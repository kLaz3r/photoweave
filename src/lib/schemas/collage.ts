import { z } from "zod";

// Enums
export const LayoutStyle = z.enum(["masonry", "grid"]);
export const OutputFormat = z.enum(["jpeg", "png", "tiff"]);
export const JobStatus = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

// Request Models
export const CollageConfigSchema = z.object({
  width_mm: z.number().min(50.0).max(1219.2).default(304.8),
  height_mm: z.number().min(50.0).max(1219.2).default(457.2),
  dpi: z.number().int().min(72).max(300).default(150),
  layout_style: LayoutStyle.default("masonry"),
  spacing: z.number().min(0.0).max(100.0).default(40.0),
  background_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/)
    .default("#FFFFFF"),
  maintain_aspect_ratio: z.boolean().default(true),
  apply_shadow: z.boolean().default(false),
  output_format: OutputFormat.default("jpeg"),
  face_aware_cropping: z.boolean().default(false),
  face_margin: z.number().min(0.0).max(0.3).default(0.08),
  pretrim_borders: z.boolean().default(false),
});

export const CollagePixelConfigSchema = z.object({
  width_px: z.number().int().min(320).max(20000).default(1920),
  height_px: z.number().int().min(320).max(20000).default(1080),
  dpi: z.number().int().min(72).max(300).default(96),
  layout_style: LayoutStyle.default("masonry"),
  spacing: z.number().min(0.0).max(100.0).default(40.0),
  background_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/)
    .default("#FFFFFF"),
  maintain_aspect_ratio: z.boolean().default(true),
  apply_shadow: z.boolean().default(false),
  output_format: OutputFormat.default("jpeg"),
  face_aware_cropping: z.boolean().default(false),
  face_margin: z.number().min(0.0).max(0.3).default(0.08),
  pretrim_borders: z.boolean().default(false),
});

// Response Models
export const CreateCollageResponseSchema = z.object({
  job_id: z.string().uuid(),
  status: JobStatus,
  message: z.string(),
});

export const CollageJobPublicSchema = z.object({
  job_id: z.string().uuid(),
  status: JobStatus,
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
  output_file: z.string().nullable(),
  error_message: z.string().nullable(),
  progress: z.number().int().min(0).max(100).default(0),
});

export const CleanupResponseSchema = z.object({
  message: z.string(),
});

export const HealthCheckResponseSchema = z.object({
  status: z.enum(["healthy", "unhealthy"]),
  timestamp: z.string().datetime(),
  version: z.string(),
  checks: z.object({
    filesystem: z.object({
      temp_dir: z.string(),
      temp_space_gb: z.number(),
      output_dir: z.string(),
      output_space_gb: z.number(),
      healthy: z.boolean(),
    }),
    jobs: z.object({
      total_jobs: z.number().int(),
      active_jobs: z.number().int(),
      healthy: z.boolean(),
    }),
    dependencies: z.object({
      magic_available: z.boolean(),
      redis_connected: z.boolean(),
      healthy: z.boolean(),
    }),
  }),
});

// Additional Request Models for Specific Endpoints
export const OptimizeGridRequestSchema = z.object({
  num_images: z.number().int().min(2).max(200),
  width_mm: z.number().min(50.0).max(1219.2).default(304.8),
  height_mm: z.number().min(50.0).max(1219.2).default(457.2),
  dpi: z.number().int().min(72).max(300).default(150),
  spacing: z.number().min(0.0).max(100.0).default(40.0),
});

export const AnalyzeMasonryRequestSchema = OptimizeGridRequestSchema;

export const JobIdParamsSchema = z.object({
  job_id: z.string().uuid(),
});

// Types
export type LayoutStyle = z.infer<typeof LayoutStyle>;
export type OutputFormat = z.infer<typeof OutputFormat>;
export type JobStatus = z.infer<typeof JobStatus>;

export type CollageConfig = z.infer<typeof CollageConfigSchema>;
export type CollagePixelConfig = z.infer<typeof CollagePixelConfigSchema>;

export type CreateCollageResponse = z.infer<typeof CreateCollageResponseSchema>;
export type CollageJobPublic = z.infer<typeof CollageJobPublicSchema>;
export type CleanupResponse = z.infer<typeof CleanupResponseSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

export type OptimizeGridRequest = z.infer<typeof OptimizeGridRequestSchema>;
export type AnalyzeMasonryRequest = z.infer<typeof AnalyzeMasonryRequestSchema>;
export type JobIdParams = z.infer<typeof JobIdParamsSchema>;
