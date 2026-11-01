import { NextResponse } from "next/server";
import { assessDocumentHealth } from "@/lib/insights";
import { getHearing, listCases, listDocuments } from "@/lib/repository";
import type { CauseListRecommendation, ReadinessStatus } from "@/lib/types";

export const runtime = "nodejs";

function recommendationFor(readiness: ReadinessStatus, priority: string) {
  if (readiness === "Ready") return priority === "Urgent" ? "Place in the early urgent block." : "Suitable for the regular list.";
  if (readiness === "Needs review") return "Keep after ready matters; registry review is advised before call.";
  return "Do not place in the active hearing block until the file is completed.";
}

export async function GET() {
  try {
    const records = await Promise.all((await listCases()).map(async (caseRecord) => {
      const [hearing, documents] = await Promise.all([getHearing(caseRecord._id), listDocuments(caseRecord._id)]);
      const health = assessDocumentHealth(caseRecord._id, documents);
      const readiness: ReadinessStatus = health.status === "Action required"
        ? "Awaiting documents"
        : hearing?.readinessStatus ?? (health.status === "Clear" ? "Ready" : "Needs review");
      return {
        case: caseRecord,
        hearing,
        readiness,
        recommendation: recommendationFor(readiness, caseRecord.priority),
        estimatedDuration: hearing?.estimatedDuration ?? 30,
      } satisfies Omit<CauseListRecommendation, "order">;
    }));

    const rank = { Ready: 0, "Needs review": 1, "Awaiting documents": 2 };
    const priority = { Urgent: 0, Priority: 1, Standard: 2 };
    const recommendations = records
      .sort((first, second) => rank[first.readiness] - rank[second.readiness] || priority[first.case.priority] - priority[second.case.priority])
      .map((item, index) => ({ ...item, order: index + 1 }));

    return NextResponse.json({
      label: "Scheduling recommendations — listing authority remains with the Court",
      recommendations,
    });
  } catch (error) {
    return NextResponse.json({ error: "Could not prepare cause-list recommendations.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
