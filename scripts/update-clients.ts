import { db } from "../server/db";
import { storage } from "../server/storage";
import { 
  clients,
  users,
  documentation
} from "../shared/schema";
import { faker } from "@faker-js/faker";
import { and, eq, sql } from "drizzle-orm";

// Helper function to get a random date within a range
function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function updateClients() {
  console.log("Updating clients with more detailed information...");
  
  // Get therapist users
  const therapistUsers = await db.select().from(users).where(sql`${users.role} = 'therapist'`);
  
  if (therapistUsers.length === 0) {
    console.error("No therapist users found. Please seed users first.");
    return;
  }
  
  // Get all clients
  const existingClients = await db.select().from(clients);
  
  if (existingClients.length === 0) {
    console.log("No clients found to update.");
    return;
  }
  
  // Common therapy focus areas - for realistic mental health context
  const therapyFocusAreas = [
    "Anxiety & Stress Management", 
    "Depression Treatment", 
    "PTSD & Trauma Recovery",
    "Relationship Counseling", 
    "Grief & Loss",
    "Addiction Recovery",
    "Family Therapy",
    "ADHD Management",
    "Eating Disorders",
    "Bipolar Disorder",
    "Personality Disorders",
    "Career Transitions",
    "Life Coaching",
    "Anger Management",
    "Child & Adolescent Issues"
  ];
  
  // Insurance providers - for realistic healthcare context
  const insuranceProviders = [
    "Blue Cross Blue Shield", 
    "Aetna", 
    "UnitedHealthcare", 
    "Cigna", 
    "Kaiser Permanente", 
    "Humana", 
    "Tricare", 
    "Medicare", 
    "Medicaid", 
    "Self-Pay"
  ];
  
  // Create realistic diagnoses - for mental health context
  const diagnosisCodes = [
    "F41.1 - Generalized Anxiety Disorder",
    "F33.1 - Major Depressive Disorder, Recurrent, Moderate",
    "F43.10 - Post-Traumatic Stress Disorder",
    "F90.0 - Attention-Deficit Hyperactivity Disorder, Combined Type",
    "F60.3 - Borderline Personality Disorder",
    "F31.9 - Bipolar Disorder, Unspecified",
    "F42.2 - Obsessive-Compulsive Disorder",
    "F50.2 - Bulimia Nervosa",
    "F50.0 - Anorexia Nervosa",
    "F43.23 - Adjustment Disorder with Mixed Anxiety and Depressed Mood",
    "F34.1 - Persistent Depressive Disorder (Dysthymia)",
    "F40.10 - Social Anxiety Disorder",
    "F44.81 - Dissociative Identity Disorder",
    "F51.01 - Insomnia Disorder",
    "F91.3 - Oppositional Defiant Disorder"
  ];
  
  // Medications common in mental health treatment
  const medications = [
    "Escitalopram (Lexapro) 10mg, once daily",
    "Sertraline (Zoloft) 50mg, once daily",
    "Bupropion (Wellbutrin) 150mg, twice daily",
    "Venlafaxine (Effexor) 75mg, once daily",
    "Fluoxetine (Prozac) 20mg, once daily",
    "Duloxetine (Cymbalta) 30mg, once daily",
    "Aripiprazole (Abilify) 5mg, once daily",
    "Quetiapine (Seroquel) 100mg, at bedtime",
    "Lamotrigine (Lamictal) 100mg, twice daily",
    "Methylphenidate (Ritalin) 10mg, twice daily",
    "Alprazolam (Xanax) 0.5mg, as needed",
    "Clonazepam (Klonopin) 0.5mg, twice daily",
    "Hydroxyzine (Vistaril) 25mg, as needed",
    "Trazodone 50mg, at bedtime",
    "Lithium carbonate 300mg, twice daily",
    "None prescribed"
  ];
  
  // Create more extensive updates for each client
  for (const client of existingClients) {
    try {
      // Generate unique therapy focus for each client
      const therapyFocus = faker.helpers.arrayElement(therapyFocusAreas);
      
      // Generate diagnosis and medication appropriate for the therapy focus
      let diagnosis = [];
      let medication = faker.helpers.arrayElement(medications);
      
      // Align diagnosis with therapy focus for more realistic cases
      if (therapyFocus.includes("Anxiety")) {
        diagnosis.push("F41.1 - Generalized Anxiety Disorder");
      } else if (therapyFocus.includes("Depression")) {
        diagnosis.push("F33.1 - Major Depressive Disorder");
      } else if (therapyFocus.includes("Trauma")) {
        diagnosis.push("F43.10 - Post-Traumatic Stress Disorder");
      } else if (therapyFocus.includes("ADHD")) {
        diagnosis.push("F90.0 - Attention-Deficit Hyperactivity Disorder");
      } else {
        // Random diagnosis for other focus areas
        diagnosis.push(faker.helpers.arrayElement(diagnosisCodes));
      }
      
      // Some clients may have comorbid conditions
      if (Math.random() > 0.7) {
        const secondaryDiagnosis = faker.helpers.arrayElement(diagnosisCodes.filter(d => !diagnosis.includes(d)));
        diagnosis.push(secondaryDiagnosis);
      }
      
      // Generate rich demographic data
      const gender = faker.helpers.arrayElement(["Male", "Female", "Non-binary", "Transgender", "Prefer not to say"]);
      const pronoun = gender === "Male" ? "he/him" : gender === "Female" ? "she/her" : "they/them";
      
      // Generate detailed address components
      const addressStreet = faker.location.streetAddress();
      const city = faker.location.city();
      const state = faker.location.state({ abbreviated: true });
      const zipCode = faker.location.zipCode();
      
      // Generate emergency contact (80% have one)
      const hasEmergencyContact = Math.random() > 0.2;
      const emergencyContactName = hasEmergencyContact ? faker.person.fullName() : "";
      const emergencyContactRelation = hasEmergencyContact ? 
        faker.helpers.arrayElement(["Spouse", "Partner", "Parent", "Sibling", "Friend", "Child", "Other Relative"]) : "";
      const emergencyContactPhone = hasEmergencyContact ? faker.phone.number() : "";
      
      // Generate insurance information (90% have insurance)
      const hasInsurance = Math.random() > 0.1;
      const insuranceProvider = hasInsurance ? faker.helpers.arrayElement(insuranceProviders) : "Self-Pay";
      const insurancePolicyNumber = hasInsurance ? faker.finance.accountNumber() : "";
      const insuranceGroupNumber = hasInsurance ? faker.finance.accountNumber(6) : "";
      const copayAmount = hasInsurance ? 
        (insuranceProvider === "Medicare" || insuranceProvider === "Medicaid" ? 
          parseFloat(faker.finance.amount(0, 20, 0)) : 
          parseFloat(faker.finance.amount(20, 50, 0))
        ) : 0;
      
      // Generate random consent data
      const consentSigned = Math.random() > 0.1; // 90% have signed consent
      const consentCommunication = [];
      if (Math.random() > 0.2) consentCommunication.push("email");
      if (Math.random() > 0.3) consentCommunication.push("phone");
      if (Math.random() > 0.5) consentCommunication.push("text");
      if (Math.random() > 0.8) consentCommunication.push("patient portal");
      
      // Generate notes appropriate for mental health
      const notes = faker.lorem.paragraph(2) + 
        " Patient reports " + faker.helpers.arrayElement([
          "sleep disturbances and anxiety about work",
          "difficulty concentrating and persistent low mood",
          "flashbacks related to previous trauma",
          "conflict with family members",
          "excessive worry about health and finances",
          "feelings of hopelessness and low energy",
          "social isolation and avoidance behaviors",
          "struggles with emotional regulation"
        ]) + ". " + faker.lorem.sentence(3);
      
      // Generate clinical notes for therapist use only
      const privateNotes = "Assessment: " + faker.helpers.arrayElement([
          "Patient demonstrates moderate symptoms of anxiety with somatic manifestations",
          "Client shows signs of depression with notable anhedonia and social withdrawal",
          "Evidence of unresolved grief affecting daily functioning",
          "Possible comorbid conditions requiring further assessment",
          "Trauma history significantly impacting current relationships",
          "Cognitive distortions apparent, particularly catastrophizing",
          "Family dynamics appear to exacerbate presenting symptoms"
        ]) + ". " + faker.lorem.sentences(2);
      
      // Generate billing notes
      const billingNotes = faker.helpers.arrayElement([
        "Insurance authorization expires on " + faker.date.future().toLocaleDateString(),
        "Patient has outstanding balance of $" + faker.finance.amount(50, 300, 2),
        "Sliding scale fee arrangement - $" + faker.finance.amount(40, 90, 0) + " per session",
        "Insurance claims pending from last 3 sessions",
        "Preauthorization required for sessions beyond 10",
        "No billing issues at this time",
        "Patient has met deductible for current year"
      ]);
      
      // Calculate age from date of birth if available
      let age = null;
      if (client.dateOfBirth) {
        const dob = new Date(client.dateOfBirth);
        const today = new Date();
        age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
      }
      
      // Update client in database with extended information (just basic info since we don't have metadata)
      await db.update(clients)
        .set({
          // Ensure we keep existing data where available
          firstName: client.firstName || faker.person.firstName(),
          lastName: client.lastName || faker.person.lastName(),
          email: client.email || faker.internet.email(),
          phone: client.phone || faker.phone.number(),
          dateOfBirth: client.dateOfBirth || getRandomDate(new Date(1960, 0, 1), new Date(2005, 0, 1)),
          status: client.status || faker.helpers.arrayElement(["Active", "Active", "Active", "Inactive", "On Hold"]),
          
          // Add comprehensive address
          address: addressStreet + ", " + city + ", " + state + " " + zipCode,
          
          // Set random therapist as primary therapist
          primaryTherapistId: therapistUsers[Math.floor(Math.random() * therapistUsers.length)].id
        })
        .where(eq(clients.id, client.id));
        
      // Instead of adding metadata to the database, we'll create comprehensive notes in documentation
      // This way, the detailed client information will be accessible through their documentation
      
      // Create a detailed client profile note
      const profileNote = {
        clientId: client.id,
        therapistId: therapistUsers[Math.floor(Math.random() * therapistUsers.length)].id,
        title: `Client Profile: ${client.firstName} ${client.lastName}`,
        content: `
# Comprehensive Client Profile

## Personal Information
- **Full Name:** ${client.firstName} ${client.lastName}
- **Preferred Name:** ${Math.random() > 0.7 ? faker.person.firstName() : client.firstName}
- **Date of Birth:** ${client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "Not provided"}
- **Age:** ${age || "Not calculated"}
- **Gender Identity:** ${gender}
- **Preferred Pronouns:** ${pronoun}
- **Marital Status:** ${faker.helpers.arrayElement(["Single", "Married", "Divorced", "Separated", "Widowed", "Partnered"])}
- **Occupation:** ${faker.person.jobTitle()}
- **Employer:** ${faker.company.name()}

## Contact Information
- **Address:** ${addressStreet}, ${city}, ${state} ${zipCode}
- **Email:** ${client.email || "Not provided"}
- **Phone (Mobile):** ${client.phone || faker.phone.number()}
- **Phone (Home):** ${Math.random() > 0.5 ? faker.phone.number() : "Not provided"}
- **Phone (Work):** ${Math.random() > 0.7 ? faker.phone.number() : "Not provided"}

## Emergency Contact
- **Name:** ${emergencyContactName || "Not provided"}
- **Relationship:** ${emergencyContactRelation || "Not provided"}
- **Phone:** ${emergencyContactPhone || "Not provided"}

## Clinical Information
- **Primary Concern:** ${therapyFocus}
- **Diagnosis:** ${diagnosis.join(", ")}
- **Medications:** ${medication}
- **Allergies:** ${Math.random() > 0.8 ? faker.helpers.arrayElement(["Penicillin", "Latex", "Sulfa drugs", "NSAIDs", "No known allergies"]) : "No known allergies"}
- **Smoking Status:** ${faker.helpers.arrayElement(["Never smoker", "Former smoker", "Current smoker", "Unknown"])}
- **Substance Use History:** ${faker.helpers.arrayElement(["None reported", "Occasional alcohol", "History of substance use", "Active substance use", "In recovery"])}

## Treatment Information
- **Therapy Start Date:** ${getRandomDate(new Date(2022, 0, 1), new Date()).toLocaleDateString()}
- **Session Frequency:** ${faker.helpers.arrayElement(["Weekly", "Bi-weekly", "Monthly", "As needed"])}
- **Treatment Goals:** ${faker.lorem.sentences(2)}
- **Sessions Attended:** ${faker.number.int({min: 1, max: 30})}
- **No-Show Count:** ${faker.number.int({min: 0, max: 3})}
- **Cancellation Count:** ${faker.number.int({min: 0, max: 5})}

## Insurance Information
- **Insurance Provider:** ${insuranceProvider}
- **Policy Number:** ${insurancePolicyNumber || "Not provided"}
- **Group Number:** ${insuranceGroupNumber || "Not provided"}
- **Copay Amount:** $${copayAmount}
- **Deductible:** ${hasInsurance ? "$" + faker.finance.amount(500, 5000, 0) : "Not applicable"}
- **Responsible Party:** ${Math.random() > 0.8 ? faker.person.fullName() : "Self"}

## Referral Information
- **Referral Source:** ${faker.helpers.arrayElement([
  "Physician Referral", "Insurance Directory", "Psychology Today", 
  "Friend/Family", "Website", "Social Media", "Former Client"
])}

## Consent Information
- **HIPAA Consent Signed:** ${consentSigned ? "Yes" : "No"}
- **Treatment Consent Signed:** ${consentSigned ? "Yes" : "No"}
- **Communication Consent:** ${consentCommunication.join(", ")}
- **Preferred Contact Method:** ${faker.helpers.arrayElement(["Email", "Phone", "Text", "Patient Portal"])}

## Assessment Scores
- **PHQ-9 (Depression):** ${faker.number.int({min: 0, max: 27})}
- **GAD-7 (Anxiety):** ${faker.number.int({min: 0, max: 21})}
- **Current Distress Level (1-10):** ${faker.number.int({min: 1, max: 10})}

## Treatment Notes
${notes}

## Billing Notes
${billingNotes}
`,
        type: "Client Profile",
        status: "Complete",
      };
      
      try {
        // Add detailed profile to documentation
        await db.insert(documentation).values(profileNote);
        
        // Add treatment plan document
        const treatmentPlan = {
          clientId: client.id,
          therapistId: therapistUsers[Math.floor(Math.random() * therapistUsers.length)].id,
          title: `Treatment Plan: ${client.firstName} ${client.lastName}`,
          content: `
# Treatment Plan

## Client Information
- **Name:** ${client.firstName} ${client.lastName}
- **Date of Birth:** ${client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "Not provided"}

## Diagnosis
${diagnosis.map(d => `- ${d}`).join("\n")}

## Presenting Problems
${faker.helpers.arrayElement([
  "Client reports experiencing persistent anxiety with physical symptoms including racing heart, shortness of breath, and excessive worry.",
  "Client presents with symptoms of depression including low mood, decreased interest in activities, sleep disturbance, and feelings of worthlessness.",
  "Client describes difficulties with interpersonal relationships, particularly in romantic partnerships, with patterns of conflict and communication breakdown.",
  "Client reports experiencing intrusive thoughts and flashbacks related to past traumatic experiences, along with avoidance behaviors and hypervigilance.",
  "Client describes struggles with attention, concentration, and impulsivity that impact functioning in work and personal life.",
  "Client reports mood instability with periods of elevated mood, decreased need for sleep, and impulsive behavior alternating with depressive episodes.",
  "Client describes obsessive thoughts and compulsive behaviors that consume significant time and cause distress."
])}

## Goals and Objectives

### Goal 1: ${faker.helpers.arrayElement([
  "Reduce anxiety symptoms",
  "Alleviate depressive symptoms",
  "Process traumatic experiences",
  "Improve interpersonal functioning",
  "Develop emotional regulation skills",
  "Establish healthy boundaries",
  "Implement effective coping strategies"
])}
- Objective 1: ${faker.lorem.sentence()}
- Objective 2: ${faker.lorem.sentence()}
- Objective 3: ${faker.lorem.sentence()}

### Goal 2: ${faker.helpers.arrayElement([
  "Improve sleep hygiene",
  "Develop mindfulness practice",
  "Enhance communication skills",
  "Reduce avoidance behaviors",
  "Challenge negative thought patterns",
  "Increase social engagement",
  "Implement stress management techniques"
])}
- Objective 1: ${faker.lorem.sentence()}
- Objective 2: ${faker.lorem.sentence()}

## Interventions
${faker.helpers.arrayElements([
  "Cognitive Behavioral Therapy (CBT) to address negative thought patterns and develop coping strategies",
  "Mindfulness and relaxation techniques to manage anxiety and stress",
  "Exposure therapy to gradually confront avoided situations and reduce fear response",
  "Interpersonal therapy to improve communication and relationship patterns",
  "Dialectical Behavior Therapy (DBT) skills for emotional regulation and distress tolerance",
  "Psychoeducation about mental health conditions and treatment approaches",
  "Behavioral activation to increase engagement in positive activities",
  "Trauma-focused cognitive processing to address past traumatic experiences",
  "Solution-focused techniques to build on client strengths and develop practical strategies",
  "Motivational interviewing to enhance commitment to change"
], 3).join("\n\n")}

## Treatment Schedule
- Frequency: ${faker.helpers.arrayElement(["Weekly", "Bi-weekly", "Monthly"])}
- Duration: ${faker.helpers.arrayElement(["45", "50", "60"])} minutes
- Estimated length of treatment: ${faker.helpers.arrayElement(["3-6 months", "6-12 months", "12+ months", "To be determined based on progress"])}

## Plan for Monitoring Progress
- Regular assessment of symptom severity using standardized measures
- Ongoing review of progress toward treatment goals
- Adjustments to treatment plan as needed based on response and emerging needs

## Provider Signature
_____________________________
${therapistUsers[Math.floor(Math.random() * therapistUsers.length)].firstName} ${therapistUsers[Math.floor(Math.random() * therapistUsers.length)].lastName}
Date: ${new Date().toLocaleDateString()}
`,
          type: "Treatment Plan",
          status: "Complete",
        };
        
        await db.insert(documentation).values(treatmentPlan);
        
        // Add an initial progress note
        const progressNote = {
          clientId: client.id,
          therapistId: therapistUsers[Math.floor(Math.random() * therapistUsers.length)].id,
          sessionId: null, // No specific session
          title: `Initial Assessment: ${client.firstName} ${client.lastName}`,
          content: `
# Initial Assessment Note

## Session Information
- **Date:** ${getRandomDate(new Date(2023, 0, 1), new Date()).toLocaleDateString()}
- **Duration:** 50 minutes
- **Session Type:** Initial Assessment
- **Therapist:** ${therapistUsers[Math.floor(Math.random() * therapistUsers.length)].firstName} ${therapistUsers[Math.floor(Math.random() * therapistUsers.length)].lastName}

## Presenting Concerns
${faker.lorem.paragraph(2)} Client reports ${faker.helpers.arrayElement([
  "feeling anxious in social situations and avoiding group gatherings",
  "persistent low mood and difficulty finding enjoyment in previously pleasurable activities",
  "intrusive thoughts and memories related to past traumatic experiences",
  "difficulty managing anger and frequent conflicts with family members",
  "problems with focus and concentration that impact work performance",
  "feeling overwhelmed by persistent worry about various life circumstances",
  "sleep disturbances including difficulty falling asleep and early morning awakening"
])}.

## Mental Status Examination
- **Appearance:** ${faker.helpers.arrayElement(["Well-groomed", "Casually dressed", "Appropriately dressed", "Disheveled"])}
- **Behavior:** ${faker.helpers.arrayElement(["Cooperative", "Restless", "Withdrawn", "Agitated", "Calm"])}
- **Speech:** ${faker.helpers.arrayElement(["Normal rate and rhythm", "Pressured", "Slow", "Soft", "Loud"])}
- **Mood:** ${faker.helpers.arrayElement(["Euthymic", "Depressed", "Anxious", "Irritable", "Elevated"])}
- **Affect:** ${faker.helpers.arrayElement(["Full range", "Restricted", "Blunted", "Incongruent with mood", "Appropriate"])}
- **Thought Process:** ${faker.helpers.arrayElement(["Logical and coherent", "Tangential", "Circumstantial", "Flight of ideas", "Thought blocking"])}
- **Thought Content:** ${faker.helpers.arrayElement(["No abnormalities noted", "Ruminations", "Obsessions", "Paranoid ideation", "Delusions"])}
- **Suicidal/Homicidal Ideation:** ${faker.helpers.arrayElement(["Denied", "Passive thoughts without plan or intent", "Requires safety planning"])}
- **Cognitive Functioning:** ${faker.helpers.arrayElement(["Alert and oriented x4", "Mild concentration difficulties", "Memory concerns noted", "No apparent deficits"])}
- **Insight:** ${faker.helpers.arrayElement(["Good", "Fair", "Limited", "Poor"])}
- **Judgment:** ${faker.helpers.arrayElement(["Good", "Fair", "Impaired", "Poor"])}

## Assessment
${privateNotes}

## Plan
1. Schedule weekly therapy sessions to address presenting concerns
2. Provide psychoeducation about ${faker.helpers.arrayElement(["anxiety", "depression", "trauma", "emotional regulation", "ADHD", "interpersonal effectiveness"])}
3. Begin developing coping strategies for immediate symptom management
4. Consider referral for ${faker.helpers.arrayElement(["medication evaluation", "psychological testing", "support group", "specialized treatment program"])} if indicated
5. Review homework assignment at next session: ${faker.helpers.arrayElement(["daily thought log", "mindfulness practice", "sleep hygiene implementation", "behavioral activation schedule"])}

## Next Appointment
Scheduled for one week from today
`,
          type: "Progress Note",
          status: "Complete",
        };
        
        await db.insert(documentation).values(progressNote);
      } catch (error) {
        console.error(`Error creating documentation for client ${client.id}:`, error);
      }
      
      console.log(`Updated client "${client.firstName} ${client.lastName}" with detailed information`);
    } catch (error) {
      console.error(`Error updating client ${client.id}:`, error);
    }
  }
  
  console.log("Client update completed successfully!");
}

// Main function
export async function main() {
  console.log("Starting client update process...");
  
  try {
    await updateClients();
    
    // Display updated client count
    const updatedClients = await db.select().from(clients);
    console.log(`Database now has ${updatedClients.length} detailed clients`);
    
    return updatedClients;
  } catch (error) {
    console.error("Error during client update:", error);
    throw error;
  }
}

// Run the update function
main().catch(error => {
  console.error(error);
  process.exit(1);
});