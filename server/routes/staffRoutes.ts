// src/routes/staffRoutes.ts
import express from "express";
import { db } from "../db/db";
import { staff } from "../db/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// CREATE Staff
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const [insertedStaff] = await db
      .insert(staff)
      .values({
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        suffix: data.suffix,
        type_of_clinician: data.type_of_clinician,
        npi_number: data.npi_number,
        supervisor_id: data.supervisor_id ? Number(data.supervisor_id) : null,
        role: data.role,
        email: data.email,
        phone: data.phone,
        can_receive_texts: data.can_receive_texts || false,
        work_phone: data.work_phone,
        address: data.address,
        city_state: data.city_state,
        zip_code: data.zip_code,
        license_state: data.license_state,
        license_taxonomy: data.license_taxonomy,
        license_expiration: data.license_expiration,
      })
      .returning();

    res.status(201).json({
      message: "Staff created successfully",
      staff: insertedStaff,
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
    res.json(allStaff);
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
    res.json(staffMember[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching staff member" });
  }
});

// UPDATE Staff
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    await db
      .update(staff)
      .set({
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        suffix: data.suffix,
        type_of_clinician: data.type_of_clinician,
        npi_number: data.npi_number,
        supervisor_id: data.supervisor_id ? Number(data.supervisor_id) : null,
        role: data.role,
        email: data.email,
        phone: data.phone,
        can_receive_texts: data.can_receive_texts || false,
        work_phone: data.work_phone,
        address: data.address,
        city_state: data.city_state,
        zip_code: data.zip_code,
        license_state: data.license_state,
        license_taxonomy: data.license_taxonomy,
        license_expiration: data.license_expiration,
      })
      .where(eq(staff.id, id));
    res.json({ message: "Staff updated successfully" });
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