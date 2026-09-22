import React, { useEffect, useState } from 'react';
import { PublicService } from '../../services/publicService';
import type { PublicMetaResponse } from '../../types/public';
import {
  HelpCircle,
  Landmark,
  ShieldCheck,
  FileCheck,
  Layers,
  Database,
  Search,
  Eye,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface AboutMethodologyPageProps {
  onNavigate: (path: string) => void;
}

export function AboutMethodologyPage({ onNavigate }: AboutMethodologyPageProps) {
  const [meta, setMeta] = useState<PublicMetaResponse | null>(null);

  useEffect(() => {
    PublicService.getMeta().then(setMeta).catch(() => null);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="border-b border-[#E9ECEF] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-[#005eb2] uppercase tracking-wider">
            Governance & Transparency
          </span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#000a1f]"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          About MPLADS Sentinel & Methodology
        </h1>
        <p className="text-xs text-[#747780] mt-0.5">
          Methodological framework, data provenance, and transparency protocols governing the public monitoring system.
        </p>
      </div>

      {/* ── 1. What is MPLADS Sentinel ────────────────────────── */}
      <section className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#00204a]">
          <Landmark size={20} className="text-[#005eb2]" />
          <h2 className="text-base font-bold uppercase tracking-wide">
            What is MPLADS Sentinel?
          </h2>
        </div>
        <p className="text-xs text-[#44474f] leading-relaxed">
          <strong>MPLADS Sentinel</strong> is an open civic transparency and public monitoring portal dedicated to tracking works recommended and executed under the <strong>Members of Parliament Local Area Development Scheme (MPLADS)</strong> for the Lok Sabha.
        </p>
        <p className="text-xs text-[#44474f] leading-relaxed">
          The platform equips citizens, researchers, and civil society with structured, searchable visibility into parliamentary constituency allocations, project statuses, fund disbursements, and physical progress markers.
        </p>
      </section>

      {/* ── 2. The Core Monitoring Workflow ───────────────────── */}
      <section className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-[#00204a]">
          <Layers size={20} className="text-[#005eb2]" />
          <h2 className="text-base font-bold uppercase tracking-wide">
            Core Monitoring Workflow
          </h2>
        </div>
        <p className="text-xs text-[#747780]">
          The end-to-end pipeline operates through five sequential stages:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF] space-y-1">
            <span className="text-xs font-mono font-bold text-[#005eb2]">STAGE 01</span>
            <h4 className="text-xs font-bold text-[#000a1f]">MPLADS Data</h4>
            <p className="text-[11px] text-[#44474f]">
              Official records published by the Ministry of Statistics and Programme Implementation (MoSPI).
            </p>
          </div>

          <div className="p-3.5 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF] space-y-1">
            <span className="text-xs font-mono font-bold text-[#005eb2]">STAGE 02</span>
            <h4 className="text-xs font-bold text-[#000a1f]">Processing</h4>
            <p className="text-[11px] text-[#44474f]">
              Data normalization, constituency mapping, and financial calculation parsing.
            </p>
          </div>

          <div className="p-3.5 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF] space-y-1">
            <span className="text-xs font-mono font-bold text-[#005eb2]">STAGE 03</span>
            <h4 className="text-xs font-bold text-[#000a1f]">Rules + ML</h4>
            <p className="text-[11px] text-[#44474f]">
              Algorithmic scanning for milestone progression gaps, duration outliers, and cost discrepancies.
            </p>
          </div>

          <div className="p-3.5 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF] space-y-1">
            <span className="text-xs font-mono font-bold text-[#005eb2]">STAGE 04</span>
            <h4 className="text-xs font-bold text-[#000a1f]">Attention Indicator</h4>
            <p className="text-[11px] text-[#44474f]">
              Objective informational flags generated to signal works that require administrative focus.
            </p>
          </div>

          <div className="p-3.5 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF] space-y-1">
            <span className="text-xs font-mono font-bold text-[#005eb2]">STAGE 05</span>
            <h4 className="text-xs font-bold text-[#000a1f]">Human Verification</h4>
            <p className="text-[11px] text-[#44474f]">
              Physical inspection and documentation review by competent district authorities.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Attention Indicators vs Proof of Wrongdoing ────── */}
      <section className="bg-white border border-amber-200 rounded-sm p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-amber-800">
          <ShieldCheck size={20} />
          <h2 className="text-base font-bold uppercase tracking-wide">
            Understanding Attention Indicators
          </h2>
        </div>
        <p className="text-xs text-[#44474f] leading-relaxed">
          Attention indicators (such as <em>Attention Required</em> or <em>Review Recommended</em>) are automated statistical cues. They identify administrative phenomena such as:
        </p>
        <ul className="list-disc pl-5 text-xs text-[#44474f] space-y-1">
          <li>Works where expenditure pace diverges from recorded milestone completion dates.</li>
          <li>Projects showing stagnant progression beyond standard timeline averages.</li>
          <li>Works with high cost variance compared to similar works in the same district.</li>
        </ul>
        <div className="p-3 rounded-sm bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900">
          <strong>Important Disclosure:</strong> Statistical attention flags do NOT prove wrongdoing, corruption, or fraud. They are prioritized administrative queues designed to assist field oversight and civic enquiry.
        </div>
      </section>

      {/* ── 4. Public vs Internal Boundary ────────────────────── */}
      <section className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#00204a]">
          <Lock size={20} className="text-[#005eb2]" />
          <h2 className="text-base font-bold uppercase tracking-wide">
            Public vs Internal Information Boundary
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-sm bg-[#f6faff] border border-[#E9ECEF] space-y-1.5">
            <h4 className="text-xs font-bold text-[#005eb2] uppercase flex items-center gap-1.5">
              <Eye size={14} /> Public Information
            </h4>
            <ul className="text-[11px] text-[#44474f] space-y-1 list-disc pl-4">
              <li>Lok Sabha representative details</li>
              <li>Constituency project listings & descriptions</li>
              <li>Sanctioned amounts & public disbursements</li>
              <li>Completion status & execution timelines</li>
              <li>Public GIS constituency overlays</li>
              <li>Civic complaint registration & tracking</li>
            </ul>
          </div>

          <div className="p-4 rounded-sm bg-[#f8f9fa] border border-[#E9ECEF] space-y-1.5">
            <h4 className="text-xs font-bold text-[#747780] uppercase flex items-center gap-1.5">
              <Lock size={14} /> Protected Internal Scope
            </h4>
            <ul className="text-[11px] text-[#747780] space-y-1 list-disc pl-4">
              <li>Officer investigation notes & audit trails</li>
              <li>Private evidence & contractor filings</li>
              <li>Confidential departmental workflows</li>
              <li>Internal verification checklists</li>
              <li>Complainant contact information</li>
              <li>Privileged officer role dashboards</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5. Data Provenance & Transparency ─────────────────── */}
      <section className="bg-white border border-[#E9ECEF] rounded-sm p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#00204a]">
          <Database size={20} className="text-[#005eb2]" />
          <h2 className="text-base font-bold uppercase tracking-wide">
            Data Provenance & Transparency
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-[#f8f9fa] border border-[#E9ECEF] rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Source Authority</span>
            <strong className="text-[#000a1f] mt-0.5 block">MoSPI Official Portal</strong>
          </div>
          <div className="p-3 bg-[#f8f9fa] border border-[#E9ECEF] rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">House Scope</span>
            <strong className="text-[#000a1f] mt-0.5 block">Lok Sabha</strong>
          </div>
          <div className="p-3 bg-[#f8f9fa] border border-[#E9ECEF] rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Constituencies</span>
            <strong className="text-[#000a1f] mt-0.5 block">All 543 Seats</strong>
          </div>
          <div className="p-3 bg-[#f8f9fa] border border-[#E9ECEF] rounded-sm">
            <span className="text-[10px] uppercase font-bold text-[#747780] block">Total Records</span>
            <strong className="text-[#000a1f] mt-0.5 block">65,000 Works</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
