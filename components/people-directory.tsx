"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/shell";

type PersonRole = "Lawyer" | "Client";
type Person = { id: string; name: string; role: PersonRole; initials: string; chamber: string; email: string; phone: string; matters: number; availability: "Available" | "In hearing" | "Contact registry"; };

const initialPeople: Person[] = [
  { id: "law-1", name: "Adv. Priya Menon", role: "Lawyer", initials: "PM", chamber: "Menon Legal Chambers", email: "priya.menon@bar.example", phone: "+91 98765 21034", matters: 6, availability: "Available" },
  { id: "law-2", name: "Adv. Sameer Dutta", role: "Lawyer", initials: "SD", chamber: "Dutta & Associates", email: "sameer.dutta@bar.example", phone: "+91 98765 82109", matters: 4, availability: "In hearing" },
  { id: "law-3", name: "Adv. Leela Nair", role: "Lawyer", initials: "LN", chamber: "Nair Counsel", email: "leela.nair@bar.example", phone: "+91 98765 63542", matters: 3, availability: "Available" },
  { id: "client-1", name: "Aarav Mehta", role: "Client", initials: "AM", chamber: "Petitioner · W.P. (C) 1842/2026", email: "aarav.mehta@example.com", phone: "+91 98765 41290", matters: 1, availability: "Contact registry" },
  { id: "client-2", name: "Nila Infrastructure Ltd.", role: "Client", initials: "NI", chamber: "Appellant · C.A. 917/2026", email: "legal@nila.example", phone: "+91 98765 88012", matters: 2, availability: "Contact registry" },
  { id: "client-3", name: "Kavya Rao", role: "Client", initials: "KR", chamber: "Applicant · O.A. 231/2026", email: "kavya.rao@example.com", phone: "+91 98765 19486", matters: 1, availability: "Contact registry" },
];

export function PeopleDirectory() {
  const [people, setPeople] = useState(initialPeople);
  const [role, setRole] = useState<"All" | PersonRole>("All");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const visible = useMemo(() => people.filter((person) => (role === "All" || person.role === role) && `${person.name} ${person.chamber}`.toLowerCase().includes(query.toLowerCase())), [people, query, role]);

  function addPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const personRole = data.get("role") as PersonRole;
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    setPeople((current) => [{ id: `new-${Date.now()}`, name, role: personRole, initials: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(), chamber: String(data.get("detail") ?? "Record pending"), email: String(data.get("email") ?? ""), phone: String(data.get("phone") ?? ""), matters: 0, availability: personRole === "Lawyer" ? "Available" : "Contact registry" }, ...current]);
    setShowForm(false); setNotice(`${personRole} added to this working directory.`);
  }

  return <AppShell>
    <PageHeader eyebrow="Professional directory" title="Lawyers & clients" description="A clear, human-readable directory for the people connected to matters before the Court." action={<button className="button primary" onClick={() => setShowForm((value) => !value)}>{showForm ? "Close form" : "Add person"}</button>} />
    <section className="directory-intro"><div><strong>{people.filter((person) => person.role === "Lawyer").length}</strong><span>lawyers on record</span></div><div><strong>{people.filter((person) => person.role === "Client").length}</strong><span>clients and parties</span></div><p>Contact details are shown for registry reference. Confirm representation and service details against the official case record.</p></section>
    {showForm && <form className="panel person-form" onSubmit={addPerson}><div className="form-heading"><div><p className="eyebrow">Directory entry</p><h2>Add a lawyer or client</h2></div><button className="text-button" type="button" onClick={() => setShowForm(false)}>Cancel</button></div><div className="person-form-grid"><label>Role<select name="role" defaultValue="Lawyer"><option>Lawyer</option><option>Client</option></select></label><label>Full name<input name="name" required placeholder="Name or organisation" /></label><label>Chamber or matter<input name="detail" placeholder="Chambers / party and case number" /></label><label>Official email<input name="email" type="email" placeholder="email@example.com" /></label><label>Phone<input name="phone" type="tel" placeholder="+91" /></label></div><button className="button primary" type="submit">Save directory entry</button></form>}
    {notice && <div className="inline-notice" role="status">{notice}</div>}
    <section className="directory-controls" aria-label="Directory filters"><div className="directory-tabs" role="tablist" aria-label="People type">{(["All", "Lawyer", "Client"] as const).map((item) => <button key={item} role="tab" aria-selected={role === item} className={role === item ? "selected" : ""} onClick={() => setRole(item)}>{item === "All" ? "All people" : `${item}s`}</button>)}</div><label className="directory-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, chamber, or case" aria-label="Search people directory" /></label></section>
    <section className="people-grid" aria-live="polite">{visible.map((person) => <article className="person-card" key={person.id}><div className={`person-avatar ${person.role.toLowerCase()}`}>{person.initials}</div><div className="person-card-top"><span className="person-role">{person.role}</span><span className={`availability ${person.availability.toLowerCase().replaceAll(" ", "-")}`}>{person.availability}</span></div><h2>{person.name}</h2><p className="person-context">{person.chamber}</p><dl><div><dt>Email</dt><dd>{person.email || "To be confirmed"}</dd></div><div><dt>Phone</dt><dd>{person.phone || "To be confirmed"}</dd></div><div><dt>Linked matters</dt><dd>{person.matters}</dd></div></dl><button className="text-button" onClick={() => setNotice(`Open the official case record to verify contact and representation details for ${person.name}.`)}>View linked matters →</button></article>)}</section>
    {!visible.length && <div className="state-panel"><strong>No matching people found</strong><p>Try a different search or add a new directory entry.</p></div>}
  </AppShell>;
}
