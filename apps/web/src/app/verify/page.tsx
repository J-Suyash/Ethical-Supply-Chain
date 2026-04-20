import type { Metadata } from "next";
import { SiteNav } from "@/components/shared/site-nav";
import { VerificationConsole } from "@/components/verify/verification-console";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Product",
  description: "Public verification page for the Ethical Supply Chain contract.",
};

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <SiteNav />
        <Suspense
          fallback={
            <div className="border border-line bg-panel px-6 py-12 font-data text-muted">
              LOADING...
            </div>
          }
        >
          <VerificationConsole />
        </Suspense>
      </div>
    </main>
  );
}
