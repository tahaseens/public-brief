"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { loudounAgendaItems } from "@/data/agenda-items";
import { localityOptions, loudounCounty, stateOptions } from "@/data/localities";
import { topicCategories, type AgendaItem, type GovernmentContact, type TopicCategory } from "@/lib/locality";

const localitySubmissionUrl = "https://github.com/tahaseens/public-brief/issues/new?title=Locality%20information%3A%20&body=Locality%3A%0AState%3A%0AOfficial%20agenda%20or%20meeting%20URL%3A%0AOfficial%20government%20directory%20URL%3A%0AOther%20relevant%20official%20sources%3A%0A%0APlease%20do%20not%20include%20private%20personal%20information.";

export function LocalityDashboard() {
  const [activeTopic, setActiveTopic] = useState<TopicCategory>("Public Money");
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);
  const [district, setDistrict] = useState("");
  const detailRef = useRef<HTMLElement>(null);

  const filteredItems = useMemo(
    () => loudounAgendaItems.filter((item) => item.categories.includes(activeTopic)),
    [activeTopic],
  );

  const representative = district
    ? loudounCounty.representatives.find((person) => person.district === district)
    : undefined;

  function openItem(item: AgendaItem) {
    setSelectedItem(item);
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function handleTopicKeys(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? topicCategories.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + topicCategories.length) % topicCategories.length;
    const nextTopic = topicCategories[nextIndex];
    setActiveTopic(nextTopic);
    setSelectedItem(null);
    document.getElementById(topicTabId(nextTopic))?.focus();
  }

  return (
    <section className="dashboard-mode" aria-labelledby="dashboard-title">
      <div className="dashboard-lead">
        <div>
          <p className="section-label">Scan My Locality</p>
          <h2 id="dashboard-title">Decisions worth a closer look</h2>
          <p>Browse a prototype feed for issues relevant to the categories below in the selected locality. Items may appear under more than one topic.</p>
        </div>
        <span className="demo-badge">Demonstration data</span>
      </div>

      <div className="locality-controls">
        <div className="control-group">
          <label htmlFor="state-select">State</label>
          <select id="state-select" defaultValue="virginia">
            {stateOptions.map((state) => (
              <option key={state.id} value={state.id} disabled={!state.supported}>{state.name}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="locality-select">Locality</label>
          <select id="locality-select" defaultValue={loudounCounty.id}>
            {localityOptions.map((locality) => (
              <option key={locality.id} value={locality.id} disabled={!locality.supported}>{locality.name}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="district-select">Local district <span>Optional</span></label>
          <select id="district-select" value={district} onChange={(event) => setDistrict(event.target.value)}>
            <option value="">Not selected</option>
            {loudounCounty.representatives.filter((person) => person.district).map((person) => (
              <option key={person.district} value={person.district}>{person.district} District</option>
            ))}
          </select>
        </div>
        <div className="control-group submission-control">
          <span className="control-label">Contribute</span>
          <a className="locality-submit-button" href={localitySubmissionUrl} target="_blank" rel="noopener noreferrer" aria-label="Submit locality information on GitHub; opens in a new tab">Submit locality information</a>
        </div>
      </div>

      <div className="dashboard-source-note">
        <div>
          <strong>Official sources, demonstration briefs</strong>
          <span>Every card is based on linked Loudoun County or Virginia government material. The summaries and pre-decision framing are adapted for product testing, not a live agenda feed.</span>
          <p><strong>How issues are collected:</strong> Prototype items are manually selected from official agendas, staff reports, procurement postings, budgets, laws, and legislative records. This is not a complete or continuously monitored feed.</p>
        </div>
        <a href="https://www.loudoun.gov/Meetings" target="_blank" rel="noopener noreferrer">Check official meeting materials</a>
      </div>

      <div className="topic-tabs" role="tablist" aria-label="Agenda topics">
        {topicCategories.map((topic, topicIndex) => (
          <button
            id={topicTabId(topic)}
            type="button"
            role="tab"
            aria-selected={activeTopic === topic}
            aria-controls="agenda-topic-panel"
            tabIndex={activeTopic === topic ? 0 : -1}
            className={activeTopic === topic ? "active" : ""}
            key={topic}
            onKeyDown={(event) => handleTopicKeys(event, topicIndex)}
            onClick={() => { setActiveTopic(topic); setSelectedItem(null); }}
          >
            <span>{topic}</span>
            <small>{loudounAgendaItems.filter((item) => item.categories.includes(topic)).length}</small>
          </button>
        ))}
      </div>

      {filteredItems.length ? (
        <div id="agenda-topic-panel" className="agenda-grid" role="tabpanel" aria-labelledby={topicTabId(activeTopic)}>
          {filteredItems.map((item) => (
            <AgendaCard key={item.id} item={item} activeTopic={activeTopic} onOpen={() => openItem(item)} />
          ))}
        </div>
      ) : (
        <div className="dashboard-empty"><strong>No demonstration items in this topic.</strong><span>Try another topic or analyze a document directly.</span></div>
      )}

      {selectedItem && (
        <AgendaDetail
          item={selectedItem}
          representative={representative}
          detailRef={detailRef}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  );
}

function AgendaCard({ item, activeTopic, onOpen }: { item: AgendaItem; activeTopic: TopicCategory; onOpen: () => void }) {
  return (
    <article className="agenda-card">
      <div className="agenda-card-top"><span className="demo-badge compact">Demo</span><span>{item.governmentLevel}</span></div>
      <h3>{item.title}</h3>
      <p className="agenda-meta"><strong>{item.governingBody}</strong><span>{item.meetingDate}</span></p>
      <div className="category-badges">
        {item.categories.map((category) => <span className={category === activeTopic ? "active" : ""} key={category}>{category}</span>)}
      </div>
      <div className="why-matters"><strong>Why this may matter</strong><p>{item.whyItMatters}</p></div>
      <p className="agenda-status">{item.status}</p>
      <div className="agenda-card-actions">
        <button type="button" className="brief-link" onClick={onOpen}>View full brief</button>
        {safeHttpsUrl(item.sourceUrl) && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open official source for ${item.title}; opens in a new tab`}>Official government source ↗</a>}
      </div>
    </article>
  );
}

function AgendaDetail({
  item,
  representative,
  detailRef,
  onClose,
}: {
  item: AgendaItem;
  representative?: (typeof loudounCounty.representatives)[number];
  detailRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  return (
    <article className="agenda-detail" ref={detailRef} tabIndex={-1} aria-labelledby="detail-title">
      <div className="detail-header">
        <div><span className="demo-badge">Demonstration data</span><p className="section-label">PublicBrief detail</p><h2 id="detail-title">{item.title}</h2><p>{item.summary}</p></div>
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close agenda item detail">Close</button>
      </div>

      <div className="detail-status-row">
        <div><span>Current status</span><strong>{item.status}</strong></div>
        <div><span>Meeting or decision date</span><strong>{item.meetingDate}</strong></div>
        <div><span>Decision level</span><strong>{item.governmentLevel}</strong></div>
      </div>

      <div className="detail-grid">
        <DetailSection title="What is being proposed"><StringList items={item.proposedAction} /></DetailSection>
        <DetailSection title="Why this item was flagged">
          <div className="flag-reasons">{item.categories.map((category) => <div key={category}><strong>{category}</strong><p>{item.categoryReasons[category]}</p></div>)}</div>
        </DetailSection>
      </div>

      <section className="responsibility-section">
        <div className="detail-section-heading">
          <p className="section-label">Decision roles</p>
          <h3>Who is responsible for what</h3>
          <p>These roles come from the source material. No single official is presented as controlling the entire decision.</p>
        </div>
        <div className="role-grid">
          {item.responsibleEntities.map((entity, index) => (
            <div key={`${entity.role}-${index}`}><span>{entity.role}</span><strong>{entity.name}</strong>{entity.detail && <p>{entity.detail}</p>}{safeHttpsUrl(entity.url) && <a href={entity.url} target="_blank" rel="noopener noreferrer">Official information</a>}</div>
          ))}
        </div>
      </section>

      <div className="detail-grid">
        <DetailSection title="Potentially affected groups"><StringList items={item.affectedGroups} /></DetailSection>
        <DetailSection title="Public money considerations"><StringList items={item.financialConsiderations} /></DetailSection>
        <DetailSection title="Privacy or surveillance considerations"><StringList items={item.privacyConsiderations} /></DetailSection>
        <DetailSection title="Community or infrastructure considerations"><StringList items={item.infrastructureConsiderations} /></DetailSection>
        <DetailSection title="Missing or unclear information"><StringList items={item.missingInformation} /></DetailSection>
        <DetailSection title="Questions residents could ask"><StringList items={item.questionsToAsk} /></DetailSection>
      </div>

      <div className="detail-grid lower">
        <DetailSection title="Who to contact">
          <ContactList contacts={item.contacts} representative={representative} />
        </DetailSection>
        <DetailSection title="Public participation options"><StringList items={item.participationOptions} /><a className="inline-source" href={item.governmentLevel === "State" ? item.sourceUrl : "https://www.loudoun.gov/4853/About-Board-of-Supervisors-Meetings"} target="_blank" rel="noopener noreferrer">{item.governmentLevel === "State" ? "Verify through the official state source" : "Verify public-input procedures"}</a></DetailSection>
      </div>

      <section className="evidence-panel">
        <p className="section-label">Evidence from the official source</p>
        <blockquote>“{item.sourceExcerpt}”</blockquote>
        {safeHttpsUrl(item.sourceUrl) && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Open {item.sourceLabel}</a>}
      </section>

      <div className="ai-notice"><strong>Verify before participating.</strong> PublicBrief provides an AI-assisted summary. Verify dates, procedures, and decision details with the issuing government body.</div>
    </article>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="detail-section"><h3>{title}</h3>{children}</section>;
}

function StringList({ items }: { items: string[] }) {
  return <ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
}

function ContactList({
  contacts,
  representative,
}: {
  contacts?: GovernmentContact[];
  representative?: (typeof loudounCounty.representatives)[number];
}) {
  const resolvedContacts = contacts?.slice(0, 3).map((contact) => {
    if (contact.id !== "district-representative" || !representative) return contact;
    return {
      ...contact,
      name: representative.name,
      title: representative.title,
      district: representative.district ? `${representative.district} District` : contact.district,
      phone: representative.phone,
      website: representative.website,
    };
  });

  return (
    <div className="contact-panel">
      <div className="contact-intro">
        <p>Relevant officials and government contacts for this decision.</p>
        {resolvedContacts?.some((contact) => contact.demonstration) && <span className="demo-badge compact">Demonstration contacts</span>}
      </div>

      {resolvedContacts?.length ? (
        <div className="contact-list">
          {resolvedContacts.map((contact) => {
            const primaryName = contact.name || contact.organization || contact.title;
            const websiteLabel = contact.id === "district-representative" && !representative ? "View directory" : "Official page";
            return (
              <section className="contact-entry" key={contact.id} aria-labelledby={`contact-${contact.id}`}>
                <h4 id={`contact-${contact.id}`}>{contact.roleLabel}</h4>
                {primaryName && <strong>{primaryName}</strong>}
                {contact.title && contact.title !== primaryName && <p>{contact.title}</p>}
                {contact.district && <p>{contact.district}</p>}
                {contact.organization && contact.organization !== primaryName && <p>{contact.organization}</p>}
                <div className="contact-actions">
                  {safeEmail(contact.email) && <a href={`mailto:${contact.email}`} aria-label={`Email ${primaryName || contact.roleLabel}`}>Email</a>}
                  {safePhone(contact.phone) && <a href={`tel:${safePhone(contact.phone)}`} aria-label={`Call ${primaryName || contact.roleLabel}`}>Call</a>}
                  {safeHttpsUrl(contact.website) && <a href={contact.website} target="_blank" rel="noopener noreferrer" aria-label={`${websiteLabel} for ${primaryName || contact.roleLabel}; opens in a new tab`}>{websiteLabel}</a>}
                  {safeHttpsUrl(contact.contactFormUrl) && <a href={contact.contactFormUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open contact form for ${primaryName || contact.roleLabel}; opens in a new tab`}>Contact form</a>}
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
  );
}

function topicTabId(topic: TopicCategory) {
  return `topic-${topic.toLowerCase().replace(/[^a-z]+/g, "-")}`;
}

function safeHttpsUrl(value?: string) {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function safeEmail(value?: string) {
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

function safePhone(value?: string) {
  if (!value) return null;
  const normalized = value.replace(/[^\d+]/g, "");
  return /^\+?\d{7,15}$/.test(normalized) ? normalized : null;
}
