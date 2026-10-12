import React, { useEffect, useState, useRef } from 'react';
import { PhoneOff, Bot, AlertTriangle, X, ChevronUp, ShieldAlert, AlertOctagon, Info } from 'lucide-react';
import { playSoftAlertChime } from '../utils/audioSiren';
import { TelemetryPacket } from '../types';
import { getScamExplanation } from '../utils/scamDetails';

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
  const lastChimedThreatRef = useRef<string | null>(null);

  useEffect(() => {
    if (!packet) {
      lastChimedThreatRef.current = null;
      setIsExpanded(false);
      return;
    }

    // Only play gentle chime once per threat event, not on every rapid stream tick
    const threatKey = `${packet.threat_level}-${packet.forensics?.is_ai_voice}-${packet.caller_info?.phone_number || ''}`;
    if (lastChimedThreatRef.current !== threatKey) {
      lastChimedThreatRef.current = threatKey;
      playSoftAlertChime();
    }
  }, [packet]);

  if (!packet) return null;

  const isAiVoice = packet.forensics?.is_ai_voice ?? false;
  const threatLevel = packet.threat_level || 'CRITICAL';
  const explanation = getScamExplanation(
    packet.intent,
    packet.caller_info?.name,
    packet.caller_info?.phone_number,
    isAiVoice
  );

  return (
    <aside
      aria-label="Security threat notification"
      className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-xl w-[94%] sm:w-auto transition-all duration-300 ease-out select-none"
    >
      {/* Air Bubble / Dynamic Island Container */}
      <div
        className={`relative overflow-hidden transition-all duration-300 ease-out bg-[#000000]/95 backdrop-blur-2xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,59,48,0.3)] ${
          isExpanded
            ? 'rounded-3xl p-4 sm:p-5 w-full sm:min-w-[480px]'
            : 'rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3'
        }`}
      >
        {/* Subtle top edge illumination */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF3B30]/70 to-transparent pointer-events-none" />

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
                <span className="text-[11px] sm:text-xs font-semibold text-white truncate max-w-[130px] sm:max-w-[220px]">
                  {packet.intent || explanation.category}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 pl-1 sm:pl-2 shrink-0">
              {/* Details button: Toggles full Apple air bubble */}
              <button
                onClick={() => setIsExpanded(true)}
                className="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 flex items-center gap-1"
                title="View full threat explanation and details"
              >
                <Info className="w-2.5 h-2.5 text-neutral-300" />
                <span>Details</span>
              </button>

              {/* Cut call button */}
              <button
                onClick={onDisconnectCall}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-[#FF3B30] hover:bg-[#e03126] text-white text-[10px] sm:text-[11px] font-bold transition-all shadow-md shadow-[#FF3B30]/35 active:scale-95 shrink-0"
                title="Disconnect call immediately"
              >
                <PhoneOff className="w-3 h-3" />
                <span>Cut Call</span>
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
          /* Expanded Island Air Bubble View with full breakdown */
          <div className="space-y-3.5 text-xs animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-sans">
                    <span>Active Threat Intercepted</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/25 text-red-300 font-mono text-[9px] font-semibold border border-red-500/30">
                      {threatLevel}
                    </span>
                  </h4>
                  <p className="text-[10px] text-neutral-400">
                    Apple Dynamic Island Call Protection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Collapse view"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={onDismiss}
                  className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 1. What It Actually Is (Their Tag) */}
            <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  What It Actually Is &middot; Identity Tag
                </span>
                {isAiVoice ? (
                  <span className="flex items-center gap-1 text-[10px] text-purple-300 font-mono font-bold">
                    <Bot className="w-3 h-3" />
                    <span>SYNTHETIC AI VOICE CLONE</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-red-400 font-mono font-bold">
                    <AlertOctagon className="w-3 h-3" />
                    <span>SOCIAL ENGINEERING FRAUD</span>
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-white">
                {explanation.tag}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between pt-0.5">
                <span>Entity: <strong className="text-neutral-200">{explanation.callerIdentity}</strong></span>
                <span>{packet.caller_info?.phone_number || ''}</span>
              </div>
            </div>

            {/* 2. Why Are They Explaining (Their Tactic & Playbook) */}
            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/25 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
                Why They Are Calling &middot; Attacker Tactic
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                {explanation.whyExplaining}
              </p>
              <div className="text-[10px] text-amber-300/80 font-mono pt-0.5">
                Method: {explanation.psychologicalTactic}
              </div>
            </div>

            {/* 3. Urgent Action: Cut Call Immediately */}
            <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/35 space-y-1.5">
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs font-sans">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Recommendation: Cut the call immediately.</span>
              </div>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {explanation.recommendedAction}
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onDisconnectCall}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#FF3B30] hover:bg-[#e03126] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF3B30]/30 active:scale-98"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Cut Call Immediately</span>
              </button>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  onDismiss();
                }}
                className="py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-neutral-300 hover:text-white font-medium text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
