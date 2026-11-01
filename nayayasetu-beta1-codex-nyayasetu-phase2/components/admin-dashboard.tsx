"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageHeader, LoadingPanel, EmptyPanel } from "@/components/shell";
import type { LegalRequestRecord, UserRecord } from "@/lib/types";

interface LoginRecord {
  id: string;
  username: string;
  email: string;
  loginAt: string;
  ipAddress: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

function formatDateTime(value: string) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AdminDashboard() {
  const router = useRouter();

  // Admin Tab selection
  const [activeTab, setActiveTab] = useState<"audit" | "requests" | "users" | "broadcast">("requests");

  // Login Records state
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingAudit, setLoadingAudit] = useState(true);

  // Legal Requests state
  const [requests, setRequests] = useState<LegalRequestRecord[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Users state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // General state
  const [error, setError] = useState("");
  const [actionNotice, setActionNotice] = useState("");

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load Login Records
  const loadRecords = useCallback(async () => {
    setLoadingAudit(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const response = await fetch(`/api/admin/login-records?${params}`);
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Unable to load login records.");
      }
      const data = (await response.json()) as {
        records: LoginRecord[];
        pagination: Pagination;
      };
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load login records.");
    } finally {
      setLoadingAudit(false);
    }
  }, [page, debouncedSearch, router]);

  // Load Legal Requests
  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch("/api/services/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // Load Users
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
    void loadRequests();
    void loadUsers();
  }, [loadRecords, loadRequests, loadUsers]);

  async function handleSignOut() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  // Update request status
  async function updateReqStatus(reqId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/services/requests/${reqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionNotice(`Request status updated to ${newStatus}.`);
        void loadRequests();
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch {
      setError("Failed to update status.");
    }
  }

  // Assign advocate to request
  async function assignAdvocate(reqId: string, lawyerName: string) {
    try {
      const res = await fetch(`/api/services/requests/${reqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Assigned",
          assignedLawyer: {
            id: `adv-${Date.now()}`,
            name: lawyerName,
            chamber: "High Court Legal Services Committee Panel",
          },
        }),
      });
      if (res.ok) {
        setActionNotice(`Assigned to ${lawyerName}.`);
        void loadRequests();
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch {
      setError("Failed to assign advocate.");
    }
  }

  // Toggle user active status
  async function toggleUserStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionNotice(`User marked as ${newStatus}.`);
        void loadUsers();
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch {
      setError("Failed to update user.");
    }
  }

  // Send broadcast notification
  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    setBroadcasting(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "all",
          title: broadcastTitle,
          message: broadcastMessage,
          type: "info",
        }),
      });
      if (res.ok) {
        setActionNotice("Broadcast notification dispatched to all users.");
        setBroadcastTitle("");
        setBroadcastMessage("");
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch {
      setError("Broadcast failed.");
    } finally {
      setBroadcasting(false);
    }
  }

  const pendingRequestsCount = requests.filter(
    (r) => r.status === "Submitted" || r.status === "Under Review"
  ).length;
  const completedRequestsCount = requests.filter((r) => r.status === "Completed").length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Registry Administration"
        title="Admin Control Center"
        description="Comprehensive portal governance, user access management, legal request allocation, and sign-in audit trails."
        action={
          <button
            className="button secondary"
            onClick={() => void handleSignOut()}
            id="admin-signout-btn"
          >
            Sign out
          </button>
        }
      />

      {actionNotice && (
        <div className="inline-notice" style={{ marginBottom: "18px" }}>
          ✓ {actionNotice}
        </div>
      )}
      {error && (
        <div className="inline-notice error" style={{ marginBottom: "18px" }} role="alert">
          {error}
        </div>
      )}

      {/* KPI Summary Strip */}
      <section className="metric-grid four" aria-label="Registry administration overview">
        <div className="metric-card">
          <span>Registered Users</span>
          <strong>{users.length}</strong>
          <small>citizens &amp; advocates</small>
        </div>
        <div className="metric-card gold">
          <span>Total Requests</span>
          <strong>{requests.length}</strong>
          <small>aid &amp; advisory filings</small>
        </div>
        <div className="metric-card burgundy">
          <span>Pending Scrutiny</span>
          <strong>{pendingRequestsCount}</strong>
          <small>action required</small>
        </div>
        <div className="metric-card emerald">
          <span>Completed</span>
          <strong>{completedRequestsCount}</strong>
          <small>resolved matters</small>
        </div>
      </section>

      {/* Navigation Tabs for Admin Sections */}
      <div style={{ display: "flex", gap: "8px", margin: "24px 0 16px", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
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
          Legal Requests Management ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "users" ? "3px solid var(--burgundy)" : "3px solid transparent",
            padding: "8px 14px",
            fontWeight: "700",
            fontSize: "13.5px",
            color: activeTab === "users" ? "var(--burgundy)" : "var(--muted)",
          }}
        >
          User Accounts &amp; Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "audit" ? "3px solid var(--burgundy)" : "3px solid transparent",
            padding: "8px 14px",
            fontWeight: "700",
            fontSize: "13.5px",
            color: activeTab === "audit" ? "var(--burgundy)" : "var(--muted)",
          }}
        >
          Sign-in Audit Log ({pagination.total})
        </button>
        <button
          onClick={() => setActiveTab("broadcast")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "broadcast" ? "3px solid var(--burgundy)" : "3px solid transparent",
            padding: "8px 14px",
            fontWeight: "700",
            fontSize: "13.5px",
            color: activeTab === "broadcast" ? "var(--burgundy)" : "var(--muted)",
          }}
        >
          System Broadcast
        </button>
      </div>

      {/* ── TAB 1: Legal Requests Management ─────────────────────────────── */}
      {activeTab === "requests" && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Request Allocation</p>
              <h2>Citizen Legal Aid &amp; Advisory Applications</h2>
            </div>
          </div>

          {loadingRequests ? (
            <LoadingPanel label="Loading legal requests…" />
          ) : requests.length === 0 ? (
            <EmptyPanel title="No Requests Filed" description="Citizen submissions will appear here for scrutiny and assignment." />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Applicant</th>
                    <th>Subject &amp; Category</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Assigned Counsel</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id}>
                      <td style={{ fontFamily: "DM Mono, monospace", fontSize: "11px", fontWeight: "700" }}>
                        {req.requestNumber}
                      </td>
                      <td>
                        <strong>{req.applicantName}</strong>
                        <div style={{ fontSize: "11px", color: "var(--muted)" }}>{req.applicantEmail}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", fontSize: "12.5px" }}>{req.subject}</div>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>{req.category}</span>
                      </td>
                      <td style={{ fontSize: "12px" }}>{req.serviceType}</td>
                      <td>
                        <span className={`status-pill ${req.status.toLowerCase().replaceAll(" ", "-")}`}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px" }}>
                        {req.assignedLawyer?.name ? (
                          <span style={{ color: "var(--emerald)", fontWeight: "600" }}>
                            {req.assignedLawyer.name}
                          </span>
                        ) : (
                          <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {req.status !== "Assigned" && (
                            <button
                              className="button secondary"
                              style={{ fontSize: "10px", padding: "4px 8px" }}
                              onClick={() => void assignAdvocate(req._id, "Adv. Priya Menon")}
                            >
                              Assign Priya
                            </button>
                          )}
                          {req.status !== "Completed" && (
                            <button
                              className="button primary"
                              style={{ fontSize: "10px", padding: "4px 8px" }}
                              onClick={() => void updateReqStatus(req._id, "Completed")}
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── TAB 2: User Accounts & Roles ─────────────────────────────────── */}
      {activeTab === "users" && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">User Directory</p>
              <h2>Registered Accounts &amp; Access Roles</h2>
            </div>
          </div>

          {loadingUsers ? (
            <LoadingPanel label="Loading user accounts…" />
          ) : users.length === 0 ? (
            <EmptyPanel title="No Registered Users" description="Users will appear once registered in the system." />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Access Role</th>
                    <th>Organization / Bar ID</th>
                    <th>Account Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className="status-pill listed" style={{ textTransform: "capitalize" }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                        {u.barCouncilNumber || u.organization || "—"}
                      </td>
                      <td>
                        <span className={`status-pill ${u.status === "active" ? "ready" : "disposed"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="button secondary"
                          style={{ fontSize: "10.5px", padding: "4px 8px" }}
                          onClick={() => void toggleUserStatus(u._id, u.status)}
                        >
                          {u.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── TAB 3: Sign-in Audit Log (Preserved & Enhanced) ───────────────── */}
      {activeTab === "audit" && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Sign-in audit</p>
              <h2>All login events</h2>
            </div>
            <div className="admin-search-wrap">
              <label htmlFor="admin-search" className="sr-only">
                Search by username or email
              </label>
              <input
                id="admin-search"
                type="search"
                className="admin-search-input"
                placeholder="Search username or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search login records"
              />
            </div>
          </div>

          {loadingAudit ? (
            <LoadingPanel label="Loading login records…" />
          ) : records.length === 0 ? (
            <EmptyPanel
              title={
                debouncedSearch
                  ? "No records match your search."
                  : "No login records yet."
              }
              description={
                debouncedSearch
                  ? "Try a different username or email."
                  : "Records will appear here once users sign in."
              }
            />
          ) : (
            <>
              <div
                className="admin-table-wrap"
                role="region"
                aria-label="Login records table"
                tabIndex={0}
              >
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Username</th>
                      <th scope="col">Email</th>
                      <th scope="col">Login date &amp; time</th>
                      <th scope="col">IP address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={record.id}>
                        <td className="admin-td-num">
                          {(pagination.page - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td>
                          <span className="admin-username">{record.username}</span>
                        </td>
                        <td>
                          <a href={`mailto:${record.email}`} className="text-link">
                            {record.email}
                          </a>
                        </td>
                        <td>
                          <time dateTime={record.loginAt}>
                            {formatDateTime(record.loginAt)}
                          </time>
                        </td>
                        <td className="admin-td-ip">
                          {record.ipAddress ?? <span className="muted-label">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <nav
                  className="admin-pagination"
                  aria-label="Login records pagination"
                >
                  <button
                    className="button secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    id="admin-prev-page"
                  >
                    &larr; Previous
                  </button>
                  <span className="admin-pagination-info">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    className="button secondary"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page >= pagination.totalPages}
                    aria-label="Next page"
                    id="admin-next-page"
                  >
                    Next &rarr;
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      )}

      {/* ── TAB 4: Broadcast Notifications ───────────────────────────────── */}
      {activeTab === "broadcast" && (
        <section className="panel" style={{ padding: "26px", maxWidth: "680px" }}>
          <div className="section-heading" style={{ padding: "0 0 16px", marginBottom: "18px" }}>
            <div>
              <p className="eyebrow">Registry Announcements</p>
              <h2>Broadcast System Notification</h2>
            </div>
          </div>
          <form onSubmit={handleBroadcast} style={{ display: "grid", gap: "14px" }}>
            <label className="form-label">
              Notification Headline
              <input
                required
                className="form-input"
                placeholder="e.g. Court Vacation Notice or System Maintenance"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
              />
            </label>

            <label className="form-label">
              Announcement Message
              <textarea
                required
                rows={4}
                className="form-textarea"
                placeholder="Message displayed to all logged-in users on their dashboard..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
            </label>

            <button type="submit" className="button primary" disabled={broadcasting} style={{ width: "max-content" }}>
              {broadcasting ? "Dispatching…" : "Broadcast to All Users →"}
            </button>
          </form>
        </section>
      )}
    </AppShell>
  );
}
