import { useDownloadHistory } from "@/hooks/use-downloader";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileAudio, FileVideo, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function HistoryList() {
  const { data: history, isLoading } = useDownloadHistory();

  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold font-display text-muted-foreground mb-4">Recent Downloads</h3>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!history?.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 mb-20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold font-display text-foreground">Recent Downloads</h3>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {history.length} items
        </span>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200 border-border/40 group">
                <div className="relative w-20 h-14 shrink-0 rounded-md overflow-hidden bg-muted">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      {item.format === 'mp3' ? <FileAudio className="w-6 h-6" /> : <FileVideo className="w-6 h-6" />}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-black/60 text-[10px] text-white px-1.5 py-0.5 rounded-tl-md">
                    {item.format.toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {item.format === 'mp3' ? <FileAudio className="w-3 h-3" /> : <FileVideo className="w-3 h-3" />}
                      {item.quality || 'Standard'}
                    </span>
                    <span>•</span>
                    <span>{item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
