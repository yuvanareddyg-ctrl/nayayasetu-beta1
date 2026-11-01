"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Case board", mark: "⌂" },
  { href: "/ai-workspace", label: "Review desk", mark: "✦" },
  { href: "/cause-list", label: "Cause list", mark: "≡" },
  { href: "/drafting", label: "Drafting studio", mark: "▤" },
  { href: "/people", label: "Lawyers & clients", mark: "◉" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="side-rail" aria-label="Primary navigation">
        <Link href="/" className="brand" aria-label="NyayaSetu home">
          <span className="brand-seal" aria-hidden="true">⚖</span>
          <span><strong>Nyaya</strong><em>Setu</em></span>
        </Link>
        <p className="brand-subtitle">A considered bridge between record and reason</p>
        <nav>
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}><span aria-hidden="true">{item.mark}</span>{item.label}</Link>;
          })}
        </nav>
        <div className="sidebar-principle">
          <span className="eyebrow">Court principle</span>
          <strong>AI assists.</strong>
          <strong>Human Judge decides.</strong>
          <p>All outputs remain subject to judicial consideration and the official record.</p>
        </div>
      </aside>
      <main id="main-content" className="main-content">{children}</main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="page-header">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
    </div>
    {action && <div className="header-action">{action}</div>}
  </header>;
}

export function ReviewBanner({ children }: { children: ReactNode }) {
  return <div className="review-banner" role="note"><span aria-hidden="true">✦</span><div><strong>Recommendation for judicial review</strong><p>{children}</p></div></div>;
}

export function LoadingPanel({ label = "Opening the case record…" }: { label?: string }) {
  return <div className="state-panel"><span className="spinner" aria-hidden="true" /><p>{label}</p></div>;
}

export function ErrorPanel({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="state-panel error" role="alert"><strong>We could not open this record.</strong><p>{message}</p>{retry && <button className="button secondary" onClick={retry}>Try again</button>}</div>;
}

export function EmptyPanel({ title, description }: { title: string; description: string }) {
  return <div className="state-panel"><strong>{title}</strong><p>{description}</p></div>;
}
