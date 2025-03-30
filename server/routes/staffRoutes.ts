// staffRoutes.ts
import express from "express";
import { db } from "../db/db";
import { staff, insertStaffSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = express.Router();

// Mapping helper - snake case to camel case for frontend
const mapStaffToCamelCase = (data: any) => {
  // Map all the snake_case db fields to camelCase for the frontend
  return {
    id: data.id,
    firstName: data.first_name,
    middleName: data.middle_name,
    lastName: data.last_name,
    suffix: data.suffix,
    typeOfClinician: data.type_of_clinician,
    npiNumber: data.npi_number,
    supervisorId: data.supervisor_id,
    role: data.role,
    roles: data.roles,
    email: data.email,
    phone: data.phone,
    canReceiveSMS: data.can_receive_texts,
    workPhone: data.work_phone,
    homePhone: data.home_phone,
    address: data.address,
    cityState: data.city_state,
    zipCode: data.zip_code,
    licenseState: data.license_state,
    licenseType: data.license_type,
    licenseNumber: data.license_number,
    licenseExpiration: data.license_expiration,
    formalName: data.formal_name,
    title: data.professional_title,
    languages: data.languages,
    status: data.status,
    profileImage: data.profile_image,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Mapping helper - camel case to snake case for database
const mapStaffToSnakeCase = (data: any) => {
  return {
    first_name: data.firstName || data.first_name,
    middle_name: data.middleName || data.middle_name,
    last_name: data.lastName || data.last_name,
    suffix: data.suffix,
    type_of_clinician: data.typeOfClinician || data.type_of_clinician,
    npi_number: data.npiNumber || data.npi_number,
    supervisor_id: data.supervisorId ? Number(data.supervisorId) : data.supervisor_id ? Number(data.supervisor_id) : null,
    role: data.role,
    roles: data.roles,
    email: data.email,
    phone: data.phone,
    can_receive_texts: data.canReceiveSMS || data.can_receive_texts || false,
    work_phone: data.workPhone || data.work_phone,
    home_phone: data.homePhone || data.home_phone,
    address: data.address,
    city_state: data.cityState || data.city_state,
    zip_code: data.zipCode || data.zip_code,
    license_state: data.licenseState || data.license_state,
    license_type: data.licenseType || data.license_type,
    license_number: data.licenseNumber || data.license_number,
    license_expiration: data.licenseExpiration || data.license_expiration,
    formal_name: data.formalName || data.formal_name,
    professional_title: data.title || data.professional_title,
    languages: data.languages,
    status: data.status || 'active',
    profile_image: data.profileImage || data.profile_image,
  };
};

// CREATE Staff
router.post("/", async (req, res) => {
  try {
    // Perform validation first
    try {
      const validateData = insertStaffSchema.parse(req.body);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return res.status(400).json({ 
        message: "Invalid staff data", 
        errors: validationError instanceof z.ZodError ? validationError.errors : [] 
      });
    }
    
    // The schema uses camelCase property names
    const staffData = req.body;
    
    // Insert the data - use the same property names as the schema
    const [insertedStaff] = await db
      .insert(staff)
      .values({
        firstName: staffData.firstName,
        middleName: staffData.middleName,
        lastName: staffData.lastName, 
        suffix: staffData.suffix,
        typeOfClinician: staffData.typeOfClinician,
        npiNumber: staffData.npiNumber,
        supervisorId: staffData.supervisorId ? Number(staffData.supervisorId) : null,
        role: staffData.role,
        roles: staffData.roles || [],
        email: staffData.email,
        phone: staffData.phone,
        canReceiveSMS: staffData.canReceiveSMS,
        workPhone: staffData.workPhone,
        homePhone: staffData.homePhone,
        address: staffData.address,
        cityState: staffData.cityState,
        zipCode: staffData.zipCode,
        licenseState: staffData.licenseState,
        licenseType: staffData.licenseType,
        licenseNumber: staffData.licenseNumber,
        licenseExpiration: staffData.licenseExpiration,
        formalName: staffData.formalName,
        title: staffData.title,
        languages: staffData.languages || [],
        status: staffData.status || "active",
        profileImage: staffData.profileImage
      })
      .returning();

    res.status(201).json({
      message: "Staff created successfully",
      staff: mapStaffToCamelCase(insertedStaff),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating staff" });
  }
});

// READ All Staff
router.get("/", async (req, res) => {
  try {
    const allStaff = await db.select().from(staff);
    res.json(allStaff.map(mapStaffToCamelCase));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching staff" });
  }
});

// READ One Staff by ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const staffMember = await db.select().from(staff).where(eq(staff.id, id));
    if (!staffMember || staffMember.length === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.json(mapStaffToCamelCase(staffMember[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching staff member" });
  }
});

// UPDATE Staff
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const staffData = req.body;
    
    // Get the existing staff member to return in response
    const [updated] = await db
      .update(staff)
      .set({
        firstName: staffData.firstName,
        middleName: staffData.middleName,
        lastName: staffData.lastName, 
        suffix: staffData.suffix,
        typeOfClinician: staffData.typeOfClinician,
        npiNumber: staffData.npiNumber,
        supervisorId: staffData.supervisorId ? Number(staffData.supervisorId) : null,
        role: staffData.role,
        roles: staffData.roles || [],
        email: staffData.email,
        phone: staffData.phone,
        canReceiveSMS: staffData.canReceiveSMS,
        workPhone: staffData.workPhone,
        homePhone: staffData.homePhone,
        address: staffData.address,
        cityState: staffData.cityState,
        zipCode: staffData.zipCode,
        licenseState: staffData.licenseState,
        licenseType: staffData.licenseType,
        licenseNumber: staffData.licenseNumber,
        licenseExpiration: staffData.licenseExpiration,
        formalName: staffData.formalName,
        title: staffData.title,
        languages: staffData.languages || [],
        status: staffData.status || "active",
        profileImage: staffData.profileImage
      })
      .where(eq(staff.id, id))
      .returning();
      
    res.json({ 
      message: "Staff updated successfully",
      staff: mapStaffToCamelCase(updated) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating staff" });
  }
});

// PATCH Staff (for partial updates)
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const staffData = req.body;
    
    // For patch we only include the fields that are provided
    const updateData: any = {};
    
    if (staffData.firstName !== undefined) updateData.firstName = staffData.firstName;
    if (staffData.middleName !== undefined) updateData.middleName = staffData.middleName;
    if (staffData.lastName !== undefined) updateData.lastName = staffData.lastName;
    if (staffData.suffix !== undefined) updateData.suffix = staffData.suffix;
    if (staffData.typeOfClinician !== undefined) updateData.typeOfClinician = staffData.typeOfClinician;
    if (staffData.npiNumber !== undefined) updateData.npiNumber = staffData.npiNumber;
    if (staffData.supervisorId !== undefined) updateData.supervisorId = Number(staffData.supervisorId);
    if (staffData.role !== undefined) updateData.role = staffData.role;
    if (staffData.roles !== undefined) updateData.roles = staffData.roles;
    if (staffData.email !== undefined) updateData.email = staffData.email;
    if (staffData.phone !== undefined) updateData.phone = staffData.phone;
    if (staffData.canReceiveSMS !== undefined) updateData.canReceiveSMS = staffData.canReceiveSMS;
    if (staffData.workPhone !== undefined) updateData.workPhone = staffData.workPhone;
    if (staffData.homePhone !== undefined) updateData.homePhone = staffData.homePhone;
    if (staffData.address !== undefined) updateData.address = staffData.address;
    if (staffData.cityState !== undefined) updateData.cityState = staffData.cityState;
    if (staffData.zipCode !== undefined) updateData.zipCode = staffData.zipCode;
    if (staffData.licenseState !== undefined) updateData.licenseState = staffData.licenseState;
    if (staffData.licenseType !== undefined) updateData.licenseType = staffData.licenseType;
    if (staffData.licenseNumber !== undefined) updateData.licenseNumber = staffData.licenseNumber;
    if (staffData.licenseExpiration !== undefined) updateData.licenseExpiration = staffData.licenseExpiration;
    if (staffData.formalName !== undefined) updateData.formalName = staffData.formalName;
    if (staffData.title !== undefined) updateData.title = staffData.title;
    if (staffData.languages !== undefined) updateData.languages = staffData.languages;
    if (staffData.status !== undefined) updateData.status = staffData.status;
    if (staffData.profileImage !== undefined) updateData.profileImage = staffData.profileImage;
    
    // Get the updated staff member to return in response
    const [updated] = await db
      .update(staff)
      .set(updateData)
      .where(eq(staff.id, id))
      .returning();
      
    res.json({ 
      message: "Staff updated successfully",
      staff: mapStaffToCamelCase(updated) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating staff" });
  }
});

// DELETE Staff
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(staff).where(eq(staff.id, id));
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting staff" });
  }
});

export default router;