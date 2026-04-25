import type { Metadata } from "next";
import { SiteNav } from "@/components/shared/site-nav";
import { OperatorDashboard } from "@/components/console/operator-dashboard";

export const metadata: Metadata = {
  title: "Operator Console - Ethical Supply Chain",
  description:
    "Role-based operator dashboard for the proposed ethical supply chain contract.",
};

export default function ConsolePage() {
  return (
    <main className="min-h-screen bg-govt-bg">
      <SiteNav />
      <div className="govt-container px-4">
        <OperatorDashboard />
      </div>
      <footer className="govt-footer mt-8">
        <div className="govt-container px-4 text-center text-xs opacity-60">
          <p>Copyright 2024-2026 Ethical Supply Chain Tracking System. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
