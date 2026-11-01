"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/shell";

type PersonRole = "Lawyer" | "Client";
interface Person {
  id: string;
  name: string;
  role: PersonRole;
  initials: string;
  chamber: string;
  email: string;
  phone: string;
  matters: number;
  availability: "Available" | "In hearing" | "Contact registry";
  specialization?: string;
}

const initialPeople: Person[] = [
  {
    id: "law-1",
    name: "Adv. Priya Menon",
    role: "Lawyer",
    initials: "PM",
    chamber: "Menon Legal Chambers",
    email: "priya.menon@bar.example",
    phone: "+91 98765 21034",
    matters: 6,
    availability: "Available",
    specialization: "Constitutional & Civil Writs",
  },
  {
    id: "law-2",
    name: "Adv. Sameer Dutta",
    role: "Lawyer",
    initials: "SD",
    chamber: "Dutta & Associates",
    email: "sameer.dutta@bar.example",
    phone: "+91 98765 82109",
    matters: 4,
    availability: "In hearing",
    specialization: "Criminal Defense & Bail",
  },
  {
    id: "law-3",
    name: "Adv. Leela Nair",
    role: "Lawyer",
    initials: "LN",
    chamber: "Nair Counsel",
    email: "leela.nair@bar.example",
    phone: "+91 98765 63542",
    matters: 3,
    availability: "Available",
    specialization: "Family & Matrimonial Law",
  },
  {
    id: "law-4",
    name: "Adv. Vikram Singhania",
    role: "Lawyer",
    initials: "VS",
    chamber: "Singhania Appellate Chambers",
    email: "vikram.singhania@bar.example",
    phone: "+91 98765 33490",
    matters: 5,
    availability: "Available",
    specialization: "Revenue & Land Laws",
  },
  {
    id: "client-1",
    name: "Aarav Mehta",
    role: "Client",
    initials: "AM",
    chamber: "Petitioner &bull; W.P. (C) 1842/2026",
    email: "aarav.mehta@example.com",
    phone: "+91 98765 41290",
    matters: 1,
    availability: "Contact registry",
  },
  {
    id: "client-2",
    name: "Nila Infrastructure Ltd.",
    role: "Client",
    initials: "NI",
    chamber: "Appellant &bull; C.A. 917/2026",
    email: "legal@nila.example",
    phone: "+91 98765 88012",
    matters: 2,
    availability: "Contact registry",
  },
  {
    id: "client-3",
    name: "Kavya Rao",
    role: "Client",
    initials: "KR",
    chamber: "Applicant &bull; O.A. 231/2026",
    email: "kavya.rao@example.com",
    phone: "+91 98765 19486",
    matters: 1,
    availability: "Contact registry",
  },
];

export function PeopleDirectory() {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [role, setRole] = useState<"All" | PersonRole>("All");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  // Consultation booking state
  const [consultingPerson, setConsultingPerson] = useState<Person | null>(null);
  const [consDate, setConsDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [consTime, setConsTime] = useState("11:00 AM - 11:30 AM");
  const [consSummary, setConsSummary] = useState("");
  const [consName, setConsName] = useState("");
  const [consEmail, setConsEmail] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const visible = useMemo(
    () =>
      people.filter(
        (person) =>
          (role === "All" || person.role === role) &&
          `${person.name} ${person.chamber} ${person.specialization || ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [people, query, role]
  );

  function addPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const personRole = data.get("role") as PersonRole;
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;

    setPeople((current) => [
      {
        id: `new-${Date.now()}`,
        name,
        role: personRole,
        initials: name
          .split(/\s+/)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        chamber: String(data.get("detail") ?? "Record pending"),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        specialization: String(data.get("specialization") ?? "General Practice"),
        matters: 0,
        availability: personRole === "Lawyer" ? "Available" : "Contact registry",
      },
      ...current,
    ]);
    setShowForm(false);
    setNotice(`${personRole} added to this working directory.`);
  }

  async function handleBookConsultation(e: FormEvent) {
    e.preventDefault();
    if (!consultingPerson) return;

    setBookingLoading(true);
    try {
      const res = await fetch("/api/services/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lawyerId: consultingPerson.id,
          lawyerName: consultingPerson.name,
          applicantName: consName || "Citizen Applicant",
          applicantEmail: consEmail || "applicant@example.com",
          applicantPhone: "+91 98765 00000",
          date: new Date(consDate).toISOString(),
          timeSlot: consTime,
          matterSummary: consSummary || "Legal inquiry and preliminary case consultation",
          mode: "Video Conference",
        }),
      });

      if (res.ok) {
        setNotice(`Consultation scheduled with ${consultingPerson.name} on ${consDate} at ${consTime}.`);
        setConsultingPerson(null);
        setConsSummary("");
      } else {
        setNotice("Could not book consultation. Please try again.");
      }
    } catch {
      setNotice("Error contacting consultation API.");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Professional Directory"
        title="Advocates &amp; Panel Experts"
        description="A certified, human-readable directory for advocates, panel counsel, and parties before the Court."
        action={
          <button className="button primary" onClick={() => setShowForm((value) => !value)}>
            {showForm ? "Close form" : "+ Add Directory Entry"}
          </button>
        }
      />

      <section className="directory-intro">
        <div>
          <strong>{people.filter((person) => person.role === "Lawyer").length}</strong>
          <span>lawyers on record</span>
        </div>
        <div>
          <strong>{people.filter((person) => person.role === "Client").length}</strong>
          <span>clients and parties</span>
        </div>
        <p>
          Contact details are displayed for official registry and representation reference. Confirm
          Vakalatnama and Bar Council standing before formal engagement.
        </p>
      </section>

      {showForm && (
        <form className="panel person-form" onSubmit={addPerson}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">Directory entry</p>
              <h2>Add an advocate or party</h2>
            </div>
            <button className="text-button" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
          <div className="person-form-grid">
            <label>
              Role
              <select name="role" defaultValue="Lawyer">
                <option>Lawyer</option>
                <option>Client</option>
              </select>
            </label>
            <label>
              Full name
              <input name="name" required placeholder="Name or organisation" />
            </label>
            <label>
              Chamber or matter
              <input name="detail" placeholder="Chambers / party and case number" />
            </label>
            <label>
              Specialization
              <input name="specialization" placeholder="e.g. Constitutional, Criminal, Land" />
            </label>
            <label>
              Official email
              <input name="email" type="email" placeholder="email@example.com" />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" placeholder="+91" />
            </label>
          </div>
          <button className="button primary" type="submit">
            Save Directory Entry
          </button>
        </form>
      )}

      {notice && (
        <div className="inline-notice" role="status">
          ✓ {notice}
        </div>
      )}

      <section className="directory-controls" aria-label="Directory filters">
        <div className="directory-tabs" role="tablist" aria-label="People type">
          {(["All", "Lawyer", "Client"] as const).map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={role === item}
              className={role === item ? "selected" : ""}
              onClick={() => setRole(item)}
            >
              {item === "All" ? "All People" : `${item}s`}
            </button>
          ))}
        </div>
        <label className="directory-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, chamber, or area of law…"
            aria-label="Search people directory"
          />
        </label>
      </section>

      <section className="people-grid" aria-live="polite">
        {visible.map((person) => (
          <article className="person-card" key={person.id}>
            <div className={`person-avatar ${person.role.toLowerCase()}`}>{person.initials}</div>
            <div className="person-card-top">
              <span className="person-role">{person.role}</span>
              <span className={`availability ${person.availability.toLowerCase().replaceAll(" ", "-")}`}>
                {person.availability}
              </span>
            </div>
            <h2>{person.name}</h2>
            <p className="person-context">{person.chamber}</p>
            {person.specialization && (
              <div style={{ marginBottom: "12px", fontSize: "11px", color: "var(--burgundy)", fontWeight: "600" }}>
                Area: {person.specialization}
              </div>
            )}
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{person.email || "To be confirmed"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{person.phone || "To be confirmed"}</dd>
              </div>
              <div>
                <dt>Matters</dt>
                <dd>{person.matters} active matters</dd>
              </div>
            </dl>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" }}>
              {person.role === "Lawyer" ? (
                <button
                  type="button"
                  className="button primary"
                  style={{ fontSize: "11px", padding: "6px 10px" }}
                  onClick={() => setConsultingPerson(person)}
                >
                  Schedule Consultation &rarr;
                </button>
              ) : (
                <button
                  className="text-button"
                  onClick={() =>
                    setNotice(`Open the case register to verify contact and pleadings for ${person.name}.`)
                  }
                >
                  View linked matters &rarr;
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      {!visible.length && (
        <div className="state-panel">
          <strong>No matching people found</strong>
          <p>Try a different search or add a new directory entry.</p>
        </div>
      )}

      {/* ── Consultation Booking Modal ────────────────────────────────────── */}
      {consultingPerson && (
        <div
          className="search-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConsultingPerson(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="search-modal" style={{ maxWidth: "560px", padding: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span className="eyebrow">Direct Appointment</span>
                <h2 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "20px", margin: "4px 0" }}>
                  Schedule with {consultingPerson.name}
                </h2>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                  {consultingPerson.chamber}
                </p>
              </div>
              <button
                onClick={() => setConsultingPerson(null)}
                style={{ background: "none", border: "none", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookConsultation} style={{ display: "grid", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="form-label">
                  Your Full Name
                  <input
                    required
                    className="form-input"
                    placeholder="e.g. Aarav Mehta"
                    value={consName}
                    onChange={(e) => setConsName(e.target.value)}
                  />
                </label>
                <label className="form-label">
                  Email Address
                  <input
                    required
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={consEmail}
                    onChange={(e) => setConsEmail(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="form-label">
                  Preferred Date
                  <input
                    required
                    type="date"
                    className="form-input"
                    value={consDate}
                    onChange={(e) => setConsDate(e.target.value)}
                  />
                </label>
                <label className="form-label">
                  Time Slot
                  <select
                    className="form-select"
                    value={consTime}
                    onChange={(e) => setConsTime(e.target.value)}
                  >
                    <option>10:00 AM - 10:30 AM</option>
                    <option>11:00 AM - 11:30 AM</option>
                    <option>02:30 PM - 03:00 PM</option>
                    <option>04:00 PM - 04:30 PM</option>
                  </select>
                </label>
              </div>

              <label className="form-label">
                Brief Subject / Matter Summary
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  placeholder="Outline the matter or questions you wish to discuss..."
                  value={consSummary}
                  onChange={(e) => setConsSummary(e.target.value)}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setConsultingPerson(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary" disabled={bookingLoading}>
                  {bookingLoading ? "Scheduling…" : "Confirm Appointment →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
