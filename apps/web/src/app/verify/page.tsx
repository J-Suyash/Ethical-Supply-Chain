import type { Metadata } from "next";
import { SiteNav } from "@/components/shared/site-nav";
import { VerificationConsole } from "@/components/verify/verification-console";

export const metadata: Metadata = {
  title: "Verification Console",
  description: "Manual lookup page for base-paper and proposed supply-chain records.",
};

interface VerifyPageProps {
  searchParams?: Promise<{
    upc?: string;
    seed?: string;
  }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <main className="paper-grid paper-noise min-h-screen overflow-hidden px-5 py-6 text-foreground sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <SiteNav />
        <VerificationConsole initialBaseUpc={params.upc} initialProductSeed={params.seed} />
      </div>
    </main>
  );
}
