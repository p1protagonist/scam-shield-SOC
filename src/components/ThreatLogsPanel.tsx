import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Trash2,
  X,
  Bot,
  User,
  Clock,
  Phone,
  CheckCircle,
  AlertOctagon,
  ChevronRight,
} from 'lucide-react';
import { TelemetryPacket } from '../types';

export interface ThreatLogEntry {
  id: string;
  timestamp: string;
  phoneNumber: string;
  callerName: string;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isAiVoice: boolean;
  pitchVariance: number;
  zcrUniformity: number;
  intent: string;
  transcriptSnippet: string;
  riskScore: number;
  actionTaken: 'KILL SWITCH ENGAGED' | 'INTERCEPTED & FLAGGED' | 'MONITORED';
}

interface ThreatLogsPanelProps {
  logs: ThreatLogEntry[];
  isOpen: boolean;
  onClose: () => void;
  onClearLogs: () => void;
  onSelectLog: (log: ThreatLogEntry) => void;
}

export const ThreatLogsPanel: React.FC<ThreatLogsPanelProps> = ({
  logs,
  isOpen,
  onClose,
  onClearLogs,
  onSelectLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'SUSPICIOUS' | 'SAFE'>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<ThreatLogEntry | null>(null);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.phoneNumber.includes(searchTerm) ||
      log.intent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSeverity === 'ALL' || log.threatLevel === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `scamshield_threat_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = 'Timestamp,Phone Number,Caller Name,Threat Level,AI Voice,Pitch Variance,ZCR,Intent,Action\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.timestamp}","${l.phoneNumber}","${l.callerName}","${l.threatLevel}","${l.isAiVoice}","${l.pitchVariance}","${l.zcrUniformity}","${l.intent.replace(/"/g, '""')}","${l.actionTaken}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scamshield_threat_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg bg-[#141418] border-l border-white/10 shadow-2xl flex flex-col backdrop-blur-xl animate-fadeIn select-none">
      {/* Panel Header */}
      <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Historical Threat Logs
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                {logs.length} Sessions
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              In-session forensic audit & scam intervention trail
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-white/[0.06] space-y-3 bg-black/20">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by caller, number, or intent..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#FF4500]"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Severity Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/10 text-[11px]">
            {(['ALL', 'CRITICAL', 'SUSPICIOUS', 'SAFE'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold transition-all ${
                  filterSeverity === sev
                    ? sev === 'CRITICAL'
                      ? 'bg-red-500 text-white shadow-sm'
                      : sev === 'SUSPICIOUS'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : sev === 'SAFE'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white/20 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 text-xs border border-white/10 transition-colors"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/20 transition-colors"
              title="Clear Session Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Log Entries List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-neutral-500">
            <CheckCircle className="w-8 h-8 mb-2 text-neutral-600" />
            <p className="text-xs font-medium text-neutral-400">No threat logs match your filters</p>
            <p className="text-[11px] text-neutral-600 mt-1">
              Trigger a live scan or preset to record forensic sessions
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedEntry(selectedEntry?.id === log.id ? null : log)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                log.threatLevel === 'CRITICAL'
                  ? 'bg-red-950/20 hover:bg-red-950/30 border-red-500/30'
                  : log.threatLevel === 'SUSPICIOUS'
                  ? 'bg-orange-950/20 hover:bg-orange-950/30 border-orange-500/30'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      log.threatLevel === 'CRITICAL'
                        ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                        : log.threatLevel === 'SUSPICIOUS'
                        ? 'bg-orange-500/30 text-orange-300 border border-orange-500/40'
                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {log.threatLevel}
                  </span>

                  {log.isAiVoice && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold border border-purple-500/30">
                      <Bot className="w-3 h-3" />
                      <span>AI SYNTHETIC</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500">
                  <Clock className="w-3 h-3" />
                  <span>{log.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-neutral-100">
                <span className="truncate">{log.callerName}</span>
                <span className="font-mono text-neutral-400 text-[11px] shrink-0 ml-2">
                  {log.phoneNumber}
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {log.intent}
              </p>

              {/* Expansion Drawer */}
              {selectedEntry?.id === log.id && (
                <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-2 text-[11px] font-mono animate-fadeIn">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 space-y-1">
                    <span className="text-neutral-500 block text-[10px]">RECORDED TRANSCRIPT:</span>
                    <p className="text-neutral-300 text-xs font-sans italic">
                      "{log.transcriptSnippet}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-400">
                    <div className="p-2 rounded-lg bg-black/40">
                      <span>PITCH VARIANCE:</span>
                      <span className="text-white font-bold block">{log.pitchVariance}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40">
                      <span>ZCR UNIFORMITY:</span>
                      <span className="text-white font-bold block">
                        {(log.zcrUniformity * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-neutral-500">ACTION DISPATCH:</span>
                    <span
                      className={`font-bold ${
                        log.threatLevel === 'CRITICAL' ? 'text-red-400' : 'text-neutral-300'
                      }`}
                    >
                      {log.actionTaken}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/[0.08] bg-black/40 text-[10px] font-mono text-neutral-500 flex items-center justify-between">
        <span>Session Storage Active</span>
        <span>Auto-logged via /ws/stream</span>
      </div>
    </div>
  );
};
