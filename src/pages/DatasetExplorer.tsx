import React, { useState } from 'react';
import { useAppStore } from '../data/store';
import {
  Database, FileSpreadsheet, Check, Eye, AlertCircle,
  ChevronLeft, ChevronRight, Building2, Landmark, RefreshCw, Layers
} from 'lucide-react';

const PAGE_SIZE = 15;

interface DatasetMeta {
  name: string;
  filename: string;
  records: string;
  columns: string[];
  house: 'Lok Sabha' | 'Rajya Sabha';
}

const RAJYA_SABHA_FILES: DatasetMeta[] = [
  {
    name: 'Works Sanctioned (Rajya Sabha)',
    filename: 'rajya_sabha_dataset/Works Sanctioned (2).csv',
    records: '79,220',
    columns: ['Sr. No.', 'Work category', 'Work', 'State', 'IDA', "Hon'ble Members of Parliament", 'Elected/Nominated', 'Work description'],
    house: 'Rajya Sabha',
  },
  {
    name: 'Works Recommended (Rajya Sabha)',
    filename: 'rajya_sabha_dataset/Works Recommended (2).csv',
    records: '87,412',
    columns: ['Sr. No.', 'Work category', 'Work', 'State', 'IDA', "Hon'ble Members of Parliament", 'Elected/Nominated', 'Work description', 'RECOMMENDED AMOUNT'],
    house: 'Rajya Sabha',
  },
  {
    name: 'Works Completed (Rajya Sabha)',
    filename: 'rajya_sabha_dataset/Works Completed (2).csv',
    records: '29,845',
    columns: ['Sr. No.', 'Work Category', 'Work', 'State', 'IDA', "Hon'ble Members of Parliament", 'Elected/Nominated', 'Work Description', 'Amount Disbursed'],
    house: 'Rajya Sabha',
  },
  {
    name: 'Expenditure on Works (Rajya Sabha)',
    filename: 'rajya_sabha_dataset/Expenditure on Completed and On-going Works as on Date (2).csv',
    records: '18,530',
    columns: ['State', 'Work', 'Work ID', 'IDA', "Hon'ble Members of Parliament", 'Elected/Nominated', 'Expenditure Date', 'Payment Status', 'Fund Disbursed Amount'],
    house: 'Rajya Sabha',
  },
  {
    name: 'Allocated Limit (Rajya Sabha MPs)',
    filename: 'rajya_sabha_dataset/Allocated Limit for Honble MPs (2).csv',
    records: '245',
    columns: ['Sr. No.', 'State', 'MP', 'Elected/Nominated', 'Allocated Amount'],
    house: 'Rajya Sabha',
  },
];

export function DatasetExplorer() {
  const {
    datasetSummary,
    lokSabhaProjects,
    rajyaSabhaProjects,
    rajyaSabhaLoaded,
    isLoadingRajyaSabha,
    loadRajyaSabhaDatasets,
    activeHouse,
    setActiveHouse,
    setCurrentPage,
    setMonitoringFilter,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'Lok Sabha' | 'Rajya Sabha'>('Lok Sabha');
  const [viewRawDataset, setViewRawDataset] = useState<DatasetMeta | null>(null);
  const [rawPage, setRawPage] = useState(1);

  const displayProjects = activeTab === 'Lok Sabha' ? lokSabhaProjects : rajyaSabhaProjects;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#005eb2] mb-1 flex items-center gap-2">
            <Database size={12} />
            Data Integrity &amp; Multi-House Dataset Explorer
          </p>
          <h1 className="text-2xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            MPLADS Dataset Explorer
          </h1>
          <p className="text-xs text-[#747780] mt-0.5">
            Empirical verification of official Lok Sabha and Rajya Sabha records · Strictly isolated pipelines
          </p>
        </div>

        {/* ── Segmented House Filter ─────────────────────────────────── */}
        <div className="flex items-center bg-white p-1 rounded-lg border border-[#E9ECEF] shadow-sm">
          <button
            onClick={() => {
              setActiveTab('Lok Sabha');
              setViewRawDataset(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'Lok Sabha'
                ? 'bg-[#005eb2] text-white shadow-sm'
                : 'text-[#44474f] hover:text-[#000a1f] hover:bg-[#F8F9FA]'
            }`}
          >
            <Building2 size={13} />
            Lok Sabha Dataset
          </button>
          <button
            onClick={() => {
              setActiveTab('Rajya Sabha');
              setViewRawDataset(null);
              if (!rajyaSabhaLoaded && !isLoadingRajyaSabha) {
                loadRajyaSabhaDatasets();
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'Rajya Sabha'
                ? 'bg-[#005eb2] text-white shadow-sm'
                : 'text-[#44474f] hover:text-[#000a1f] hover:bg-[#F8F9FA]'
            }`}
          >
            <Landmark size={13} />
            Rajya Sabha Dataset
          </button>
        </div>
      </div>

      {/* ── House Status Banner ────────────────────────────────────── */}
      {activeTab === 'Lok Sabha' ? (
        <div className="p-4 rounded-lg bg-[#f0f9ff] border border-[#bae6fd] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#005eb2] text-white flex items-center justify-center flex-shrink-0">
              <Building2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#00204a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Lok Sabha Dataset (House of the People)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#065f46] text-[10px] font-bold border border-[#a7f3d0]">
                  Status: Loaded &amp; Verified
                </span>
              </div>
              <p className="text-xs text-[#0369a1] mt-0.5">
                {lokSabhaProjects.length.toLocaleString('en-IN')} unique project records across 6 official CSV files · 543 Parliamentary Constituencies
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveHouse('Lok Sabha');
              setCurrentPage('monitoring');
            }}
            className="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-1.5"
          >
            <Layers size={13} /> Explore in Project Monitoring
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-[#faf5ff] border border-[#e9d5ff] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#6d28d9] text-white flex items-center justify-center flex-shrink-0">
              <Landmark size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#3b0764]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Rajya Sabha Dataset (Council of States)
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  rajyaSabhaLoaded
                    ? 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]'
                    : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                }`}>
                  {rajyaSabhaLoaded ? 'Status: Loaded & Verified' : 'Status: Ready on Demand'}
                </span>
              </div>
              <p className="text-xs text-[#7e22ce] mt-0.5">
                {rajyaSabhaLoaded
                  ? `${rajyaSabhaProjects.length.toLocaleString('en-IN')} unique Rajya Sabha records across 5 isolated CSV files · State/UT representation`
                  : 'Separate Rajya Sabha junction files ready for high-performance memory loading.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!rajyaSabhaLoaded && (
              <button
                onClick={() => loadRajyaSabhaDatasets()}
                disabled={isLoadingRajyaSabha}
                className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
              >
                {isLoadingRajyaSabha ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Loading Datasets...</span>
                  </>
                ) : (
                  <>
                    <Database size={12} />
                    <span>Load Rajya Sabha Data</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => {
                setActiveHouse('Rajya Sabha');
                setCurrentPage('monitoring');
              }}
              className="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6d28d9] hover:bg-[#5b21b6]"
            >
              <Layers size={13} /> Explore in Project Monitoring
            </button>
          </div>
        </div>
      )}

      {/* ── Dataset Source Files Grid ───────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#44474f]">
            {activeTab} Source Dataset Files ({activeTab === 'Lok Sabha' ? (datasetSummary?.datasets.length ?? 6) : RAJYA_SABHA_FILES.length})
          </h2>
          <span className="text-[10px] text-[#747780]">
            Format: Official Government CSV Junction Tables
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === 'Lok Sabha'
            ? datasetSummary?.datasets.map((ds) => (
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
                      <div className="text-[10px] text-[#44474f] font-bold uppercase tracking-wider">
                        Available Schema Fields ({ds.columns.length}):
                      </div>
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
                      setViewRawDataset({
                        name: ds.name,
                        filename: ds.filename,
                        records: ds.records.toLocaleString(),
                        columns: ds.columns,
                        house: 'Lok Sabha',
                      });
                      setRawPage(1);
                    }}
                    className="btn-secondary w-full flex items-center justify-center gap-1.5 text-xs py-1.5 mt-2"
                  >
                    <Eye size={13} />
                    View Records ({ds.records.toLocaleString()})
                  </button>
                </div>
              ))
            : RAJYA_SABHA_FILES.map((ds) => (
                <div key={ds.filename} className="panel p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#6d28d9] flex items-center gap-1.5">
                        <FileSpreadsheet size={14} />
                        {ds.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe] font-semibold">
                        {ds.records} records
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#747780] truncate">{ds.filename}</p>

                    <div className="mt-3 space-y-1 text-xs">
                      <div className="text-[10px] text-[#44474f] font-bold uppercase tracking-wider">
                        Available Schema Fields ({ds.columns.length}):
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ds.columns.slice(0, 5).map(col => (
                          <span key={col} className="text-[10px] bg-[#faf5ff] text-[#6d28d9] px-1.5 py-0.5 rounded-sm border border-[#e9d5ff] font-mono">
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
                      if (!rajyaSabhaLoaded && !isLoadingRajyaSabha) {
                        loadRajyaSabhaDatasets();
                      }
                      setViewRawDataset(ds);
                      setRawPage(1);
                    }}
                    className="btn-secondary w-full flex items-center justify-center gap-1.5 text-xs py-1.5 mt-2 text-[#6d28d9] border-[#e9d5ff]"
                  >
                    <Eye size={13} />
                    View Records ({ds.records})
                  </button>
                </div>
              ))}
        </div>
      </div>

      {/* ── Raw Records Viewer Modal / Bottom Panel ─────────────────── */}
      {viewRawDataset && (
        <div className="panel p-5 space-y-3 animate-fade-in border-2 border-[#005eb2]/30">
          <div className="flex items-center justify-between border-b border-[#E9ECEF] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#000a1f] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Database size={15} className="text-[#005eb2]" />
                Raw Records Viewer: {viewRawDataset.name}
              </h2>
              <p className="text-xs text-[#747780]">
                File: {viewRawDataset.filename} · House: <strong className="text-[#005eb2]">{viewRawDataset.house}</strong> · {viewRawDataset.records} total rows
              </p>
            </div>
            <button
              onClick={() => setViewRawDataset(null)}
              className="text-xs text-[#44474f] hover:text-[#DC3545] font-semibold underline"
            >
              Close Table
            </button>
          </div>

          <div className="overflow-x-auto max-h-[420px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8F9FA] text-[#44474f] border-b border-[#E9ECEF] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 w-10">#</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Work ID</th>
                  <th className="px-3 py-2.5">State</th>
                  <th className="px-3 py-2.5">MP Name</th>
                  {viewRawDataset.house === 'Lok Sabha' ? (
                    <th className="px-3 py-2.5">Constituency</th>
                  ) : (
                    <th className="px-3 py-2.5">Representation</th>
                  )}
                  <th className="px-3 py-2.5">Description</th>
                  <th className="px-3 py-2.5 text-right">Sanction Amount</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF]">
                {displayProjects.slice((rawPage - 1) * PAGE_SIZE, rawPage * PAGE_SIZE).map((p, rowIdx) => (
                  <tr key={p.workId + rowIdx} className="hover:bg-[#F8F9FA]">
                    <td className="px-3 py-2.5 text-[#94a3b8] font-mono text-[10px]">
                      {(rawPage - 1) * PAGE_SIZE + rowIdx + 1}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#005eb2] font-semibold whitespace-nowrap">
                      {p.workCategory}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] whitespace-nowrap">
                      {p.workId}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{p.state}</td>
                    <td className="px-3 py-2.5 font-semibold text-[#000a1f] whitespace-nowrap">{p.mp}</td>
                    {viewRawDataset.house === 'Lok Sabha' ? (
                      <td className="px-3 py-2.5 whitespace-nowrap">{p.constituency || '—'}</td>
                    ) : (
                      <td className="px-3 py-2.5 whitespace-nowrap text-[#6d28d9] font-medium">Rajya Sabha</td>
                    )}
                    <td className="px-3 py-2.5 truncate max-w-xs">{p.workDescription}</td>
                    <td className="px-3 py-2.5 font-mono text-right whitespace-nowrap font-semibold text-[#000a1f]">
                      {p.sanctionAmount ? `₹${p.sanctionAmount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.workStatus?.toLowerCase().includes('completed')
                          ? 'bg-[#d1fae5] text-[#065f46]'
                          : p.workStatus?.toLowerCase().includes('progress')
                          ? 'bg-[#fef3c7] text-[#92400e]'
                          : 'bg-[#f1f5f9] text-[#475569]'
                      }`}>
                        {p.workStatus || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-[#747780]">
              Page {rawPage} of {Math.max(1, Math.ceil(displayProjects.length / PAGE_SIZE))} ({displayProjects.length.toLocaleString('en-IN')} total records in memory)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRawPage(p => Math.max(1, p - 1))}
                disabled={rawPage === 1}
                className="btn-secondary px-2.5 py-1 text-xs disabled:opacity-40"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                onClick={() => setRawPage(p => p + 1)}
                disabled={rawPage >= Math.ceil(displayProjects.length / PAGE_SIZE)}
                className="btn-secondary px-2.5 py-1 text-xs disabled:opacity-40"
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
