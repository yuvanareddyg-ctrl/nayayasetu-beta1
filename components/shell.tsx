"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import type { NotificationRecord, UserSession } from "@/lib/types";
import { fetchCurrentUser, formatDateTime } from "@/lib/client-api";

interface SearchResult {
  cases: Array<{ _id: string; caseNumber: string; title: string }>;
  requests: Array<{ _id: string; requestNumber: string; subject: string }>;
  people: Array<{ _id: string; name: string; role: string }>;
  precedents: Array<{ _id: string; title: string; legalTopic: string }>;
  total: number;
}

const mainNavigation = [
  { href: "/", label: "Home", mark: "🏛" },
  { href: "/services", label: "Legal Services", mark: "⚖" },
  { href: "/dashboard", label: "Citizen Dashboard", mark: "⌂" },
  { href: "/case-board", label: "Judicial Register", mark: "📋" },
  { href: "/ai-workspace", label: "Review Desk", mark: "✦" },
  { href: "/cause-list", label: "Cause List", mark: "≡" },
  { href: "/drafting", label: "Drafting Studio", mark: "▤" },
  { href: "/people", label: "Advocates & Experts", mark: "◉" },
];

const adminNavigation = [
  { href: "/admin", label: "Admin Registry", mark: "◈" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);

  // Load current user and notifications
  useEffect(() => {
    void (async () => {
      const u = await fetchCurrentUser();
      setUser(u);
    })();

    void (async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {
        // ignore
      }
    })();
  }, [pathname]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowNotifs(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* ── Left Navigation Rail ─────────────────────────────────────────── */}
      <aside className="side-rail" aria-label="Primary navigation">
        <Link href="/" className="brand" aria-label="NyayaSetu home">
          <span className="brand-seal" aria-hidden="true">
            ⚖
          </span>
          <span>
            <strong>Nyaya</strong>
            <em>Setu</em>
          </span>
        </Link>
        <p className="brand-subtitle">
          Institutional Bridge Between Record and Reason
        </p>

        {/* Global Search Button */}
        <button
          className="search-trigger-btn"
          onClick={() => setShowSearch(true)}
          type="button"
          aria-label="Search site"
          style={{ marginBottom: "14px", width: "100%", justifyContent: "space-between" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span aria-hidden="true">🔍</span> Search portal…
          </span>
          <kbd className="search-trigger-kbd">Ctrl K</kbd>
        </button>

        <nav>
          <div className="nav-heading">Public &amp; Judicial Portals</div>
          {mainNavigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span aria-hidden="true">{item.mark}</span>
                {item.label}
              </Link>
            );
          })}

          <hr className="nav-divider" aria-hidden="true" />
          <div className="nav-heading">Registry Administration</div>
          {adminNavigation.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span aria-hidden="true">{item.mark}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Status in Sidebar */}
        <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid rgba(92,104,95,.2)" }}>
          {user ? (
            <div style={{ display: "grid", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "var(--burgundy)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div style={{ lineHeight: "1.2" }}>
                    <div style={{ fontSize: "12.5px", fontWeight: "700" }}>{user.name}</div>
                    <div style={{ fontSize: "10.5px", color: "var(--muted)", textTransform: "capitalize" }}>
                      {user.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => void handleLogout()}
                  className="button secondary"
                  style={{ padding: "4px 8px", fontSize: "10.5px" }}
                  title="Sign out"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              <Link href="/login" className="button secondary" style={{ fontSize: "11px", padding: "6px 8px" }}>
                Sign In
              </Link>
              <Link href="/register" className="button primary" style={{ fontSize: "11px", padding: "6px 8px" }}>
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="sidebar-principle">
          <span className="eyebrow">Constitutional Principle</span>
          <strong>AI assists.</strong>
          <strong>Human Judge decides.</strong>
          <p>
            Digital technology assists with file orientation and document health.
            Substantive judicial determination remains strictly with the Court.
          </p>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top Header Bar */}
        <header className="top-nav" aria-label="Global header">
          <div className="top-nav-links">
            <Link href="/" className={`top-nav-link ${pathname === "/" ? "active" : ""}`}>
              Overview
            </Link>
            <Link href="/services" className={`top-nav-link ${pathname === "/services" ? "active" : ""}`}>
              Services
            </Link>
            <Link href="/dashboard" className={`top-nav-link ${pathname === "/dashboard" ? "active" : ""}`}>
              Dashboard
            </Link>
            <Link href="/case-board" className={`top-nav-link ${pathname === "/case-board" ? "active" : ""}`}>
              Case Register
            </Link>
            <Link href="/people" className={`top-nav-link ${pathname === "/people" ? "active" : ""}`}>
              Advocates
            </Link>
          </div>

          <div className="top-nav-actions" style={{ marginLeft: "auto" }}>
            {/* Search Trigger */}
            <button
              className="search-trigger-btn"
              onClick={() => setShowSearch(true)}
              type="button"
              aria-label="Open global search"
            >
              <span>🔍</span>
              <span className="sr-only">Search</span>
              <kbd className="search-trigger-kbd">Ctrl K</kbd>
            </button>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                className="notif-bell-btn"
                onClick={() => setShowNotifs((prev) => !prev)}
                type="button"
                aria-label="Notifications"
                aria-expanded={showNotifs}
              >
                🔔
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {showNotifs && (
                <div className="notif-popover" role="dialog" aria-label="Notification center">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => void markAllRead()}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "11px",
                          color: "var(--burgundy)",
                          fontWeight: "700",
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <ul className="notif-list">
                    {notifications.length === 0 ? (
                      <li style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
                        No notifications yet.
                      </li>
                    ) : (
                      notifications.map((notif) => (
                        <li
                          key={notif._id}
                          className={`notif-item ${!notif.isRead ? "unread" : ""}`}
                          onClick={() => {
                            if (notif.link) router.push(notif.link);
                            setShowNotifs(false);
                          }}
                        >
                          <div className="notif-title">{notif.title}</div>
                          <p className="notif-text">{notif.message}</p>
                          <span className="notif-time">{formatDateTime(notif.createdAt)}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* User Account / Sign In Pill */}
            {user ? (
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "5px 11px",
                  borderRadius: "99px",
                  background: "var(--sage-50)",
                  border: "1px solid var(--line)",
                  fontSize: "12.5px",
                  fontWeight: "600",
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "var(--burgundy)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "10px",
                  }}
                >
                  {user.name.charAt(0)}
                </span>
                <span>{user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link href="/login" className="button primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
                Sign In
              </Link>
            )}
          </div>
        </header>

        <main id="main-content" className="main-content" style={{ flex: 1 }}>
          {children}
        </main>

        {/* Global Footer */}
        <footer className="site-footer" role="contentinfo">
          <div className="footer-container">
            <div className="footer-brand">
              <h3>
                <span style={{ color: "var(--burgundy)" }}>⚖</span> NyayaSetu
              </h3>
              <p>
                A high-integrity judicial case-management and citizen legal assistance
                portal built upon the principle <em>&ldquo;AI Assists — Human Judge Decides.&rdquo;</em>
              </p>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                National Tele-Law Helpline: <strong>14416</strong> · NALSA Legal Aid: <strong>15100</strong>
              </div>
            </div>

            <div className="footer-col">
              <h4>Citizen Services</h4>
              <ul>
                <li>
                  <Link href="/services/request">Apply for Free Legal Aid</Link>
                </li>
                <li>
                  <Link href="/services/track">Track Application Status</Link>
                </li>
                <li>
                  <Link href="/people">Find Verified Advocates</Link>
                </li>
                <li>
                  <Link href="/cause-list">Daily Court Cause List</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Judicial Registry</h4>
              <ul>
                <li>
                  <Link href="/case-board">Case Register Board</Link>
                </li>
                <li>
                  <Link href="/ai-workspace">AI Review Desk</Link>
                </li>
                <li>
                  <Link href="/drafting">Judicial Drafting Studio</Link>
                </li>
                <li>
                  <Link href="/admin">Administrative Audit</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Institutional Info</h4>
              <ul>
                <li>
                  <a href="#how-it-works">How the Platform Works</a>
                </li>
                <li>
                  <a href="#faq">Frequently Asked Questions</a>
                </li>
                <li>
                  <a href="#support">Registry Support &amp; Contacts</a>
                </li>
                <li>
                  <Link href="/login">Portal Login</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              &copy; 2026 NyayaSetu Portal · Ministry of Law &amp; Justice / e-Courts Digital Project
            </div>
            <div>
              Strictly non-dispositive AI assistance · Human judicial determination supreme
            </div>
          </div>
        </footer>
      </div>

      {/* ── Global Search Modal ─────────────────────────────────────────── */}
      {showSearch && (
        <div
          className="search-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSearch(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Global search dialog"
        >
          <div className="search-modal">
            <div className="search-modal-header">
              <span aria-hidden="true">🔍</span>
              <input
                autoFocus
                placeholder="Search cases, legal requests, advocates, or precedents…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                style={{ background: "none", border: "none", fontSize: "14px", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <div className="search-results-box">
              {searching ? (
                <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                  <span className="spinner-sm" style={{ borderTopColor: "var(--burgundy)" }} /> Searching...
                </div>
              ) : !searchQuery.trim() ? (
                <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)", fontSize: "13px" }}>
                  Type a case number (e.g. <em>W.P. 1842</em>), request ID, advocate name, or legal topic.
                </div>
              ) : searchResults && searchResults.total === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)", fontSize: "13px" }}>
                  No matching records found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                searchResults && (
                  <div>
                    {searchResults.cases.length > 0 && (
                      <div>
                        <div className="search-group-title">Court Matters &amp; Cases</div>
                        {searchResults.cases.map((c) => (
                          <Link
                            key={c._id}
                            href={`/cases/${c._id}`}
                            className="search-result-row"
                            onClick={() => setShowSearch(false)}
                          >
                            <strong>{c.caseNumber}</strong>
                            <span>{c.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.requests.length > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <div className="search-group-title">Citizen Legal Requests</div>
                        {searchResults.requests.map((r) => (
                          <Link
                            key={r._id}
                            href="/dashboard"
                            className="search-result-row"
                            onClick={() => setShowSearch(false)}
                          >
                            <strong>{r.requestNumber}</strong>
                            <span>{r.subject}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.people.length > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <div className="search-group-title">Advocates &amp; Panel Counsel</div>
                        {searchResults.people.map((p) => (
                          <Link
                            key={p._id}
                            href="/people"
                            className="search-result-row"
                            onClick={() => setShowSearch(false)}
                          >
                            <strong>{p.name}</strong>
                            <span style={{ textTransform: "capitalize" }}>{p.role}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.precedents.length > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <div className="search-group-title">Legal Precedents &amp; Authorities</div>
                        {searchResults.precedents.map((pr) => (
                          <Link
                            key={pr._id}
                            href="/ai-workspace"
                            className="search-result-row"
                            onClick={() => setShowSearch(false)}
                          >
                            <strong>{pr.title}</strong>
                            <span>{pr.legalTopic}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action && <div className="header-action">{action}</div>}
    </header>
  );
}

export function ReviewBanner({ children }: { children: ReactNode }) {
  return (
    <div className="review-banner" role="note">
      <span aria-hidden="true">✦</span>
      <div>
        <strong>Recommendation for judicial review</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function LoadingPanel({ label = "Opening the case record…" }: { label?: string }) {
  return (
    <div className="state-panel">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorPanel({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="state-panel error" role="alert">
      <strong>We could not open this record.</strong>
      <p>{message}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-panel">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
