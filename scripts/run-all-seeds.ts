import { db } from "../server/db";
import { storage } from "../server/storage";
import { 
  users,
  referralSources,
  InsertReferralSource
} from "../shared/schema";
import { faker } from "@faker-js/faker";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";

// Ensure we have test users
async function ensureUsers() {
  console.log("Ensuring test users exist...");
  const existingUsers = await db.select().from(users);
  
  if (existingUsers.length === 0) {
    console.log("No users found. Creating admin and therapist users...");
    
    // Create admin user
    const adminHashedPassword = await argon2.hash("admin123");
    await db.insert(users).values({
      username: "admin@mentalspace.com",
      passwordHash: adminHashedPassword,
      firstName: "Admin",
      lastName: "User",
      email: "admin@mentalspace.com",
      role: "administrator",
      status: "active",
    });
    
    // Create therapist user
    const therapistHashedPassword = await argon2.hash("therapist123");
    await db.insert(users).values({
      username: "therapist@mentalspace.com",
      passwordHash: therapistHashedPassword,
      firstName: "Jane",
      lastName: "Smith",
      email: "therapist@mentalspace.com",
      role: "therapist",
      status: "active",
      specialties: ["Anxiety", "Depression", "PTSD"],
      bio: "Dr. Smith is a licensed therapist with over 10 years of experience in cognitive behavioral therapy."
    });
    
    // Create additional therapists
    const additionalTherapists = [
      {
        username: "dr.roberts@mentalspace.com",
        firstName: "Michael",
        lastName: "Roberts",
        specialties: ["Family Therapy", "Adolescent Counseling", "Behavioral Issues"]
      },
      {
        username: "dr.patel@mentalspace.com",
        firstName: "Priya",
        lastName: "Patel",
        specialties: ["Trauma Recovery", "EMDR", "Mindfulness"]
      }
    ];
    
    for (const therapist of additionalTherapists) {
      const password = await argon2.hash("password123");
      await db.insert(users).values({
        username: therapist.username,
        passwordHash: password,
        firstName: therapist.firstName,
        lastName: therapist.lastName,
        email: therapist.username,
        role: "therapist",
        status: "active",
        specialties: therapist.specialties,
        bio: `Dr. ${therapist.lastName} specializes in ${therapist.specialties.join(", ")}.`
      });
    }
    
    console.log("Created test users successfully");
  } else {
    console.log(`Found ${existingUsers.length} existing users. Skipping creation.`);
  }
  
  return await db.select().from(users);
}

// Ensure we have referral sources
async function ensureReferralSources() {
  console.log("Ensuring referral sources exist...");
  const existingSources = await db.select().from(referralSources);
  
  if (existingSources.length === 0) {
    console.log("No referral sources found. Creating sample sources...");
    
    // Find admin user for attribution
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users`);
    
    let adminId;
    // Try to find admin user
    const adminUser = allUsers.find(user => user.role === "administrator");
    if (adminUser) {
      adminId = adminUser.id;
    } else {
      // If no admin, use the first user
      if (allUsers.length > 0) {
        adminId = allUsers[0].id;
      } else {
        console.error("No users found. Please seed users first.");
        return [];
      }
    }
    
    console.log(`Using user with ID ${adminId} as creator`);
    
    // Sample referral source data
    const referralSourceData = [
      {
        name: "Psychology Today",
        type: "Directory",
        details: {
          url: "https://www.psychologytoday.com",
          subscription: "Premium",
          monthlyFee: 29.95
        },
        activeStatus: "active",
        contactPerson: null,
        contactEmail: "support@psychologytoday.com",
        contactPhone: null,
        notes: "Prominent mental health professional directory with good lead generation"
      },
      {
        name: "Dr. Johnson's Practice",
        type: "Professional Referral",
        details: {
          specialty: "Psychiatry",
          referralFee: 0,
          location: "Main Street Medical Center"
        },
        activeStatus: "active",
        contactPerson: "Dr. Robert Johnson",
        contactEmail: "rjohnson@mainstreetmedical.com",
        contactPhone: faker.phone.number(),
        notes: "Psychiatrist who refers clients needing therapy in addition to medication"
      },
      {
        name: "Google Ads",
        type: "Online Advertising",
        details: {
          platform: "Google",
          budget: 500,
          keywords: ["therapy near me", "anxiety therapist", "depression help"]
        },
        activeStatus: "active",
        contactPerson: null,
        contactEmail: null,
        contactPhone: null,
        notes: "Monthly Google Ads campaign targeting local therapy seekers"
      },
      {
        name: "Community Health Center",
        type: "Healthcare Partner",
        details: {
          partnership: "Bi-directional referrals",
          agreement: "Formal MOU",
          services: ["Primary care", "Social services"]
        },
        activeStatus: "active",
        contactPerson: "Maria Gonzalez",
        contactEmail: "mgonzalez@communityhealthcenter.org",
        contactPhone: faker.phone.number(),
        notes: "Local community health center that refers clients needing mental health services"
      },
      {
        name: "Local University",
        type: "Educational Institution",
        details: {
          department: "Student Counseling Services",
          population: "Students",
          serviceAgreement: "External provider for overflow"
        },
        activeStatus: "active",
        contactPerson: "Dr. Sarah Thomas",
        contactEmail: "sthomas@university.edu",
        contactPhone: faker.phone.number(),
        notes: "University counseling center that refers students needing specialized or long-term care"
      }
    ];
    
    // Insert referral sources
    for (const sourceData of referralSourceData) {
      const referralSource: InsertReferralSource = {
        name: sourceData.name,
        type: sourceData.type,
        details: sourceData.details,
        activeStatus: sourceData.activeStatus,
        contactPerson: sourceData.contactPerson,
        contactEmail: sourceData.contactEmail,
        contactPhone: sourceData.contactPhone,
        notes: sourceData.notes,
        createdById: adminId
      };
      
      await storage.createReferralSource(referralSource);
    }
    
    console.log(`Created ${referralSourceData.length} referral sources`);
  } else {
    console.log(`Found ${existingSources.length} existing referral sources. Skipping creation.`);
  }
  
  return await db.select().from(referralSources);
}

// Run all seed scripts
async function runAllSeeds() {
  console.log("Starting complete database seeding process...");
  
  try {
    // Ensure prerequisite data
    await ensureUsers();
    await ensureReferralSources();
    
    // Import and run seed scripts
    console.log("\nImporting seed scripts...");
    
    // Run client seeding script
    console.log("\n--- RUNNING CLIENT SEEDING ---");
    const clientModule = await import("./seed-clients");
    if (typeof clientModule.main === 'function') {
      await clientModule.main();
    } else {
      console.log("Client seeding function not found, skipping");
    }
    
    // Run lead seeding script
    console.log("\n--- RUNNING LEAD SEEDING ---");
    const leadModule = await import("./seed-leads");
    if (typeof leadModule.main === 'function') {
      await leadModule.main();
    } else {
      console.log("Lead seeding function not found, skipping");
    }
    
    // Run marketing campaign seeding script
    console.log("\n--- RUNNING MARKETING CAMPAIGN SEEDING ---");
    const campaignModule = await import("./seed-campaigns");
    if (typeof campaignModule.main === 'function') {
      await campaignModule.main();
    } else {
      console.log("Campaign seeding function not found, skipping");
    }
    
    // Run marketing events seeding script
    console.log("\n--- RUNNING MARKETING EVENTS SEEDING ---");
    const eventsModule = await import("./seed-events");
    if (typeof eventsModule.main === 'function') {
      await eventsModule.main();
    } else {
      console.log("Events seeding function not found, skipping");
    }
    
    console.log("\nAll seeding processes completed successfully!");
  } catch (error) {
    console.error("Error during seeding process:", error);
    process.exit(1);
  }
}

// Run the main function
runAllSeeds().catch(console.error);