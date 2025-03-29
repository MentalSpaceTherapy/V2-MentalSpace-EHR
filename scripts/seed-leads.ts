import { db } from "../server/db";
import { storage } from "../server/storage";
import { 
  leads,
  users,
  referralSources,
  InsertLead,
} from "../shared/schema";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

// Seed leads directly
async function seedLeads() {
  console.log("Checking for existing leads...");
  const existingLeads = await db.select().from(leads);
  
  if (existingLeads.length === 0) {
    console.log("No leads found. Creating sample leads...");
    
    // Get therapist users for assignment
    const therapistUsers = await db.select().from(users).where(eq(users.role, "therapist"));
    
    if (therapistUsers.length === 0) {
      console.error("No therapist users found. Please seed users first.");
      return [];
    }
    
    // Get available referral sources
    const referralSourcesList = await db.select().from(referralSources);
    
    // Lead status and stage options
    const leadStatusOptions = ["new", "contacted", "qualified", "in progress", "converted", "lost"];
    const leadStageOptions = ["inquiry", "consultation", "assessment", "proposal", "negotiation", "closed"];
    
    const createdLeads = [];
    
    // Create diverse lead profiles
    for (let i = 0; i < 25; i++) {
      // Determine source
      let source = null;
      let sourceId = null;
      
      if (referralSourcesList.length > 0 && Math.random() > 0.3) {
        const randomSource = referralSourcesList[Math.floor(Math.random() * referralSourcesList.length)];
        source = randomSource.name;
        sourceId = randomSource.id;
      } else {
        // Common lead sources when not from our referral database
        source = faker.helpers.arrayElement([
          "Website Form", 
          "Google Search", 
          "Social Media", 
          "Email Campaign",
          "Phone Inquiry",
          "Partner Referral",
          "Conference"
        ]);
      }
      
      // Determine status - distribute across the pipeline
      const status = leadStatusOptions[Math.floor(Math.random() * leadStatusOptions.length)];
      const stage = leadStageOptions[Math.floor(Math.random() * leadStageOptions.length)];
      
      // Create realistic timestamps with appropriate sequence
      const dateAdded = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
      const lastContactDate = new Date(dateAdded.getTime() + Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000);
      const lastActivityDate = new Date(lastContactDate.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000);
      
      // Create lead data with more specific service interests
      const leadData: InsertLead = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        source,
        sourceId,
        status,
        notes: faker.lorem.paragraph(),
        stage,
        assignedToId: therapistUsers[Math.floor(Math.random() * therapistUsers.length)].id,
        interestedServices: faker.helpers.arrayElements([
          "Individual Therapy", 
          "Couples Therapy", 
          "Family Therapy", 
          "Group Therapy", 
          "Cognitive Behavioral Therapy",
          "EMDR Therapy",
          "Play Therapy for Children",
          "Dialectical Behavior Therapy",
          "Psychological Assessment",
          "Medication Management"
        ], Math.floor(Math.random() * 3) + 1),
        demographicInfo: {
          age: Math.floor(Math.random() * 60) + 18,
          gender: faker.helpers.arrayElement(["Male", "Female", "Non-binary", "Prefer not to say"]),
          location: faker.location.city(),
          income: faker.helpers.arrayElement(["Under $30,000", "$30,000-$60,000", "$60,000-$100,000", "Over $100,000", "Prefer not to say"]),
          insuranceProvider: faker.helpers.arrayElement(["Aetna", "Blue Cross", "Cigna", "UnitedHealthcare", "Medicaid", "Medicare", "None/Self-pay"])
        },
        marketingCampaignId: null,
        leadScore: Math.floor(Math.random() * 100),
        conversionProbability: Math.floor(Math.random() * 100),
        tags: faker.helpers.arrayElements([
          "Anxiety", "Depression", "Relationship", "Urgent", "Insurance", "Follow-up", 
          "VIP", "Needs-Assessment", "Financial-Assistance", "New-Client", "Telehealth",
          "In-Person"
        ], Math.floor(Math.random() * 4) + 1)
      };
      
      try {
        const lead = await storage.createLead(leadData);
        createdLeads.push(lead);
        console.log(`Created lead "${leadData.name}" - ${status} (${stage})`);
      } catch (error) {
        console.error(`Error creating lead:`, error);
      }
    }
    
    console.log(`Successfully created ${createdLeads.length} leads`);
    return createdLeads;
  } else {
    console.log(`Found ${existingLeads.length} existing leads. Skipping creation.`);
    return existingLeads;
  }
}

// Main function
export async function main() {
  console.log("Starting lead seeding process...");
  
  try {
    const allLeads = await seedLeads();
    console.log(`Database now has ${allLeads.length} leads`);
    return allLeads;
  } catch (error) {
    console.error("Error during lead seeding:", error);
    throw error;
  }
}

// Run the seeding function if this script is executed directly
// Note: We can't check if executed directly in ES modules, so this will run regardless
// But the run-all-seeds.ts script will catch and handle any errors
main().catch(error => {
  console.error(error);
  // Only exit if not imported (shouldn't exit when imported by run-all-seeds)
  if (process.argv[1].includes('seed-leads.ts')) {
    process.exit(1);
  }
});