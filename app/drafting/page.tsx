import { Suspense } from "react";
import { DraftingStudio } from "@/components/drafting-studio";

export default function DraftingPage() {
  return <Suspense fallback={<div className="page-loading">Opening drafting studio…</div>}><DraftingStudio /></Suspense>;
}