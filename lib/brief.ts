import { z } from "zod";

const detailSchema = z.object({
  documentedFacts: z.array(z.string()).max(4),
  possibleImplications: z.array(z.string()).max(2),
});

const sectionKeys = [
  "plainLanguageSummary",
  "proposedAction",
  "affectedGroups",
  "financialOrRevenueConsiderations",
  "privacyOrSurveillanceConsiderations",
  "importantDates",
  "publicParticipationOptions",
  "missingInformation",
  "questionsToAsk",
] as const;

export const publicBriefSchema = z.object({
  plainLanguageSummary: z.string(),
  proposedAction: detailSchema,
  affectedGroups: detailSchema,
  financialOrRevenueConsiderations: detailSchema,
  privacyOrSurveillanceConsiderations: detailSchema,
  importantDates: z.array(z.string()).max(4),
  publicParticipationOptions: z.array(z.string()).max(4),
  missingInformation: z.array(z.string()).max(5),
  questionsToAsk: z.array(z.string()).max(5),
  concernFocus: z.object({
    mostRelevantSection: z.enum([...sectionKeys, "none"]),
    explanation: z.string(),
  }),
  publicCommentDraft: z.string(),
});

export type PublicBrief = z.infer<typeof publicBriefSchema>;

export const publicBriefJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "plainLanguageSummary", "proposedAction", "affectedGroups",
    "financialOrRevenueConsiderations", "privacyOrSurveillanceConsiderations",
    "importantDates", "publicParticipationOptions", "missingInformation",
    "questionsToAsk", "concernFocus", "publicCommentDraft"
  ],
  properties: {
    plainLanguageSummary: { type: "string" },
    proposedAction: detailJsonSchema(),
    affectedGroups: detailJsonSchema(),
    financialOrRevenueConsiderations: detailJsonSchema(),
    privacyOrSurveillanceConsiderations: detailJsonSchema(),
    importantDates: stringArray(),
    publicParticipationOptions: stringArray(),
    missingInformation: stringArray(),
    questionsToAsk: stringArray(),
    concernFocus: {
      type: "object",
      additionalProperties: false,
      required: ["mostRelevantSection", "explanation"],
      properties: {
        mostRelevantSection: { type: "string", enum: [...sectionKeys, "none"] },
        explanation: { type: "string" },
      },
    },
    publicCommentDraft: { type: "string" },
  },
} as const;

function stringArray() {
  return { type: "array", items: { type: "string" } } as const;
}

function detailJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["documentedFacts", "possibleImplications"],
    properties: {
      documentedFacts: stringArray(),
      possibleImplications: stringArray(),
    },
  } as const;
}
