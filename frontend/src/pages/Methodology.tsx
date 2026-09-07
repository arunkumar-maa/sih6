import React from 'react';
import {
  Cpu, Database, ShieldCheck, CheckCircle2, ArrowRight,
  GitMerge, HelpCircle, Layers, Zap, Scale, Terminal
} from 'lucide-react';

export function Methodology() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={16} className="text-[#005eb2]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2]">Architecture & System Design</span>
        </div>
        <h1 className="text-2xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>System Methodology & Risk Engine</h1>
        <p className="text-sm text-[#747780] mt-1">
          Transparent, explainable AI risk intelligence for human-in-the-loop civic infrastructure monitoring.
        </p>
      </div>

      {/* Philosophy Statement */}
      <div className="panel p-5 bg-[#dbeafe] border-l-4 border-l-[#005eb2]">
        <h2 className="text-base font-bold text-[#000a1f] mb-2 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <Scale size={18} className="text-[#005eb2]" />
          Core Operational Philosophy
        </h2>
        <blockquote className="text-sm text-[#141d23] italic leading-relaxed">
          "The system identifies projects that may require attention and provides explainable risk indicators to support human verification. The AI assists officers, not replaces their decision-making."
        </blockquote>
      </div>

      {/* Visual Data Pipeline Flow */}
      <div className="panel p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#000a1f] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Data Processing & Risk Scoring Flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center pt-2">
          {[
            { step: '1. MPLADS DATA', desc: 'Raw CSV Datasets', color: '#005eb2', icon: Database },
            { step: '2. PREPROCESSING', desc: 'Join & Normalization', color: '#6d28d9', icon: GitMerge },
            { step: '3. ANOMALY ENGINE', desc: 'Statistical Rules', color: '#92400e', icon: Zap },
            { step: '4. RISK SCORE', desc: 'Weighted 0–100', color: '#DC3545', icon: Cpu },
            { step: '5. EXPLAINABLE ALERT', desc: 'Evidence & Metrics', color: '#0891b2', icon: Layers },
            { step: '6. OFFICER DECISION', desc: 'Human Verification', color: '#198754', icon: ShieldCheck },
          ].map((item, i) => (
            <div key={item.step} className="panel-muted p-3 flex flex-col items-center justify-between border-t-2 border border-[#E9ECEF]" style={{ borderTopColor: item.color }}>
              <item.icon size={20} style={{ color: item.color }} className="mb-2" />
              <div className="text-xs font-bold text-[#000a1f] mb-1">{item.step}</div>
              <div className="text-[10px] text-[#747780]">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Prototype vs Future ML Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Prototype */}
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#E9ECEF] pb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#198754]" />
            <h3 className="text-sm font-bold text-[#000a1f]">Active Production Intelligence Pipeline</h3>
          </div>
          <p className="text-xs text-[#44474f] leading-relaxed">
            Rule-based + statistical risk intelligence executed directly on the attached MPLADS dataset.
          </p>
          <ul className="space-y-2 text-xs text-[#141d23]">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#198754] mt-0.5 flex-shrink-0" />
              <span><strong>Stale Status Risk:</strong> Identifies works sanctioned &gt;365 days ago stuck in initial status.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#198754] mt-0.5 flex-shrink-0" />
              <span><strong>Unsanctioned Recommendations:</strong> Detects recommended works with "NA" sanction date pending &gt;180 days.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#198754] mt-0.5 flex-shrink-0" />
              <span><strong>Cost Anomaly:</strong> Flags works &gt;2.5x above category median cost.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#198754] mt-0.5 flex-shrink-0" />
              <span><strong>Disbursement Mismatch:</strong> Highlights disbursement exceeding sanction amount.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#198754] mt-0.5 flex-shrink-0" />
              <span><strong>Vendor Concentration:</strong> Flags vendors assigned to &ge;5 works.</span>
            </li>
          </ul>
        </div>

        {/* Future ML Layer */}
        <div className="panel p-5 space-y-3 bg-[#f3e8ff] border border-[#d8b4fe]">
          <div className="flex items-center gap-2 border-b border-[#d8b4fe] pb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6d28d9] animate-pulse" />
            <h3 className="text-sm font-bold text-[#4c1d95]">Future ML Production Architecture</h3>
          </div>
          <p className="text-xs text-[#6b21a8] leading-relaxed">
            Modular extension points ready to connect Python Microservices & ML Pipelines.
          </p>
          <ul className="space-y-2 text-xs text-[#4c1d95]">
            <li className="flex items-start gap-2">
              <ArrowRight size={14} className="text-[#6d28d9] mt-0.5 flex-shrink-0" />
              <span><strong>Isolation Forest:</strong> Unsupervised multidimensional anomaly detection for outlier projects.</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight size={14} className="text-[#6d28d9] mt-0.5 flex-shrink-0" />
              <span><strong>XGBoost Regressor:</strong> Predictive delay and cost overrun risk modeling based on historical timelines.</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight size={14} className="text-[#6d28d9] mt-0.5 flex-shrink-0" />
              <span><strong>TF-IDF + Cosine Similarity:</strong> Semantic duplicate detection across work descriptions.</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight size={14} className="text-[#6d28d9] mt-0.5 flex-shrink-0" />
              <span><strong>SHAP (SHapley Additive exPlanations):</strong> Mathematically rigorous feature importance score breakdown per prediction.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Why AI Section */}
      <div className="panel p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#000a1f] uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <HelpCircle size={16} className="text-[#92400e]" />
          Why AI for Civic Infrastructure Monitoring?
        </h3>
        <p className="text-xs text-[#44474f] leading-relaxed">
          With thousands of active MPLADS works across multiple districts, manual verification of every proposal and voucher is bottlenecked. AI statistical analysis scales immediately across national datasets to prioritize officers' attention toward projects with unusual combinations of cost, timeline delay, disbursement mismatch, and vendor concentration.
        </p>
      </div>
    </div>
  );
}
