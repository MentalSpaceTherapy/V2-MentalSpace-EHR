import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: any; // Using any to avoid typescript errors
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  sessionStore: any; // Using any to avoid typescript errors

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Setup in-memory session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add a sample user for development testing
    const sampleUser: InsertUser = {
      username: "therapist@mentalspace.com",
      password: "password123", // This will be hashed by auth.ts
      firstName: "Sarah",
      lastName: "Johnson",
      email: "therapist@mentalspace.com",
      role: "Therapist",
      licenseType: "LPC, LMHC",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    
    this.createUser(sampleUser).catch(console.error);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    
    // Create a user object with all required fields explicitly defined
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      email: insertUser.email,
      role: insertUser.role,
      status: "active",
      licenseType: insertUser.licenseType ?? null,
      licenseNumber: insertUser.licenseNumber ?? null,
      licenseExpirationDate: insertUser.licenseExpirationDate ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null
    };
    
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
