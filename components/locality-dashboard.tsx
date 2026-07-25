"use client";

import { useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { loudounAgendaItems } from "@/data/agenda-items";
import { localityOptions, loudounCounty } from "@/data/localities";
import { topicCategories, type AgendaItem, type GovernmentContact, type TopicCategory } from "@/lib/locality";

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

  return (
    <section className="dashboard-mode" aria-labelledby="dashboard-title">
      <div className="dashboard-lead">
        <div>
          <p className="section-label">Scan My Locality</p>
          <h2 id="dashboard-title">Decisions worth a closer look</h2>
          <p>Browse a curated prototype feed for one locality. Items may appear under more than one topic.</p>
        </div>
        <span className="demo-badge">Demonstration data</span>
      </div>

      <div className="locality-controls">
        <div className="control-group">
          <label htmlFor="state-select">State</label>
          <select id="state-select" value="Virginia" disabled>
            <option>Virginia</option>
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
      </div>

      <div className="dashboard-source-note">
        <div>
          <strong>Official sources, demonstration briefs</strong>
          <span>Every card is based on linked Loudoun County material. The summaries and pre-decision framing are adapted for product testing, not a live agenda feed.</span>
        </div>
        <a href="https://www.loudoun.gov/Meetings" target="_blank" rel="noreferrer">Check official meeting materials</a>
      </div>

      <div className="topic-tabs" role="tablist" aria-label="Agenda topics">
        {topicCategories.map((topic) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeTopic === topic}
            className={activeTopic === topic ? "active" : ""}
            key={topic}
            onClick={() => { setActiveTopic(topic); setSelectedItem(null); }}
          >
            <span>{topic}</span>
            <small>{loudounAgendaItems.filter((item) => item.categories.includes(topic)).length}</small>
          </button>
        ))}
      </div>

      {filteredItems.length ? (
        <div className="agenda-grid" role="tabpanel" aria-label={activeTopic}>
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
      <div className="why-matters"><strong>Why it matters</strong><p>{item.whyItMatters}</p></div>
      <p className="agenda-status">{item.status}</p>
      <div className="agenda-card-actions">
        <button type="button" className="brief-link" onClick={onOpen}>View full brief</button>
        <a href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open official source for ${item.title}`}>Official Loudoun source ↗</a>
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
        <DetailSection title="Potentially affected groups"><StringList items={item.affectedGroups} /></DetailSection>
        <DetailSection title="Public money considerations"><StringList items={item.financialConsiderations} /></DetailSection>
        <DetailSection title="Privacy or surveillance considerations"><StringList items={item.privacyConsiderations} /></DetailSection>
        <DetailSection title="Community or infrastructure considerations"><StringList items={item.infrastructureConsiderations} /></DetailSection>
        <DetailSection title="Missing or unclear information" important><StringList items={item.missingInformation} /></DetailSection>
        <DetailSection title="Questions residents could ask"><StringList items={item.questionsToAsk} /></DetailSection>
      </div>

      <section className="responsibility-section">
        <div className="detail-section-heading">
          <p className="section-label">Decision roles</p>
          <h3>Who is responsible for what</h3>
          <p>These roles come from the source material. No single official is presented as controlling the entire decision.</p>
        </div>
        <div className="role-grid">
          {item.responsibleEntities.map((entity, index) => (
            <div key={`${entity.role}-${index}`}><span>{entity.role}</span><strong>{entity.name}</strong>{entity.detail && <p>{entity.detail}</p>}{entity.url && <a href={entity.url} target="_blank" rel="noreferrer">Official information</a>}</div>
          ))}
        </div>
      </section>

      <div className="detail-grid lower">
        <DetailSection title="Who to contact">
          <ContactList contacts={item.contacts} representative={representative} />
        </DetailSection>
        <DetailSection title="Public participation options"><StringList items={item.participationOptions} /><a className="inline-source" href="https://www.loudoun.gov/4853/About-Board-of-Supervisors-Meetings" target="_blank" rel="noreferrer">Verify public-input procedures</a></DetailSection>
      </div>

      <section className="evidence-panel">
        <p className="section-label">Evidence from the official source</p>
        <blockquote>“{item.sourceExcerpt}”</blockquote>
        <a href={item.sourceUrl} target="_blank" rel="noreferrer">Open {item.sourceLabel}</a>
      </section>

      <div className="ai-notice"><strong>Verify before participating.</strong> PublicBrief provides an AI-assisted summary. Verify dates, procedures, and decision details with the issuing government body.</div>
    </article>
  );
}

function DetailSection({ title, children, important = false }: { title: string; children: ReactNode; important?: boolean }) {
  return <section className={`detail-section ${important ? "important" : ""}`}><h3>{title}</h3>{children}</section>;
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
                  {contact.email && <a href={`mailto:${contact.email}`} aria-label={`Email ${primaryName || contact.roleLabel}`}>Email</a>}
                  {contact.phone && <a href={`tel:${contact.phone}`} aria-label={`Call ${primaryName || contact.roleLabel}`}>Call</a>}
                  {contact.website && <a href={contact.website} target="_blank" rel="noreferrer" aria-label={`${websiteLabel} for ${primaryName || contact.roleLabel}`}>{websiteLabel}</a>}
                  {contact.contactFormUrl && <a href={contact.contactFormUrl} target="_blank" rel="noreferrer" aria-label={`Open contact form for ${primaryName || contact.roleLabel}`}>Contact form</a>}
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
