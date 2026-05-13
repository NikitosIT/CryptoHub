import { z } from "zod";

const healthDependencyStatusSchema = z.enum(["ok", "error"]);

export const healthResponseSchema = z
  .object({
    status: z.enum(["healthy", "unhealthy"]),
    checks: z.object({
      database: healthDependencyStatusSchema,
      redis: healthDependencyStatusSchema,
    }),
  })
  .strict();

export type HealthDependencyStatus = z.infer<
  typeof healthDependencyStatusSchema
>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
