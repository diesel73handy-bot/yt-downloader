
import { z } from 'zod';
import { insertDownloadSchema, downloads } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  info: {
    method: 'POST' as const,
    path: '/api/info',
    input: z.object({
      url: z.string().url()
    }),
    responses: {
      200: z.object({
        title: z.string(),
        thumbnail: z.string(),
        duration: z.string(),
        formats: z.array(z.object({
          itag: z.number(),
          qualityLabel: z.string().nullable().optional(),
          container: z.string(),
          hasAudio: z.boolean(),
          hasVideo: z.boolean(),
        }))
      }),
      400: errorSchemas.validation,
    },
  },
  download: {
    method: 'GET' as const,
    path: '/api/download',
    // We use query params for GET download requests
    input: z.object({
      url: z.string().url(),
      format: z.string(), // mp4 or mp3
      itag: z.string().optional(), // Specific quality itag
    }),
    responses: {
      // Stream response doesn't map cleanly to JSON schema, but we document it
      200: z.any(), 
      400: errorSchemas.validation,
    },
  },
  history: {
    method: 'GET' as const,
    path: '/api/history',
    responses: {
      200: z.array(z.custom<typeof downloads.$inferSelect>()),
    },
  },
  recordHistory: {
    method: 'POST' as const,
    path: '/api/history',
    input: insertDownloadSchema,
    responses: {
      201: z.custom<typeof downloads.$inferSelect>(),
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
