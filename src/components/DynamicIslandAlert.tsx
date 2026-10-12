import React, { useEffect, useState, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  Bot,
  AlertTriangle,
  X,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Info,
  Mic,
} from 'lucide-react';
import { playSoftAlertChime, playAppleRingtone, stopAppleRingtone } from '../utils/audioSiren';
import { TelemetryPacket } from '../types';
import { getScamExplanation } from '../utils/scamDetails';

export interface IncomingCallData {
  callerName: string;
  phoneNumber: string;
  category?: string;
  isAiVoice?: boolean;
}

interface DynamicIslandAlertProps {
  packet: TelemetryPacket | null;
  incomingCall: IncomingCallData | null;
  callStartTime?: number | null;
  onAnswerCall: () => void;
  onDeclineCall: () => void;
  onEndCallNow: () => void;
  onDismiss: () => void;
}

export const DynamicIslandAlert: React.FC<DynamicIslandAlertProps> = ({
  packet,
  incomingCall,
  callStartTime = null,
  onAnswerCall,
  onDeclineCall,
  onEndCallNow,
  onDismiss,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const lastChimedThreatRef = useRef<string | null>(null);

  // Play ringtone while incoming call is ringing
  useEffect(() => {
    if (incomingCall) {
      playAppleRingtone();
    } else {
      stopAppleRingtone();
    }
    return () => {
      stopAppleRingtone();
    };
  }, [incomingCall]);

  // Live timer for active call in Dynamic Island
  useEffect(() => {
    if (!callStartTime) {
      setElapsedSeconds(0);
      return;
    }
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - callStartTime) / 1000)));
    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - callStartTime) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [callStartTime]);

  // Play gentle alert chime on new threat
  useEffect(() => {
    if (!packet) {
      lastChimedThreatRef.current = null;
      setIsExpanded(false);
      return;
    }

    if (packet.threat_level === 'CRITICAL' || packet.threat_level === 'SUSPICIOUS' || packet.forensics?.is_ai_voice) {
      const threatKey = `${packet.threat_level}-${packet.forensics?.is_ai_voice}-${packet.caller_info?.phone_number || ''}`;
      if (lastChimedThreatRef.current !== threatKey) {
        lastChimedThreatRef.current = threatKey;
        playSoftAlertChime();
      }
    }
  }, [packet]);

  // If neither an incoming call nor an active call packet is present, render nothing
  if (!incomingCall && !packet) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. INCOMING CALL RINGING STATE
  if (incomingCall) {
    return (
      <aside
        aria-label="Incoming Call Alert"
        className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-[94%] sm:w-auto transition-all duration-300 ease-out select-none"
      >
        <div className="relative overflow-hidden transition-all duration-300 ease-out bg-[#000000]/95 backdrop-blur-2xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(48,209,88,0.25)] rounded-full px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-3 sm:gap-4 min-w-[320px] sm:min-w-[420px]">
          {/* Subtle green rim glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#30D158]/70 to-transparent pointer-events-none" />

          {/* Left: Caller info & Animated Phone Icon */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#30D158]/20 border border-[#30D158]/40 text-[#30D158] shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-40" />
              <PhoneIncoming className="w-4 h-4 animate-pulse relative z-10" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {incomingCall.callerName}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                <span className="text-[#30D158] font-semibold animate-pulse">Incoming Call</span>
                <span>&middot;</span>
                <span className="truncate">{incomingCall.phoneNumber}</span>
              </span>
            </div>
          </div>

          {/* Right: Answer & Decline Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Decline Button */}
            <button
              onClick={onDeclineCall}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FF3B30] hover:bg-[#e03126] text-white text-xs font-bold transition-all shadow-md shadow-[#FF3B30]/30 active:scale-95 cursor-pointer"
              title="Decline call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Decline</span>
            </button>

            {/* Answer Button */}
            <button
              onClick={onAnswerCall}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#30D158] hover:bg-[#28b84d] text-white text-xs font-bold transition-all shadow-md shadow-[#30D158]/35 active:scale-95 animate-bounce cursor-pointer"
              title="Answer call to begin screening"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Answer</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // 2. ACTIVE CALL & THREAT ALERT STATE (Handles BOTH Safe calls and Threat calls)
  if (!packet) return null;

  const isAiVoice = packet.forensics?.is_ai_voice ?? false;
  const isSafe = packet.threat_level === 'SAFE';
  const isCritical = packet.threat_level === 'CRITICAL';
  const threatLevel = packet.threat_level || 'SAFE';

  const explanation = getScamExplanation(
    packet.intent,
    packet.caller_info?.name,
    packet.caller_info?.phone_number,
    isAiVoice,
    packet.transcript,
    threatLevel
  );

  const shadowGlow = isSafe
    ? 'shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(48,209,88,0.28)]'
    : isAiVoice
    ? 'shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(191,90,242,0.3)]'
    : 'shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,59,48,0.3)]';

  const rimColor = isSafe
    ? 'via-[#30D158]/75'
    : isAiVoice
    ? 'via-[#BF5AF2]/75'
    : 'via-[#FF3B30]/75';

  return (
    <aside
      aria-label="Dynamic Island Call Shield"
      className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-xl w-[94%] sm:w-auto transition-all duration-300 ease-out select-none"
    >
      <div
        className={`relative overflow-hidden transition-all duration-300 ease-out bg-[#000000]/95 backdrop-blur-2xl border border-white/20 ${shadowGlow} ${
          isExpanded
            ? 'rounded-[32px] p-4 sm:p-5 w-full sm:min-w-[480px]'
            : 'rounded-full px-3.5 sm:px-4 py-2 flex items-center gap-2.5 sm:gap-3'
        }`}
      >
        {/* Subtle top edge illumination */}
        <div
          className={`absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent ${rimColor} to-transparent pointer-events-none`}
        />

        {!isExpanded ? (
          /* Sleek Apple-style Pill (Collapsed) */
          <div className="flex items-center justify-between gap-2.5 sm:gap-3 w-full">
            {/* Left badge & tag preview with live call timer */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSafe ? 'bg-emerald-400' : isAiVoice ? 'bg-purple-400' : 'bg-red-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-full w-full ${
                    isSafe ? 'bg-[#30D158]' : isAiVoice ? 'bg-[#BF5AF2]' : 'bg-[#FF3B30]'
                  }`}
                />
              </span>

              {/* Call Timer pill */}
              {callStartTime && (
                <span className="text-[10px] font-mono font-bold text-neutral-300 px-1.5 py-0.5 rounded-full bg-white/[0.08] tabular-nums shrink-0">
                  {formatTimer(elapsedSeconds)}
                </span>
              )}

              <div className="flex items-center gap-1 font-sans min-w-0">
                {isSafe ? (
                  <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-400 font-mono tracking-tight shrink-0">
                    <ShieldCheck className="w-3 h-3 text-[#30D158]" />
                    <span>VERIFIED SAFE</span>
                  </span>
                ) : isAiVoice ? (
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
                <span className="text-[11px] sm:text-xs font-semibold text-white truncate max-w-[130px] sm:max-w-[210px]">
                  {packet.caller_info?.name || packet.intent || explanation.category}
                </span>
              </div>
            </div>

            {/* Right: Show Details & End Call Now Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Show Details Button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                title="Show call details and explanation"
              >
                <Info className="w-2.5 h-2.5 text-neutral-300" />
                <span>Show Details</span>
              </button>

              {/* End Call Now Button */}
              <button
                onClick={onEndCallNow}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-[#FF3B30] hover:bg-[#e03126] text-white text-[10px] sm:text-[11px] font-bold transition-all shadow-md shadow-[#FF3B30]/35 active:scale-95 shrink-0 cursor-pointer"
                title="Cut the call immediately"
              >
                <PhoneOff className="w-3 h-3" />
                <span>{isSafe ? 'End Call' : 'End Call Now'}</span>
              </button>

              <button
                onClick={onDismiss}
                className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss pill"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Fluid Expanded View (With Specific Threat/Safe Tag & Persuasive End Call Now CTA) */
          <div className="space-y-3.5 text-xs animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isSafe
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-[#30D158]'
                      : isAiVoice
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400'
                      : 'bg-red-500/20 border border-red-500/40 text-red-400'
                  }`}
                >
                  {isSafe ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <ShieldAlert className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-sans">
                    <span>
                      {isSafe ? 'Verified Legitimate Caller' : 'Critical Threat Intercepted'}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full font-mono text-[9px] font-semibold border ${
                        isSafe
                          ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                          : 'bg-red-500/25 text-red-300 border-red-500/30'
                      }`}
                    >
                      {threatLevel}
                    </span>
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Apple Dynamic Island Call Protection {callStartTime ? `· ${formatTimer(elapsedSeconds)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Collapse view"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={onDismiss}
                  className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 1. Specific Threat / Safe Tag & Identity */}
            <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  Verified Analysis &middot; Identity Tag
                </span>
                {isSafe ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-mono font-bold">
                    <ShieldCheck className="w-3 h-3 text-[#30D158]" />
                    <span>NATURAL HUMAN CADENCE</span>
                  </span>
                ) : isAiVoice ? (
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
                <span>
                  Caller: <strong className="text-neutral-200">{explanation.callerIdentity}</strong>
                </span>
                <span>{packet.caller_info?.phone_number || ''}</span>
              </div>
            </div>

            {/* Real-Time Speech Evidence Block (Derived directly from live transcription) */}
            {packet.transcript && (
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-300 font-semibold uppercase tracking-wider">
                    <Mic className="w-3 h-3 text-[#30D158]" />
                    <span>Live Spoken Evidence</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.08] text-neutral-300 font-mono">
                    REAL-TIME TRANSCRIPT
                  </span>
                </div>
                <p className="text-xs text-neutral-100 font-medium leading-relaxed">
                  "{packet.transcript}"
                </p>
              </div>
            )}

            {/* 2. Why They Are Explaining (Attacker Tactic or Legitimate Purpose) */}
            <div
              className={`p-3 rounded-2xl border space-y-1.5 ${
                isSafe
                  ? 'bg-emerald-950/20 border-emerald-500/25'
                  : 'bg-amber-950/20 border-amber-500/25'
              }`}
            >
              <span
                className={`text-[10px] font-mono uppercase tracking-wider font-semibold block ${
                  isSafe ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isSafe ? 'Call Purpose & Behavior' : 'Why They Are Calling · Attacker Tactic'}
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                {explanation.whyExplaining}
              </p>
              <div
                className={`text-[10px] font-mono pt-0.5 ${
                  isSafe ? 'text-emerald-300/80' : 'text-amber-300/80'
                }`}
              >
                Behavioral Analysis: {explanation.psychologicalTactic}
              </div>
            </div>

            {/* 3. Persuasive Recommendation: End Call Now or Safe Proceed */}
            <div
              className={`p-3.5 rounded-2xl border space-y-1.5 ${
                isSafe
                  ? 'bg-gradient-to-r from-emerald-950/30 to-black/60 border-emerald-500/35'
                  : 'bg-gradient-to-r from-red-950/40 to-black/60 border-red-500/40'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 font-bold text-xs font-sans ${
                  isSafe ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isSafe ? (
                  <ShieldCheck className="w-4 h-4 text-[#30D158] shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                )}
                <span>
                  {isSafe ? 'Safe Call Verified' : 'Urgent Action Required: Cut The Call Immediately'}
                </span>
              </div>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {explanation.recommendedAction}
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onEndCallNow}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#FF3B30] hover:bg-[#e03126] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF3B30]/35 active:scale-98 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>{isSafe ? 'End Call' : 'Cut Call Immediately'}</span>
              </button>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  onDismiss();
                }}
                className="py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-neutral-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
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
