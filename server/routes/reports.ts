import express, { Request, Response } from "express";
import { storage } from "../storage";
import { 
  insertReportTemplateSchema, 
  insertSavedReportSchema,
  type SavedReport
} from "@shared/schema";
import { createObjectCsvWriter } from "csv-writer";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import util from "util";
import { z } from "zod";
import { sendCreated, sendPaginatedSuccess, sendUpdated, sendSuccess, sendSuccessNoContent } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

// Create reports router
const router = express.Router();

// Create the uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Get all report templates with optional filters
router.get("/templates", async (req: Request, res: Response) => {
  try {
    const { isPublic, category, createdById } = req.query;
    const filters = {
      isPublic: isPublic === "true" ? true : isPublic === "false" ? false : undefined,
      category: category as string | undefined,
      createdById: createdById ? parseInt(createdById as string) : undefined
    };

    const templates = await storage.getReportTemplates(filters);
    res.json(templates);
  } catch (error) {
    console.error("Error getting report templates:", error);
    res.status(500).json({ error: "Failed to get report templates" });
  }
});

// Get a specific report template by ID
router.get("/templates/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const template = await storage.getReportTemplate(id);
    
    if (!template) {
      return res.status(404).json({ error: "Report template not found" });
    }
    
    res.json(template);
  } catch (error) {
    console.error("Error getting report template:", error);
    res.status(500).json({ error: "Failed to get report template" });
  }
});

// Create a new report template
router.post("/templates", async (req: Request, res: Response) => {
  try {
    // Get the current user ID from the session (assuming auth middleware adds user)
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Validate the request body
    const validatedData = insertReportTemplateSchema.parse(req.body);
    
    // Set the created by ID
    const templateData = {
      ...validatedData,
      createdById: userId
    };
    
    // Create the template
    const newTemplate = await storage.createReportTemplate(templateData);
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error("Error creating report template:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid report template data", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create report template" });
    }
  }
});

// Update an existing report template
router.put("/templates/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if the template exists
    const template = await storage.getReportTemplate(id);
    if (!template) {
      return res.status(404).json({ error: "Report template not found" });
    }
    
    // Get the current user ID from the session
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Check if the user is the creator of the template
    if (template.createdById !== userId && req.session.userRole !== "admin") {
      return res.status(403).json({ error: "Not authorized to update this template" });
    }
    
    // Validate the request body
    const validatedData = insertReportTemplateSchema.partial().parse(req.body);
    
    // Update the template
    const updatedTemplate = await storage.updateReportTemplate(id, validatedData);
    res.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating report template:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid report template data", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update report template" });
    }
  }
});

// Delete a report template
router.delete("/templates/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if the template exists
    const template = await storage.getReportTemplate(id);
    if (!template) {
      return res.status(404).json({ error: "Report template not found" });
    }
    
    // Get the current user ID from the session
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Check if the user is the creator of the template
    if (template.createdById !== userId && req.session.userRole !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this template" });
    }
    
    // Delete the template
    const success = await storage.deleteReportTemplate(id);
    
    if (success) {
      res.status(204).end();
    } else {
      res.status(500).json({ error: "Failed to delete report template" });
    }
  } catch (error) {
    console.error("Error deleting report template:", error);
    res.status(500).json({ error: "Failed to delete report template" });
  }
});

// Generate a report
router.post("/generate", async (req: Request, res: Response) => {
  try {
    // Get the current user ID from the session
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Validate the request body
    const { templateId, name, format = "json", parameters = {} } = req.body;
    
    if (!templateId || !name) {
      return res.status(400).json({ error: "Template ID and name are required" });
    }
    
    // Check if the template exists
    const template = await storage.getReportTemplate(parseInt(templateId));
    if (!template) {
      return res.status(404).json({ error: "Report template not found" });
    }
    
    // Generate the report data
    const reportData = await generateReportData(template, parameters);
    
    // Generate the file content
    const fileContent = await generateFileContent(reportData, format);
    
    // Calculate the file size
    const fileSize = calculateFileSize(fileContent, format);
    
    // Determine the file URL
    const fileUrl = format !== "json" ? `/api/reports/download/${randomUUID()}` : undefined;
    
    // If it's not JSON, save the file
    if (format !== "json" && fileUrl) {
      const fileName = fileUrl.split("/").pop();
      const filePath = path.join(uploadsDir, fileName!);
      await fs.promises.writeFile(filePath, fileContent);
    }
    
    // Create the saved report
    const savedReport = await storage.createSavedReport({
      name,
      createdById: userId,
      templateId: parseInt(templateId),
      format,
      data: reportData,
      status: "completed",
      size: fileSize,
      fileUrl,
      parameters,
      isArchived: false
    } as any); // Cast to any because isArchived isn't in the schema yet
    
    const responseData = {
      reportId: savedReport.id,
      name: savedReport.name,
      format: savedReport.format,
      fileUrl: savedReport.fileUrl,
      fileSize: savedReport.size,
      data: format === "json" ? reportData : undefined
    };
    
    sendCreated(res, responseData, "Report generated successfully");
  } catch (error) {
    next(fromError(error, "Failed to generate report"));
  }
});

// Get all saved reports
router.get("/saved", asyncHandler(async (req: Request, res: Response) => {
  // Get the current user ID from the session
  const userId = req.session.userId;
  if (!userId) {
    throw new ApiError("Authentication required", 401, "AUTHENTICATION_REQUIRED");
  }
  
  const { templateId, isArchived, page = "1", limit = "20" } = req.query;
  const filters = {
    createdById: userId,
    isArchived: isArchived === "true" ? true : isArchived === "false" ? false : undefined,
    templateId: templateId ? parseInt(templateId as string) : undefined
  };
  
  // Parse pagination parameters
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  
  // Get reports with count
  const reports = await storage.getSavedReports(filters);
  
  // Apply pagination
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedReports = reports.slice(startIndex, endIndex);
  
  // Create pagination metadata
  const pagination = {
    page: pageNum,
    limit: limitNum,
    totalItems: reports.length,
    totalPages: Math.ceil(reports.length / limitNum),
    hasNextPage: endIndex < reports.length,
    hasPrevPage: pageNum > 1
  };
  
  sendPaginatedSuccess(res, paginatedReports, pagination, { filters });
}));

// Get a specific saved report
router.get("/saved/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  // Get the current user ID from the session
  const userId = req.session.userId;
  if (!userId) {
    throw new ApiError("Authentication required", 401, "AUTHENTICATION_REQUIRED");
  }
  
  // Get the report
  const report = await storage.getSavedReport(id);
  
  if (!report) {
    throw new ApiError("Saved report not found", 404, "RESOURCE_NOT_FOUND");
  }
  
  // Check if the user is authorized to access this report
  if (report.createdById !== userId && req.session.userRole !== "admin") {
    throw new ApiError("Not authorized to access this report", 403, "FORBIDDEN");
  }
  
  // If format is json, include the data
  if (report.format === "json") {
    sendSuccess(res, report);
  } else {
    // Otherwise, only include metadata and file URL
    const { data, ...metadata } = report;
    sendSuccess(res, metadata);
  }
}));

// Archive or unarchive a saved report
router.put("/saved/:id/archive", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  // Get the current user ID from the session
  const userId = req.session.userId;
  if (!userId) {
    throw new ApiError("Authentication required", 401, "AUTHENTICATION_REQUIRED");
  }
  
  // Get the report
  const report = await storage.getSavedReport(id);
  
  if (!report) {
    throw new ApiError("Saved report not found", 404, "RESOURCE_NOT_FOUND");
  }
  
  // Check if the user is authorized to modify this report
  if (report.createdById !== userId && req.session.userRole !== "admin") {
    throw new ApiError("Not authorized to modify this report", 403, "FORBIDDEN");
  }
  
  // Toggle the archived status
  const isArchived = req.body.isArchived === undefined ? !report.isArchived : req.body.isArchived;
  
  // Update the report
  const updatedReport = await storage.updateSavedReport(id, {
    isArchived: isArchived as any // Cast to any because isArchived isn't in the schema yet
  });
  
  sendUpdated(res, updatedReport, `Report ${isArchived ? 'archived' : 'unarchived'} successfully`);
}));

// Delete a saved report
router.delete("/saved/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  // Get the current user ID from the session
  const userId = req.session.userId;
  if (!userId) {
    throw new ApiError("Authentication required", 401, "AUTHENTICATION_REQUIRED");
  }
  
  // Get the report
  const report = await storage.getSavedReport(id);
  
  if (!report) {
    throw new ApiError("Saved report not found", 404, "RESOURCE_NOT_FOUND");
  }
  
  // Check if the user is authorized to delete this report
  if (report.createdById !== userId && req.session.userRole !== "admin") {
    throw new ApiError("Not authorized to delete this report", 403, "FORBIDDEN");
  }
  
  // If there's a file URL, delete the file
  if (report.fileUrl) {
    const fileName = report.fileUrl.split("/").pop();
    const filePath = path.join(uploadsDir, fileName!);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
  
  // Delete the report
  const success = await storage.deleteSavedReport(id);
  
  if (success) {
    sendSuccessNoContent(res);
  } else {
    throw new ApiError("Failed to delete saved report", 500, "INTERNAL_SERVER_ERROR");
  }
}));

// Download a report file
router.get("/download/:id", asyncHandler(async (req: Request, res: Response) => {
  const fileName = req.params.id;
  const filePath = path.join(uploadsDir, fileName);
  
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new ApiError("Report file not found", 404, "RESOURCE_NOT_FOUND");
  }
  
  // Get the report by file name
  const reports = await storage.getSavedReports({});
  const report = reports.find(r => r.fileUrl?.includes(fileName));
  
  if (!report) {
    throw new ApiError("Report not found", 404, "RESOURCE_NOT_FOUND");
  }
  
  // Get the current user ID from the session
  const userId = req.session.userId;
  if (!userId) {
    throw new ApiError("Authentication required", 401, "AUTHENTICATION_REQUIRED");
  }
  
  // Check if the user is authorized to access this report
  if (report.createdById !== userId && req.session.userRole !== "admin") {
    throw new ApiError("Not authorized to access this report", 403, "FORBIDDEN");
  }
  
  // Determine the content type
  const contentType = getContentType(report.format);
  
  // Set headers
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="report-${report.name.replace(/\s+/g, "-")}.${report.format}"`);
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}));

// Helper functions
async function generateReportData(template: any, parameters: any): Promise<any> {
  try {
    // This function would generate the actual report data based on the template and parameters
    // For now, we'll just use sample data
    let reportData: any = {};
    
    // Basic templates with data based on the template type
    switch (template.type) {
      case "client-summary":
        reportData = {
          clientCount: 150,
          activeClients: 120,
          newClientsThisMonth: 15,
          averageSessionsPerClient: 8.5,
          topDiagnoses: [
            { diagnosis: "Anxiety Disorder", count: 45 },
            { diagnosis: "Depression", count: 38 },
            { diagnosis: "ADHD", count: 22 },
            { diagnosis: "PTSD", count: 18 },
            { diagnosis: "Bipolar Disorder", count: 12 }
          ]
        };
        break;
        
      case "financial":
        reportData = {
          revenueByMonth: [
            { month: "January", revenue: 25000 },
            { month: "February", revenue: 27500 },
            { month: "March", revenue: 26800 },
            { month: "April", revenue: 30200 },
            { month: "May", revenue: 32100 },
            { month: "June", revenue: 33500 }
          ],
          unpaidInvoices: 18,
          totalUnpaid: 7540,
          averageSessionCost: 125,
          insuranceBreakdown: [
            { provider: "Blue Cross", percentage: 35 },
            { provider: "Aetna", percentage: 25 },
            { provider: "Cigna", percentage: 20 },
            { provider: "Medicare", percentage: 15 },
            { provider: "Other", percentage: 5 }
          ]
        };
        break;
        
      case "activity":
        reportData = {
          sessionsByWeekday: [
            { day: "Monday", count: 35 },
            { day: "Tuesday", count: 42 },
            { day: "Wednesday", count: 38 },
            { day: "Thursday", count: 45 },
            { day: "Friday", count: 30 },
            { day: "Saturday", count: 15 },
            { day: "Sunday", count: 0 }
          ],
          cancelationRate: 0.08,
          rescheduledRate: 0.12,
          busyHours: [
            { hour: "9 AM", load: 0.65 },
            { hour: "10 AM", load: 0.85 },
            { hour: "11 AM", load: 0.90 },
            { hour: "12 PM", load: 0.75 },
            { hour: "1 PM", load: 0.60 },
            { hour: "2 PM", load: 0.70 },
            { hour: "3 PM", load: 0.95 },
            { hour: "4 PM", load: 0.85 },
            { hour: "5 PM", load: 0.75 }
          ]
        };
        break;
        
      case "marketing":
        reportData = {
          leadsBySource: [
            { source: "Referral", count: 35 },
            { source: "Website", count: 28 },
            { source: "Google Ads", count: 22 },
            { source: "Social Media", count: 18 },
            { source: "Events", count: 12 }
          ],
          conversionRate: 0.42,
          campaignPerformance: [
            { campaign: "Spring Mental Health Awareness", leads: 45, conversions: 18 },
            { campaign: "New Patient Special", leads: 38, conversions: 22 },
            { campaign: "Anxiety Workshop", leads: 32, conversions: 12 }
          ],
          avgTimeToConversion: 14.5 // days
        };
        break;
        
      default:
        // Generic data for custom templates
        reportData = {
          timestamp: new Date().toISOString(),
          parameters,
          customData: {
            metric1: Math.floor(Math.random() * 1000),
            metric2: Math.floor(Math.random() * 1000),
            ratio: Math.random().toFixed(2),
            trend: Math.random() > 0.5 ? "up" : "down"
          }
        };
    }
    
    // Apply any specific parameters
    if (parameters.startDate) {
      reportData.dateRange = {
        start: parameters.startDate,
        end: parameters.endDate || new Date().toISOString()
      };
    }
    
    if (parameters.clientId) {
      reportData.clientDetails = {
        id: parameters.clientId,
        // This would typically be fetched from the database
        name: "Sample Client",
        email: "client@example.com",
        startDate: "2023-01-15"
      };
    }
    
    return reportData;
  } catch (error) {
    console.error("Error generating report data:", error);
    throw new Error("Failed to generate report data");
  }
}

async function generateFileContent(data: any, format: string): Promise<string | Buffer> {
  switch (format.toLowerCase()) {
    case "csv":
      return generateCsvContent(data);
    case "pdf":
      // PDF generation would typically use a library like PDFKit or puppeteer
      // For now, we'll just return a placeholder
      return Buffer.from(`PDF Report - ${new Date().toISOString()}`);
    case "xlsx":
      // XLSX generation would use a library like exceljs
      // For now, we'll just return a placeholder
      return Buffer.from(`Excel Report - ${new Date().toISOString()}`);
    case "json":
    default:
      return JSON.stringify(data, null, 2);
  }
}

function calculateFileSize(data: any, format: string): number {
  // For string data, get the length in bytes
  if (typeof data === "string") {
    return Buffer.from(data).length;
  }
  
  // For Buffer data, get the length
  if (data instanceof Buffer) {
    return data.length;
  }
  
  // For JSON data, calculate the size of the stringified data
  return Buffer.from(JSON.stringify(data)).length;
}

function getContentType(format: string): string {
  switch (format.toLowerCase()) {
    case "csv":
      return "text/csv";
    case "pdf":
      return "application/pdf";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "json":
    default:
      return "application/json";
  }
}

function generateCsvContent(data: any): string {
  try {
    let records: any[] = [];
    let header: { id: string, title: string }[] = [];
    
    // Extract the records and headers based on the data structure
    if (Array.isArray(data)) {
      // If data is already an array, use it as is
      records = data;
      
      // Create headers from the first record
      if (records.length > 0) {
        header = Object.keys(records[0]).map(key => ({
          id: key,
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
        }));
      }
    } else if (typeof data === "object") {
      // If data is an object, try to find arrays inside it
      const arrayProps = Object.entries(data)
        .filter(([_, value]) => Array.isArray(value))
        .sort((a, b) => (b[1] as any[]).length - (a[1] as any[]).length);
      
      if (arrayProps.length > 0) {
        // Use the largest array as the records
        const [propName, propValue] = arrayProps[0];
        records = propValue as any[];
        
        // Create headers from the first record
        if (records.length > 0) {
          header = Object.keys(records[0]).map(key => ({
            id: key,
            title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
          }));
        }
      } else {
        // Flatten the object to a single record
        records = [data];
        header = Object.keys(data).map(key => ({
          id: key,
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
        }));
      }
    }
    
    // Write to a temporary CSV file
    const tempFile = path.join(uploadsDir, `temp_${randomUUID()}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: tempFile,
      header
    });
    
    // Write records
    csvWriter.writeRecords(records);
    
    // Wait for the file to be written
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const content = fs.readFileSync(tempFile, "utf8");
          fs.unlinkSync(tempFile); // Clean up temp file
          resolve(content);
        } catch (err) {
          reject(err);
        }
      }, 100);
    });
  } catch (error) {
    console.error("Error generating CSV content:", error);
    return "Error generating CSV content";
  }
}

export default router;