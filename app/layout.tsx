import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ShellGate } from "@/components/elaris/ShellGate";
import { getViewerContext } from "@/lib/db/viewer";
import { getAttentionCount } from "@/lib/db/attention";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Elaris — Deployment & Change Evidence",
  description: "Connect a Physical AI system's configuration with the evidence and approvals that authorize its deployment.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ persons, viewerId }, attentionCount] = await Promise.all([
    getViewerContext(),
    getAttentionCount(),
  ]);

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <ShellGate persons={persons} viewerId={viewerId} attentionCount={attentionCount}>
          {children}
        </ShellGate>
      </body>
    </html>
  );
}
