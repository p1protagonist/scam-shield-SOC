import React, { useEffect, useState } from 'react';
import { PhoneOff, Bot, AlertTriangle, X, ChevronDown, ChevronUp, Sparkles, ShieldAlert } from 'lucide-react';
import { playSoftAlertChime } from '../utils/audioSiren';
import { TelemetryPacket } from '../types';

interface DynamicIslandAlertProps {
  packet: TelemetryPacket | null;
  onDismiss: () => void;
  onDisconnectCall: () => void;
}

export const DynamicIslandAlert: React.FC<DynamicIslandAlertProps> = ({
  packet,
  onDismiss,
  onDisconnectCall,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Play a gentle, discrete Apple-style notification chime on pop
    playSoftAlertChime();
  }, [packet]);

  if (!packet) return null;

  const isAiVoice = packet.forensics?.is_ai_voice ?? false;
  const threatLevel = packet.threat_level || 'CRITICAL';

  return (
    <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-xl w-[94%] sm:w-auto transition-all duration-300 ease-out select-none">
      {/* Air Bubble / Dynamic Island Container */}
      <div
        className={`relative overflow-hidden transition-all duration-300 ease-out bg-[#000000]/95 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,69,0,0.3)] ${
          isExpanded ? 'rounded-3xl p-4 sm:p-5 w-full sm:min-w-[460px]' : 'rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3'
        }`}
      >
        {/* Subtle orange/crimson edge illumination */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/60 to-transparent" />

        {!isExpanded ? (
          /* Compact Dynamic Island Pill */
          <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
            {/* Left badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-full w-full bg-red-500" />
              </span>

              <div className="flex items-center gap-1 font-sans min-w-0">
                {isAiVoice ? (
                  <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-purple-300 font-mono tracking-tight shrink-0">
                    <Bot className="w-3 h-3 text-purple-400" />
                    <span>AI CLONE</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-red-400 font-mono tracking-tight shrink-0">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span>SCAM</span>
                  </span>
                )}
                <span className="text-neutral-500 hidden sm:inline">&middot;</span>
                <span className="text-[11px] sm:text-xs font-semibold text-white truncate max-w-[120px] sm:max-w-[240px]">
                  {packet.intent || 'High-Risk Fraud Attempt'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 shrink-0">
              <button
                onClick={() => setIsExpanded(true)}
                className="hidden xs:inline-block px-2 sm:px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-[10px] sm:text-[11px] font-medium transition-all"
              >
                Details
              </button>

              <button
                onClick={onDisconnectCall}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-[#FF4500] hover:bg-[#e03d00] text-white text-[10px] sm:text-[11px] font-bold transition-all shadow-md shadow-[#FF4500]/30 active:scale-95 shrink-0"
              >
                <PhoneOff className="w-3 h-3" />
                <span>Cut</span>
              </button>

              <button
                onClick={onDismiss}
                className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
                title="Dismiss pill"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Expanded Island Air Bubble View */
          <div className="space-y-3.5 text-xs animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-sans">
                    <span>Active Scam Threat Intercepted</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 font-mono text-[9px]">
                      {threatLevel}
                    </span>
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Dynamic Island Security Shield
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                  title="Collapse"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={onDismiss} className="p-1 text-neutral-400 hover:text-white" title="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Fraud & Voice Tags */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <span className="text-[10px] text-neutral-500 block mb-0.5">VOICE ORIGIN</span>
                {isAiVoice ? (
                  <span className="text-purple-300 font-bold flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>SYNTHETIC AI CLONE</span>
                  </span>
                ) : (
                  <span className="text-neutral-200 font-medium">Human Social Engineering</span>
                )}
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <span className="text-[10px] text-neutral-500 block mb-0.5">ACOUSTIC JITTER</span>
                <span className="text-neutral-200 font-semibold">
                  {packet.forensics?.pitch_variance ?? 0.041} (Uniformity: {(packet.forensics?.zcr_uniformity ? packet.forensics.zcr_uniformity * 100 : 96).toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Detected Intent */}
            <div className="p-2.5 rounded-2xl bg-red-950/20 border border-red-500/25 text-neutral-200">
              <span className="text-[10px] text-red-400 font-mono block mb-0.5">DETECTED INTENT</span>
              <p className="text-xs text-neutral-100 font-medium">{packet.intent}</p>
            </div>

            {/* Caller identity */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1">
              <span>Caller: <strong className="text-white">{packet.caller_info?.name || 'Inbound Call'}</strong></span>
              <span>{packet.caller_info?.phone_number || ''}</span>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                onClick={onDisconnectCall}
                className="flex-1 py-2.5 rounded-2xl bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF4500]/25 active:scale-98"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Disconnect Call Immediately</span>
              </button>

              <button
                onClick={onDismiss}
                className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white font-medium text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
