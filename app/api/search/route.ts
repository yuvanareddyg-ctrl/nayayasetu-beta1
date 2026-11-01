import { NextResponse } from "next/server";
import { listCases, listLegalRequests, listPrecedents, listUsers } from "@/lib/repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") ?? "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json({
        cases: [],
        requests: [],
        people: [],
        precedents: [],
        total: 0,
      });
    }

    const [cases, requests, users, precedents] = await Promise.all([
      listCases(),
      listLegalRequests(),
      listUsers(),
      listPrecedents(),
    ]);

    const matchedCases = cases
      .filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.jurisdiction.toLowerCase().includes(query) ||
          c.parties.some((p) => p.toLowerCase().includes(query)) ||
          c.assignedJudge.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const matchedRequests = requests
      .filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(query) ||
          r.subject.toLowerCase().includes(query) ||
          r.applicantName.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const matchedPeople = users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          (u.organization && u.organization.toLowerCase().includes(query)) ||
          u.role.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const matchedPrecedents = precedents
      .filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.legalTopic.toLowerCase().includes(query) ||
          p.court.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const total =
      matchedCases.length +
      matchedRequests.length +
      matchedPeople.length +
      matchedPrecedents.length;

    return NextResponse.json({
      cases: matchedCases,
      requests: matchedRequests,
      people: matchedPeople,
      precedents: matchedPrecedents,
      total,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed.", detail: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}

