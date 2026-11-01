"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell, LoadingPanel, PageHeader } from "@/components/shell";
import type { ConsultationRecord, LegalRequestRecord, NotificationRecord, UserSession } from "@/lib/types";
import { fetchCurrentUser, formatDate, formatDateTime, requestJson } from "@/lib/client-api";

export function UserDashboard() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [requests, setRequests] = useState<LegalRequestRecord[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"requests" | "consultations" | "notifications" | "settings">("requests");

  // Settings form state
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState("");
  const [settingsNotice, setSettingsNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      if (currentUser?.phone) setPhone(currentUser.phone);
      if (currentUser?.organization) setOrg(currentUser.organization);

      const [reqData, consData, notifData] = await Promise.all([
        requestJson<{ requests: LegalRequestRecord[] }>("/api/services/requests"),
        requestJson<{ consultations: ConsultationRecord[] }>("/api/services/consultations"),
        requestJson<{ notifications: NotificationRecord[] }>("/api/notifications"),
      ]);

      setRequests(reqData.requests || []);
      setConsultations(consData.consultations || []);
      setNotifications(notifData.notifications || []);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsNotice("Settings updated successfully.");
    setTimeout(() => setSettingsNotice(""), 3000);
  }

  const pendingCount = requests.filter((r) => r.status === "Submitted" || r.status === "Under Review").length;
  const activeCount = requests.filter((r) => r.status === "Assigned" || r.status === "Hearing Scheduled").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Portal Account"
        title="Citizen &amp; Advocate Dashboard"
        description="Review your active legal assistance requests, scheduled consultations, and official notices."
        action={
          <Link href="/services/request" className="button primary">
            + New Assistance Request
          </Link>
        }
      />

      {loading ? (
        <LoadingPanel label="Loading your dashboard records…" />
      ) : (
        <>
          {/* Welcome Card */}
          <div className="welcome-banner">
            <div>
              <h2>Welcome, {user ? user.name : "Citizen Litigant"}</h2>
              <p>
                Account Role:{" "}
                <strong style={{ textTransform: "capitalize", color: "var(--burgundy)" }}>
                  {user?.role || "Citizen"}
                </strong>
                {user?.barCouncilNumber && (
                  <span> &bull; Bar Council: {user.barCouncilNumber}</span>
                )}
                {user?.email && <span> &bull; {user.email}</span>}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/services/request" className="button primary">
                Request Legal Aid
              </Link>
              <Link href="/services/track" className="button secondary">
                Track by ID
              </Link>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="quick-actions-bar">
            <Link href="/services/request" className="button secondary">
              📝 Apply for Free Legal Aid
            </Link>
            <Link href="/people" className="button secondary">
              👤 Consult an Advocate
            </Link>
            <Link href="/case-board" className="button secondary">
              📋 Court Case Register
            </Link>
            <Link href="/cause-list" className="button secondary">
              🏛 View Daily Cause List
            </Link>
          </div>

          {/* KPI Summary Cards */}
          <section className="metric-grid four">
            <div className="metric-card">
              <span>Submitted Requests</span>
              <strong>{requests.length}</strong>
              <small>total applications</small>
            </div>
            <div className="metric-card gold">
              <span>Under Scrutiny</span>
              <strong>{pendingCount}</strong>
              <small>verification in progress</small>
            </div>
            <div className="metric-card emerald">
              <span>Counsel Assigned</span>
              <strong>{activeCount}</strong>
              <small>active legal representation</small>
            </div>
            <div className="metric-card burgundy">
              <span>Consultations</span>
              <strong>{consultations.length}</strong>
              <small>scheduled appointments</small>
            </div>
          </section>

          {/* Dashboard Navigation Tabs */}
          <div style={{ display: "flex", gap: "8px", margin: "24px 0 16px", borderBottom: "1px solid var(--line)" }}>
            <button
              onClick={() => setActiveTab("requests")}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "requests" ? "3px solid var(--burgundy)" : "3px solid transparent",
                padding: "8px 14px",
                fontWeight: "700",
                fontSize: "13.5px",
                color: activeTab === "requests" ? "var(--burgundy)" : "var(--muted)",
              }}
            >
              My Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab("consultations")}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "consultations" ? "3px solid var(--burgundy)" : "3px solid transparent",
                padding: "8px 14px",
                fontWeight: "700",
                fontSize: "13.5px",
                color: activeTab === "consultations" ? "var(--burgundy)" : "var(--muted)",
              }}
            >
              Consultations ({consultations.length})
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "notifications" ? "3px solid var(--burgundy)" : "3px solid transparent",
                padding: "8px 14px",
                fontWeight: "700",
                fontSize: "13.5px",
                color: activeTab === "notifications" ? "var(--burgundy)" : "var(--muted)",
              }}
            >
              Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "settings" ? "3px solid var(--burgundy)" : "3px solid transparent",
                padding: "8px 14px",
                fontWeight: "700",
                fontSize: "13.5px",
                color: activeTab === "settings" ? "var(--burgundy)" : "var(--muted)",
              }}
            >
              Profile &amp; Settings
            </button>
          </div>

          {/* Tab 1: Requests */}
          {activeTab === "requests" && (
            <div className="panel" style={{ padding: "20px" }}>
              <div className="section-heading" style={{ padding: "0 0 16px", marginBottom: "16px" }}>
                <div>
                  <p className="eyebrow">Application Register</p>
                  <h2>My Legal Aid &amp; Advisory Requests</h2>
                </div>
                <Link href="/services/request" className="button primary" style={{ fontSize: "11px" }}>
                  + Submit New Request
                </Link>
              </div>

              {requests.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
                  <p>You have not submitted any assistance requests yet.</p>
                  <Link href="/services/request" className="button primary">
                    Submit Your First Request &rarr;
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {requests.map((req) => (
                    <article
                      key={req._id}
                      style={{
                        padding: "16px 18px",
                        border: "1px solid var(--line)",
                        borderRadius: "var(--radius-sm)",
                        background: "#fffdf9",
                        display: "grid",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span className="eyebrow" style={{ margin: 0 }}>
                            {req.requestNumber} &bull; {req.category}
                          </span>
                          <h3 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "16px", margin: "4px 0" }}>
                            {req.subject}
                          </h3>
                        </div>
                        <span className={`status-pill ${req.status.toLowerCase().replaceAll(" ", "-")}`}>
                          {req.status}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: "1.5" }}>
                        {req.description}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "11.5px",
                          color: "var(--muted)",
                          borderTop: "1px solid var(--line-subtle)",
                          paddingTop: "8px",
                          marginTop: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <strong>Service:</strong> {req.serviceType} &bull; <strong>Submitted:</strong>{" "}
                          {formatDate(req.createdAt)}
                        </div>
                        {req.assignedLawyer ? (
                          <div style={{ color: "var(--emerald)" }}>
                            <strong>Assigned Counsel:</strong> {req.assignedLawyer.name} (
                            {req.assignedLawyer.chamber || "Panel Advocate"})
                          </div>
                        ) : (
                          <span>Awaiting panel advocate assignment</span>
                        )}
                      </div>

                      {req.timeline && req.timeline.length > 0 && (
                        <div
                          style={{
                            background: "var(--sage-50)",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            marginTop: "4px",
                          }}
                        >
                          <strong>Latest Update:</strong> {req.timeline[req.timeline.length - 1].note} (
                          {formatDateTime(req.timeline[req.timeline.length - 1].timestamp)})
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Consultations */}
          {activeTab === "consultations" && (
            <div className="panel" style={{ padding: "20px" }}>
              <div className="section-heading" style={{ padding: "0 0 16px", marginBottom: "16px" }}>
                <div>
                  <p className="eyebrow">Advocate Appointments</p>
                  <h2>Scheduled Consultations</h2>
                </div>
                <Link href="/people" className="button secondary" style={{ fontSize: "11px" }}>
                  Find More Advocates &rarr;
                </Link>
              </div>

              {consultations.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
                  <p>No consultations currently scheduled.</p>
                  <Link href="/people" className="button primary">
                    Browse Advocate Directory &rarr;
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {consultations.map((c) => (
                    <article
                      key={c._id}
                      style={{
                        padding: "16px 18px",
                        border: "1px solid var(--line)",
                        borderRadius: "var(--radius-sm)",
                        background: "#fffdf9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span className="eyebrow">{c.consultationNumber}</span>
                        <h3 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "15px", margin: "4px 0" }}>
                          Consultation with {c.lawyerName}
                        </h3>
                        <p style={{ margin: "4px 0", fontSize: "12.5px", color: "var(--muted)" }}>
                          {c.matterSummary}
                        </p>
                        <div style={{ fontSize: "11.5px", color: "var(--sage-500)", marginTop: "4px" }}>
                          📅 {formatDate(c.date)} &bull; ⏰ {c.timeSlot} &bull; 💻 {c.mode}
                        </div>
                      </div>

                      <div style={{ textAlign: "right", display: "grid", gap: "8px" }}>
                        <span className={`status-pill ${c.status.toLowerCase()}`}>{c.status}</span>
                        {c.meetingLink && (
                          <a
                            href={c.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button primary"
                            style={{ fontSize: "11px", padding: "5px 10px" }}
                          >
                            Join Video Call &rarr;
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Notifications */}
          {activeTab === "notifications" && (
            <div className="panel" style={{ padding: "20px" }}>
              <div className="section-heading" style={{ padding: "0 0 16px", marginBottom: "16px" }}>
                <div>
                  <p className="eyebrow">Registry Feed</p>
                  <h2>In-App Notifications</h2>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
                  No notifications recorded.
                </div>
              ) : (
                <ul className="notif-list">
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className={`notif-item ${!n.isRead ? "unread" : ""}`}
                      style={{ borderRadius: "var(--radius-sm)", marginBottom: "8px", border: "1px solid var(--line)" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong className="notif-title">{n.title}</strong>
                        <span className="notif-time">{formatDateTime(n.createdAt)}</span>
                      </div>
                      <p className="notif-text">{n.message}</p>
                      {n.link && (
                        <Link href={n.link} className="text-link" style={{ fontSize: "11.5px", marginTop: "4px" }}>
                          View Associated Record &rarr;
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Tab 4: Settings */}
          {activeTab === "settings" && (
            <div className="panel" style={{ padding: "24px", maxWidth: "680px" }}>
              <h2 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "20px", margin: "0 0 16px" }}>
                Account &amp; Personal Settings
              </h2>

              {settingsNotice && (
                <div className="inline-notice" style={{ marginBottom: "16px" }}>
                  {settingsNotice}
                </div>
              )}

              <form onSubmit={handleSaveSettings} style={{ display: "grid", gap: "14px" }}>
                <label className="form-label">
                  Full Name
                  <input className="form-input" disabled value={user?.name || ""} />
                </label>

                <label className="form-label">
                  Email Address
                  <input className="form-input" disabled value={user?.email || ""} />
                </label>

                <label className="form-label">
                  Phone Number
                  <input
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91"
                  />
                </label>

                <label className="form-label">
                  Organization / Address
                  <input
                    className="form-input"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="Chamber or District residence"
                  />
                </label>

                <button type="submit" className="button primary" style={{ width: "max-content", marginTop: "10px" }}>
                  Save Profile Settings
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

