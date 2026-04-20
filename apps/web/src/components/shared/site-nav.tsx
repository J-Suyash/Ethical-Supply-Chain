"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { contractConfig } from "@/lib/contracts";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/verify", label: "VERIFY" },
  { href: "/console", label: "CONSOLE" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const hasContract = Boolean(contractConfig.proposedAddress);

  return (
    <header className="border-grid bg-panel">
      <div className="flex items-center justify-between border-b border-line px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="font-display text-xl tracking-tight">ESC</span>
          <span className="font-data text-muted">ETHICAL SUPPLY CHAIN</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-data text-muted">
            [ {contractConfig.demoChainName.toUpperCase()} : {contractConfig.demoChainId} ]
          </span>
          <span
            className={`inline-block h-2 w-2 ${hasContract ? "bg-success" : "bg-danger"}`}
          />
        </div>
      </div>
      <nav className="flex">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`border-r border-line px-6 py-3 font-data transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-panel text-foreground hover:bg-panel-alt"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
