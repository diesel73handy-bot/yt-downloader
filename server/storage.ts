
import { db } from "./db";
import {
  downloads,
  type InsertDownload,
  type Download
} from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getHistory(): Promise<Download[]>;
  createDownload(download: InsertDownload): Promise<Download>;
}

export class DatabaseStorage implements IStorage {
  async getHistory(): Promise<Download[]> {
    return await db.select()
      .from(downloads)
      .orderBy(desc(downloads.createdAt))
      .limit(20);
  }

  async createDownload(insertDownload: InsertDownload): Promise<Download> {
    const [download] = await db.insert(downloads)
      .values(insertDownload)
      .returning();
    return download;
  }
}

export const storage = new DatabaseStorage();
