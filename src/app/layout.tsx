import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OBD-GPT",
  description: "Browser-based OBD-II vehicle diagnostics dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
