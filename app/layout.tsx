import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NyayaSetu | Judicial case management",
  description: "A human-led judicial workspace with carefully bounded AI assistance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
