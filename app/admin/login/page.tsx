import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginPage } from "@/components/admin-login-page";

export const metadata: Metadata = {
  title: "Admin Sign In | NyayaSetu",
  description: "Sign in to the NyayaSetu administration panel.",
};

export default function AdminLoginRoute() {
  return (
    <Suspense>
      <AdminLoginPage />
    </Suspense>
  );
}
