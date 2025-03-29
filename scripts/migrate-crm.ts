// scripts/migrate-crm.ts
import { db } from '../server/db';
import { 
  contactHistory, 
  marketingCampaigns, 
  clients, 
  leads, 
  referralSources, 
  eventRegistrations
} from '../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * This script pushes the CRM data connectivity schema changes to the database
 * using Drizzle Kit and performs necessary data migrations.
 */
async function migrateCrmData() {
  console.log('Starting CRM data connectivity migration...');
  
  try {
    // First, run the schema push using Drizzle
    console.log('Pushing schema changes to database...');
    const { stdout, stderr } = await execAsync('npm run db:push');
    
    if (stderr && !stderr.includes('warnings')) {
      console.error('Error in db:push:', stderr);
      return;
    }
    
    console.log('Schema push output:', stdout);
    console.log('Schema push complete!');
    
    // Now perform data migrations that connect the various entities
    
    // 1. Connect any contact history records to their related marketing campaigns
    console.log('Connecting contact history to marketing campaigns...');
    const marketingCampaignRecords = await db.select().from(marketingCampaigns);
    const contactHistoryRecords = await db.select().from(contactHistory)
      .where(isNull(contactHistory.campaignId));
    
    // Map campaigns by name for easier lookup
    const campaignsByName = new Map();
    marketingCampaignRecords.forEach(campaign => {
      campaignsByName.set(campaign.name.toLowerCase(), campaign.id);
    });
    
    // Update contact history records that might be related to campaigns
    for (const record of contactHistoryRecords) {
      // Skip records that don't have any notes
      if (!record.notes) continue;
      
      // Look through notes for campaign mentions
      const notes = record.notes.toLowerCase();
      
      for (const [campaignName, campaignId] of campaignsByName.entries()) {
        if (notes.includes(campaignName)) {
          // Found a potential match, update the record
          console.log(`Connecting contact history #${record.id} to marketing campaign #${campaignId}`);
          
          try {
            await db.update(contactHistory)
              .set({ campaignId: campaignId })
              .where(eq(contactHistory.id, record.id));
          } catch (err) {
            console.error(`Error updating contact history #${record.id}:`, err);
          }
          
          break; // Only connect to the first matching campaign
        }
      }
    }
    
    // 2. Connect clients to their original marketing campaigns where possible
    console.log('Connecting clients to their original marketing campaigns...');
    const clientRecords = await db.select().from(clients)
      .where(isNull(clients.originalMarketingCampaignId));
    
    for (const client of clientRecords) {
      // Try to find a contact history record for this client with a campaign ID
      const [contactRecord] = await db.select()
        .from(contactHistory)
        .where(
          and(
            eq(contactHistory.clientId, client.id),
            isNull(contactHistory.campaignId).not()
          )
        )
        .limit(1);
      
      if (contactRecord && contactRecord.campaignId) {
        console.log(`Connecting client #${client.id} to original marketing campaign #${contactRecord.campaignId}`);
        
        try {
          await db.update(clients)
            .set({ originalMarketingCampaignId: contactRecord.campaignId })
            .where(eq(clients.id, client.id));
        } catch (err) {
          console.error(`Error updating client #${client.id}:`, err);
        }
      }
    }
    
    // 3. Connect leads to referral sources where possible
    console.log('Connecting leads to referral sources...');
    const leadRecords = await db.select().from(leads)
      .where(isNull(leads.sourceId));
    const referralSourceRecords = await db.select().from(referralSources);
    
    // Map referral sources by name for easier lookup
    const sourcesByName = new Map();
    referralSourceRecords.forEach(source => {
      sourcesByName.set(source.name.toLowerCase(), source.id);
    });
    
    for (const lead of leadRecords) {
      // Skip leads that don't have a source text
      if (!lead.source) continue;
      
      const sourceText = lead.source.toLowerCase();
      
      // Try to match the source text to a referral source
      for (const [sourceName, sourceId] of sourcesByName.entries()) {
        if (sourceText.includes(sourceName) || sourceName.includes(sourceText)) {
          console.log(`Connecting lead #${lead.id} to referral source #${sourceId}`);
          
          try {
            await db.update(leads)
              .set({ sourceId: sourceId })
              .where(eq(leads.id, lead.id));
          } catch (err) {
            console.error(`Error updating lead #${lead.id}:`, err);
          }
          
          break; // Only connect to the first matching source
        }
      }
    }
    
    // 4. Add email tracking info to contact history where there's a campaign connection
    console.log('Updating contact history with email tracking information...');
    const campaignConnectedRecords = await db.select()
      .from(contactHistory)
      .where(isNull(contactHistory.campaignId).not());
    
    for (const record of campaignConnectedRecords) {
      // Only update email-related contact records that don't have tracking info yet
      if (
        record.contactType?.toLowerCase().includes('email') && 
        (record.emailStatus === null || record.emailOpened === null)
      ) {
        console.log(`Adding email tracking info to contact history #${record.id}`);
        
        try {
          await db.update(contactHistory)
            .set({ 
              emailStatus: 'sent',
              emailOpened: false,
              emailClicked: false 
            })
            .where(eq(contactHistory.id, record.id));
        } catch (err) {
          console.error(`Error updating contact history #${record.id}:`, err);
        }
      }
    }
    
    console.log('CRM data connectivity migration completed successfully!');
  } catch (error) {
    console.error('Error during CRM data migration:', error);
  }
}

migrateCrmData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error in migration script:', error);
    process.exit(1);
  });