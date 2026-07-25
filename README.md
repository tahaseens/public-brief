# PublicBrief DMV

PublicBrief is a one-page civic-tech application that turns dense local-government agendas, notices, procurement proposals, land-use decisions, and policy documents into readable, source-grounded public briefs.

The MVP uses Next.js, TypeScript, the App Router, Tailwind CSS, and a server-side OpenAI Responses API route. It has no authentication, database, or document-upload flow.

## Local setup

Requirements: Node.js 20.9 or newer and an OpenAI API key.

```bash
npm install
copy .env.example .env.local
npm run dev
```

On macOS or Linux, use `cp .env.example .env.local` instead. Then open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `.env.local` in the project root:

```dotenv
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.6
```

- `OPENAI_API_KEY` is required and is read only by the server-side API route.
- `OPENAI_MODEL` is optional and defaults to `gpt-5.6`.

Never commit `.env.local` or an API key. Environment files are ignored by Git except for `.env.example`.

## Commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Serve the production build
npm run lint     # Run ESLint
```

## How the AI request is constrained

`POST /api/brief` accepts pasted text, a reader perspective, and an optional concern. The server asks the model for strict JSON Schema output and validates the returned data with Zod before sending it to the UI. The prompt requires the model to use only supplied text, expose missing details, distinguish documented facts from possible implications, remain politically neutral, and avoid legal advice.

The generated brief is an aid to understanding—not an official record or legal advice. Users should verify details with the issuing government body.

##  Use of AI
ChatGPT-5.6 was used to generate the codebase for this concept. The outline and design remain my own.