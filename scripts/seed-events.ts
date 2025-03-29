import { db } from "../server/db";
import { storage } from "../server/storage";
import { 
  marketingEvents,
  InsertMarketingEvent,
  users,
  marketingCampaigns
} from "../shared/schema";
import { faker } from "@faker-js/faker";

async function seedEvents() {
  console.log("Starting marketing events seeding process...");
  console.log("Checking for existing events...");
  
  const existingEvents = await db.select().from(marketingEvents);
  
  if (existingEvents.length > 0) {
    console.log(`Found ${existingEvents.length} existing events. Skipping creation.`);
    return existingEvents;
  }
  
  console.log("No marketing events found. Creating sample events...");
  
  // Find users to assign as creators
  const allUsers = await db.select().from(users);
  if (allUsers.length === 0) {
    console.error("No users found. Please run the user seed script first.");
    return [];
  }
  
  // Find campaigns to associate events with
  const allCampaigns = await db.select().from(marketingCampaigns);
  if (allCampaigns.length === 0) {
    console.error("No campaigns found. Please run the campaign seed script first.");
    return [];
  }
  
  // Define event types
  const eventTypes = [
    "Workshop", 
    "Webinar", 
    "Open House", 
    "Community Talk", 
    "Panel Discussion",
    "Conference",
    "Training Session"
  ];
  
  // Define possible statuses
  const statuses = ["scheduled", "active", "completed", "cancelled"];
  
  // Create sample events
  const events = [
    {
      name: "Managing Anxiety During Uncertain Times",
      type: "Workshop",
      status: "scheduled",
      description: "A workshop for adults dealing with anxiety related to major life changes and uncertainty.",
      venue: "MentalSpace Main Office - Conference Room",
      capacity: 25,
      isVirtual: false,
      registrationRequired: true,
      registrationUrl: "https://mentalspace.example.com/events/anxiety-workshop",
      startDate: new Date(2025, 3, 10, 18, 0), // April 10, 2025, 6:00 PM
      endDate: new Date(2025, 3, 10, 20, 0),   // April 10, 2025, 8:00 PM
      campaignId: allCampaigns.find(c => c.name === "Spring Anxiety Relief Workshop Series")?.id || null,
      details: {
        presenter: "Dr. Jane Smith",
        materials: ["Handouts", "Anxiety self-assessment tools", "Resource list"],
        agenda: [
          "Introduction to anxiety and its physical manifestations",
          "Identifying personal triggers",
          "Practical coping strategies",
          "Q&A and group discussion"
        ]
      }
    },
    {
      name: "Supporting Your Child's Emotional Development",
      type: "Webinar",
      status: "scheduled",
      description: "Online webinar for parents focusing on supporting healthy emotional development in children ages 5-12.",
      venue: "Zoom",
      capacity: 100,
      isVirtual: true,
      registrationRequired: true,
      registrationUrl: "https://mentalspace.example.com/events/child-development-webinar",
      startDate: new Date(2025, 3, 22, 12, 0), // April 22, 2025, 12:00 PM
      endDate: new Date(2025, 3, 22, 13, 30),  // April 22, 2025, 1:30 PM
      campaignId: allCampaigns.find(c => c.name === "Parenting Support Email Series")?.id || null,
      details: {
        presenter: "Dr. Michael Roberts",
        platform: "Zoom",
        recordingAvailable: true,
        topics: [
          "Emotional intelligence basics",
          "Age-appropriate expectations",
          "Communication techniques",
          "Managing challenging behaviors"
        ]
      }
    },
    {
      name: "Introduction to Mindfulness for Workplace Stress",
      type: "Training Session",
      status: "scheduled",
      description: "An introductory session on mindfulness practices specifically designed for workplace stress reduction.",
      venue: "TechCorp Headquarters",
      capacity: 30,
      isVirtual: false,
      registrationRequired: true,
      registrationUrl: "https://mentalspace.example.com/events/workplace-mindfulness",
      startDate: new Date(2025, 2, 15, 9, 0),  // March 15, 2025, 9:00 AM
      endDate: new Date(2025, 2, 15, 12, 0),   // March 15, 2025, 12:00 PM
      campaignId: allCampaigns.find(c => c.name === "Mindfulness for Workplace Wellness Program")?.id || null,
      details: {
        presenter: "Dr. Priya Patel",
        audience: "Corporate employees",
        materials: ["Mindfulness guide", "Practice journal", "Audio meditation files"],
        topics: [
          "Science of mindfulness",
          "Brief practices for busy schedules",
          "Handling workplace triggers",
          "Building daily mindfulness routines"
        ]
      }
    },
    {
      name: "Mental Health First Aid for Healthcare Professionals",
      type: "Training Session",
      status: "scheduled",
      description: "Specialized training for healthcare providers on recognizing and responding to mental health crises.",
      venue: "Community Health Center - Training Room",
      capacity: 40,
      isVirtual: false,
      registrationRequired: true,
      registrationUrl: "https://mentalspace.example.com/events/mh-first-aid",
      startDate: new Date(2025, 4, 8, 8, 0),   // May 8, 2025, 8:00 AM
      endDate: new Date(2025, 4, 8, 17, 0),    // May 8, 2025, 5:00 PM
      campaignId: allCampaigns.find(c => c.name === "Healthcare Provider Referral Program")?.id || null,
      details: {
        presenter: "Mental Health First Aid Certified Instructors",
        certificationProvided: true,
        CEUCredits: 8,
        audience: "Healthcare providers",
        topics: [
          "Risk assessment",
          "Crisis intervention",
          "Referral protocols",
          "Self-care for providers"
        ]
      }
    },
    {
      name: "Understanding Depression: Myths and Facts",
      type: "Community Talk",
      status: "scheduled",
      description: "Educational community presentation addressing common myths about depression and sharing evidence-based information.",
      venue: "Public Library - Community Room",
      capacity: 50,
      isVirtual: false,
      registrationRequired: false,
      registrationUrl: null,
      startDate: new Date(2025, 9, 15, 18, 30), // October 15, 2025, 6:30 PM
      endDate: new Date(2025, 9, 15, 20, 0),    // October 15, 2025, 8:00 PM
      campaignId: allCampaigns.find(c => c.name === "Depression Awareness Month Webinar Series")?.id || null,
      details: {
        presenter: "Dr. Jane Smith",
        openToPublic: true,
        materials: ["Informational brochures", "Resource list", "Screening tools"],
        topics: [
          "Depression vs. sadness",
          "Biological factors in depression",
          "Treatment options",
          "Supporting loved ones"
        ]
      }
    }
  ];
  
  const createdEvents = [];
  
  for (const event of events) {
    // Randomly select a creator from available users
    const creator = allUsers[Math.floor(Math.random() * allUsers.length)];
    
    const eventData: InsertMarketingEvent = {
      name: event.name,
      type: event.type,
      status: event.status,
      description: event.description,
      date: event.startDate,
      duration: Math.floor((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60)),
      location: event.venue.toString(), // Ensure venue is a string
      capacity: event.capacity,
      createdById: creator.id
    };
    
    const createdEvent = await storage.createEvent(eventData);
    createdEvents.push(createdEvent);
    
    console.log(`Created event "${event.name}" - ${event.type}`);
  }
  
  console.log(`Successfully created ${createdEvents.length} marketing events`);
  
  return createdEvents;
}

// Main function to run the seed
export async function main() {
  try {
    const events = await seedEvents();
    console.log("Database now has marketing events ready for testing");
    return events;
  } catch (error) {
    console.error("Error seeding marketing events:", error);
    throw error;
  }
}

// Run the seeding function if this script is executed directly
// Note: We can't check if executed directly in ES modules, so this will run regardless
// But the run-all-seeds.ts script will catch and handle any errors
main().catch(error => {
  console.error(error);
  // Only exit if not imported (shouldn't exit when imported by run-all-seeds)
  if (process.argv[1].includes('seed-events.ts')) {
    process.exit(1);
  }
});