import type { Metadata } from "next";
import { SignInPage } from "@/components/login-page";

export const metadata: Metadata = {
  title: "Sign In | NyayaSetu",
  description: "Sign in to your NyayaSetu judicial workspace.",
};

export default function LoginRoute() {
  return <SignInPage />;
}
