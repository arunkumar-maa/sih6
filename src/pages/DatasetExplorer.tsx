import React, { useState } from 'react';
import { useAppStore } from '../data/store';
import { Database, FileSpreadsheet, Check, Eye, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 15;

export function DatasetExplorer() {
  const { datasetSummary, projects } = useAppStore();
  const [viewRawDatasetIndex, setViewRawDatasetIndex] = useState<number | null>(null);
  const [rawPage, setRawPage] = useState(1);

  if (!datasetSummary) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading dataset metadata...
      </div>
    );
  }

  const selectedDs = viewRawDatasetIndex !== null ? datasetSummary.datasets[viewRawDatasetIndex] : null;

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2] mb-1 flex items-center gap-2">
          <Database size={11} />
          Dataset Verification &amp; Coverage
        </p>
        <h1 className="text-2xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Dataset Verification &amp; Coverage Explorer</h1>
        <p className="text-xs text-[#747780] mt-0.5">
          Empirical verification of attached MPLADS dataset files · Primary source of truth
        </p>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasetSummary.datasets.map((ds, idx) => (
          <div key={ds.filename} className="panel p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#005eb2] flex items-center gap-1.5">
                  <FileSpreadsheet size={14} />
                  {ds.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#065f46] border border-[#6ee7b7] font-semibold">
                  {ds.records.toLocaleString()} records
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#747780] truncate">{ds.filename}</p>

              <div className="mt-3 space-y-1 text-xs">
                <div className="text-[10px] text-[#44474f] font-bold uppercase tracking-wider">Available Columns ({ds.columns.length}):</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ds.columns.slice(0, 5).map(col => (
                    <span key={col} className="text-[10px] bg-[#ecf5fe] text-[#005eb2] px-1.5 py-0.5 rounded-sm border border-[#c4c6d0] font-mono">
                      {col}
                    </span>
                  ))}
                  {ds.columns.length > 5 && (
                    <span className="text-[10px] text-[#747780] font-mono">+{ds.columns.length - 5} more</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setViewRawDatasetIndex(idx);
                setRawPage(1);
              }}
              className="btn-secondary w-full flex items-center justify-center gap-1.5 text-xs py-1.5 mt-2"
            >
              <Eye size={13} />
              View Raw Records
            </button>
          </div>
        ))}
      </div>

      {/* Raw Records Modal / View */}
      {selectedDs && (
        <div className="panel p-5 space-y-3 animate-fade-in border-2 border-[#005eb2]/30">
          <div className="flex items-center justify-between border-b border-[#E9ECEF] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#000a1f] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Database size={15} className="text-[#005eb2]" />
                Raw Records Viewer: {selectedDs.name}
              </h2>
              <p className="text-xs text-[#747780]">File: {selectedDs.filename} ({selectedDs.records} total rows)</p>
            </div>
            <button
              onClick={() => setViewRawDatasetIndex(null)}
              className="text-xs text-[#44474f] hover:text-[#DC3545] font-semibold underline"
            >
              Close Table
            </button>
          </div>

          <div className="overflow-x-auto max-h-[400px]">
            <table>
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  {selectedDs.columns.map(c => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.slice((rawPage - 1) * PAGE_SIZE, rawPage * PAGE_SIZE).map((p, rowIdx) => (
                  <tr key={p.workId + rowIdx}>
                    <td className="text-[#c4c6d0] font-mono text-xs">{(rawPage - 1) * PAGE_SIZE + rowIdx + 1}</td>
                    <td className="font-mono text-xs text-[#005eb2] font-semibold">{p.workCategory}</td>
                    <td className="font-mono text-xs">{p.workId}</td>
                    <td className="text-xs">{p.state}</td>
                    <td className="text-xs">{p.ida}</td>
                    <td className="text-xs">{p.mp}</td>
                    <td className="text-xs">{p.constituency}</td>
                    <td className="text-xs truncate max-w-xs">{p.workDescription}</td>
                    <td className="text-xs font-mono">{p.recommendedDate ? p.recommendedDate.toLocaleDateString() : 'NA'}</td>
                    <td className="text-xs font-mono">{p.sanctionDate ? p.sanctionDate.toLocaleDateString() : 'NA'}</td>
                    <td className="text-xs font-mono">{p.sanctionAmount ? `₹${p.sanctionAmount.toLocaleString('en-IN')}` : 'Not Available'}</td>
                    <td className="text-xs">{p.workStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#747780]">
              Page {rawPage} of {Math.ceil(projects.length / PAGE_SIZE)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRawPage(p => Math.max(1, p - 1))}
                disabled={rawPage === 1}
                className="btn-secondary px-2 py-1 text-xs disabled:opacity-40"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                onClick={() => setRawPage(p => p + 1)}
                disabled={rawPage >= Math.ceil(projects.length / PAGE_SIZE)}
                className="btn-secondary px-2 py-1 text-xs disabled:opacity-40"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
