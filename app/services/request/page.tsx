"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/shell";
import { fetchCurrentUser, uploadDocument } from "@/lib/client-api";

export default function RequestServicePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedNumber, setSubmittedNumber] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("Legal Aid Representation");
  const [category, setCategory] = useState("Constitutional & Rights");
  const [priority, setPriority] = useState<"Standard" | "Urgent" | "Emergency">("Standard");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  // Uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ filename: string; url: string; size: number }>
  >([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void (async () => {
      const u = await fetchCurrentUser();
      if (u) {
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
      }
    })();
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadDocument(file);
      setUploadedFiles((prev) => [
        ...prev,
        { filename: uploaded.filename, url: uploaded.url, size: uploaded.size },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name || !email || !subject || !description) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/services/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName: name,
          applicantEmail: email,
          applicantPhone: phone || "+91 98765 00000",
          serviceType,
          category,
          priority,
          subject,
          description,
          documents: uploadedFiles,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to submit request.");
        return;
      }

      setSubmittedNumber(data.request.requestNumber);
    } catch {
      setError("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Application Submission"
        title="Apply for Free Legal Aid &amp; Advisory"
        description="Statutory assistance request under the Legal Services Authorities Act, 1987."
      />

      {submittedNumber ? (
        <div className="panel" style={{ padding: "40px 30px", textAlign: "center", maxWidth: "680px", margin: "0 auto" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--emerald)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: "28px",
              margin: "0 auto 16px",
            }}
          >
            ✓
          </div>
          <h2 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "24px", margin: "0 0 10px" }}>
            Application Lodged Successfully
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px" }}>
            Your application has been registered in the digital registry. An official acknowledgment
            has been generated.
          </p>

          <div
            style={{
              background: "var(--sage-50)",
              border: "1px solid var(--line)",
              padding: "16px",
              borderRadius: "var(--radius)",
              margin: "0 auto 24px",
              display: "inline-block",
            }}
          >
            <span className="muted-label">Your Tracking Reference Number</span>
            <strong style={{ fontFamily: "DM Mono, monospace", fontSize: "20px", color: "var(--burgundy)" }}>
              {submittedNumber}
            </strong>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/dashboard" className="button primary">
              Open My Dashboard
            </Link>
            <Link href={`/services/track?id=${submittedNumber}`} className="button secondary">
              Track Request Status
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel" style={{ padding: "32px", maxWidth: "780px", margin: "0 auto" }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label className="form-label">
                Applicant Legal Name *
                <input
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Mehta"
                />
              </label>

              <label className="form-label">
                Official Email Address *
                <input
                  required
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label className="form-label">
                Contact Phone Number
                <input
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                />
              </label>

              <label className="form-label">
                Matter Urgency / Priority
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "Standard" | "Urgent" | "Emergency")
                  }
                >
                  <option value="Standard">Standard (General Hearing)</option>
                  <option value="Urgent">Urgent (Upcoming Listing)</option>
                  <option value="Emergency">Emergency (Bail / Demolition / Custody)</option>
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label className="form-label">
                Service Type Required *
                <select
                  className="form-select"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="Legal Aid Representation">Legal Aid Representation</option>
                  <option value="Legal Advisory">Legal Advisory &amp; Counseling</option>
                  <option value="Document Scrutiny">Document Scrutiny / Pre-filing Check</option>
                  <option value="Bail &amp; Custody Assistance">Bail &amp; Custody Assistance</option>
                  <option value="Mediation">Pre-Litigation Mediation</option>
                </select>
              </label>

              <label className="form-label">
                Dispute Legal Category *
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Constitutional &amp; Rights">Constitutional &amp; Rights</option>
                  <option value="Civil &amp; Property">Civil &amp; Property</option>
                  <option value="Family &amp; Matrimonial">Family &amp; Matrimonial</option>
                  <option value="Criminal Defense">Criminal Defense</option>
                  <option value="Labor &amp; Employment">Labor &amp; Employment</option>
                  <option value="Consumer &amp; Commercial">Consumer &amp; Commercial</option>
                </select>
              </label>
            </div>

            <label className="form-label">
              Subject / Matter Headline *
              <input
                required
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief title of the dispute or relief sought"
              />
            </label>

            <label className="form-label">
              Detailed Description &amp; Grounds *
              <textarea
                required
                rows={5}
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="State the facts of your matter, parties involved, current court details (if any), and specific assistance required..."
              />
            </label>

            {/* Document Upload Section */}
            <div style={{ background: "var(--sage-50)", padding: "18px", borderRadius: "var(--radius)", border: "1px dashed var(--line)" }}>
              <span className="eyebrow" style={{ margin: "0 0 6px" }}>
                Supporting Documentation
              </span>
              <p style={{ fontSize: "12.5px", color: "var(--muted)", margin: "0 0 12px" }}>
                Upload relevant orders, notices, or identity proof (PDF, DOCX, PNG, max 10MB each).
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <input
                  type="file"
                  id="file-upload-input"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  disabled={uploading}
                />
                <label htmlFor="file-upload-input" className="button secondary" style={{ cursor: "pointer" }}>
                  {uploading ? "Uploading document…" : "📎 Choose File to Upload"}
                </label>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Permitted formats: PDF, DOC, DOCX, PNG, JPG
                </span>
              </div>

              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: "14px", display: "grid", gap: "6px" }}>
                  {uploadedFiles.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fff",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid var(--line)",
                        fontSize: "12px",
                      }}
                    >
                      <span>📄 {file.filename}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        style={{ color: "var(--burgundy)", background: "none", border: "none" }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="inline-notice error" role="alert">
                {error}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
              <Link href="/services" className="text-link">
                &larr; Back to Services
              </Link>
              <button className="button primary button-lg" type="submit" disabled={loading || uploading}>
                {loading ? "Lodging Application…" : "Submit Legal Aid Application →"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
