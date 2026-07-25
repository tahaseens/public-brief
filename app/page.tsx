"use client";

import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import type { PublicBrief } from "@/lib/brief";
import { LocalityDashboard } from "@/components/locality-dashboard";

const SAMPLE_NOTICE = `RESOLUTION OF THE BOARD OF SUPERVISORS OF LOUDOUN COUNTY, VIRGINIA, ADOPTING GRANDFATHERING RULES FOR ZOAM-2024-0001, DATA CENTER STANDARDS AND LOCATIONS, PHASE I

SOURCE-GROUNDED EXCERPT ADAPTED FOR DEMONSTRATION
This is an adapted excerpt of an adopted resolution, not notice of a pending vote.

Official resolution: https://va-loudouncounty.civicplus.com/DocumentCenter/View/215835
Official project page: https://www.loudoun.gov/6221/Phase-1-Project-Plan-for-Data-Center-Sta

Current status and decision
On March 18, 2025, the Loudoun County Board of Supervisors adopted ZOAM-2024-0001 and this related grandfathering resolution. The zoning amendment requires Special Exception approval for data center uses in the Industrial Park, General Industry, and Mineral Resources-Heavy Industry zoning districts. The resolution establishes when certain applications already in process may continue without obtaining that new Special Exception approval.

Applications covered
A legislative or administrative application officially accepted for processing by Loudoun County on or before February 12, 2025 may qualify for grandfathered treatment under the resolution. A qualifying legislative application may include a zoning map amendment, zoning concept plan amendment, or zoning conversion application involving a proposed data center use. A qualifying administrative application may include a site plan, site plan amendment, construction plan and profile, or subdivision application involving a proposed data center use.

Retaining grandfathered status
An application must avoid a substantial modification after February 12, 2025 and the applicant must diligently pursue approval. The resolution describes substantial modifications separately for legislative and administrative applications. Examples include certain increases in proposed data center floor area or building height, reductions in setbacks, changes or additions to proposed uses, or changes to the land area covered by the application. A modification requested by County staff in an official referral or review memorandum is not treated as a substantial modification under the applicable administrative rule.

The resolution states that an applicant may lose grandfathered status for failing to respond to a County request for resubmission or supporting material within six months, missing required public-hearing notices or meeting submission deadlines, withdrawing an application, or allowing it to become inactive. An administrative application may also lose its status if compliant application materials are not submitted within three years after the resolution's effective date. The assigned project manager is to provide written notice when an application loses grandfathered status.

What the resolution does not identify
The resolution does not list every application that qualifies, the address or parcel location of each affected project, the households or businesses near each site, the projected number or size of resulting data centers, expected tax revenue, public infrastructure costs, utility demand, environmental effects, privacy or surveillance practices, or a project-by-project construction timeline. Those details would need to be verified in the individual land-development application and official County records.

Public participation
The resolution records that the Planning Commission held a public hearing on September 24, 2024 and work sessions before forwarding a recommendation on December 12, 2024. The Board of Supervisors held a public hearing on February 12, 2025 and considered the amendments at meetings on March 4 and March 18, 2025. This excerpt does not specify a future hearing, comment deadline, or participation procedure for the adopted grandfathering resolution.`;

const perspectives = ["Resident", "Parent", "Small-business owner", "Community organization", "Other"] as const;
const NOT_SPECIFIED = "Not specified in the provided text";
const NO_RELEVANT_INFORMATION = "No relevant information was identified in the provided text.";

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

const sectionByKey = Object.fromEntries(copySections.map((section) => [section.key, section])) as Record<SectionKey, (typeof copySections)[number]>;

const primarySectionKeys = ["proposedAction", "importantDates", "publicParticipationOptions"] as const;
const secondarySectionKeys = [
  "affectedGroups",
  "financialOrRevenueConsiderations",
  "privacyOrSurveillanceConsiderations",
  "communityOrInfrastructureConsiderations",
] as const;

export default function Home() {
  const [mode, setMode] = useState<"scan" | "analyze">("scan");

  function handleModeKeys(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextMode = event.key === "ArrowLeft" || event.key === "Home" ? "scan" : "analyze";
    setMode(nextMode);
    document.getElementById(`${nextMode}-tab`)?.focus();
  }

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

      <section className="mode-content" aria-label="PublicBrief tools">
        <nav className="mode-switcher" aria-label="PublicBrief modes" role="tablist">
          <button id="scan-tab" type="button" role="tab" aria-selected={mode === "scan"} aria-controls="scan-panel" tabIndex={mode === "scan" ? 0 : -1} className={mode === "scan" ? "active" : ""} onKeyDown={handleModeKeys} onClick={() => setMode("scan")}><span>01</span> Scan My Locality</button>
          <button id="analyze-tab" type="button" role="tab" aria-selected={mode === "analyze"} aria-controls="analyze-panel" tabIndex={mode === "analyze" ? 0 : -1} className={mode === "analyze" ? "active" : ""} onKeyDown={handleModeKeys} onClick={() => setMode("analyze")}><span>02</span> Analyze a Document</button>
        </nav>

        {mode === "scan" ? <div id="scan-panel" role="tabpanel" aria-labelledby="scan-tab"><LocalityDashboard /></div> : <DocumentAnalyzer />}
      </section>

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
  const [submittedPerspective, setSubmittedPerspective] = useState<(typeof perspectives)[number]>("Resident");
  const [sampleLoaded, setSampleLoaded] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);
  const generateButtonRef = useRef<HTMLButtonElement>(null);

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
      setSubmittedPerspective(perspective);
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
    setPerspective("Resident");
    setConcern("Which data center applications qualify, where they are located, and what impacts remain undisclosed");
    setSampleLoaded(true);
    setBrief(null);
    setError("");
    setStatus("idle");
    requestAnimationFrame(() => generateButtonRef.current?.focus());
  }

  return (
    <div className="analyzer-mode" id="analyze-panel" role="tabpanel" aria-labelledby="analyze-tab">
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
          <button className={`sample-button ${sampleLoaded ? "loaded" : ""}`} type="button" onClick={loadSample}>{sampleLoaded ? "Sample loaded" : "Load a sample notice"}</button>
        </div>

        <form onSubmit={submit} aria-busy={status === "loading"}>
          <div className="textarea-wrap">
            <label htmlFor="source-text">Government agenda item or public notice</label>
            <textarea id="source-text" value={text} onChange={(event) => { setText(event.target.value); setSampleLoaded(false); }} maxLength={15000} placeholder="Paste the full text here…" aria-describedby={`text-help${status === "error" ? " analysis-error" : ""}`} aria-invalid={status === "error"} />
            <div className="textarea-meta" id="text-help"><span>Use the original text for the most reliable result.</span><span>{charCount.toLocaleString()} / 15,000</span></div>
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

          {status === "error" && <div className="message error" id="analysis-error" role="alert"><strong>We hit a snag.</strong> {error}</div>}

          {sampleLoaded && <p className="sample-ready" role="status">Demo-ready sample loaded</p>}

          <button ref={generateButtonRef} className={`generate-button ${sampleLoaded ? "sample-attention" : ""}`} type="submit" disabled={status === "loading" || text.trim().length === 0} aria-describedby={sampleLoaded ? "sample-generate-note" : undefined} aria-live="polite">
            {status === "loading" ? <><span className="spinner" aria-hidden="true" /> Generating your brief…</> : <>Generate Public Brief</>}
          </button>
          {sampleLoaded && <span className="sr-only" id="sample-generate-note">The demonstration sample is ready to analyze.</span>}
          <p className="privacy-note">Your text is sent to an AI provider for analysis. Don’t paste sensitive personal information. PublicBrief does not intentionally store submitted text in the application.</p>
        </form>
      </section>

      {status === "idle" && !brief && (
        <section className="empty-state" aria-label="No brief generated yet">
          <span aria-hidden="true">⌁</span><p>Your brief will appear here after you add source text and generate it.</p>
        </section>
      )}

      {status === "loading" && (
        <section className="loading-state" role="status" aria-live="polite" aria-label="Generating your PublicBrief">
          <div className="loading-line wide"/><div className="loading-line"/><div className="loading-cards"><div/><div/><div/></div>
        </section>
      )}

      {brief && status === "success" && (
        <section className="results" ref={resultsRef} aria-labelledby="results-title">
          <div className="results-header">
            <div><p className="result-kicker">Generated from the text you provided</p><h2 id="results-title">What the notice says</h2></div>
            <button className="copy-button" onClick={() => copy(fullBrief, "brief")}>{copied === "brief" ? "Copied" : "Copy complete brief"}</button>
          </div>

          <div className="analyzer-context" aria-label="Document context">
            <div><span>Document type</span><strong>{brief.documentContext.documentType}</strong></div>
            <div><span>Current status</span><strong>{brief.documentContext.currentStatus}</strong></div>
            <div><span>Meeting or decision date</span><strong>{brief.documentContext.meetingOrDecisionDate}</strong></div>
            <div><span>Decision level</span><strong>{brief.documentContext.decisionLevel}</strong></div>
          </div>

          <div className="verify-banner"><span aria-hidden="true">!</span><p><strong>Verify before you act.</strong> AI can make mistakes. Confirm dates, requirements, and participation details with the issuing government body.</p></div>

          <AtAGlance brief={brief} />

          {submittedConcern && brief.concernFocus.mostRelevantSection !== "none" && (
            <div className="concern-banner">
              <p><strong>Your focus:</strong> {submittedConcern}</p>
              <p>{brief.concernFocus.explanation}</p>
            </div>
          )}

          <div className="card-grid">
            <ProposalDetailsCard brief={brief} index={1} relevant={submittedConcern !== "" && brief.concernFocus.mostRelevantSection === "proposedAction"} />
            <DecisionRolesCard
              brief={brief}
              index={2}
              relevant={submittedConcern !== "" && ["decisionMakingBody", "responsibleEntities"].includes(brief.concernFocus.mostRelevantSection)}
            />
            {primarySectionKeys.slice(1).map((key, index) => (
              <ResultCard key={key} title={sectionByKey[key].title} hint={sectionByKey[key].hint} value={brief[key]} evidence={evidenceForSection(brief, key)} index={index + 3} relevant={submittedConcern !== "" && brief.concernFocus.mostRelevantSection === key} />
            ))}
            <PerspectiveCard perspective={submittedPerspective} summary={brief.perspectiveSummary} index={5} />
            {secondarySectionKeys.map((key, index) => (
              <ResultCard key={key} title={sectionByKey[key].title} hint={sectionByKey[key].hint} value={brief[key]} evidence={key === "affectedGroups" ? undefined : evidenceForSection(brief, key)} index={index + 6} relevant={submittedConcern !== "" && brief.concernFocus.mostRelevantSection === key} />
            ))}
            <ResultCard title={sectionByKey.missingInformation.title} hint={sectionByKey.missingInformation.hint} value={brief.missingInformation} index={10} relevant={submittedConcern !== "" && brief.concernFocus.mostRelevantSection === "missingInformation"} />
          </div>

          <ActionCenter brief={brief} copied={copied === "comment"} onCopy={() => copy(brief.publicCommentDraft, "comment")} />

          <section className="analyzer-evidence">
            <div><p className="result-kicker">Source grounding</p><h3>Evidence from the source</h3><p>Short excerpts that support the analysis above.</p></div>
            <div className="evidence-list">
              {brief.evidenceFromSource.map((evidence, index) => (
                <div key={`${evidence.finding}-${index}`}><span className={`evidence-status ${evidence.evidenceStatus}`}>{evidenceStatusLabel(evidence.evidenceStatus)}</span><p>{evidence.finding}</p>{evidence.evidence && <blockquote>“{evidence.evidence}”</blockquote>}</div>
              ))}
            </div>
          </section>
          <span className="sr-only" role="status" aria-live="polite">{copied === "brief" ? "Complete brief copied." : copied === "comment" ? "Public-comment draft copied." : ""}</span>
        </section>
      )}

    </div>
  );
}

function ProposalDetailsCard({ brief, index, relevant }: { brief: PublicBrief; index: number; relevant: boolean }) {
  const details = [
    { title: "Where", hint: "Location, site, district, or affected area", items: brief.proposalLocations },
    { title: "Who", hint: "People, households, businesses, or eligibility groups", items: brief.affectedGroups.documentedFacts },
    { title: "How money is managed", hint: "Funding source, administrator, contract, or oversight", items: brief.financialOrRevenueConsiderations.documentedFacts },
    { title: "Timeline", hint: "Hearings, approvals, implementation, and duration", items: brief.importantDates },
  ];

  return (
    <article className={`result-card proposal-details-card ${relevant ? "most-relevant" : ""}`}>
      <div className="card-topline"><p className="card-index">{String(index).padStart(2, "0")}</p>{relevant && <span className="relevance-label">Most relevant to your concern</span>}</div>
      <h3>Proposal details</h3>
      <p className="card-hint">The concrete scope of what is being considered</p>
      <div className="proposal-action"><h4>Decision being considered</h4><Value value={brief.proposedAction} /></div>
      <div className="proposal-facts-grid">
        {details.map((detail) => (
          <section key={detail.title}>
            <h4>{detail.title}</h4>
            <p>{detail.hint}</p>
            <Value value={detail.items} />
          </section>
        ))}
      </div>
      {evidenceForSection(brief, "proposedAction").some((finding) => finding.evidence) && <EvidenceDetails findings={evidenceForSection(brief, "proposedAction")} />}
    </article>
  );
}

function ActionCenter({ brief, copied, onCopy }: { brief: PublicBrief; copied: boolean; onCopy: () => void }) {
  return (
    <section className="action-center" aria-labelledby="action-center-title">
      <div className="action-center-heading">
        <div><p className="result-kicker">Action</p><h3 id="action-center-title">Turn the brief into action</h3></div>
        <p>Use the unresolved questions at a hearing or send a source-grounded public comment. Verify the meeting process before participating.</p>
      </div>
      <div className="action-center-grid">
        <section className="hearing-questions" aria-labelledby="hearing-questions-title">
          <p className="action-label">At a hearing or meeting</p>
          <h4 id="hearing-questions-title">Questions to ask</h4>
          <ol>{brief.questionsToAsk.map((question, index) => <li key={`${question}-${index}`}>{question}</li>)}</ol>
        </section>
        <section className="email-action" aria-labelledby="email-action-title">
          <div className="email-action-heading"><div><p className="action-label">By email</p><h4 id="email-action-title">Public-comment draft</h4></div><button className="copy-button" type="button" onClick={onCopy}>{copied ? "Copied" : "Copy email-ready comment"}</button></div>
          <p className="action-note">Add your name, verify the details, and send it through the issuing body’s official channel.</p>
          <div className="comment-copy">{brief.publicCommentDraft}</div>
        </section>
      </div>
    </section>
  );
}

function AtAGlance({ brief }: { brief: PublicBrief }) {
  const flaggedCategories = [
    hasRelevantInformation(brief.financialOrRevenueConsiderations) ? "Public Money" : null,
    hasRelevantInformation(brief.privacyOrSurveillanceConsiderations) ? "Privacy & Surveillance" : null,
    hasRelevantInformation(brief.communityOrInfrastructureConsiderations) ? "Community & Infrastructure" : null,
  ].filter(Boolean) as string[];
  const decision = brief.proposedAction.documentedFacts[0] || NOT_SPECIFIED;
  const participation = brief.publicParticipationOptions[0] || NOT_SPECIFIED;

  return (
    <section className="at-a-glance" aria-labelledby="at-a-glance-title">
      <div className="at-a-glance-heading">
        <p className="result-kicker">Five-second brief</p>
        <h3 id="at-a-glance-title">At a glance</h3>
        <p>{brief.plainLanguageSummary}</p>
      </div>
      <dl>
        <div><dt>Decision</dt><dd>{decision}</dd></div>
        <div><dt>Status</dt><dd>{brief.documentContext.currentStatus || NOT_SPECIFIED}</dd></div>
        <div><dt>Meeting</dt><dd>{brief.documentContext.meetingOrDecisionDate || NOT_SPECIFIED}</dd></div>
        <div><dt>Decision-maker</dt><dd>{brief.decisionMakingBody || NOT_SPECIFIED}</dd></div>
        <div><dt>Participation</dt><dd>{participation}</dd></div>
        <div><dt>Flagged for</dt><dd>{flaggedCategories.length ? flaggedCategories.join(" · ") : NOT_SPECIFIED}</dd></div>
      </dl>
    </section>
  );
}

function ResultCard({ title, hint, value, evidence, index, relevant }: { title: string; hint: string; value: SectionValue; evidence?: PublicBrief["evidenceFromSource"]; index: number; relevant?: boolean }) {
  return (
    <article className={`result-card ${relevant ? "most-relevant" : ""}`}>
      <div className="card-topline"><p className="card-index">{String(index).padStart(2, "0")}</p>{relevant && <span className="relevance-label">Most relevant to your concern</span>}</div>
      <h3>{title}</h3><p className="card-hint">{hint}</p>
      <div className="card-content"><Value value={value} /></div>
      {evidence && evidence.some((finding) => finding.evidence) && <EvidenceDetails findings={evidence} />}
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
      <div className="decision-contact-line">
        <strong>Source-stated contact information</strong>
        {brief.contacts.length ? (
          <ul>{brief.contacts.map((contact, contactIndex) => {
            const identity = contact.name || contact.organization || contact.title || NOT_SPECIFIED;
            const details = [contact.title, contact.district, contact.organization, contact.email, contact.phone, contact.website, contact.contactFormUrl]
              .filter((value, index, values) => value && value !== identity && values.indexOf(value) === index);
            return <li key={`${contact.roleLabel}-${contactIndex}`}><span>{contact.roleLabel}:</span> {identity}{details.length ? ` — ${details.join(" · ")}` : ""}</li>;
          })}</ul>
        ) : <p>No contact information was identified in the provided text. Check the issuing body’s official page.</p>}
      </div>
    </article>
  );
}

function PerspectiveCard({ perspective, summary, index }: { perspective: string; summary: string; index: number }) {
  return (
    <article className="result-card perspective-card">
      <div className="card-topline"><p className="card-index">{String(index).padStart(2, "0")}</p></div>
      <h3>What this means to you as a {perspective.toLocaleLowerCase()}</h3>
      <p className="card-hint">Perspective-aware emphasis, without adding facts or recommending a position</p>
      <div className="card-content"><p>{summary}</p></div>
    </article>
  );
}

function EvidenceDetails({ findings }: { findings: PublicBrief["evidenceFromSource"] }) {
  const visibleFindings = findings.filter((finding) => finding.evidence);
  return (
    <details className="inline-evidence">
      <summary>Source evidence</summary>
      <div>{visibleFindings.map((finding, index) => (
        <section key={`${finding.finding}-${index}`}>
          <span className={`evidence-status ${finding.evidenceStatus}`}>{evidenceStatusLabel(finding.evidenceStatus)}</span>
          <p>{finding.finding}</p>
          {finding.evidence && <blockquote>“{finding.evidence}”</blockquote>}
        </section>
      ))}</div>
    </details>
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
  const notSpecified = value.documentedFacts.length === 0 || value.documentedFacts.every((item) => item === NOT_SPECIFIED || item === NO_RELEVANT_INFORMATION);
  if (notSpecified) return <div className="not-specified"><h4>Not specified</h4><p>{value.documentedFacts[0] || NOT_SPECIFIED}</p></div>;
  return <><h4>Documented in the source</h4><ul>{value.documentedFacts.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>{value.possibleImplications.length > 0 && <><h4>Potential implications</h4><ul>{value.possibleImplications.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></>}</>;
}

function hasRelevantInformation(value: PublicBrief["financialOrRevenueConsiderations"]) {
  return value.documentedFacts.some((item) => item !== NOT_SPECIFIED && item !== NO_RELEVANT_INFORMATION);
}

function evidenceStatusLabel(status: "direct" | "inferred" | "not-specified") {
  if (status === "direct") return "Directly stated";
  if (status === "inferred") return "Potential implication";
  return "Not specified";
}

function evidenceForSection(brief: PublicBrief, section: PublicBrief["evidenceFromSource"][number]["section"]) {
  return brief.evidenceFromSource.filter((finding) => finding.section === section);
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
    "",
    "PERSPECTIVE SUMMARY",
    brief.perspectiveSummary,
    "",
    "PROPOSAL DETAILS",
    "Where:", ...brief.proposalLocations.map((item) => `• ${item}`),
    "Who:", ...brief.affectedGroups.documentedFacts.map((item) => `• ${item}`),
    "How money is managed:", ...brief.financialOrRevenueConsiderations.documentedFacts.map((item) => `• ${item}`),
    "Timeline:", ...brief.importantDates.map((item) => `• ${item}`),
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
    else if (typeof value === "object") lines.push("Documented in the source:", ...value.documentedFacts.map((item) => `• ${item}`), "Potential implications:", ...value.possibleImplications.map((item) => `• ${item}`));
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
  lines.push("", "EVIDENCE FROM THE SOURCE", ...brief.evidenceFromSource.map((evidence) => `• ${evidence.finding}${evidence.evidence ? ` — “${evidence.evidence}”` : ""}`));
  lines.push("", "PUBLIC-COMMENT DRAFT", brief.publicCommentDraft, "", "Verify details with the issuing government body. Not legal advice.");
  return lines.join("\n");
}
