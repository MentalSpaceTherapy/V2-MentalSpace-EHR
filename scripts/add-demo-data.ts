import { db } from "../server/db";
import { clients, messages } from "../shared/schema";
import { format } from "date-fns";

const THERAPIST_ID = 1; // Assuming our logged in therapist

const clientsData = [
  { 
    firstName: "Sarah", 
    lastName: "Johnson", 
    email: "sarah.j@example.com", 
    phone: "555-987-6543", 
    status: "Active", 
    dateOfBirth: new Date("1992-05-15"), 
    therapistId: THERAPIST_ID 
  },
  { 
    firstName: "Michael", 
    lastName: "Brown", 
    email: "michael.b@example.com", 
    phone: "555-456-7890", 
    status: "Active", 
    dateOfBirth: new Date("1985-11-28"), 
    therapistId: THERAPIST_ID 
  },
  { 
    firstName: "Emily", 
    lastName: "Davis", 
    email: "emily.d@example.com", 
    phone: "555-234-5678", 
    status: "Inactive", 
    dateOfBirth: new Date("1978-03-10"), 
    therapistId: THERAPIST_ID 
  },
  { 
    firstName: "James", 
    lastName: "Wilson", 
    email: "james.w@example.com", 
    phone: "555-123-4567", 
    status: "Active", 
    dateOfBirth: new Date("1990-07-22"), 
    therapistId: THERAPIST_ID 
  },
  { 
    firstName: "Emma", 
    lastName: "Taylor", 
    email: "emma.t@example.com", 
    phone: "555-789-0123", 
    status: "Active", 
    dateOfBirth: new Date("1983-09-05"), 
    therapistId: THERAPIST_ID 
  },
  { 
    firstName: "Robert", 
    lastName: "Martinez", 
    email: "robert.m@example.com", 
    phone: "555-678-9012", 
    status: "Active", 
    dateOfBirth: new Date("1975-01-18"), 
    therapistId: THERAPIST_ID 
  },
  { 
    firstName: "Olivia", 
    lastName: "Anderson", 
    email: "olivia.a@example.com", 
    phone: "555-567-8901", 
    status: "Inactive", 
    dateOfBirth: new Date("1995-12-30"), 
    therapistId: THERAPIST_ID 
  },
  { 
    firstName: "David", 
    lastName: "Thompson", 
    email: "david.t@example.com", 
    phone: "555-345-6789", 
    status: "Active", 
    dateOfBirth: new Date("1988-08-14"), 
    therapistId: THERAPIST_ID 
  },
  { 
    firstName: "Sophia", 
    lastName: "Garcia", 
    email: "sophia.g@example.com", 
    phone: "555-901-2345", 
    status: "Active", 
    dateOfBirth: new Date("1993-06-27"), 
    therapistId: THERAPIST_ID 
  }
];

// Function to get a random date within the last month
function getRandomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  
  return now;
}

// Add clients and then add messages for them
async function addDemoData() {
  try {
    // First, check if there's already data to avoid duplication
    const existingClients = await db.select().from(clients);
    
    if (existingClients.length > 9) {
      console.log("Database already has sufficient demo data");
      return;
    }
    
    console.log("Adding demo clients...");
    
    // Add each client and collect their IDs
    const addedClientIds = [];
    
    for (const clientData of clientsData) {
      const [newClient] = await db.insert(clients).values(clientData).returning();
      console.log(`Added client: ${newClient.firstName} ${newClient.lastName}`);
      addedClientIds.push(newClient.id);
    }
    
    console.log("Adding demo messages...");
    
    // For each client, add 3-5 messages
    for (const clientId of addedClientIds) {
      const messageCount = Math.floor(Math.random() * 3) + 3; // 3-5 messages
      
      for (let i = 0; i < messageCount; i++) {
        const isFromTherapist = Math.random() > 0.6; // 40% chance message is from client
        const createdAt = getRandomRecentDate();
        const isRead = isFromTherapist ? true : Math.random() > 0.3; // 70% chance client messages are read
        
        const messageData = {
          clientId,
          therapistId: THERAPIST_ID,
          content: isFromTherapist 
            ? `Here's some follow-up information for you from our last session.`
            : `I have a question about my treatment plan. Can we discuss this?`,
          sender: isFromTherapist ? "therapist" : "client",
          isRead,
          createdAt
        };
        
        await db.insert(messages).values(messageData);
      }
      
      console.log(`Added ${messageCount} messages for client ${clientId}`);
    }
    
    console.log("Demo data added successfully!");
  } catch (error) {
    console.error("Error adding demo data:", error);
  }
}

// Run the function
addDemoData();