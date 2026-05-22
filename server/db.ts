import { MongoClient } from "mongodb";

export type DbMode = "database" | "memory";

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  organization: string;
  website: string;
  address: string;
  linkedin: string;
  twitter: string;
  github: string;
  avatar: string; // Base64 DataURL string
  createdAt: string;
}

export let dbMode: DbMode = "memory";
export let dbError: string | null = null;

let cachedClient: MongoClient | null = null;
const inMemoryContacts: Contact[] = [];

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    dbMode = "memory";
    dbError = "MONGODB_URI environment variable is absent";
    throw new Error("MONGODB_URI is absent");
  }
  
  if (cachedClient) {
    try {
      const db = cachedClient.db();
      await db.command({ ping: 1 });
      return db;
    } catch (e: any) {
      console.warn("Cached database client connection is dead, recreating:", e.message || e);
      try {
        await cachedClient.close();
      } catch (closeErr) {
        // Ignore errors during closing a stale client
      }
      cachedClient = null;
    }
  }

  try {
    cachedClient = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await cachedClient.connect();
    dbMode = "database";
    dbError = null;
    return cachedClient.db();
  } catch (err: any) {
    dbMode = "memory";
    dbError = err.message || "Failed to connect to MongoDB";
    console.warn("Failed to connect to MongoDB. Falling back to in-memory mode:", err);
    throw err;
  }
}

export async function initializeDbConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    dbMode = "memory";
    dbError = "MONGODB_URI is not set";
    return;
  }
  try {
    await getDb();
    dbMode = "database";
  } catch (err: any) {
    dbMode = "memory";
    dbError = err.message || "Initialization failed";
  }
}

export function getMemoryStore(): Contact[] {
  return inMemoryContacts;
}
