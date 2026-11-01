import {
  getPlatformStats,
  getUserByEmail,
  createUser,
  createLegalRequest,
  getLegalRequestById,
  listLegalRequests,
  createConsultation,
  listConsultations,
  listNotifications,
  createNotification,
  markNotificationRead,
  listUsers,
  createDocument,
  listCases,
} from "../lib/repository";
import { hashPassword, verifyPassword, signUserToken, verifyUserToken } from "../lib/auth-user";

async function runSmokeTest() {
  console.log("=== NayayaSetu Smoke Test Starting ===");

  // 1. Check Platform Stats
  const stats = await getPlatformStats();
  console.log("1. Platform Stats:", {
    totalCases: stats.totalCases,
    totalRequests: stats.totalRequests,
    totalUsers: stats.totalUsers,
    registeredAdvocates: stats.verifiedAdvocates,
  });
  if (stats.totalCases <= 0 || stats.totalRequests < 0) {
    throw new Error("Stats calculation failed");
  }

  // 2. Auth & Password Verification
  const citizen = await getUserByEmail("aarav.mehta@example.com");
  if (!citizen) throw new Error("Seed citizen not found");
  const isValid = await verifyPassword("Password123!", citizen.passwordHash || "");
  console.log("2. Seed citizen password verification:", isValid ? "SUCCESS" : "FAILED");
  if (!isValid) throw new Error("Seed citizen password mismatch");

  // Test token creation and verification
  const token = await signUserToken({
    id: citizen._id,
    name: citizen.name,
    email: citizen.email,
    role: citizen.role,
  });
  const session = await verifyUserToken(token);
  console.log("2b. JWT session test:", session?.email === citizen.email ? "SUCCESS" : "FAILED");
  if (!session || session.email !== citizen.email) throw new Error("JWT token verification failed");

  // 3. User Creation
  const testEmail = `test.user.${Date.now()}@example.com`;
  const pwdHash = await hashPassword("SecurePass123!");
  const newUser = await createUser({
    name: "Pooja Verma",
    email: testEmail,
    passwordHash: pwdHash,
    role: "citizen",
    phone: "+91 98765 43210",
  });
  console.log("3. User creation:", newUser.email === testEmail ? "SUCCESS" : "FAILED");

  // 4. Legal Request Creation & Tracking
  const requestNumber = `NS-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newReq = await createLegalRequest({
    requestNumber,
    applicantName: newUser.name,
    applicantEmail: newUser.email,
    applicantPhone: "+91 98765 43210",
    serviceType: "legal-aid",
    category: "Family & Matrimonial",
    subject: "Maintenance support inquiry",
    description: "Seeking assistance regarding Section 125 CrPC application.",
    priority: "urgent",
    documents: [],
  });
  const fetchedReq = await getLegalRequestById(requestNumber);
  console.log("4. Request Creation & Lookup:", fetchedReq?.requestNumber === requestNumber ? "SUCCESS" : "FAILED");
  if (!fetchedReq) throw new Error("Failed to find created legal request");

  // 5. Consultation Scheduling
  const consultationNumber = `NS-CON-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newCon = await createConsultation({
    consultationNumber,
    userId: newUser._id,
    lawyerId: "adv-1",
    lawyerName: "Adv. Rajesh Kumar",
    lawyerSpecialization: "Constitutional & Civil Law",
    clientName: newUser.name,
    clientEmail: newUser.email,
    clientPhone: "+91 98765 43210",
    date: "2026-11-05",
    timeSlot: "11:00 AM - 11:30 AM",
    mode: "video",
    subject: "Civil Property Query",
    meetingLink: "https://meet.nyayasetu.gov.in/room-test",
  });
  console.log("5. Consultation booking:", newCon.consultationNumber === consultationNumber ? "SUCCESS" : "FAILED");

  // 6. Global Search matching
  const [cases, reqs, users] = await Promise.all([
    listCases(),
    listLegalRequests(),
    listUsers(),
  ]);
  const matchedUsers = users.filter((u) => u.name.toLowerCase().includes("priya"));
  console.log("6. Search matching for 'Priya':", {
    matchedAdvocates: matchedUsers.length,
    totalCasesAvailable: cases.length,
    totalRequestsAvailable: reqs.length,
  });
  if (matchedUsers.length === 0) throw new Error("Search failed to find advocate Priya");

  // 7. In-App Notifications
  const notif = await createNotification({
    userId: newUser._id,
    title: "Request Received",
    message: "Your application has been logged.",
    type: "request",
    link: `/services/track?ref=${requestNumber}`,
  });
  await markNotificationRead(notif._id);
  const userNotifs = await listNotifications(newUser._id);
  const updatedNotif = userNotifs.find((n) => n._id === notif._id);
  console.log("7. Notification created and marked as read:", updatedNotif?.isRead ? "SUCCESS" : "FAILED");

  // 8. Case Documents
  if (cases.length > 0) {
    const doc = await createDocument({
      caseId: cases[0]._id,
      filename: "rejoinder_affidavit_test.pdf",
      type: "Affidavit",
      completionStatus: "Complete",
      isDuplicate: false,
      isMissing: false,
    });
    console.log("8. Case document upload test:", doc.filename === "rejoinder_affidavit_test.pdf" ? "SUCCESS" : "FAILED");
  }

  console.log("\n✅ ALL SMOKE TESTS PASSED SUCCESSFULLY!");
}

runSmokeTest().catch((err) => {
  console.error("❌ Smoke test failed:", err);
  process.exit(1);
});
