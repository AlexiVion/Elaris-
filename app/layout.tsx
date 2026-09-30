import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/elaris/Sidebar";
import { Topbar } from "@/components/elaris/Topbar";
import { copy } from "@/lib/copy/en";
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
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar persons={persons} viewerId={viewerId} attentionCount={attentionCount} />
            {/* Discreet demo-data banner while the DB is the seed (spec §3.1). */}
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-800 md:px-6">
              {copy.demoBanner}
            </div>
            <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
