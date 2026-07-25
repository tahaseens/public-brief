export const topicCategories = [
  "Public Money",
  "Privacy & Surveillance",
  "Community & Infrastructure",
] as const;

export type TopicCategory = (typeof topicCategories)[number];

export type ResponsibleRole =
  | "Voting body"
  | "Committee or commission"
  | "Sponsoring department"
  | "Applicant or vendor"
  | "District representative"
  | "Public-comment contact";

export type ResponsibleEntity = {
  role: ResponsibleRole;
  name: string;
  detail?: string;
  url?: string;
};

export type GovernmentContact = {
  id: string;
  roleLabel: string;
  name?: string;
  title?: string;
  district?: string;
  organization?: string;
  email?: string;
  phone?: string;
  website?: string;
  contactFormUrl?: string;
  demonstration?: true;
};

export type AgendaItem = {
  id: string;
  title: string;
  summary: string;
  whyItMatters: string;
  jurisdiction: string;
  governmentLevel: "County" | "Local district" | "State";
  governingBody: string;
  meetingDate: string;
  status: string;
  categories: TopicCategory[];
  categoryReasons: Partial<Record<TopicCategory, string>>;
  sourceUrl: string;
  sourceLabel: string;
  sourceExcerpt: string;
  proposedAction: string[];
  affectedGroups: string[];
  financialConsiderations: string[];
  privacyConsiderations: string[];
  infrastructureConsiderations: string[];
  missingInformation: string[];
  questionsToAsk: string[];
  responsibleEntities: ResponsibleEntity[];
  contacts?: GovernmentContact[];
  participationOptions: string[];
  representativeDistricts?: string[];
  featured?: true;
  demonstration: true;
};

export type Representative = {
  name: string;
  title: string;
  district?: string;
  phone?: string;
  website: string;
};

export type LocalityConfig = {
  id: string;
  name: string;
  state: string;
  supported: boolean;
  agendaSources: { name: string; url: string }[];
  governingBodies: { name: string; type: string; website: string }[];
  representatives: Representative[];
  participationLinks: { label: string; url: string; detail?: string }[];
  directoryUrl: string;
  mainPhone: string;
};
