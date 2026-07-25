import { z } from "zod";

export const MAX_SOURCE_CHARACTERS = 15_000;
export const MAX_REQUEST_BYTES = 64_000;

export const analysisRequestSchema = z.object({
  text: z.string().trim().min(50, "Paste at least 50 characters.").max(MAX_SOURCE_CHARACTERS),
  perspective: z.enum(["Resident", "Parent", "Small-business owner", "Community organization", "Other"]),
  concern: z.string().trim().max(500, "Keep the primary concern under 500 characters.").optional().default(""),
}).strict();

export function isOversizedSource(value: unknown) {
  return typeof value === "object" && value !== null && "text" in value
    && typeof value.text === "string" && value.text.length > MAX_SOURCE_CHARACTERS;
}
