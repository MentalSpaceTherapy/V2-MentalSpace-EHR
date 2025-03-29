import { db } from "../server/db";
import { storage } from "../server/storage";
// Ensure module compatibility
import { createInsertSchema } from "drizzle-zod";
import { 
  clients, 
  leads, 
  marketingCampaigns, 
  referralSources, 
  marketingEvents,
  contactHistory,
  users,
  extendedClientSchema,
  InsertMarketingCampaign,
  InsertReferralSource,
  InsertLead,
  InsertMarketingEvent,
  InsertContactHistory
} from "../shared/schema";
import { faker } from "@faker-js/faker";
import * as argon2 from "argon2";

// Seed users if none exist
async function seedUsers() {
  console.log("Checking for existing users...");
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
    });
    
    // Create another therapist
    const therapist2HashedPassword = await argon2.hash("therapist123");
    await db.insert(users).values({
      username: "therapist2@mentalspace.com",
      passwordHash: therapist2HashedPassword,
      firstName: "John",
      lastName: "Doe",
      email: "therapist2@mentalspace.com",
      role: "therapist",
      status: "active",
    });
    
    console.log("Created admin and therapist users");
  } else {
    console.log(`Found ${existingUsers.length} existing users. Skipping user creation.`);
  }
  
  return await db.select().from(users);
}

// Seed referral sources
async function seedReferralSources(createdById: number) {
  console.log("Checking for existing referral sources...");
  const existingReferralSources = await db.select().from(referralSources);
  
  if (existingReferralSources.length === 0) {
    console.log("No referral sources found. Creating sample referral sources...");
    
    const referralSourcesData: InsertReferralSource[] = [
      {
        name: "Psychology Today Directory",
        type: "directory",
        details: "Online therapist directory",
        activeStatus: "active",
        contactPerson: "Support Team",
        contactEmail: "support@psychologytoday.com",
        contactPhone: "800-555-1234",
        notes: "Premium listing, renews annually in January",
        createdById
      },
      {
        name: "Dr. Sarah Johnson",
        type: "professional",
        details: "Local psychiatrist",
        activeStatus: "active",
        contactPerson: "Dr. Sarah Johnson",
        contactEmail: "sarah.johnson@example.com",
        contactPhone: "555-123-4567",
        notes: "Sends referrals for therapy alongside medication management",
        createdById
      },
      {
        name: "Community Health Center",
        type: "organization",
        details: "Local non-profit health center",
        activeStatus: "active",
        contactPerson: "Mark Wilson",
        contactEmail: "mwilson@communityhealthcenter.org",
        contactPhone: "555-987-6543",
        notes: "Partnership for sliding scale services",
        createdById
      },
      {
        name: "Mindful Living Workshop",
        type: "event",
        details: "Workshop series we hosted last year",
        activeStatus: "inactive",
        contactPerson: "Workshop Coordinator",
        contactEmail: "events@mentalspace.com",
        contactPhone: "555-789-0123",
        notes: "One-time event that generated several client leads",
        createdById
      },
      {
        name: "Google Ads",
        type: "marketing",
        details: "PPC advertising",
        activeStatus: "active",
        contactPerson: "Marketing Manager",
        contactEmail: "marketing@mentalspace.com",
        contactPhone: "",
        notes: "Monthly budget of $500, targeting local area",
        createdById
      },
      {
        name: "University Counseling Center",
        type: "organization",
        details: "Local university referral partnership",
        activeStatus: "active",
        contactPerson: "Dr. Michael Chen",
        contactEmail: "mchen@university.edu",
        contactPhone: "555-567-8901",
        notes: "Refers students needing long-term therapy",
        createdById
      }
    ];
    
    for (const sourceData of referralSourcesData) {
      await storage.createReferralSource(sourceData);
    }
    
    console.log(`Created ${referralSourcesData.length} referral sources`);
  } else {
    console.log(`Found ${existingReferralSources.length} existing referral sources. Skipping creation.`);
  }
  
  return await db.select().from(referralSources);
}

// Seed marketing campaigns
async function seedMarketingCampaigns(createdById: number) {
  console.log("Checking for existing marketing campaigns...");
  const existingCampaigns = await db.select().from(marketingCampaigns);
  
  if (existingCampaigns.length === 0) {
    console.log("No marketing campaigns found. Creating sample campaigns...");
    
    const campaignData: InsertMarketingCampaign[] = [
      {
        name: "Spring Wellness Newsletter",
        type: "Email",
        status: "Completed",
        description: "Seasonal newsletter focusing on spring mental health topics",
        audience: "Existing clients and leads who opted in for emails",
        content: {
          emailTemplate: "spring_newsletter_template",
          subject: "Spring Into Wellness: Mental Health Tips for the New Season",
          cta: "Schedule a Session"
        },
        startDate: new Date("2023-03-01"),
        endDate: new Date("2023-03-15"),
        createdById,
        stats: {
          sent: 250,
          opened: 175,
          clicked: 45,
          converted: 8,
          revenue: 1600
        },
        tags: ["newsletter", "seasonal", "wellness"]
      },
      {
        name: "Anxiety Relief Workshop",
        type: "Event",
        status: "Running",
        description: "Free community workshop on anxiety management techniques",
        audience: "General public, targeting working professionals",
        content: {
          eventDetails: "Virtual workshop via Zoom",
          presenter: "Jane Smith, LMFT",
          duration: "90 minutes",
          materials: ["Anxiety Workbook", "Resource Guide"]
        },
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdById,
        stats: {
          registrations: 42,
          attendees: 0, // Not occurred yet
          leads: 42,
          estimatedConversions: 8
        },
        tags: ["workshop", "anxiety", "community"]
      },
      {
        name: "Google Ads - Therapy Services",
        type: "PPC",
        status: "Running",
        description: "Google search ads campaign targeting therapy-related keywords",
        audience: "Local individuals searching for therapy services",
        content: {
          keywords: ["therapist near me", "anxiety therapy", "depression counseling"],
          adCopy: "MentalSpace - Professional Therapy Services | Book Your First Session",
          landingPage: "/services"
        },
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdById,
        stats: {
          impressions: 12500,
          clicks: 375,
          cost: 1125,
          leads: 28,
          conversions: 12,
          revenue: 3600,
          roi: 220
        },
        tags: ["google", "ppc", "digital"]
      },
      {
        name: "Referral Partnership Program",
        type: "Partner",
        status: "Running",
        description: "Structured program for healthcare provider referrals",
        audience: "Local physicians, psychiatrists, and healthcare providers",
        content: {
          materials: ["Partner information packet", "Referral forms", "Business cards"],
          incentives: "Bi-directional referral system",
          tracking: "Unique referral codes"
        },
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        endDate: null, // Ongoing
        createdById,
        stats: {
          partners: 15,
          referrals: 32,
          conversions: 21,
          revenue: 6300
        },
        tags: ["referral", "partnership", "healthcare"]
      }
    ];
    
    for (const campaign of campaignData) {
      await storage.createCampaign(campaign);
    }
    
    console.log(`Created ${campaignData.length} marketing campaigns`);
  } else {
    console.log(`Found ${existingCampaigns.length} existing marketing campaigns. Skipping creation.`);
  }
  
  return await db.select().from(marketingCampaigns);
}

// Seed marketing events
async function seedMarketingEvents(createdById: number, campaigns: any[]) {
  console.log("Checking for existing marketing events...");
  const existingEvents = await db.select().from(marketingEvents);
  
  if (existingEvents.length === 0) {
    console.log("No marketing events found. Creating sample events...");
    
    // Find the Anxiety Relief Workshop campaign
    const workshopCampaign = campaigns.find(c => c.name === "Anxiety Relief Workshop");
    
    const eventsData: InsertMarketingEvent[] = [
      {
        name: "Anxiety Relief Workshop - March",
        type: "Workshop",
        description: "Learn practical techniques to manage anxiety and stress",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        duration: 90, // in minutes
        location: "Virtual (Zoom)",
        capacity: 50,
        status: "Scheduled",
        createdById
      },
      {
        name: "Parent-Child Communication Seminar",
        type: "Seminar",
        description: "Strategies for effective communication between parents and children",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        duration: 120, // in minutes
        location: "Community Center, 123 Main St",
        capacity: 30,
        status: "Scheduled",
        createdById
      },
      {
        name: "Mental Health Awareness Day Booth",
        type: "Community",
        description: "Information booth at local health fair",
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        duration: 360, // 6 hours in minutes
        location: "City Park",
        capacity: null,
        status: "Scheduled",
        createdById
      },
      {
        name: "Coping with Holiday Stress",
        type: "Webinar",
        description: "Webinar on managing stress during holiday seasons",
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago (past event)
        duration: 60,
        location: "Virtual (Webinar)",
        capacity: 100,
        status: "Completed",
        createdById
      }
    ];
    
    for (const eventData of eventsData) {
      await storage.createEvent(eventData);
    }
    
    console.log(`Created ${eventsData.length} marketing events`);
  } else {
    console.log(`Found ${existingEvents.length} existing marketing events. Skipping creation.`);
  }
  
  return await db.select().from(marketingEvents);
}

// Seed leads
async function seedLeads(
  assignedToId: number, 
  referralSources: any[], 
  campaigns: any[]
) {
  console.log("Checking for existing leads...");
  const existingLeads = await db.select().from(leads);
  
  if (existingLeads.length === 0) {
    console.log("No leads found. Creating sample leads...");
    
    // Get referral source IDs by name for reference
    const psychologyTodaySource = referralSources.find(s => s.name === "Psychology Today Directory");
    const googleAdsSource = referralSources.find(s => s.name === "Google Ads");
    const drJohnsonSource = referralSources.find(s => s.name === "Dr. Sarah Johnson");
    const communityHealthSource = referralSources.find(s => s.name === "Community Health Center");
    
    // Get campaign IDs by name
    const googleAdsCampaign = campaigns.find(c => c.name === "Google Ads - Therapy Services");
    const workshopCampaign = campaigns.find(c => c.name === "Anxiety Relief Workshop");
    
    const leadStatusOptions = ["new", "contacted", "qualified", "disqualified", "converted"];
    const leadStageOptions = ["inquiry", "consultation", "assessment", "proposal", "closed"];
    
    // Create 20 leads with varying data
    const leadsData: InsertLead[] = [];
    
    for (let i = 0; i < 20; i++) {
      // Determine source dynamically
      let source = null;
      let sourceId = null;
      let marketingCampaignId = null;
      
      // Assign sources based on patterns
      if (i < 5) {
        source = source = psychologyTodaySource ? "Psychology Today" : undefined;.replace("undefined", "null");
        sourceId = sourceId = psychologyTodaySource ? psychologyTodaySource.id : undefined;.replace("undefined", "null");
      } else if (i < 10) {
        source = source = googleAdsSource ? "Google Ads" : undefined;.replace("undefined", "null");
        sourceId = sourceId = googleAdsSource ? googleAdsSource.id : undefined;.replace("undefined", "null");
        marketingCampaignId = marketingCampaignId = googleAdsCampaign ? googleAdsCampaign.id : undefined;.replace("undefined", "null");
      } else if (i < 15) {
        source = source = drJohnsonSource ? "Professional Referral" : undefined;.replace("undefined", "null");
        sourceId = sourceId = drJohnsonSource ? drJohnsonSource.id : undefined;.replace("undefined", "null");
      } else {
        source = source = communityHealthSource ? "Community Outreach" : undefined;.replace("undefined", "null");
        sourceId = sourceId = communityHealthSource ? communityHealthSource.id : undefined;.replace("undefined", "null");
        marketingCampaignId = marketingCampaignId = workshopCampaign ? workshopCampaign.id : undefined;.replace("undefined", "null");
      }
      
      // Determine status - make some converted, some in progress
      const status = i < 3 ? "converted" : leadStatusOptions[Math.floor(Math.random() * (leadStatusOptions.length - 1))];
      const stage = leadStageOptions[Math.floor(Math.random() * leadStageOptions.length)];
      
      // Create timestamps with appropriate sequence
      const dateAdded = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
      const lastContactDate = new Date(dateAdded.getTime() + Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000);
      const lastActivityDate = new Date(lastContactDate.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000);
      
      // Create the lead object
      const leadData: InsertLead = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        source,
        sourceId,
        status,
        notes: faker.lorem.paragraph(),
        stage,
        assignedToId,
        interestedServices: faker.helpers.arrayElements(["Individual Therapy", "Couples Therapy", "Family Therapy", "Group Therapy", "Assessment"], Math.floor(Math.random() * 3) + 1),
        demographicInfo: {
          age: Math.floor(Math.random() * 60) + 18,
          gender: faker.helpers.arrayElement(["Male", "Female", "Non-binary", "Prefer not to say"]),
          location: faker.location.city()
        },
        marketingCampaignId,
        leadScore: Math.floor(Math.random() * 100),
        conversionProbability: Math.floor(Math.random() * 100),
        tags: faker.helpers.arrayElements(["Anxiety", "Depression", "Relationship", "Urgent", "Insurance", "Follow-up"], Math.floor(Math.random() * 3) + 1)
      };
      
      leadsData.push(leadData);
    }
    
    // Insert leads
    for (const leadData of leadsData) {
      await storage.createLead(leadData);
    }
    
    console.log(`Created ${leadsData.length} leads`);
  } else {
    console.log(`Found ${existingLeads.length} existing leads. Skipping creation.`);
  }
  
  return await db.select().from(leads);
}

// Convert some leads to clients
async function convertLeadsToClients(therapists: any[], existingLeads: any[]) {
  console.log("Checking for existing clients...");
  const existingClients = await db.select().from(clients);
  
  if (existingClients.length === 0) {
    console.log("No clients found. Converting some leads to clients...");
    
    // Find leads with "new" status to convert
    const leadsToConvert = existingLeads.filter(lead => lead.status !== "converted").slice(0, 5);
    
    for (const lead of leadsToConvert) {
      // Create client data based on lead
      const clientData = {
        firstName: lead.name.split(' ')[0],
        lastName: lead.name.split(' ').slice(1).join(' '),
        email: lead.email,
        phone: lead.phone,
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        dateOfBirth: new Date(Date.now() - (Math.floor(Math.random() * 50) + 18) * 365 * 24 * 60 * 60 * 1000),
        gender: (lead.demographicInfo?.gender || faker.helpers.arrayElement(["Male", "Female", "Non-binary", "Prefer not to say"])),
        maritalStatus: faker.helpers.arrayElement(["Single", "Married", "Divorced", "Widowed", "Separated"]),
        occupation: faker.person.jobTitle(),
        primaryTherapistId: therapists[Math.floor(Math.random() * therapists.length)].id,
        status: "active",
        referralSource: lead.source,
        emergencyContact: {
          name: faker.person.fullName(),
          relationship: faker.helpers.arrayElement(["Spouse", "Parent", "Sibling", "Friend"]),
          phone: faker.phone.number()
        },
        insuranceInfo: {
          provider: faker.helpers.arrayElement(["Blue Cross", "Aetna", "UnitedHealthcare", "Cigna", "Self-Pay"]),
          policyNumber: faker.string.alphanumeric(10).toUpperCase(),
          groupNumber: faker.string.alphanumeric(8).toUpperCase(),
          policyholder: faker.helpers.arrayElement(["Self", "Spouse", "Parent"]),
          copay: parseFloat(faker.finance.amount({ min: 20, max: 50, dec: 0 }))
        },
        notes: lead.notes || faker.lorem.paragraph()
      };
      
      try {
        // Convert lead using existing method
        const validatedData = extendedClientSchema.parse(clientData);
        await storage.convertLeadToClient(lead.id, validatedData);
        console.log(`Converted lead "${lead.name}" to client`);
      } catch (error) {
        console.error(`Error converting lead ${lead.id} to client:`, error);
      }
    }
    
    // Create some direct clients not from leads
    for (let i = 0; i < 8; i++) {
      const clientData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        dateOfBirth: new Date(Date.now() - (Math.floor(Math.random() * 50) + 18) * 365 * 24 * 60 * 60 * 1000),
        gender: faker.helpers.arrayElement(["Male", "Female", "Non-binary", "Prefer not to say"]),
        maritalStatus: faker.helpers.arrayElement(["Single", "Married", "Divorced", "Widowed", "Separated"]),
        occupation: faker.person.jobTitle(),
        primaryTherapistId: therapists[Math.floor(Math.random() * therapists.length)].id,
        status: "active",
        referralSource: faker.helpers.arrayElement(["Word of Mouth", "Internet Search", "Insurance Directory", "Social Media", "Community Event"]),
        emergencyContact: {
          name: faker.person.fullName(),
          relationship: faker.helpers.arrayElement(["Spouse", "Parent", "Sibling", "Friend"]),
          phone: faker.phone.number()
        },
        insuranceInfo: {
          provider: faker.helpers.arrayElement(["Blue Cross", "Aetna", "UnitedHealthcare", "Cigna", "Self-Pay"]),
          policyNumber: faker.string.alphanumeric(10).toUpperCase(),
          groupNumber: faker.string.alphanumeric(8).toUpperCase(),
          policyholder: faker.helpers.arrayElement(["Self", "Spouse", "Parent"]),
          copay: parseFloat(faker.finance.amount({ min: 20, max: 50, dec: 0 }))
        },
        notes: faker.lorem.paragraph()
      };
      
      try {
        const validatedData = extendedClientSchema.parse(clientData);
        await storage.createClient(validatedData);
        console.log(`Created direct client "${clientData.firstName} ${clientData.lastName}"`);
      } catch (error) {
        console.error(`Error creating client:`, error);
      }
    }
  } else {
    console.log(`Found ${existingClients.length} existing clients. Skipping creation.`);
  }
  
  return await db.select().from(clients);
}

// Seed contact history records
async function seedContactHistory(
  therapistId: number,
  existingLeads: any[],
  existingClients: any[],
  campaigns: any[]
) {
  console.log("Checking for existing contact history records...");
  const existingRecords = await db.select().from(contactHistory);
  
  if (existingRecords.length === 0) {
    console.log("No contact history records found. Creating sample records...");
    
    const contactHistoryRecords: InsertContactHistory[] = [];
    
    // Add contact history for leads
    for (const lead of existingLeads) {
      const numRecords = Math.floor(Math.random() * 3) + 1; // 1-3 records per lead
      
      for (let i = 0; i < numRecords; i++) {
        const contactTypes = ["phone", "email", "text", "video call", "in-person"];
        const outcomes = ["left message", "spoke directly", "no answer", "scheduled consultation", "needs follow-up", "not interested", "converted to client"];
        
        const contactRecord: InsertContactHistory = {
          leadId: lead.id,
          contactType: contactTypes[Math.floor(Math.random() * contactTypes.length)],
          direction: Math.random() > 0.5 ? "outbound" : "inbound",
          subject: faker.lorem.sentence(3),
          content: faker.lorem.paragraph(),
          contactNumber: i === 0 ? lead.phone : null,
          duration: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
          notes: faker.lorem.paragraph(),
          outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
          followUpDate: Math.random() > 0.3 ? new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000) : null,
          followUpType: Math.random() > 0.3 ? faker.helpers.arrayElement(["call", "email", "text"]) : null,
          completedById: therapistId,
          campaignId: lead.marketingCampaignId || (Math.random() > 0.7 ? campaigns[Math.floor(Math.random() * campaigns.length)].id : null),
        };
        
        contactHistoryRecords.push(contactRecord);
      }
    }
    
    // Add contact history for clients
    for (const client of existingClients) {
      const numRecords = Math.floor(Math.random() * 4) + 2; // 2-5 records per client
      
      for (let i = 0; i < numRecords; i++) {
        const contactTypes = ["phone", "email", "text", "video call", "in-person", "session", "intake"];
        const outcomes = ["completed session", "rescheduled", "follow-up scheduled", "paperwork completed", "provided resources", "medication referral"];
        
        const contactRecord: InsertContactHistory = {
          clientId: client.id,
          contactType: contactTypes[Math.floor(Math.random() * contactTypes.length)],
          direction: Math.random() > 0.5 ? "outbound" : "inbound",
          subject: faker.lorem.sentence(3),
          content: faker.lorem.paragraph(),
          contactNumber: i === 0 ? client.phone : null,
          duration: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
          notes: faker.lorem.paragraph(),
          outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
          followUpDate: Math.random() > 0.5 ? new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000) : null,
          followUpType: Math.random() > 0.5 ? faker.helpers.arrayElement(["session", "call", "email"]) : null,
          completedById: client.primaryTherapistId || therapistId,
        };
        
        contactHistoryRecords.push(contactRecord);
      }
    }
    
    // Insert contact history records
    for (const record of contactHistoryRecords) {
      await storage.createContactHistory(record);
    }
    
    console.log(`Created ${contactHistoryRecords.length} contact history records`);
  } else {
    console.log(`Found ${existingRecords.length} existing contact history records. Skipping creation.`);
  }
  
  return await db.select().from(contactHistory);
}

// Main seeding function
async function seedDatabase() {
  console.log("Starting database seeding process...");
  
  try {
    // Seed users first
    const users = await seedUsers();
    const adminUser = users.find(u => u.role === "administrator");
    const therapistUser = users.find(u => u.role === "therapist");
    
    if (!adminUser || !therapistUser) {
      console.error("Failed to find admin or therapist user. Aborting seed process.");
      return;
    }
    
    const adminId = adminUser.id;
    const therapistId = therapistUser.id;
    
    // Seed data in order of dependencies
    const sources = await seedReferralSources(adminId);
    const campaigns = await seedMarketingCampaigns(therapistId);
    const events = await seedMarketingEvents(therapistId, campaigns);
    const allLeads = await seedLeads(therapistId, sources, campaigns);
    const clients = await convertLeadsToClients(
      users.filter(u => u.role === "therapist"), 
      allLeads
    );
    const contactRecords = await seedContactHistory(therapistId, allLeads, clients, campaigns);
    
    console.log("Database seeding completed successfully!");
    
    // Print summary
    console.log("\nSeed Data Summary:");
    console.log(`- Users: ${users.length}`);
    console.log(`- Referral Sources: ${sources.length}`);
    console.log(`- Marketing Campaigns: ${campaigns.length}`);
    console.log(`- Marketing Events: ${events.length}`);
    console.log(`- Leads: ${allLeads.length}`);
    console.log(`- Clients: ${clients.length}`);
    console.log(`- Contact History Records: ${contactRecords.length}`);
    
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

// Run the seeding function
seedDatabase().catch(console.error);