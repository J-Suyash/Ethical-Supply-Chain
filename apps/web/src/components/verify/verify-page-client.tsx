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
    <main className="min-h-screen bg-govt-bg">
      <SiteNav />
      <div className="govt-container px-4">
        <VerificationConsole />
      </div>
      <footer className="govt-footer mt-8">
        <div className="govt-container px-4 text-center text-xs opacity-60">
          <p>Copyright 2026 Ethical Supply Chain Tracking System. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
