import type { Metadata } from "next";
import { SiteNav } from "@/components/shared/site-nav";
import { lifecycleStages, systemModules, metrics, features } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Ethical Supply Chain Tracking System - Home",
  description:
    "Blockchain-powered ethical supply chain with threshold-based authority validation on Sepolia.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-govt-bg">
      <SiteNav />

      <div className="govt-container px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="govt-section">
              <div className="govt-section-header flex items-center gap-2">
                <span className="h-2 w-2 bg-govt-saffron" />
                About the System
              </div>
              <div className="govt-section-body">
                <h2 className="text-xl mb-3">Ethical Supply Chain Tracking System</h2>
                <p className="text-sm leading-relaxed mb-4">
                  The Ethical Supply Chain Tracking System is a blockchain-based platform designed to ensure
                  transparency and accountability in the pharmaceutical supply chain. The system implements
                  multi-authority threshold validation, where designated regulatory authorities must approve
                  products at each stage before they can proceed through the supply chain.
                </p>
                <p className="text-sm leading-relaxed mb-4">
                  Built on the Sepolia Ethereum testnet, every stage transition, approval, and rejection is
                  permanently recorded on-chain, providing an immutable audit trail accessible to all stakeholders.
                </p>
                <div className="flex gap-2 mt-4">
                  <a
                    href="/console"
                    className="govt-btn govt-btn-primary"
                  >
                    Access Operator Console
                  </a>
                  <a
                    href="/verify"
                    className="govt-btn govt-btn-secondary"
                  >
                    Verify Product
                  </a>
                </div>
              </div>
            </div>

            <div className="govt-section">
              <div className="govt-section-header">System Architecture Modules</div>
              <div className="govt-section-body p-0">
                <table className="govt-table">
                  <thead>
                    <tr>
                      <th style={{ width: "30%" }}>Module Name</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemModules.map((mod) => (
                      <tr key={mod.name}>
                        <td className="font-bold text-govt-blue">{mod.name}</td>
                        <td className="text-sm">{mod.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="govt-section">
              <div className="govt-section-header">Product Lifecycle Stages</div>
              <div className="govt-section-body p-0">
                <table className="govt-table">
                  <thead>
                    <tr>
                      <th style={{ width: "8%" }}>Stage</th>
                      <th style={{ width: "22%" }}>Stage Name</th>
                      <th style={{ width: "15%" }}>Responsible Actor</th>
                      <th>Stage Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lifecycleStages.map((stage) => (
                      <tr key={stage.id}>
                        <td className="text-center font-mono text-govt-blue">{stage.id}</td>
                        <td className="font-bold">{stage.name}</td>
                        <td>{stage.owner}</td>
                        <td className="text-sm">{stage.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="govt-section">
              <div className="govt-section-header">System Statistics</div>
              <div className="govt-section-body">
                <table className="govt-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m) => (
                      <tr key={m.label}>
                        <td className="text-sm font-bold">{m.label}</td>
                        <td className="text-sm text-center">{m.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="govt-section">
              <div className="govt-section-header">Key Capabilities</div>
              <div className="govt-section-body">
                <ul className="space-y-3">
                  {features.map((f) => (
                    <li key={f.title} className="border-b border-govt-border pb-3 last:border-b-0 last:pb-0">
                      <p className="font-bold text-sm text-govt-blue">{f.title}</p>
                      <p className="text-xs text-govt-gray-dark mt-1">{f.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="govt-section">
              <div className="govt-section-header">Quick Links</div>
              <div className="govt-section-body">
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/verify" className="flex items-center gap-2 hover:text-govt-blue">
                      <span className="text-govt-saffron">&#9654;</span> Verify Product Authenticity
                    </a>
                  </li>
                  <li>
                    <a href="/console" className="flex items-center gap-2 hover:text-govt-blue">
                      <span className="text-govt-saffron">&#9654;</span> Operator Console Login
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-2 hover:text-govt-blue">
                      <span className="text-govt-saffron">&#9654;</span> User Manual (PDF)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-2 hover:text-govt-blue">
                      <span className="text-govt-saffron">&#9654;</span> System Guidelines
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="govt-footer mt-8">
        <div className="govt-container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="font-bold mb-2 text-govt-saffron">Ethical Supply Chain Tracking System</p>
              <p className="text-xs opacity-80">
                A blockchain-based transparency platform for pharmaceutical supply chain management.
              </p>
            </div>
            <div>
              <p className="font-bold mb-2 text-govt-saffron">Contact Information</p>
              <p className="text-xs opacity-80">
                Helpline: 1800-XXX-XXXX<br />
                Email: support@esc-gov.in<br />
                Working Hours: Mon-Fri, 9:00 AM - 6:00 PM
              </p>
            </div>
            <div>
              <p className="font-bold mb-2 text-govt-saffron">Network Details</p>
              <p className="text-xs opacity-80">
                Deployed on: Sepolia Testnet<br />
                Chain ID: 11155111<br />
                Contract: ESC V1
              </p>
            </div>
          </div>
          <div className="border-t border-govt-blue pt-3 text-center text-xs opacity-60">
            <p>Copyright 2024-2026 Ethical Supply Chain Tracking System. All Rights Reserved.</p>
            <p className="mt-1">Website designed and developed for research and demonstration purposes.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
