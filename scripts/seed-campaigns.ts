import { db } from "../server/db";
import { storage } from "../server/storage";
import { 
  marketingCampaigns,
  InsertMarketingCampaign,
  users,
  referralSources
} from "../shared/schema";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

async function seedCampaigns() {
  console.log("Starting campaign seeding process...");
  console.log("Checking for existing campaigns...");
  
  const existingCampaigns = await db.select().from(marketingCampaigns);
  
  if (existingCampaigns.length > 0) {
    console.log(`Found ${existingCampaigns.length} existing campaigns. Skipping creation.`);
    return existingCampaigns;
  }
  
  console.log("No campaigns found. Creating sample campaigns...");
  
  // Find users to assign as creators
  const allUsers = await db.select().from(users);
  if (allUsers.length === 0) {
    console.error("No users found. Please run the user seed script first.");
    return [];
  }
  
  // Find referral sources for reference
  const allSources = await db.select().from(referralSources);
  
  // Define campaign types
  const campaignTypes = [
    "Email Marketing", 
    "Social Media", 
    "Content Marketing", 
    "Referral Program", 
    "Community Outreach",
    "Workshop Series",
    "Webinar"
  ];
  
  // Define possible statuses
  const statuses = ["draft", "scheduled", "active", "paused", "completed", "cancelled"];
  
  // Create sample campaigns
  const campaigns = [
    {
      name: "Spring Anxiety Relief Workshop Series",
      type: "Workshop Series",
      status: "active",
      description: "A series of workshops focused on anxiety management techniques for the spring season.",
      audience: {
        demographics: ["adults", "professionals"],
        conditions: ["anxiety", "stress"],
        location: "local"
      },
      content: {
        topics: ["stress management", "mindfulness", "CBT techniques"],
        delivery: "in-person and virtual",
        materials: ["handouts", "practice exercises", "audio recordings"]
      },
      startDate: new Date(2025, 2, 15), // March 15, 2025
      endDate: new Date(2025, 4, 30),   // May 30, 2025
      tags: ["anxiety", "workshops", "spring2025"],
      stats: {
        registrations: 45,
        attendees: 32,
        leadsGenerated: 18,
        conversions: 7,
        revenue: 3500
      }
    },
    {
      name: "Parenting Support Email Series",
      type: "Email Marketing",
      status: "scheduled",
      description: "Email campaign providing guidance for parents of children with behavioral challenges.",
      audience: {
        demographics: ["parents", "caregivers"],
        conditions: ["behavioral issues", "ADHD", "anxiety"],
        location: "national"
      },
      content: {
        emailSequence: ["introduction", "understanding behaviors", "communication strategies", "self-care"],
        resources: ["articles", "video links", "worksheets"],
        callToAction: "Free consultation booking"
      },
      startDate: new Date(2025, 3, 1),  // April 1, 2025
      endDate: new Date(2025, 5, 15),   // June 15, 2025
      tags: ["parenting", "email-campaign", "behavioral-health"],
      stats: {
        subscribers: 120,
        openRate: 43.2,
        clickRate: 18.7,
        consultationsBooked: 15
      }
    },
    {
      name: "Depression Awareness Month Webinar Series",
      type: "Webinar",
      status: "draft",
      description: "Educational webinar series for Depression Awareness Month highlighting treatment approaches and self-help strategies.",
      audience: {
        demographics: ["general public", "healthcare providers"],
        interests: ["mental health", "depression", "continuing education"],
        location: "global"
      },
      content: {
        sessions: ["Understanding Depression", "Evidence-based Treatments", "Supporting Loved Ones", "Recovery Stories"],
        presenters: ["Dr. Smith", "Dr. Patel", "Panel of specialists"],
        materials: ["slides", "resource guides", "certificate of attendance"]
      },
      startDate: new Date(2025, 9, 5),  // October 5, 2025
      endDate: new Date(2025, 9, 26),   // October 26, 2025
      tags: ["depression", "webinar", "awareness-month", "education"],
      stats: {}
    },
    {
      name: "Healthcare Provider Referral Program",
      type: "Referral Program",
      status: "active",
      description: "Partnership program with local physicians, psychiatrists, and other healthcare providers for bidirectional referrals.",
      audience: {
        professionals: ["primary care physicians", "psychiatrists", "nurse practitioners", "social workers"],
        specialties: ["general practice", "psychiatry", "neurology", "pediatrics"],
        location: "local"
      },
      content: {
        materials: ["referral guides", "practice brochures", "contact cards"],
        benefits: ["expedited appointments", "care coordination", "follow-up reports"],
        process: "Streamlined electronic referral system with status updates"
      },
      startDate: new Date(2025, 1, 1),  // February 1, 2025
      endDate: new Date(2025, 11, 31),  // December 31, 2025
      tags: ["referrals", "healthcare-partners", "professional-network"],
      stats: {
        partnersEnrolled: 23,
        referralsReceived: 67,
        referralsSent: 42,
        conversionRate: 68.5
      }
    },
    {
      name: "Mindfulness for Workplace Wellness Program",
      type: "Community Outreach",
      status: "paused",
      description: "Corporate wellness program offering mindfulness training for local businesses to support employee mental health.",
      audience: {
        organizations: ["corporations", "small businesses", "non-profits"],
        departments: ["HR", "leadership", "all employees"],
        industries: ["technology", "healthcare", "finance", "education"]
      },
      content: {
        format: "6-week onsite program",
        sessions: ["stress reduction", "mindful communication", "focus enhancement", "emotional regulation"],
        deliverables: ["group sessions", "app access", "practice guides", "progress tracking"]
      },
      startDate: new Date(2025, 0, 15),  // January 15, 2025
      endDate: new Date(2025, 6, 15),   // July 15, 2025
      tags: ["workplace-wellness", "mindfulness", "corporate", "stress-management"],
      stats: {
        businessesEnrolled: 4,
        participantsTotal: 87,
        satisfactionRating: 4.7,
        followUpServices: 12
      }
    }
  ];
  
  const createdCampaigns = [];
  
  for (const campaign of campaigns) {
    // Randomly select a creator from available users
    const creator = allUsers[Math.floor(Math.random() * allUsers.length)];
    
    const campaignData: InsertMarketingCampaign = {
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      description: campaign.description,
      audience: campaign.audience,
      content: campaign.content,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      createdById: creator.id,
      tags: campaign.tags,
      stats: campaign.stats
    };
    
    const createdCampaign = await storage.createCampaign(campaignData);
    createdCampaigns.push(createdCampaign);
    
    console.log(`Created campaign "${campaign.name}" - ${campaign.status}`);
  }
  
  console.log(`Successfully created ${createdCampaigns.length} campaigns`);
  
  return createdCampaigns;
}

// Main function to run the seed
export async function main() {
  try {
    const campaigns = await seedCampaigns();
    console.log("Database now has campaigns ready for testing");
    return campaigns;
  } catch (error) {
    console.error("Error seeding campaigns:", error);
    throw error;
  }
}

// Run the seeding function if this script is executed directly
// Note: We can't check if executed directly in ES modules, so this will run regardless
// But the run-all-seeds.ts script will catch and handle any errors
main().catch(error => {
  console.error(error);
  // Only exit if not imported (shouldn't exit when imported by run-all-seeds)
  if (process.argv[1].includes('seed-campaigns.ts')) {
    process.exit(1);
  }
});