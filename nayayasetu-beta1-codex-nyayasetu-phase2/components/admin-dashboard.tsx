"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageHeader, LoadingPanel, ErrorPanel, EmptyPanel } from "@/components/shell";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
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
      setError(
        cause instanceof Error ? cause.message : "Unable to load login records.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSignOut() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  const summary = useMemo(
    () => ({
      total: pagination.total,
      shown: records.length,
    }),
    [pagination.total, records.length],
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Registry administration"
        title="Login records"
        description="A complete audit trail of sign-in events, newest first."
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

      {/* Summary strip */}
      <section className="metric-grid" aria-label="Login record overview">
        <div className="metric-card">
          <span>Total login events</span>
          <strong>{pagination.total}</strong>
          <small>all recorded sign-ins</small>
        </div>
        <div className="metric-card sage">
          <span>Showing</span>
          <strong>{summary.shown}</strong>
          <small>of {pagination.total} records</small>
        </div>
        <div className="metric-card burgundy">
          <span>Page</span>
          <strong>
            {pagination.page} / {pagination.totalPages}
          </strong>
          <small>current view</small>
        </div>
      </section>

      {/* Search + table */}
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

        {loading ? (
          <LoadingPanel label="Loading login records…" />
        ) : error ? (
          <ErrorPanel message={error} retry={() => void load()} />
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
            <div className="admin-table-wrap" role="region" aria-label="Login records table" tabIndex={0}>
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
                        <a
                          href={`mailto:${record.email}`}
                          className="text-link"
                        >
                          {record.email}
                        </a>
                      </td>
                      <td>
                        <time dateTime={record.loginAt}>
                          {formatDateTime(record.loginAt)}
                        </time>
                      </td>
                      <td className="admin-td-ip">
                        {record.ipAddress ?? (
                          <span className="muted-label">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                  ← Previous
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
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}
