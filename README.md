# PublicBrief DMV

PublicBrief DMV helps residents understand upcoming government decisions involving public money, surveillance, land use, infrastructure, and community services. It identifies what is being proposed, who is responsible for the decision, what information may be missing, and how residents can participate before a final vote.

The application is politically neutral. It helps people investigate proposals and take part in public processes without recommending a political position.

## Problem statement

Local-government decisions are often published in long agendas, procurement files, staff reports, and technical notices. The timing and language can make consequential proposals difficult to find and understand before a hearing, contract award, or final vote.

## Social-good justification

Municipal governments regularly make decisions involving land use, public revenue, infrastructure, procurement, data collection, and surveillance technologies. Vendors, developers, and institutional stakeholders often have dedicated resources for tracking these decisions, while individual residents may only learn about them after contracts are signed or proposals have advanced. When residents disengage from local-government processes, consequential decisions can move forward without meaningful public scrutiny. PublicBrief DMV helps reduce that information imbalance by making upcoming decisions easier to find, understand, question, and respond to.

## Current prototype scope

This hackathon prototype focuses on Loudoun County, Virginia. It has two modes:

- **Scan My Locality** presents eight curated, source-linked demonstration briefs. This is not a live agenda feed, and every item is visibly labeled as demonstration data.
- **Analyze a Document** accepts pasted public text and returns a structured, source-grounded AI brief. It remains available independently of any agenda integration.

The prototype intentionally has no accounts, authentication, database, scheduled scanner, alerts, document upload, address collection, geocoding, or automatic email sending.

## Core features

- Two-mode navigation for locality scanning and manual analysis
- Topic tabs with multi-category agenda items
- Explicit decision roles rather than attributing control to one official
- Optional Loudoun County district selection and official Board directory links
- Agenda detail views with status, dates, impacts, missing information, questions, participation routes, and source evidence
- Strict JSON Schema output plus Zod validation for AI responses
- Short source excerpts supporting AI-generated analysis
- A send-ready, neutral public-comment email draft
- Copy controls for the complete brief and comment draft
- Responsive layouts and visible loading, empty, success, and error states

## Supported locality

Loudoun County, Virginia is the only enabled locality. Fairfax County, Montgomery County, and Washington, DC appear as disabled “Coming soon” options.

Official sources and contact routes are maintained in [`data/localities.ts`](data/localities.ts). The prototype links residents to official Loudoun County meeting materials, governing-body pages, public-input instructions, and the county directory. Representatives and procedures can change, so they must be verified at the linked government source.

## Topic categories

- **Public Money:** contracts, procurement, budgets, incentives, bonds, public property, fiscal commitments, capital spending, and revenue projections
- **Privacy & Surveillance:** cameras, automated license-plate readers, drones, biometrics, location data, police technology, AI procurement, data sharing, retention, and vendor access
- **Community & Infrastructure:** land use, data centers, utilities, transportation, housing, schools, environmental impacts, parks, and community services

An item can appear in more than one category. Its detail view explains the source language and reasoning behind each classification.

## Responsible-AI safeguards

The server prompt requires the model to:

- use only the pasted source text;
- never invent dates, officials, agencies, vendors, contract terms, or procedures;
- write `Not specified in the provided text` when evidence is unavailable;
- separate documented facts from possible implications;
- assess money, privacy, and infrastructure independently instead of forcing every category;
- quote short source excerpts that support the analysis;
- avoid legal advice and political recommendations; and
- return only schema-conforming JSON.

The API route validates the request and model response with Zod. The OpenAI key is read only on the server. The interface reminds users: “PublicBrief provides an AI-assisted summary. Verify dates, procedures, and decision details with the issuing government body.”

## Technology stack

- Next.js App Router
- TypeScript with strict checking
- React
- Tailwind CSS
- OpenAI Responses API with structured outputs
- Zod validation

No additional runtime infrastructure is required.

## Local setup

Requirements: Node.js 20.9 or newer, npm, and an OpenAI API key for document analysis.

```powershell
git clone https://github.com/tahaseens/public-brief.git
cd public-brief
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Use `npm` instead of `npm.cmd` on macOS or Linux, and `cp .env.example .env.local` to copy the environment file. On Windows, `npm.cmd` avoids a PowerShell execution-policy error caused by `npm.ps1`. Open [http://localhost:3000](http://localhost:3000) after the development server starts.

## Required environment variables

Create `.env.local` in the repository root:

```dotenv
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.6
SITE_URL=http://localhost:3000
```

- `OPENAI_API_KEY` is required only for **Analyze a Document**. Create one in the [OpenAI API key dashboard](https://platform.openai.com/api-keys).
- `OPENAI_MODEL` is optional and defaults to `gpt-5.6`.
- `SITE_URL` is optional locally. Set it to the production origin, such as `https://your-project.vercel.app`, so social-card URLs are absolute.

Never expose either variable with a `NEXT_PUBLIC_` prefix, paste a secret into client code, or commit `.env.local`.

## Commands

```powershell
npm.cmd run dev      # Start local development
npm.cmd run lint     # Run ESLint
npm.cmd run build    # Type-check and create a production build
npm.cmd run start    # Serve the production build
```

## Deployment

The simplest path is Vercel:

1. Push the repository to GitHub.
2. In Vercel, create a new project and import the GitHub repository.
3. Keep the detected Next.js framework and default build settings.
4. Add `OPENAI_API_KEY` as an encrypted environment variable. Add `OPENAI_MODEL` only if overriding the default, and set `SITE_URL` to the production origin.
5. Deploy, then test both modes on the production URL.
6. Confirm the site’s locality links open official Loudoun County pages and run a small document-analysis request.

Any Node.js host that supports Next.js server routes can also run `npm run build` followed by `npm run start`. A static-only host will not support `/api/brief`.

## Known limitations

- Dashboard items are curated demonstration content, not current or continuously monitored agenda items.
- Loudoun County is the only configured locality.
- Official contacts, representatives, meeting dates, and participation procedures can change.
- District selection is manual; no address is requested or matched.
- AI analysis can still be incomplete or incorrect and must be checked against the original source.
- The analyzer accepts pasted text only; it does not parse URLs, PDFs, or uploaded documents.
- There are no saved briefs, historical comparisons, alerts, or automated messages.

## Future roadmap

- Additional DMV jurisdictions
- Locality-specific agenda adapters
- Legistar and other public-agenda integrations
- Virginia General Assembly integration
- Address-to-district matching and representative lookup, with an explicit privacy design
- User-selected alerts and scheduled agenda monitoring
- Historical decision tracking
- Comparisons between proposed and final policy language

Future ingestion should use small, testable locality-specific adapters rather than one universal scraper:

```ts
interface AgendaSourceAdapter {
  fetchMeetings(): Promise<Meeting[]>;
  fetchAgendaItems(meetingId: string): Promise<AgendaItem[]>;
}
```

Potential adapters include `LegistarAdapter`, `CivicPlusAdapter`, `HtmlAgendaAdapter`, `PdfPacketAdapter`, and `OpenStatesAdapter`. Each adapter should preserve source URLs and excerpts, expose failures clearly, and support source-specific validation.

## Project structure

- `app/page.tsx` — two-mode client experience and document analyzer
- `app/api/brief/route.ts` — server-only OpenAI request and request validation
- `components/locality-dashboard.tsx` — dashboard, cards, district selector, and detail view
- `data/agenda-items.ts` — typed demonstration agenda items
- `data/localities.ts` — official locality, body, representative, and participation configuration
- `lib/brief.ts` — AI response schema and TypeScript type
- `lib/locality.ts` — dashboard domain types

## Use of AI

OpenAI tools assisted with implementation and structured analysis. Product direction, editorial choices, and deployment decisions remain under human review.
