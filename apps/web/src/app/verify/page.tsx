import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyPageClient } from "@/components/verify/verify-page-client";

export const metadata: Metadata = {
  title: "Verify Product - Ethical Supply Chain",
  description: "Public verification page for the Ethical Supply Chain contract.",
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-govt-bg">
          <div className="govt-container flex items-center justify-center py-24">
            <p className="text-sm text-govt-gray-dark">Loading...</p>
          </div>
        </main>
      }
    >
      <VerifyPageClient />
    </Suspense>
  );
}
