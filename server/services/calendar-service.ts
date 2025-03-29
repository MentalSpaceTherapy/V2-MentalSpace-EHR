import { Session, InsertSession } from '../../shared/schema';
import { IStorage } from '../storage';

interface CreateCalendarEvent {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: Array<{ email: string; name?: string }>;
}

interface CalendarEvent extends CreateCalendarEvent {
  id: string;
}

interface CalendarProvider {
  createEvent(event: CreateCalendarEvent): Promise<string>;
  updateEvent(eventId: string, event: CalendarEvent): Promise<string>;
  deleteEvent(eventId: string): Promise<boolean>;
  getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
}

class GoogleCalendarProvider implements CalendarProvider {
  private authConfig: any;

  constructor(authConfig: any) {
    this.authConfig = authConfig;
  }

  async createEvent(event: CreateCalendarEvent): Promise<string> {
    // This is a placeholder implementation
    // In a real application, this would use the Google Calendar API
    console.log('Creating Google Calendar event:', event);
    return `google-event-${Date.now()}`;
  }

  async updateEvent(eventId: string, event: CalendarEvent): Promise<string> {
    console.log('Updating Google Calendar event:', eventId, event);
    return eventId;
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    console.log('Deleting Google Calendar event:', eventId);
    return true;
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    console.log('Getting Google Calendar events between', startDate, 'and', endDate);
    return [];
  }
}

class OutlookCalendarProvider implements CalendarProvider {
  private authConfig: any;

  constructor(authConfig: any) {
    this.authConfig = authConfig;
  }

  async createEvent(event: CreateCalendarEvent): Promise<string> {
    // This is a placeholder implementation
    // In a real application, this would use the Microsoft Graph API
    console.log('Creating Outlook Calendar event:', event);
    return `outlook-event-${Date.now()}`;
  }

  async updateEvent(eventId: string, event: CalendarEvent): Promise<string> {
    console.log('Updating Outlook Calendar event:', eventId, event);
    return eventId;
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    console.log('Deleting Outlook Calendar event:', eventId);
    return true;
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    console.log('Getting Outlook Calendar events between', startDate, 'and', endDate);
    return [];
  }
}

export class CalendarService {
  private storage: IStorage;
  private providers: Record<string, CalendarProvider> = {};

  constructor(storage: IStorage) {
    this.storage = storage;

    // Initialize calendar providers (would use real auth in production)
    this.providers['google'] = new GoogleCalendarProvider({});
    this.providers['outlook'] = new OutlookCalendarProvider({});
  }

  async createSessionWithCalendarEvent(sessionData: InsertSession, calendarType?: string): Promise<Session> {
    // First create the session in our database
    const session = await this.storage.createSession(sessionData);

    // If calendar integration is requested
    if (calendarType && this.providers[calendarType]) {
      try {
        // Get client and therapist details for the calendar event
        const client = await this.storage.getClient(session.clientId);
        const therapist = await this.storage.getUser(session.therapistId);

        if (!client || !therapist) {
          throw new Error('Could not find client or therapist details');
        }

        // Create calendar event using provider
        const eventId = await this.providers[calendarType].createEvent({
          summary: `Therapy Session: ${client.firstName} ${client.lastName}`,
          description: session.notes || 'Therapy session',
          start: session.startTime,
          end: session.endTime,
          location: session.location || '',
          attendees: [
            { email: therapist.email, name: `${therapist.firstName} ${therapist.lastName}` },
            { email: client.email || '', name: `${client.firstName} ${client.lastName}` }
          ].filter(a => a.email), // Filter out attendees without email
        });

        // Update session with external calendar event ID
        await this.storage.updateSession(session.id, {
          externalCalendarEventId: eventId,
          externalCalendarType: calendarType
        });

        // Return updated session
        return await this.storage.getSession(session.id) as Session;
      } catch (error) {
        console.error('Failed to create calendar event:', error);
        // Still return the session even if calendar integration fails
        return session;
      }
    }

    return session;
  }

  async updateSessionWithCalendarEvent(sessionId: number, sessionData: Partial<InsertSession>): Promise<Session | undefined> {
    // Get the existing session
    const existingSession = await this.storage.getSession(sessionId);
    if (!existingSession) {
      throw new Error('Session not found');
    }

    // Update the session in our database
    const updatedSession = await this.storage.updateSession(sessionId, sessionData);
    if (!updatedSession) {
      throw new Error('Failed to update session');
    }

    // If session has an external calendar event, update it
    if (updatedSession.externalCalendarEventId && updatedSession.externalCalendarType) {
      try {
        const client = await this.storage.getClient(updatedSession.clientId);
        const therapist = await this.storage.getUser(updatedSession.therapistId);

        if (!client || !therapist) {
          throw new Error('Could not find client or therapist details');
        }

        const provider = this.providers[updatedSession.externalCalendarType];
        if (provider) {
          await provider.updateEvent(updatedSession.externalCalendarEventId, {
            id: updatedSession.externalCalendarEventId,
            summary: `Therapy Session: ${client.firstName} ${client.lastName}`,
            description: updatedSession.notes || 'Therapy session',
            start: updatedSession.startTime,
            end: updatedSession.endTime,
            location: updatedSession.location || '',
            attendees: [
              { email: therapist.email, name: `${therapist.firstName} ${therapist.lastName}` },
              { email: client.email || '', name: `${client.firstName} ${client.lastName}` }
            ].filter(a => a.email), // Filter out attendees without email
          });
        }
      } catch (error) {
        console.error('Failed to update calendar event:', error);
        // Continue with the operation even if calendar update fails
      }
    }

    return updatedSession;
  }

  async deleteSessionWithCalendarEvent(sessionId: number): Promise<boolean> {
    // Get the existing session
    const existingSession = await this.storage.getSession(sessionId);
    if (!existingSession) {
      throw new Error('Session not found');
    }

    // If session has an external calendar event, delete it
    if (existingSession.externalCalendarEventId && existingSession.externalCalendarType) {
      try {
        const provider = this.providers[existingSession.externalCalendarType];
        if (provider) {
          await provider.deleteEvent(existingSession.externalCalendarEventId);
        }
      } catch (error) {
        console.error('Failed to delete calendar event:', error);
        // Continue with the operation even if calendar deletion fails
      }
    }

    // Delete the session from our database
    return await this.storage.deleteSession(sessionId);
  }

  // This method would be called by a scheduler to process reminders
  async processSessionReminders(): Promise<number> {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    // Find sessions that need reminders
    const sessionsNeedingReminders = await this.storage.getSessions({
      reminderSent: false,
      reminderTime: { lte: thirtyMinutesFromNow },
      status: 'scheduled',
    });

    let remindersSent = 0;

    for (const session of sessionsNeedingReminders) {
      try {
        // Get client and therapist details
        const client = await this.storage.getClient(session.clientId);
        const therapist = await this.storage.getUser(session.therapistId);

        if (!client || !therapist) {
          console.error(`Could not find client or therapist for session ${session.id}`);
          continue;
        }

        // In a real app, this would send an email, SMS, or notification
        console.log(`Sending reminder for session ${session.id} to ${client.firstName} ${client.lastName}`);
        
        // Update the session to mark reminder as sent
        await this.storage.updateSession(session.id, { reminderSent: true });
        
        remindersSent++;
      } catch (error) {
        console.error(`Failed to send reminder for session ${session.id}:`, error);
      }
    }

    return remindersSent;
  }
}