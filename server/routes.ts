
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import ytdl from "@distube/ytdl-core";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.info.path, async (req, res) => {
    try {
      const { url } = api.info.input.parse(req.body);
      
      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      const info = await ytdl.getInfo(url);
      
      const formats = info.formats
        .filter(f => f.container === 'mp4' || f.hasAudio)
        .map(f => ({
          itag: f.itag,
          qualityLabel: f.qualityLabel,
          container: f.container,
          hasAudio: f.hasAudio,
          hasVideo: f.hasVideo
        }));

      res.json({
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[0]?.url || "",
        duration: info.videoDetails.lengthSeconds,
        formats
      });
    } catch (err) {
      console.error('Info error:', err);
      res.status(400).json({ message: "Failed to fetch video info" });
    }
  });

  app.get(api.download.path, async (req, res) => {
    try {
      const url = req.query.url as string;
      const format = req.query.format as string;
      const itag = req.query.itag ? parseInt(req.query.itag as string) : undefined;

      if (!ytdl.validateURL(url)) {
        return res.status(400).send("Invalid URL");
      }

      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
      
      res.header('Content-Disposition', `attachment; filename="${title}.${format === 'mp3' ? 'mp3' : 'mp4'}"`);

      if (format === 'mp3') {
        ytdl(url, { quality: 'highestaudio', filter: 'audioonly' })
          .on('error', (err) => {
            console.error('ytdl error:', err);
            if (!res.headersSent) res.status(500).send("Download failed");
          })
          .pipe(res);
      } else {
        // For video, we try to find a muxed stream (video+audio) first
        // If itag is provided, we use it.
        const options: ytdl.downloadOptions = itag 
          ? { quality: itag } 
          : { quality: 'highest', filter: 'audioandvideo' };
          
        ytdl(url, options)
          .on('error', (err) => {
            console.error('ytdl error:', err);
            if (!res.headersSent) res.status(500).send("Download failed");
          })
          .pipe(res);
      }
    } catch (err) {
      console.error('Download error:', err);
      res.status(500).send("Download failed");
    }
  });

  app.get(api.history.path, async (req, res) => {
    const history = await storage.getHistory();
    res.json(history);
  });

  app.post(api.recordHistory.path, async (req, res) => {
    try {
      const input = api.recordHistory.input.parse(req.body);
      const entry = await storage.createDownload(input);
      res.status(201).json(entry);
    } catch (err) {
      res.status(400).json({ message: "Invalid history data" });
    }
  });

  return httpServer;
}
