import { z } from "zod";

const detailSchema = z.object({
  documentedFacts: z.array(z.string()),
  possibleImplications: z.array(z.string()),
});

export const publicBriefSchema = z.object({
  plainLanguageSummary: z.string(),
  proposedAction: detailSchema,
  affectedGroups: detailSchema,
  financialOrRevenueConsiderations: detailSchema,
  privacyOrSurveillanceConsiderations: detailSchema,
  importantDates: z.array(z.string()),
  publicParticipationOptions: z.array(z.string()),
  missingInformation: z.array(z.string()),
  questionsToAsk: z.array(z.string()),
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
    "questionsToAsk", "publicCommentDraft"
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
