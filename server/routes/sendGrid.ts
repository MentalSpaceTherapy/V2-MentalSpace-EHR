import { Router, Request, Response } from "express";
import { sendGridService } from "../services/sendGrid";
import { z } from "zod";

// Create a router
const router = Router();

// Define validation schemas
const testEmailSchema = z.object({
  to: z.string().email("Must be a valid email"),
  from: z.string().email("Must be a valid email"),
  name: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  text: z.string().min(1, "Text content is required"),
  html: z.string().min(1, "HTML content is required"),
});

const recipientSchema = z.object({
  email: z.string().email("Must be a valid email"),
  name: z.string().optional(),
  dynamicData: z.record(z.any()).optional(),
});

const campaignSchema = z.object({
  recipients: z.array(recipientSchema),
  from: z.string().email("Must be a valid email"),
  fromName: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  textTemplate: z.string().min(1, "Text template is required"),
  htmlTemplate: z.string().min(1, "HTML template is required"),
});

const segmentSchema = z.object({
  name: z.string().min(1, "Segment name is required"),
  description: z.string().optional(),
});

// Routes
/**
 * @route GET /api/sendgrid/status
 * @desc Check if SendGrid is configured
 * @access Private
 */
router.get("/status", (req: Request, res: Response) => {
  const status = sendGridService.getConfigStatus();
  return res.json(status);
});

/**
 * @route POST /api/sendgrid/send-test
 * @desc Send a test email
 * @access Private
 */
router.post("/send-test", async (req: Request, res: Response) => {
  try {
    const validatedData = testEmailSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: validatedData.error.format(),
      });
    }
    
    const result = await sendGridService.sendTestEmail(validatedData.data);
    
    if (!result.success) {
      return res.status(500).json({
        error: "Failed to send test email",
        message: result.message,
      });
    }
    
    return res.json({ success: true, message: "Test email sent successfully" });
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * @route POST /api/sendgrid/send-campaign
 * @desc Send an email campaign to multiple recipients
 * @access Private
 */
router.post("/send-campaign", async (req: Request, res: Response) => {
  try {
    const validatedData = campaignSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: validatedData.error.format(),
      });
    }
    
    const result = await sendGridService.sendCampaign(validatedData.data);
    
    if (!result.success) {
      return res.status(500).json({
        error: "Failed to send campaign",
        message: result.message,
      });
    }
    
    return res.json({ success: true, message: "Campaign sent successfully" });
  } catch (error: any) {
    console.error("Error sending campaign:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * @route GET /api/sendgrid/segments
 * @desc Get all segments (mocked for now)
 * @access Private
 */
router.get("/segments", (req: Request, res: Response) => {
  // In a real implementation, this would query the SendGrid API
  // For now, return mock data
  const segments = [
    {
      id: "segment1",
      name: "Active Clients",
      description: "All current active clients",
      contact_count: 24
    },
    {
      id: "segment2",
      name: "New Leads",
      description: "Leads from the last 30 days",
      contact_count: 12
    },
    {
      id: "segment3",
      name: "Newsletter Subscribers",
      description: "People who opted in to receive the monthly newsletter",
      contact_count: 58
    }
  ];
  
  return res.json(segments);
});

/**
 * @route POST /api/sendgrid/segments
 * @desc Create a new segment (mocked for now)
 * @access Private
 */
router.post("/segments", (req: Request, res: Response) => {
  try {
    const validatedData = segmentSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: validatedData.error.format(),
      });
    }
    
    // In a real implementation, this would call the SendGrid API
    // For now, return mock success
    const newSegment = {
      id: `segment${Date.now()}`,
      name: validatedData.data.name,
      description: validatedData.data.description || "",
      contact_count: 0
    };
    
    return res.json(newSegment);
  } catch (error: any) {
    console.error("Error creating segment:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;