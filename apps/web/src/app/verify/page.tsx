import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyPageClient } from "@/components/verify/verify-page-client";

export const metadata: Metadata = {
  title: "Verify Product",
  description: "Public verification page for the Ethical Supply Chain contract.",
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background text-foreground">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-center">
            <p className="font-data text-muted">LOADING...</p>
          </div>
        </main>
      }
    >
      <VerifyPageClient />
    </Suspense>
  );
}
