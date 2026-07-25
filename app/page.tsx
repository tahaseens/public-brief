"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { PublicBrief } from "@/lib/brief";

const SAMPLE_NOTICE = `CITY OF RIVERTON — PUBLIC HEARING NOTICE

The Riverton Planning Commission will hold a public hearing on September 18, 2026, at 6:30 p.m. in Council Chambers, 100 Civic Plaza, regarding application LU-26-041.

The applicant requests approval to rezone 14–22 Maple Avenue from Neighborhood Commercial to Mixed-Use Medium Density. The proposal describes a five-story building with 62 apartments, approximately 8,000 square feet of ground-floor retail space, and 71 parking spaces. Eight apartments would be designated affordable for households earning up to 80% of area median income for 20 years.

Written comments received by the Planning Department by 4:00 p.m. on September 17, 2026, will be included in the meeting record. Members of the public may also speak at the hearing for up to three minutes. The notice does not state the anticipated construction schedule, estimated project cost, expected tax revenue, traffic impacts, or whether tenant relocation will be required.`;

const perspectives = ["Resident", "Parent", "Small-business owner", "Community organization", "Other"] as const;

type Detail = PublicBrief["proposedAction"];

const sections: Array<{ key: keyof PublicBrief; title: string; hint: string }> = [
  { key: "plainLanguageSummary", title: "Plain-language summary", hint: "The essentials, without the jargon" },
  { key: "proposedAction", title: "Proposed action", hint: "What the government body may do" },
  { key: "affectedGroups", title: "Who may be affected", hint: "People and groups named or reasonably implicated" },
  { key: "financialOrRevenueConsiderations", title: "Money & revenue", hint: "Costs, funding, contracts, or revenue" },
  { key: "privacyOrSurveillanceConsiderations", title: "Privacy & surveillance", hint: "Collection, sharing, or monitoring of data" },
  { key: "importantDates", title: "Important dates", hint: "Deadlines, meetings, and effective dates" },
  { key: "publicParticipationOptions", title: "Ways to participate", hint: "Options stated in the source" },
  { key: "missingInformation", title: "What’s missing", hint: "Details the notice does not provide" },
  { key: "questionsToAsk", title: "Questions to ask", hint: "Useful, neutral follow-up questions" },
];

export default function Home() {
  const [text, setText] = useState("");
  const [perspective, setPerspective] = useState<(typeof perspectives)[number]>("Resident");
  const [concern, setConcern] = useState("");
  const [brief, setBrief] = useState<PublicBrief | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"brief" | "comment" | null>(null);
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
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="PublicBrief home">
          <span className="brand-mark" aria-hidden="true">PB</span>
          <span>PublicBrief</span>
        </a>
        <span className="header-note">For a more informed public</span>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span /> Civic information, made legible</div>
        <h1>Public decisions.<br /><em>Plainly understood.</em></h1>
        <p className="hero-copy">Paste a local-government agenda item, notice, proposal, or policy. Get a source-grounded brief focused on what matters to you.</p>
        <div className="trust-row">
          <span>Facts stay facts</span><span>Gaps stay visible</span><span>No political persuasion</span>
        </div>
      </section>

      <section className="workspace" aria-labelledby="workspace-title">
        <div className="workspace-heading">
          <div><span className="step-number">01</span><h2 id="workspace-title">Add the public text</h2></div>
          <button className="sample-button" type="button" onClick={loadSample}>Load a sample notice <span aria-hidden="true">↘</span></button>
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
            {status === "loading" ? <><span className="spinner" /> Reading the public record…</> : <>Generate Public Brief <span aria-hidden="true">→</span></>}
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
            <div><span className="step-number">02</span><div><p className="result-kicker">Your generated brief</p><h2 id="results-title">What the notice says</h2></div></div>
            <button className="copy-button" onClick={() => copy(fullBrief, "brief")}>{copied === "brief" ? "Copied" : "Copy complete brief"}</button>
          </div>

          <div className="verify-banner"><span aria-hidden="true">!</span><p><strong>Verify before you act.</strong> AI can make mistakes. Confirm dates, requirements, and participation details with the issuing government body.</p></div>

          <div className="card-grid">
            {sections.map((section, index) => (
              <ResultCard key={section.key} title={section.title} hint={section.hint} value={brief[section.key]} index={index + 1} featured={index === 0} />
            ))}
          </div>

          <article className="comment-card">
            <div><p className="card-index">10 / READY TO EDIT</p><h3>Public-comment draft</h3><p className="card-hint">A neutral starting point based only on the notice</p></div>
            <div className="comment-copy">{brief.publicCommentDraft}</div>
            <button className="copy-button dark" onClick={() => copy(brief.publicCommentDraft, "comment")}>{copied === "comment" ? "Copied" : "Copy comment draft"}</button>
          </article>
        </section>
      )}

      <footer><div className="brand"><span className="brand-mark">PB</span><span>PublicBrief</span></div><p>Public information should be understandable.</p><p>Not legal advice. Always verify official details.</p></footer>
    </main>
  );
}

function ResultCard({ title, hint, value, index, featured }: { title: string; hint: string; value: string | string[] | Detail; index: number; featured?: boolean }) {
  return (
    <article className={`result-card ${featured ? "featured" : ""}`}>
      <p className="card-index">{String(index).padStart(2, "0")}</p>
      <h3>{title}</h3><p className="card-hint">{hint}</p>
      <div className="card-content"><Value value={value} /></div>
    </article>
  );
}

function Value({ value }: { value: string | string[] | Detail }) {
  if (typeof value === "string") return <p>{value}</p>;
  if (Array.isArray(value)) return <ul>{value.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
  return <><h4>Documented facts</h4><ul>{value.documentedFacts.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul><h4>Possible implications</h4><ul>{value.possibleImplications.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></>;
}

function briefToText(brief: PublicBrief) {
  const lines = ["PUBLICBRIEF", "", "PLAIN-LANGUAGE SUMMARY", brief.plainLanguageSummary];
  for (const section of sections.slice(1)) {
    const value = brief[section.key];
    lines.push("", section.title.toUpperCase());
    if (Array.isArray(value)) lines.push(...value.map((item) => `• ${item}`));
    else if (typeof value === "object") lines.push("Documented facts:", ...value.documentedFacts.map((item) => `• ${item}`), "Possible implications:", ...value.possibleImplications.map((item) => `• ${item}`));
  }
  lines.push("", "PUBLIC-COMMENT DRAFT", brief.publicCommentDraft, "", "Verify details with the issuing government body. Not legal advice.");
  return lines.join("\n");
}
