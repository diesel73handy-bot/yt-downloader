import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVideoInfo } from "@/hooks/use-downloader";
import { VideoCard } from "@/components/VideoCard";
import { HistoryList } from "@/components/HistoryList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Youtube, ArrowRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const searchSchema = z.object({
  url: z.string().url("Please enter a valid URL").min(1, "URL is required"),
});

type SearchForm = z.infer<typeof searchSchema>;

export default function Home() {
  const { register, handleSubmit, formState: { errors } } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
  });

  const { mutate: fetchInfo, data: videoInfo, isPending, error } = useVideoInfo();
  const [lastUrl, setLastUrl] = useState("");

  const onSubmit = (data: SearchForm) => {
    setLastUrl(data.url);
    fetchInfo(data.url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-accent/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />

      <div className="container max-w-5xl mx-auto px-4 py-16 md:py-24">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-primary/10 mb-6 ring-1 ring-black/5">
            <Youtube className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground text-balance">
            Download YouTube <br className="hidden md:block"/> Videos Instantly
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            The simplest way to save your favorite content. Supports 4K video and high-quality audio extraction.
          </p>
        </motion.div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto relative z-10">
          <form onSubmit={handleSubmit(onSubmit)} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex shadow-xl shadow-black/5 rounded-2xl overflow-hidden bg-background ring-1 ring-border focus-within:ring-2 focus-within:ring-primary transition-all duration-300">
              <div className="pl-6 flex items-center justify-center text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <Input
                {...register("url")}
                placeholder="Paste YouTube link here..."
                className="border-0 shadow-none focus-visible:ring-0 h-16 text-lg bg-transparent px-4 font-medium"
              />
              <div className="pr-2 py-2">
                <Button 
                  type="submit" 
                  disabled={isPending}
                  size="lg"
                  className="h-12 px-8 rounded-xl font-semibold bg-primary hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Get Video <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
          
          <AnimatePresence>
            {errors.url && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-destructive font-medium text-center"
              >
                {errors.url.message}
              </motion.p>
            )}
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-destructive font-medium text-center"
              >
                Could not find video. Please check the URL and try again.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {videoInfo && (
            <VideoCard key={videoInfo.title} info={videoInfo} originalUrl={lastUrl} />
          )}
        </AnimatePresence>

        {/* History Section */}
        <HistoryList />
      </div>
    </div>
  );
}
