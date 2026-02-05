import { motion } from "framer-motion";
import { Clock, Download, Music, Video, Film, Disc } from "lucide-react";
import { useState } from "react";
import { type VideoInfoResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useRecordDownload } from "@/hooks/use-downloader";
import { useToast } from "@/hooks/use-toast";

interface VideoCardProps {
  info: VideoInfoResponse;
  originalUrl: string;
}

export function VideoCard({ info, originalUrl }: VideoCardProps) {
  const [format, setFormat] = useState<"mp4" | "mp3">("mp4");
  const [quality, setQuality] = useState<string>("");
  const { toast } = useToast();
  const recordDownload = useRecordDownload();

  // Filter formats based on selected type
  const availableFormats = info.formats
    .filter((f) => {
      if (format === "mp4") return f.hasVideo; // Allow video-only for better selection
      return f.hasAudio;
    })
    // Remove duplicates by quality label
    .filter((v, i, a) => {
      if (!v.qualityLabel) return i === a.findIndex(t => t.itag === v.itag);
      return i === a.findIndex((t) => t.qualityLabel === v.qualityLabel);
    })
    .sort((a, b) => (b.itag || 0) - (a.itag || 0));

  // Auto-select highest quality when formats change
  const currentItag = quality || (availableFormats.length > 0 ? String(availableFormats[0].itag) : "");

  const handleDownload = () => {
    try {
      // Construct download URL
      const selectedItag = quality || (availableFormats.length > 0 ? String(availableFormats[0].itag) : "");
      const params = new URLSearchParams({
        url: originalUrl,
        format,
        ...(selectedItag ? { itag: selectedItag } : {}),
      });

      const downloadUrl = `/api/download?${params.toString()}`;

      // Trigger download
      window.location.href = downloadUrl;

      // Record in history
      recordDownload.mutate({
        url: originalUrl,
        title: info.title,
        thumbnail: info.thumbnail,
        format,
        quality: quality || "auto",
      });

      toast({
        title: "Download Started",
        description: `Your ${format.toUpperCase()} file is being processed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start download.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <Card className="overflow-hidden border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail Section */}
          <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-black/5">
            <img
              src={info.thumbnail}
              alt={info.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-md backdrop-blur-md flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {info.duration}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold font-display line-clamp-2 leading-tight text-foreground">
                {info.title}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Tabs
                  value={format}
                  onValueChange={(v) => setFormat(v as "mp4" | "mp3")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                    <TabsTrigger value="mp4" className="flex items-center gap-2">
                      <Video className="w-4 h-4" /> Video
                    </TabsTrigger>
                    <TabsTrigger value="mp3" className="flex items-center gap-2">
                      <Music className="w-4 h-4" /> Audio
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex gap-3">
                {format === "mp4" && (
                  <Select value={currentItag} onValueChange={setQuality}>
                    <SelectTrigger className="w-[160px] bg-background/50 border-border/50">
                      <SelectValue placeholder="Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFormats.map((f) => (
                        <SelectItem key={f.itag} value={String(f.itag)}>
                          {f.qualityLabel || (f.hasAudio && !f.hasVideo ? "Audio Only" : "Unknown")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 font-semibold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {format.toUpperCase()}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
