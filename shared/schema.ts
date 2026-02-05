
import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  thumbnail: text("thumbnail"),
  format: varchar("format", { length: 10 }).notNull(), // 'mp4' | 'mp3'
  quality: varchar("quality", { length: 20 }), // '1080p', 'highest', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({ 
  id: true, 
  createdAt: true 
});

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;

export type VideoInfoResponse = {
  title: string;
  thumbnail: string;
  duration: string;
  formats: {
    itag: number;
    qualityLabel: string;
    container: string;
    hasAudio: boolean;
    hasVideo: boolean;
  }[];
};
