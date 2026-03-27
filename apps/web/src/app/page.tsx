import type { Metadata } from "next";
import { BuildStatusSection } from "@/components/home/build-status-section";
import { ComparisonSection } from "@/components/home/comparison-section";
import { WalletConsole } from "@/components/demo/wallet-console";
import { HeroSection } from "@/components/home/hero-section";
import { ResearchGapsSection } from "@/components/home/research-gaps-section";
import { SystemSections } from "@/components/home/system-sections";
import { WorkingFlowSections } from "@/components/home/working-flow-sections";
import { SiteNav } from "@/components/shared/site-nav";

export const metadata: Metadata = {
  title: "Base Paper vs Proposed System",
  description:
    "Compare the base medicine supply-chain paper workflow with the proposed multi-authority ethical validation system.",
};

export default function Home() {
  return (
    <main className="paper-grid paper-noise min-h-screen overflow-hidden px-5 py-6 text-foreground sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <SiteNav />
        <HeroSection />
        <SystemSections />
        <WorkingFlowSections />
        <ResearchGapsSection />
        <ComparisonSection />
        <WalletConsole />
        <BuildStatusSection />
      </div>
    </main>
  );
}
