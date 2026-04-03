import { z } from 'zod';

export const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  channel_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  guest_name: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  parent_message_id: z.string().uuid().optional(),
});

export const channelSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_-\s]+$/),
  description: z.string().max(500).optional(),
  is_private: z.boolean().optional(),
});

export const userProfileSchema = z.object({
  display_name: z.string().min(2).max(30),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().nullable(),
});

export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
  type: z.string().regex(/^(image\/(jpeg|png|gif|webp)|application\/pdf|text\/plain)$/),
});

// Type exports for use with schema validation
export type MessageInput = z.infer<typeof messageSchema>;
export type ChannelInput = z.infer<typeof channelSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;

// Helper function to validate and return parsed data or throw
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Helper function to validate and return result without throwing
export function safeValidateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
