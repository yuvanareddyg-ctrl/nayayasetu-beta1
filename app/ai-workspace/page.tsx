import { Suspense } from "react";
import { AiWorkspace } from "@/components/ai-workspace";

export default function AiWorkspacePage() {
  return <Suspense fallback={<div className="page-loading">Opening review desk…</div>}><AiWorkspace /></Suspense>;
}