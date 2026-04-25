"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { contractConfig } from "@/lib/contracts";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/verify", label: "Verify Product" },
  { href: "/console", label: "Operator Console" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const hasContract = Boolean(contractConfig.proposedAddress);

  return (
    <header>
      <div className="govt-header-top">
        <div className="govt-container flex items-center justify-between px-4">
          <span>Skip to Main Content | Screen Reader Access</span>
          <div className="flex items-center gap-4">
            <span className="font-bold">EN</span>
            <span className="opacity-60">|</span>
            <span>HI</span>
            <span className="opacity-60">|</span>
            <span>Font Size: A- | A | A+</span>
          </div>
        </div>
      </div>

      <div className="govt-header-main">
        <div className="govt-container flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-govt-blue text-white font-bold text-lg">
              ESC
            </div>
            <div>
              <h1 className="text-lg leading-tight">Ethical Supply Chain Tracking System</h1>
              <p className="text-xs text-govt-gray-dark">
                Department of Blockchain Governance | Ministry of Digital Infrastructure
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <p className="font-bold text-govt-blue">{contractConfig.demoChainName} Network</p>
              <p className="text-govt-gray-dark">Chain ID: {contractConfig.demoChainId}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-3 w-3 border ${hasContract ? "bg-govt-green border-govt-green" : "bg-govt-red border-govt-red"}`} />
              <span className="text-xs">{hasContract ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="govt-nav">
        <div className="govt-container flex px-4">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "active" : ""}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="bg-govt-saffron px-4 py-1 text-center text-xs font-bold text-govt-blue border-b border-govt-green overflow-hidden">
        <span className="inline-block animate-marquee whitespace-nowrap">
          NOTICE: All product registrations and approvals are recorded on the Sepolia blockchain testnet. For assistance, contact support@esc-gov.in | Helpline: 1800-XXX-XXXX
        </span>
      </div>
    </header>
  );
}
