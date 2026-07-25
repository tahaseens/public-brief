"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { PublicBrief } from "@/lib/brief";
import { LocalityDashboard } from "@/components/locality-dashboard";

const SAMPLE_NOTICE = `LOUDOUN COUNTY, VIRGINIA — DATA CENTER STANDARDS & LOCATIONS
ADAPTED FROM AN OFFICIAL COUNTY PROJECT PAGE FOR DEMONSTRATION

Source: https://www.loudoun.gov/5990/Data-Center-Standards-Locations

The Loudoun County Board of Supervisors began a project in February 2024 to review policies and standards for data centers and electrical substations. In July 2024, the Board approved a plan dividing the work into two phases.

Phase 1 was approved in March 2025. It changed parts of the Comprehensive Plan and Zoning Ordinance so that data centers in some locations would require conditional or Special Exception approval instead of being permitted by right.

Phase 2 is underway and concerns possible policy guidance and use-specific zoning standards for data centers and utility substations. The county project page does not identify a final Phase 2 vote date, final standards, projected infrastructure costs, expected fiscal effects, or quantified power and water demand.

The county states that residents may submit comments to Planning and Zoning staff through the project page. Comments are typically incorporated into staff reports before Planning Commission and Board of Supervisors public hearings. Residents may also provide input directly to the Board using the county's public-input process.`;

const perspectives = ["Resident", "Parent", "Small-business owner", "Community organization", "Other"] as const;

type SectionKey = Exclude<PublicBrief["concernFocus"]["mostRelevantSection"], "none">;
type SectionValue = PublicBrief[SectionKey];

const copySections: Array<{ key: SectionKey; title: string; hint: string }> = [
  { key: "plainLanguageSummary", title: "Plain-language summary", hint: "The essentials, without the jargon" },
  { key: "proposedAction", title: "Proposed action", hint: "What the government body may do" },
  { key: "decisionMakingBody", title: "Decision-making body", hint: "Who the text says will make the decision" },
  { key: "responsibleEntities", title: "Responsible entities", hint: "Named parties, separated by role" },
  { key: "affectedGroups", title: "Who may be affected", hint: "People and groups named or reasonably implicated" },
  { key: "financialOrRevenueConsiderations", title: "Money & revenue", hint: "Costs, funding, contracts, or revenue" },
  { key: "privacyOrSurveillanceConsiderations", title: "Privacy & surveillance", hint: "Collection, sharing, or monitoring of data" },
  { key: "communityOrInfrastructureConsiderations", title: "Community & infrastructure", hint: "Land use, housing, utilities, services, or transportation" },
  { key: "importantDates", title: "Important dates", hint: "Deadlines, meetings, and effective dates" },
  { key: "publicParticipationOptions", title: "Ways to participate", hint: "Options stated in the source" },
  { key: "missingInformation", title: "What’s missing", hint: "Details the notice does not provide" },
  { key: "questionsToAsk", title: "Questions to ask", hint: "Useful, neutral follow-up questions" },
];

const sections = copySections.filter(
  (section) => section.key !== "decisionMakingBody" && section.key !== "responsibleEntities",
);
const participationSectionIndex = sections.findIndex((section) => section.key === "publicParticipationOptions");

export default function Home() {
  const [mode, setMode] = useState<"scan" | "analyze">("scan");

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="PublicBrief DMV home">
          <span className="brand-mark" aria-hidden="true">PB</span>
          <span>PublicBrief <small>DMV</small></span>
        </a>
        <span className="header-note">Understanding Public Decisions</span>
      </header>

      <section className="product-intro" id="top">
        <div className="hero-wordmark">
          <h1>PublicBrief</h1>
        </div>
        <p className="intro-kicker">Local government decisions before the vote</p>
        <h2>See what is being proposed and how it affects you.</h2>
        <p>PublicBrief DMV helps residents understand upcoming government decisions involving public money, surveillance, land use, infrastructure, and community services. It identifies what is being proposed, who is responsible for the decision, what information may be missing, and how residents can participate before a final vote.</p>
      </section>

      <nav className="mode-switcher" aria-label="PublicBrief modes">
        <button type="button" className={mode === "scan" ? "active" : ""} aria-pressed={mode === "scan"} onClick={() => setMode("scan")}><span>01</span> Scan My Locality</button>
        <button type="button" className={mode === "analyze" ? "active" : ""} aria-pressed={mode === "analyze"} onClick={() => setMode("analyze")}><span>02</span> Analyze a Document</button>
      </nav>

      {mode === "scan" ? <LocalityDashboard /> : <DocumentAnalyzer />}

      <footer><div className="brand"><span className="brand-mark" aria-hidden="true">PB</span><span>PublicBrief <small>DMV</small></span></div><p>Understanding Public Decisions</p><p>Politically neutral. Not legal advice, always verify official details.</p></footer>
    </main>
  );
}

function DocumentAnalyzer() {
  const [text, setText] = useState("");
  const [perspective, setPerspective] = useState<(typeof perspectives)[number]>("Resident");
  const [concern, setConcern] = useState("");
  const [brief, setBrief] = useState<PublicBrief | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"brief" | "comment" | null>(null);
  const [submittedConcern, setSubmittedConcern] = useState("");
  const resultsRef = useRef<HTMLElement>(null);

  const charCount = text.length;
  const fullBrief = useMemo(() => brief ? briefToText(brief) : "", [brief]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim().length < 40) {
      setError("Paste at least 40 characters so there is enough source material to review.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");
    setBrief(null);
    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, perspective, concern }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The brief could not be generated.");
      setBrief(data);
      setSubmittedConcern(concern.trim());
      setStatus("success");
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  async function copy(value: string, target: "brief" | "comment") {
    await navigator.clipboard.writeText(value);
    setCopied(target);
    window.setTimeout(() => setCopied(null), 1800);
  }

  function loadSample() {
    setText(SAMPLE_NOTICE);
    setBrief(null);
    setError("");
    setStatus("idle");
  }

  return (
    <div className="analyzer-mode">
      <section className="hero">
        <p className="eyebrow">Manual document analyzer</p>
        <h2>Analyze a government document</h2>
        <p className="hero-copy">Paste an agenda item, public notice, procurement proposal, land-use document, or policy excerpt to break down the contents.</p>
      </section>

      <section className="workspace" aria-labelledby="workspace-title">
        <div className="workspace-heading">
          <div className="workspace-title-group">
            <h2 id="workspace-title">Add the public text</h2>
            <p className="pdf-help">Working from a PDF? If its text won’t copy cleanly, use a PDF-to-Markdown tool to extract the document, review the output against the original, then paste it here.</p>
          </div>
          <button className="sample-button" type="button" onClick={loadSample}>Load a sample notice</button>
        </div>

        <form onSubmit={submit}>
          <div className="textarea-wrap">
            <label htmlFor="source-text">Government agenda item or public notice</label>
            <textarea id="source-text" value={text} onChange={(event) => setText(event.target.value)} maxLength={30000} placeholder="Paste the full text here…" aria-describedby="text-help" />
            <div className="textarea-meta" id="text-help"><span>Use the original text for the most reliable result.</span><span>{charCount.toLocaleString()} / 30,000</span></div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="perspective">Your perspective</label>
              <div className="select-wrap">
                <select id="perspective" value={perspective} onChange={(event) => setPerspective(event.target.value as typeof perspective)}>
                  {perspectives.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="concern">Primary concern <span>Optional</span></label>
              <input id="concern" value={concern} onChange={(event) => setConcern(event.target.value)} maxLength={500} placeholder="e.g. housing cost, traffic, privacy" />
            </div>
          </div>

          {status === "error" && <div className="message error" role="alert"><strong>We hit a snag.</strong> {error}</div>}

          <button className="generate-button" type="submit" disabled={status === "loading" || text.trim().length === 0}>
            {status === "loading" ? <><span className="spinner" /> Reading the public record…</> : <>Generate Public Brief</>}
          </button>
          <p className="privacy-note">Your text is sent to the AI provider to generate this brief. Don’t paste sensitive personal information.</p>
        </form>
      </section>

      {status === "idle" && !brief && (
        <section className="empty-state" aria-label="No brief generated yet">
          <span aria-hidden="true">⌁</span><p>Your brief will appear here after you add source text and generate it.</p>
        </section>
      )}

      {status === "loading" && (
        <section className="loading-state" aria-live="polite">
          <div className="loading-line wide"/><div className="loading-line"/><div className="loading-cards"><div/><div/><div/></div>
        </section>
      )}

      {brief && status === "success" && (
        <section className="results" ref={resultsRef} aria-labelledby="results-title">
          <div className="results-header">
            <div><div><p className="result-kicker">Generated from the text you provided</p><h2 id="results-title">What the notice says</h2></div></div>
            <button className="copy-button" onClick={() => copy(fullBrief, "brief")}>{copied === "brief" ? "Copied" : "Copy complete brief"}</button>
          </div>

          <div className="analyzer-context" aria-label="Document context">
            <div><span>Document type</span><strong>{brief.documentContext.documentType}</strong></div>
            <div><span>Current status</span><strong>{brief.documentContext.currentStatus}</strong></div>
            <div><span>Meeting or decision date</span><strong>{brief.documentContext.meetingOrDecisionDate}</strong></div>
            <div><span>Decision level</span><strong>{brief.documentContext.decisionLevel}</strong></div>
          </div>

          <div className="verify-banner"><span aria-hidden="true">!</span><p><strong>Verify before you act.</strong> AI can make mistakes. Confirm dates, requirements, and participation details with the issuing government body.</p></div>

          {submittedConcern && brief.concernFocus.mostRelevantSection !== "none" && (
            <div className="concern-banner">
              <p><strong>Your focus:</strong> {submittedConcern}</p>
              <p>{brief.concernFocus.explanation}</p>
            </div>
          )}

          <div className="card-grid">
            <ResultCard title={sections[0].title} hint={sections[0].hint} value={brief[sections[0].key]} index={1} featured relevant={submittedConcern !== "" && brief.concernFocus.mostRelevantSection === sections[0].key} />
            <DecisionRolesCard
              brief={brief}
              index={2}
              relevant={submittedConcern !== "" && ["decisionMakingBody", "responsibleEntities"].includes(brief.concernFocus.mostRelevantSection)}
            />
            {sections.slice(1, participationSectionIndex + 1).map((section, index) => (
              <ResultCard key={section.key} title={section.title} hint={section.hint} value={brief[section.key]} index={index + 3} relevant={submittedConcern !== "" && brief.concernFocus.mostRelevantSection === section.key} />
            ))}
            <AnalyzerContactsCard contacts={brief.contacts} index={10} />
            {sections.slice(participationSectionIndex + 1).map((section, index) => (
              <ResultCard key={section.key} title={section.title} hint={section.hint} value={brief[section.key]} index={index + 11} relevant={submittedConcern !== "" && brief.concernFocus.mostRelevantSection === section.key} />
            ))}
          </div>

          <article className="comment-card">
            <div><p className="card-index">{sections.length + 3} / EMAIL-READY</p><h3>Public-comment draft</h3><p className="card-hint">Add your name, review the details, and send it to the issuing body.</p></div>
            <div className="comment-copy">{brief.publicCommentDraft}</div>
            <button className="copy-button dark" onClick={() => copy(brief.publicCommentDraft, "comment")}>{copied === "comment" ? "Copied" : "Copy email-ready comment"}</button>
          </article>

          <section className="analyzer-evidence">
            <div><p className="result-kicker">Source grounding</p><h3>Evidence from the source</h3><p>Short excerpts that support the analysis above.</p></div>
            <div className="evidence-list">
              {brief.evidenceFromSource.map((evidence, index) => (
                <div key={`${evidence.excerpt}-${index}`}><blockquote>“{evidence.excerpt}”</blockquote><span>Supports: {evidence.supports}</span></div>
              ))}
            </div>
          </section>
        </section>
      )}

    </div>
  );
}

function ResultCard({ title, hint, value, index, featured, relevant }: { title: string; hint: string; value: SectionValue; index: number; featured?: boolean; relevant?: boolean }) {
  return (
    <article className={`result-card ${featured ? "featured" : ""} ${relevant ? "most-relevant" : ""}`}>
      <div className="card-topline"><p className="card-index">{String(index).padStart(2, "0")}</p>{relevant && <span className="relevance-label">Most relevant to your concern</span>}</div>
      <h3>{title}</h3><p className="card-hint">{hint}</p>
      <div className="card-content"><Value value={value} /></div>
    </article>
  );
}

function DecisionRolesCard({ brief, index, relevant }: { brief: PublicBrief; index: number; relevant: boolean }) {
  return (
    <article className={`result-card decision-roles-card ${relevant ? "most-relevant" : ""}`}>
      <div className="card-topline"><p className="card-index">{String(index).padStart(2, "0")}</p>{relevant && <span className="relevance-label">Most relevant to your concern</span>}</div>
      <h3>Decision roles</h3>
      <p className="card-hint">Who makes the decision and which named parties have a role</p>
      <div className="decision-roles-layout">
        <div className="decision-body-summary"><span>Decision-making body</span><strong>{brief.decisionMakingBody}</strong></div>
        <Value value={brief.responsibleEntities} />
      </div>
    </article>
  );
}

function AnalyzerContactsCard({ contacts, index }: { contacts: PublicBrief["contacts"]; index: number }) {
  return (
    <article className="result-card who-to-contact-card">
      <div className="card-topline"><p className="card-index">{String(index).padStart(2, "0")}</p></div>
      <h3>Who to contact</h3>
      <p className="card-hint">Relevant officials and government contacts for this decision.</p>
      <div className="contact-panel analyzer-contact-panel">
        {contacts.length ? (
          <div className="contact-list">
            {contacts.map((contact, contactIndex) => {
              const primaryName = contact.name || contact.organization || contact.title;
              const website = safeExternalUrl(contact.website);
              const contactFormUrl = safeExternalUrl(contact.contactFormUrl);
              const phoneHref = contact.phone ? contact.phone.replace(/[^\d+]/g, "") : "";
              return (
                <section className="contact-entry" key={`${contact.roleLabel}-${contactIndex}`} aria-labelledby={`analyzer-contact-${contactIndex}`}>
                  <h4 id={`analyzer-contact-${contactIndex}`}>{contact.roleLabel}</h4>
                  {primaryName && <strong>{primaryName}</strong>}
                  {contact.title && contact.title !== primaryName && <p>{contact.title}</p>}
                  {contact.district && <p>{contact.district}</p>}
                  {contact.organization && contact.organization !== primaryName && <p>{contact.organization}</p>}
                  <div className="contact-actions">
                    {contact.email && <a href={`mailto:${contact.email}`} aria-label={`Email ${primaryName || contact.roleLabel}`}>Email</a>}
                    {phoneHref && <a href={`tel:${phoneHref}`} aria-label={`Call ${primaryName || contact.roleLabel}`}>Call</a>}
                    {website && <a href={website} target="_blank" rel="noreferrer" aria-label={`Open official page for ${primaryName || contact.roleLabel}`}>Official page</a>}
                    {contactFormUrl && <a href={contactFormUrl} target="_blank" rel="noreferrer" aria-label={`Open contact form for ${primaryName || contact.roleLabel}`}>Contact form</a>}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="contact-empty">Contact information is not yet available for this item. Check the issuing government body’s official meeting page or staff report.</p>
        )}
        <p className="contact-footer">Confirm your district and current representative through the official government directory before contacting them.</p>
      </div>
    </article>
  );
}

function Value({ value }: { value: SectionValue }) {
  if (typeof value === "string") return <p>{value}</p>;
  if (Array.isArray(value)) {
    if (value.length && typeof value[0] === "object") {
      const entities = value as PublicBrief["responsibleEntities"];
      return <div className="analyzer-entities">{entities.map((entity, index) => <div key={`${entity.role}-${index}`}><strong>{entity.role}</strong><span>{entity.name}</span><p>{entity.documentedBasis}</p></div>)}</div>;
    }
    return <ul>{(value as string[]).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
  }
  return <><h4>Documented facts</h4><ul>{value.documentedFacts.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul><h4>Possible implications</h4><ul>{value.possibleImplications.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></>;
}

function briefToText(brief: PublicBrief) {
  const lines = [
    "PUBLICBRIEF",
    "",
    "DOCUMENT CONTEXT",
    `Document type: ${brief.documentContext.documentType}`,
    `Current status: ${brief.documentContext.currentStatus}`,
    `Meeting or decision date: ${brief.documentContext.meetingOrDecisionDate}`,
    `Decision level: ${brief.documentContext.decisionLevel}`,
    "",
    "PLAIN-LANGUAGE SUMMARY",
    brief.plainLanguageSummary,
  ];
  for (const section of copySections.slice(1)) {
    const value = brief[section.key];
    lines.push("", section.title.toUpperCase());
    if (Array.isArray(value)) {
      if (value.length && typeof value[0] === "object") {
        lines.push(...(value as PublicBrief["responsibleEntities"]).map((entity) => `• ${entity.role}: ${entity.name} — ${entity.documentedBasis}`));
      } else {
        lines.push(...(value as string[]).map((item) => `• ${item}`));
      }
    }
    else if (typeof value === "string") lines.push(value);
    else if (typeof value === "object") lines.push("Documented facts:", ...value.documentedFacts.map((item) => `• ${item}`), "Possible implications:", ...value.possibleImplications.map((item) => `• ${item}`));
  }
  lines.push("", "WHO TO CONTACT");
  if (brief.contacts.length) {
    lines.push(...brief.contacts.map((contact) => {
      const details = [contact.name, contact.title, contact.district, contact.organization, contact.email, contact.phone, contact.website, contact.contactFormUrl].filter(Boolean).join(" | ");
      return `• ${contact.roleLabel}: ${details || "Not specified in the provided text"}`;
    }));
  } else {
    lines.push("Contact information is not yet available for this item. Check the issuing government body’s official meeting page or staff report.");
  }
  if (brief.concernFocus.mostRelevantSection !== "none") lines.push("", "CONCERN FOCUS", brief.concernFocus.explanation);
  lines.push("", "EVIDENCE FROM THE SOURCE", ...brief.evidenceFromSource.map((evidence) => `• “${evidence.excerpt}” — ${evidence.supports}`));
  lines.push("", "PUBLIC-COMMENT DRAFT", brief.publicCommentDraft, "", "Verify details with the issuing government body. Not legal advice.");
  return lines.join("\n");
}

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}
