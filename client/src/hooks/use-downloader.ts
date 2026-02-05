import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertDownload } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useVideoInfo() {
  return useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", api.info.path, { url });
      return api.info.responses[200].parse(await res.json());
    },
  });
}

export function useDownloadHistory() {
  return useQuery({
    queryKey: [api.history.path],
    queryFn: async () => {
      const res = await fetch(api.history.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.history.responses[200].parse(await res.json());
    },
  });
}

export function useRecordDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDownload) => {
      const res = await apiRequest("POST", api.recordHistory.path, data);
      return api.recordHistory.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.history.path] });
    },
  });
}
