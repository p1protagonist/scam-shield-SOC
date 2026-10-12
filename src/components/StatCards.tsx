import React from 'react';
import { ShieldCheck, ShieldAlert, Bot, PhoneCall, Sparkles } from 'lucide-react';

interface StatCardsProps {
  totalScans: number;
  criticalCount: number;
  suspiciousCount: number;
  safeCount: number;
  aiVoiceCount: number;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isAiVoice: boolean;
  isStreaming: boolean;
  confidenceScore?: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalScans = 0,
  criticalCount = 0,
  threatLevel = 'SAFE',
  isAiVoice = false,
  isStreaming = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 select-none">
      {/* 1. Shield Protection Status */}
      <div className="liquid-tile p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              threatLevel === 'CRITICAL' && isStreaming
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : isStreaming
                ? 'bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {threatLevel === 'CRITICAL' && isStreaming ? (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-[11px] font-medium text-neutral-400">Call Shield</div>
            <div className="text-sm font-semibold text-white">
              {isStreaming
                ? threatLevel === 'CRITICAL'
                  ? 'Threat Detected'
                  : 'Screening Live Call'
                : 'Active & Protected'}
            </div>
          </div>
        </div>

        <span
          className={`w-2.5 h-2.5 rounded-full ${
            threatLevel === 'CRITICAL' && isStreaming
              ? 'bg-red-500 animate-ping'
              : isStreaming
              ? 'bg-[#FF4500] animate-pulse'
              : 'bg-emerald-500'
          }`}
        />
      </div>

      {/* 2. Live Threat Level / Voice Origin */}
      <div className="liquid-tile p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isAiVoice && isStreaming
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : threatLevel === 'CRITICAL' && isStreaming
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/[0.06] text-neutral-300 border border-white/10'
            }`}
          >
            {isAiVoice && isStreaming ? (
              <Bot className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-[11px] font-medium text-neutral-400">Voice & Intent</div>
            <div className="text-sm font-semibold text-white">
              {isStreaming ? (
                isAiVoice ? (
                  <span className="text-purple-300">AI Voice Clone</span>
                ) : threatLevel === 'CRITICAL' ? (
                  <span className="text-red-400">Scam Script</span>
                ) : (
                  <span className="text-emerald-300">Natural Human</span>
                )
              ) : (
                'Real-Time Analysis'
              )}
            </div>
          </div>
        </div>

        <span className="text-xs font-mono text-neutral-400">
          {isStreaming ? (threatLevel === 'CRITICAL' ? 'High Risk' : 'Normal') : 'Standby'}
        </span>
      </div>

      {/* 3. Calls Screened / Intercepts */}
      <div className="liquid-tile p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-300">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-neutral-400">Calls Screened</div>
            <div className="text-sm font-semibold text-white">
              {totalScans > 0 ? `${totalScans} Audio Chunks` : 'Ready to Screen'}
            </div>
          </div>
        </div>

        {criticalCount > 0 ? (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[11px] font-semibold">
            {criticalCount} Blocked
          </span>
        ) : (
          <span className="text-xs text-neutral-400 font-mono">0 Flags</span>
        )}
      </div>
    </div>
  );
};
