import React, { useState } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Activity,
  MoveRight,
} from 'lucide-react';

interface InvestigationsFlowProps {
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isAiVoice: boolean;
  pitchVariance?: number;
  zcrUniformity?: number;
  isStreaming: boolean;
  activeChunkCount: number;
}

export const InvestigationsFlow: React.FC<InvestigationsFlowProps> = ({
  threatLevel,
  isAiVoice,
  pitchVariance = 0.15,
  zcrUniformity = 0.45,
  isStreaming,
  activeChunkCount,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const isCritical = threatLevel === 'CRITICAL';
  const isSuspicious = threatLevel === 'SUSPICIOUS';

  return (
    <div className="liquid-tile p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide font-sans">
            Investigations Flow
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Follow the flow of scam calls and alerts from Ingestion to resolution
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-[#FF4500] text-[11px] font-mono border border-[#FF4500]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500] animate-ping" />
              <span>PASS #{activeChunkCount || 1} &middot; DSP ACTIVE</span>
            </span>
          )}
          <span className="text-[11px] font-mono text-neutral-400">6 Stages &middot; Dynamic Routing</span>
        </div>
      </div>

      {/* Mobile horizontal swipe indicator */}
      <div className="sm:hidden flex items-center gap-1 text-[11px] font-mono text-neutral-400 mb-2">
        <MoveRight className="w-3.5 h-3.5 text-[#FF4500]" />
        <span>Swipe horizontally to view pipeline stages</span>
      </div>

      {/* Node Columns Horizontal Diagram with smooth touch scrolling */}
      <div className="overflow-x-auto pb-3 -mx-2 px-2 scroll-smooth">
        <div className="min-w-[920px] grid grid-cols-6 gap-3 relative text-xs">
          {/* Column 1: Ingestion */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
              Ingestion
            </div>

            <div
              onClick={() => setSelectedNode('Microsoft Sentinel VoIP SIP Logs')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isStreaming
                  ? 'bg-white/[0.08] border-white/20 shadow-md ring-1 ring-white/10'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-neutral-300">
                <span className="font-medium truncate">MSFT Sentinel</span>
                <span className="text-[10px] font-mono text-neutral-400 tabular-nums">55</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1 font-mono">VoIP SIP Logs</div>
            </div>

            <div
              onClick={() => setSelectedNode('Audio Stream Capture (3-Second Slices)')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isStreaming
                  ? 'bg-orange-500/15 border-orange-500/50 text-orange-200 shadow-[0_0_15px_rgba(255,69,0,0.15)]'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-white/15'
              }`}
            >
              {isStreaming && (
                <div className="absolute top-0 right-0 w-1.5 h-full bg-[#FF4500] animate-pulse" />
              )}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200 truncate flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FF4500]" />
                  <span>Audio Capture</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400 tabular-nums">35</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1 font-mono">
                {isStreaming ? 'Web Audio Slices' : 'MediaRecorder'}
              </div>
            </div>
          </div>

          {/* Column 2: Categorization */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
              Categorization
            </div>

            <div
              onClick={() => setSelectedNode('Voice Identity Classification')}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isAiVoice
                  ? 'bg-purple-500/25 border-purple-500/50 text-purple-200 font-semibold shadow-lg shadow-purple-900/30'
                  : 'bg-white/[0.03] border-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">Voice Identity</span>
                <span className="text-[10px] font-mono text-neutral-400 tabular-nums">26</span>
              </div>
              {isAiVoice && (
                <div className="text-[9px] text-purple-300 font-mono mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-purple-300 animate-spin" />
                  <span>Synthetic Cloned</span>
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between text-neutral-300">
                <span className="truncate">Telephony Inbound</span>
                <span className="text-[10px] font-mono text-neutral-400 tabular-nums">28</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between text-neutral-300">
                <span className="truncate">Cloud VoIP Gateway</span>
                <span className="text-[10px] font-mono text-neutral-400 tabular-nums">28</span>
              </div>
            </div>
          </div>

          {/* Column 3: Enrichment */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
              Enrichment
            </div>

            {/* Shimmering Feature Cue for Librosa Pitch DSP */}
            <div
              onClick={() => setSelectedNode('Librosa Pitch DSP (Autocorrelation YIN / Piptrack)')}
              className={`p-2 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isStreaming
                  ? isAiVoice
                    ? 'bg-gradient-to-r from-purple-950/70 via-purple-600/30 to-purple-950/70 border-purple-400 text-purple-200 ring-1 ring-purple-400/40'
                    : 'bg-gradient-to-r from-emerald-950/50 via-emerald-600/25 to-emerald-950/50 border-emerald-400/40 text-emerald-200'
                  : 'bg-white/[0.03] border-white/[0.06] text-neutral-300'
              }`}
            >
              {isStreaming && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-liquid-shimmer pointer-events-none" />
              )}
              <div className="flex items-center justify-between">
                <span className="truncate text-[11px] font-semibold">Librosa Pitch DSP</span>
                <span className="text-[9px] font-mono text-neutral-400 tabular-nums">26</span>
              </div>
              <div className="text-[9px] font-mono mt-0.5 opacity-90">
                Var: {pitchVariance.toFixed(3)} {isAiVoice ? '(Uniform)' : '(Natural)'}
              </div>
            </div>

            {/* ZCR Uniformity Check */}
            <div
              onClick={() => setSelectedNode('ZCR Uniformity (Zero-Crossing Rate Stability)')}
              className={`p-2 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isStreaming && zcrUniformity > 0.8
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-white/[0.03] border-white/[0.06] text-neutral-300'
              }`}
            >
              {isStreaming && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
              <div className="flex items-center justify-between">
                <span className="truncate text-[11px]">ZCR Uniformity</span>
                <span className="text-[9px] font-mono text-neutral-400 tabular-nums">12</span>
              </div>
              <div className="text-[9px] font-mono mt-0.5 text-neutral-400">
                {(zcrUniformity * 100).toFixed(0)}% Vocoder Flatness
              </div>
            </div>

            <div
              onClick={() => setSelectedNode('Truecaller Registry')}
              className="p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-neutral-300 cursor-pointer hover:border-white/15"
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-[11px]">Truecaller Registry</span>
                <span className="text-[9px] font-mono text-neutral-400 tabular-nums">16</span>
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-neutral-300">
              <div className="flex items-center justify-between">
                <span className="truncate text-[11px]">Anonymous VoIP IP</span>
                <span className="text-[9px] font-mono text-neutral-400 tabular-nums">14</span>
              </div>
            </div>
          </div>

          {/* Column 4: Agent Triage */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
              Agent Triage
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                isCritical || isSuspicious
                  ? 'bg-red-500/20 border-red-500/50 text-red-200 ring-1 ring-red-500/30'
                  : 'bg-white/[0.03] border-white/[0.06] text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Escalated</span>
              </div>
              <div className="text-xl font-bold font-mono mt-1 tabular-nums">
                {isCritical ? '1' : '0'}
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border transition-all ${
                !isCritical && !isSuspicious && isStreaming
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                  : 'bg-white/[0.03] border-white/[0.06] text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                <span>Not escalated</span>
              </div>
              <div className="text-xl font-bold font-mono mt-1 tabular-nums">1</div>
            </div>
          </div>

          {/* Column 5: Determination */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
              Determination
            </div>

            <div
              className={`p-2 rounded-2xl border transition-all ${
                isCritical
                  ? 'bg-red-500/30 border-red-500 text-white font-bold ring-1 ring-red-500/50 shadow-lg shadow-red-950/50'
                  : 'bg-white/[0.03] border-white/[0.06] text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="truncate">Malicious Scam</span>
                <span className="font-mono text-[9px] tabular-nums">{isCritical ? '1' : '0'}</span>
              </div>
            </div>

            <div
              className={`p-2 rounded-2xl border transition-all ${
                isSuspicious
                  ? 'bg-orange-500/25 border-orange-500 text-white font-semibold'
                  : 'bg-white/[0.03] border-white/[0.06] text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="truncate">Suspicious</span>
                <span className="font-mono text-[9px] tabular-nums">{isSuspicious ? '1' : '0'}</span>
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-neutral-400">
              <div className="flex items-center justify-between text-[11px]">
                <span className="truncate">Review Needed</span>
                <span className="font-mono text-[9px] tabular-nums">0</span>
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-neutral-400">
              <div className="flex items-center justify-between text-[11px]">
                <span className="truncate">Acceptable Risk</span>
                <span className="font-mono text-[9px] tabular-nums">0</span>
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-neutral-400">
              <div className="flex items-center justify-between text-[11px]">
                <span className="truncate">Mitigated</span>
                <span className="font-mono text-[9px] tabular-nums">1</span>
              </div>
            </div>
          </div>

          {/* Column 6: Status Pills */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
              Status
            </div>

            <div
              className={`flex items-center justify-between px-3 py-2 rounded-full border transition-all ${
                isCritical
                  ? 'bg-red-500/30 border-red-500 text-red-200 ring-2 ring-red-500/40 shadow-lg shadow-red-950/60'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="font-medium text-[11px]">Open [Critical]</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span className="font-medium text-[11px]">Open [High]</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
            </div>

            <div
              className={`flex items-center justify-between px-3 py-2 rounded-full border transition-all ${
                isSuspicious
                  ? 'bg-orange-500/30 border-orange-500 text-orange-200 ring-2 ring-orange-500/40'
                  : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                <span className="font-medium text-[11px]">Open [Medium]</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                <span className="font-medium text-[11px]">Open [Low]</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium text-[11px]">Closed</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Node Detail Popover */}
      {selectedNode && (
        <div className="mt-4 p-3 rounded-2xl bg-black/70 border border-white/10 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF4500]" />
            <span className="text-neutral-200 font-medium">Node Inspection: {selectedNode}</span>
            <span className="text-neutral-500">&middot;</span>
            <span className="text-neutral-400 font-mono">
              16kHz sampling &middot; Librosa DSP pipeline active
            </span>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-neutral-400 hover:text-white px-2 py-0.5 rounded text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
