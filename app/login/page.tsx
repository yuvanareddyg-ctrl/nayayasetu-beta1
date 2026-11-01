import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInPage } from "@/components/login-page";

export const metadata: Metadata = {
  title: "Sign In | NyayaSetu",
  description: "Sign in to your NyayaSetu judicial workspace.",
};

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="login-page" style={{ padding: "40px", textAlign: "center" }}>Loading…</div>}>
      <SignInPage />
    </Suspense>
  );
}
