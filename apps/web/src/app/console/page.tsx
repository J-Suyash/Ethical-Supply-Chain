import type { Metadata } from "next";
import { SiteNav } from "@/components/shared/site-nav";
import { OperatorDashboard } from "@/components/console/operator-dashboard";

export const metadata: Metadata = {
  title: "Operator Console",
  description:
    "Role-based operator dashboard for the proposed ethical supply chain contract.",
};

export default function ConsolePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <SiteNav />
        <OperatorDashboard />
      </div>
    </main>
  );
}
