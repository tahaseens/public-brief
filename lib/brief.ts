import { z } from "zod";

const detailSchema = z.object({
  documentedFacts: z.array(z.string()).max(4),
  possibleImplications: z.array(z.string()).max(2),
});

const contactSchema = z.object({
  roleLabel: z.string(),
  name: z.string().nullable(),
  title: z.string().nullable(),
  district: z.string().nullable(),
  organization: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  contactFormUrl: z.string().nullable(),
});

const sectionKeys = [
  "plainLanguageSummary",
  "proposedAction",
  "affectedGroups",
  "financialOrRevenueConsiderations",
  "privacyOrSurveillanceConsiderations",
  "communityOrInfrastructureConsiderations",
  "importantDates",
  "decisionMakingBody",
  "responsibleEntities",
  "publicParticipationOptions",
  "missingInformation",
  "questionsToAsk",
] as const;

export const publicBriefSchema = z.object({
  documentContext: z.object({
    documentType: z.string(),
    currentStatus: z.string(),
    meetingOrDecisionDate: z.string(),
    decisionLevel: z.string(),
  }),
  plainLanguageSummary: z.string(),
  proposedAction: detailSchema,
  affectedGroups: detailSchema,
  financialOrRevenueConsiderations: detailSchema,
  privacyOrSurveillanceConsiderations: detailSchema,
  communityOrInfrastructureConsiderations: detailSchema,
  importantDates: z.array(z.string()).max(4),
  decisionMakingBody: z.string(),
  responsibleEntities: z.array(z.object({
    role: z.string(),
    name: z.string(),
    documentedBasis: z.string(),
  })).max(6),
  contacts: z.array(contactSchema).max(3),
  publicParticipationOptions: z.array(z.string()).max(4),
  missingInformation: z.array(z.string()).max(5),
  questionsToAsk: z.array(z.string()).max(5),
  concernFocus: z.object({
    mostRelevantSection: z.enum([...sectionKeys, "none"]),
    explanation: z.string(),
  }),
  evidenceFromSource: z.array(z.object({
    excerpt: z.string(),
    supports: z.string(),
  })).max(6),
  publicCommentDraft: z.string(),
});

export type PublicBrief = z.infer<typeof publicBriefSchema>;

export const publicBriefJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "documentContext", "plainLanguageSummary", "proposedAction", "affectedGroups",
    "financialOrRevenueConsiderations", "privacyOrSurveillanceConsiderations",
    "communityOrInfrastructureConsiderations", "importantDates", "decisionMakingBody",
    "responsibleEntities", "contacts", "publicParticipationOptions", "missingInformation",
    "questionsToAsk", "concernFocus", "evidenceFromSource", "publicCommentDraft"
  ],
  properties: {
    documentContext: {
      type: "object",
      additionalProperties: false,
      required: ["documentType", "currentStatus", "meetingOrDecisionDate", "decisionLevel"],
      properties: {
        documentType: { type: "string" },
        currentStatus: { type: "string" },
        meetingOrDecisionDate: { type: "string" },
        decisionLevel: { type: "string" },
      },
    },
    plainLanguageSummary: { type: "string" },
    proposedAction: detailJsonSchema(),
    affectedGroups: detailJsonSchema(),
    financialOrRevenueConsiderations: detailJsonSchema(),
    privacyOrSurveillanceConsiderations: detailJsonSchema(),
    communityOrInfrastructureConsiderations: detailJsonSchema(),
    importantDates: stringArray(),
    decisionMakingBody: { type: "string" },
    responsibleEntities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "name", "documentedBasis"],
        properties: {
          role: { type: "string" },
          name: { type: "string" },
          documentedBasis: { type: "string" },
        },
      },
    },
    contacts: {
      type: "array",
      items: contactJsonSchema(),
    },
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
    evidenceFromSource: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["excerpt", "supports"],
        properties: {
          excerpt: { type: "string" },
          supports: { type: "string" },
        },
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

function contactJsonSchema() {
  const nullableString = { type: ["string", "null"] } as const;
  return {
    type: "object",
    additionalProperties: false,
    required: ["roleLabel", "name", "title", "district", "organization", "email", "phone", "website", "contactFormUrl"],
    properties: {
      roleLabel: { type: "string" },
      name: nullableString,
      title: nullableString,
      district: nullableString,
      organization: nullableString,
      email: nullableString,
      phone: nullableString,
      website: nullableString,
      contactFormUrl: nullableString,
    },
  } as const;
}
