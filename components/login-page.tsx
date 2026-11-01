"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Demo sign-in accepted. Connect an authentication provider before using real accounts.");
  }

  return <main className="login-page">
    <section className="login-illustration" aria-hidden="true">
      <div className="login-architecture"><span /><span /><span /><span /><span /></div>
      <div className="login-principle"><p>NyayaSetu</p><strong>AI assists.</strong><strong>Human Judge decides.</strong><span>Judicial case management, with the Court always in control.</span></div>
    </section>
    <section className="login-panel">
      <Link href="/" className="login-brand" aria-label="Return to NyayaSetu"><span>⚖</span><b>Nyaya</b><em>Setu</em></Link>
      <div className="login-copy"><p className="eyebrow">Secure judicial workspace</p><h1>Welcome back</h1><p>Sign in to open your case board and the Court’s working record.</p></div>
      <form className="login-form" onSubmit={submit}>
        <label htmlFor="email">Official email address<input id="email" name="email" type="email" autoComplete="email" placeholder="name@court.gov" required /></label>
        <label htmlFor="password">Password<div className="password-input"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></label>
        <div className="login-options"><label className="check-label"><input type="checkbox" /> <span>Keep me signed in</span></label><a href="#access-support">Need access?</a></div>
        {notice && <div className="inline-notice" role="status">{notice} <Link href="/">Open demo case board</Link></div>}
        <button className="button primary login-submit" type="submit">Sign in securely <span aria-hidden="true">→</span></button>
      </form>
      <p id="access-support" className="login-help">This is a protected workspace. For account access or assistance, contact the registry administrator.</p>
      <p className="login-footer">NyayaSetu · Respectful technology for human judgment</p>
    </section>
  </main>;
}
