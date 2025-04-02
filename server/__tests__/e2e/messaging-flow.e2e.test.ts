import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import puppeteer, { Browser, Page } from 'puppeteer';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import { createTestUser, createTestClient, createTestMessage } from '../fixtures/test-data';

describe('Messaging Flow E2E', () => {
  let browser: Browser;
  let page: Page;
  let testUser: any;
  let testClient: any;
  
  // Set up test environment
  beforeAll(async () => {
    // Set up test database
    await setupTestDatabase();
    
    // Create test data
    testUser = await createTestUser({
      username: 'therapist',
      firstName: 'Test',
      lastName: 'Therapist',
      email: 'therapist@example.com',
      role: 'therapist'
    });
    
    testClient = await createTestClient({
      firstName: 'John',
      lastName: 'Client',
      dateOfBirth: '1990-01-01',
      email: 'client@example.com',
      phone: '555-123-4567'
    });
    
    // Create some test messages
    await createTestMessage({
      clientId: testClient.id,
      content: 'Hello, I need to schedule an appointment',
      sender: 'client',
      isRead: false,
      createdAt: new Date(Date.now() - 86400000) // 1 day ago
    });
    
    await createTestMessage({
      clientId: testClient.id,
      content: 'Sure, I have availability next Tuesday',
      sender: 'therapist',
      isRead: true,
      createdAt: new Date(Date.now() - 43200000) // 12 hours ago
    });
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });
  
  // Clean up after tests
  afterAll(async () => {
    await browser.close();
    await teardownTestDatabase();
  });
  
  // Reset page before each test
  beforeEach(async () => {
    page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Log in
    await page.goto('http://localhost:3001/login');
    await page.type('input[name="username"]', 'therapist');
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete and redirect to dashboard
    await page.waitForNavigation();
  });
  
  it('should navigate to messages page and display client conversations', async () => {
    // Navigate to messages page
    await page.click('a[href="/messages"]');
    await page.waitForSelector('[data-testid="messages-page"]');
    
    // Check if client is displayed
    const clientElement = await page.waitForSelector(`[data-testid="client-${testClient.id}"]`);
    expect(clientElement).not.toBeNull();
    
    // Check if client name is displayed
    const clientName = await page.$eval(`[data-testid="client-${testClient.id}"] .client-name`, 
      (el) => el.textContent);
    expect(clientName).toContain('John Client');
    
    // Check if unread indicator is displayed
    const unreadIndicator = await page.$(`[data-testid="client-${testClient.id}"] .unread-indicator`);
    expect(unreadIndicator).not.toBeNull();
  });
  
  it('should display message conversation when client is selected', async () => {
    // Navigate to messages page
    await page.click('a[href="/messages"]');
    await page.waitForSelector('[data-testid="messages-page"]');
    
    // Click on client
    await page.click(`[data-testid="client-${testClient.id}"]`);
    
    // Wait for messages to load
    await page.waitForSelector('[data-testid="message-container"]');
    
    // Check if messages are displayed
    const messages = await page.$$('[data-testid="message-item"]');
    expect(messages.length).toBeGreaterThanOrEqual(2);
    
    // Check content of messages
    const messageContents = await page.$$eval('[data-testid="message-content"]', 
      (elements) => elements.map((el) => el.textContent));
    
    expect(messageContents).toContain('Hello, I need to schedule an appointment');
    expect(messageContents).toContain('Sure, I have availability next Tuesday');
  });
  
  it('should send a new message', async () => {
    // Navigate to messages page
    await page.click('a[href="/messages"]');
    await page.waitForSelector('[data-testid="messages-page"]');
    
    // Click on client
    await page.click(`[data-testid="client-${testClient.id}"]`);
    
    // Wait for message input to be available
    await page.waitForSelector('[data-testid="message-input"]');
    
    // Type a new message
    const newMessage = 'This is a test message sent via E2E test';
    await page.type('[data-testid="message-input"]', newMessage);
    
    // Click send button
    await page.click('[data-testid="send-button"]');
    
    // Wait for the message to appear
    await page.waitForFunction(
      (text) => {
        const elements = document.querySelectorAll('[data-testid="message-content"]');
        return Array.from(elements).some(el => el.textContent?.includes(text));
      }, 
      {},
      newMessage
    );
    
    // Verify the message is in the conversation
    const messageContents = await page.$$eval('[data-testid="message-content"]', 
      (elements) => elements.map((el) => el.textContent));
    
    expect(messageContents).toContain(newMessage);
  });
  
  it('should mark messages as read when conversation is opened', async () => {
    // Navigate to messages page
    await page.click('a[href="/messages"]');
    await page.waitForSelector('[data-testid="messages-page"]');
    
    // Check if unread indicator exists before opening conversation
    const unreadIndicatorBefore = await page.$(`[data-testid="client-${testClient.id}"] .unread-indicator`);
    expect(unreadIndicatorBefore).not.toBeNull();
    
    // Click on client
    await page.click(`[data-testid="client-${testClient.id}"]`);
    
    // Wait for messages to load
    await page.waitForSelector('[data-testid="message-container"]');
    
    // Navigate away and back to messages page to refresh client list
    await page.click('a[href="/dashboard"]');
    await page.waitForSelector('[data-testid="dashboard-page"]');
    await page.click('a[href="/messages"]');
    await page.waitForSelector('[data-testid="messages-page"]');
    
    // Check if unread indicator is gone after reading messages
    const unreadIndicatorAfter = await page.$(`[data-testid="client-${testClient.id}"] .unread-indicator`);
    expect(unreadIndicatorAfter).toBeNull();
  });
  
  it('should filter conversations using search', async () => {
    // Navigate to messages page
    await page.click('a[href="/messages"]');
    await page.waitForSelector('[data-testid="messages-page"]');
    
    // Verify client is visible initially
    const clientBefore = await page.$(`[data-testid="client-${testClient.id}"]`);
    expect(clientBefore).not.toBeNull();
    
    // Type in search box
    await page.type('[data-testid="search-input"]', 'NonExistentClient');
    
    // Wait for filtering to occur
    await page.waitForTimeout(300);
    
    // Client should no longer be visible
    const clientAfter = await page.$(`[data-testid="client-${testClient.id}"]`);
    expect(clientAfter).toBeNull();
    
    // Clear search box
    await page.click('[data-testid="search-input"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    
    // Type the actual client name
    await page.type('[data-testid="search-input"]', 'John');
    
    // Wait for filtering to occur
    await page.waitForTimeout(300);
    
    // Client should be visible again
    const clientAfterValidSearch = await page.$(`[data-testid="client-${testClient.id}"]`);
    expect(clientAfterValidSearch).not.toBeNull();
  });
}); 