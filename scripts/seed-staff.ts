import { storage } from "../server/storage";
import { InsertStaff } from "@shared/schema";

/**
 * This script seeds the database with sample staff members
 */
async function seedStaffMembers() {
  console.log("Seeding staff members...");

  // Define staff seed data
  const staffMembers: InsertStaff[] = [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@mentalspace.com",
      phone: "555-123-4567",
      role: "Therapist",
      roles: ["Therapist", "Clinical Supervisor"],
      title: "LMFT",
      licenseType: "LMFT",
      licenseNumber: "MFT12345",
      licenseExpiration: new Date("2025-08-15"),
      npiNumber: "1234567890",
      supervision: "Clinical Supervisor",
      canReceiveSMS: true,
      workPhone: "555-123-4568",
      homePhone: "555-987-6543",
      address1: "123 Main St",
      address2: "Suite 200",
      zip: "90210",
      city: "Beverly Hills",
      state: "CA",
      status: "Active",
      formalName: "Dr. John Smith"
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@mentalspace.com",
      phone: "555-234-5678",
      role: "Therapist",
      roles: ["Therapist"],
      title: "LCSW",
      licenseType: "LCSW",
      licenseNumber: "CSW54321",
      licenseExpiration: new Date("2024-04-30"),
      npiNumber: "0987654321",
      canReceiveSMS: true,
      workPhone: "555-234-5679",
      address1: "456 Oak Avenue",
      zip: "90211",
      city: "Beverly Hills",
      state: "CA",
      status: "Active",
      formalName: "Sarah Johnson"
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@mentalspace.com",
      phone: "555-345-6789",
      role: "Administrative",
      roles: ["Administrative", "Billing"],
      title: "Office Manager",
      canReceiveSMS: false,
      workPhone: "555-345-6780",
      address1: "789 Pine Street",
      zip: "90212",
      city: "Beverly Hills",
      state: "CA",
      status: "Active",
      formalName: "Michael Brown"
    },
    {
      firstName: "Jessica",
      lastName: "Wilson",
      email: "jessica.wilson@mentalspace.com",
      phone: "555-456-7890",
      role: "Intern",
      roles: ["Intern", "Assistant"],
      title: "MFT Trainee",
      supervision: "Under Dr. Smith",
      canReceiveSMS: true,
      workPhone: "555-456-7891",
      address1: "321 Cedar Road",
      zip: "90213",
      city: "Beverly Hills",
      state: "CA",
      status: "Active",
      formalName: "Jessica Wilson"
    },
    {
      firstName: "David",
      lastName: "Martinez",
      email: "david.martinez@mentalspace.com",
      phone: "555-567-8901",
      role: "Therapist",
      roles: ["Therapist", "Group Facilitator"],
      title: "PhD",
      licenseType: "Psychologist",
      licenseNumber: "PSY98765",
      licenseExpiration: new Date("2023-12-31"),
      npiNumber: "5678901234",
      canReceiveSMS: true,
      workPhone: "555-567-8902",
      address1: "654 Maple Drive",
      zip: "90214",
      city: "Beverly Hills",
      state: "CA",
      status: "Inactive",
      formalName: "Dr. David Martinez"
    }
  ];

  // Add staff members to the database
  try {
    for (const staffData of staffMembers) {
      // Check if staff with same email already exists
      const existingStaff = await storage.getStaffMembers({ 
        role: staffData.role 
      });
      
      const staffExists = existingStaff.some(
        staff => staff.email === staffData.email
      );
      
      if (!staffExists) {
        const newStaff = await storage.createStaffMember(staffData);
        console.log(`Created staff: ${newStaff.firstName} ${newStaff.lastName}`);
      } else {
        console.log(`Staff with email ${staffData.email} already exists, skipping`);
      }
    }
    
    console.log("Staff seeding completed successfully");
  } catch (error) {
    console.error("Error seeding staff members:", error);
    throw error;
  }
}

export async function main() {
  try {
    await seedStaffMembers();
    console.log("All staff data seeded successfully!");
  } catch (error) {
    console.error("Error seeding staff data:", error);
    process.exit(1);
  }
}

// Run the main function
main();