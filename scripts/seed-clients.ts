import { db } from "../server/db";
import { storage } from "../server/storage";
import { 
  clients,
  users,
  extendedClientSchema,
} from "../shared/schema";
import { faker } from "@faker-js/faker";

// Seed direct clients without requiring lead conversion
async function seedDirectClients() {
  console.log("Checking for existing clients...");
  const existingClients = await db.select().from(clients);
  
  if (existingClients.length === 0) {
    console.log("No clients found. Creating sample clients...");
    
    // Get therapist users
    const therapistUsers = await db.select().from(users).where(sql => sql`${users.role} = 'therapist'`);
    
    if (therapistUsers.length === 0) {
      console.error("No therapist users found. Please seed users first.");
      return [];
    }
    
    const createdClients = [];
    
    // Create direct clients with diverse data
    for (let i = 0; i < 15; i++) {
      // Create varied client profiles with different therapy needs
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const therapyFocus = faker.helpers.arrayElement([
        "Anxiety & Stress Management", 
        "Depression Treatment", 
        "Relationship Counseling", 
        "Trauma Recovery",
        "Career Transitions",
        "Grief Counseling",
        "Family Therapy",
        "ADHD Management",
        "Substance Use Recovery",
        "Life Coaching"
      ]);
      
      // Vary client status to represent real-world practice
      const status = faker.helpers.arrayElement([
        "active", "active", "active", "active", // Weighted toward active
        "inactive", 
        "on-hold",
        "pending"
      ]);
      
      // Create varied insurance scenarios
      const insuranceProvider = faker.helpers.arrayElement([
        "Blue Cross", "Aetna", "UnitedHealthcare", "Cigna", "Kaiser", 
        "Humana", "Tricare", "Medicare", "Medicaid", "Self-Pay"
      ]);
      
      // More realistic copays based on insurance type
      let copay = 25;
      if (insuranceProvider === "Self-Pay") {
        copay = parseFloat(faker.finance.amount({ min: 80, max: 150, dec: 0 }));
      } else if (insuranceProvider === "Medicare" || insuranceProvider === "Medicaid") {
        copay = parseFloat(faker.finance.amount({ min: 0, max: 20, dec: 0 }));
      } else {
        copay = parseFloat(faker.finance.amount({ min: 20, max: 50, dec: 0 }));
      }
      
      // Create full client profile
      const clientData = {
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        dateOfBirth: new Date(Date.now() - (Math.floor(Math.random() * 60) + 18) * 365 * 24 * 60 * 60 * 1000),
        gender: faker.helpers.arrayElement(["Male", "Female", "Non-binary", "Prefer not to say"]),
        maritalStatus: faker.helpers.arrayElement(["Single", "Married", "Divorced", "Widowed", "Separated", "Domestic Partnership"]),
        occupation: faker.person.jobTitle(),
        primaryTherapistId: therapistUsers[Math.floor(Math.random() * therapistUsers.length)].id,
        status,
        referralSource: faker.helpers.arrayElement([
          "Psychology Today", "Google Search", "Doctor Referral", "Friend/Family", 
          "Insurance Directory", "Social Media", "Community Event", "Previous Client"
        ]),
        emergencyContact: {
          name: faker.person.fullName(),
          relationship: faker.helpers.arrayElement(["Spouse", "Parent", "Sibling", "Friend", "Child", "Partner"]),
          phone: faker.phone.number()
        },
        insuranceInfo: {
          provider: insuranceProvider,
          policyNumber: faker.string.alphanumeric(10).toUpperCase(),
          groupNumber: faker.string.alphanumeric(8).toUpperCase(),
          policyholder: faker.helpers.arrayElement(["Self", "Spouse", "Parent", "Employer"]),
          copay
        },
        notes: `${firstName} is seeking therapy for ${therapyFocus.toLowerCase()}. ${faker.lorem.paragraph()}`
      };
      
      try {
        const validatedData = extendedClientSchema.parse(clientData);
        const client = await storage.createClient(validatedData);
        createdClients.push(client);
        console.log(`Created client "${clientData.firstName} ${clientData.lastName}" - ${therapyFocus}`);
      } catch (error) {
        console.error(`Error creating client:`, error);
      }
    }
    
    console.log(`Successfully created ${createdClients.length} clients`);
    return createdClients;
  } else {
    console.log(`Found ${existingClients.length} existing clients. Skipping creation.`);
    return existingClients;
  }
}

// Main function
export async function main() {
  console.log("Starting client seeding process...");
  
  try {
    const clients = await seedDirectClients();
    console.log(`Database now has ${clients.length} clients`);
    return clients;
  } catch (error) {
    console.error("Error during client seeding:", error);
    throw error;
  }
}

// Run the seeding function if this script is executed directly
// Note: We can't check if executed directly in ES modules, so this will run regardless
// But the run-all-seeds.ts script will catch and handle any errors
main().catch(error => {
  console.error(error);
  // Only exit if not imported (shouldn't exit when imported by run-all-seeds)
  if (process.argv[1].includes('seed-clients.ts')) {
    process.exit(1);
  }
});