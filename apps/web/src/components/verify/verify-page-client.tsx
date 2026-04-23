"use client";

import { useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/shared/site-nav";
import { VerificationConsole } from "@/components/verify/verification-console";
import { ProductLanding } from "@/components/verify/product-landing";

export function VerifyPageClient() {
  const searchParams = useSearchParams();
  const seed = searchParams.get("seed");

  if (seed) {
    return <ProductLanding seed={seed} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <SiteNav />
        <VerificationConsole />
      </div>
    </main>
  );
}
