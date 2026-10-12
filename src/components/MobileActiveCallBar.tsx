import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, Square, ShieldAlert, ShieldCheck, Bot, UserCheck, AlertTriangle } from 'lucide-react';
import { CallerInfo } from '../types';

interface MobileActiveCallBarProps {
  isStreaming: boolean;
  isMicActive: boolean;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isAiVoice: boolean;
  activeCaller: CallerInfo | null;
  activePresetTitle?: string;
  onHangup: () => void;
  onToggleMic: () => void;
  audioVolume: number;
  callStartTime?: number | null;
}

export const MobileActiveCallBar: React.FC<MobileActiveCallBarProps> = ({
  isStreaming,
  isMicActive,
  threatLevel,
  isAiVoice,
  activeCaller,
  activePresetTitle,
  onHangup,
  onToggleMic,
  callStartTime = null,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isStreaming || !callStartTime) {
      setElapsedSeconds(0);
      return;
    }

    // Set initial elapsed seconds immediately
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - callStartTime) / 1000)));

    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - callStartTime) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, callStartTime]);

  if (!isStreaming) return null;

  // Accurately determine threat status across all calls
  const isKnownScamCaller =
    activeCaller?.spam_flag === true ||
    (activeCaller?.risk_score !== undefined && activeCaller.risk_score >= 60) ||
    /scam|fake|spoofed|extortion|fraud|impersonat|arrest|warrant/i.test(activeCaller?.name || '') ||
    /scam|fake|spoofed|extortion|fraud|impersonat|arrest|warrant|bail|virus/i.test(activePresetTitle || '');

  const isCritical = threatLevel === 'CRITICAL' || isKnownScamCaller;
  const isSuspicious = !isCritical && (threatLevel === 'SUSPICIOUS' || (activeCaller?.risk_score !== undefined && activeCaller.risk_score >= 35));
  const isScreening = !isCritical && !isSuspicious && isMicActive;

  let statusBadgeText = 'VERIFIED SAFE';
  let statusBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let ambientClass = 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600';
  let avatarBgClass = 'bg-emerald-600 shadow-emerald-600/30';
  let timerBadgeClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
  let timerDotClass = 'bg-emerald-400 animate-pulse';

  if (isCritical) {
    statusBadgeText = isAiVoice ? 'AI CLONE' : 'SCAM';
    statusBadgeClass = isAiVoice
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';
    ambientClass = isAiVoice
      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-pulse'
      : 'bg-gradient-to-r from-red-600 via-orange-600 to-red-600 animate-pulse';
    avatarBgClass = isAiVoice ? 'bg-purple-600 shadow-purple-600/40' : 'bg-red-600 shadow-red-600/40';
    timerBadgeClass = 'bg-red-500/15 border-red-500/30 text-red-400';
    timerDotClass = 'bg-red-400 animate-ping';
  } else if (isSuspicious) {
    statusBadgeText = 'SUSPICIOUS';
    statusBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    ambientClass = 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600';
    avatarBgClass = 'bg-amber-600 shadow-amber-600/30';
    timerBadgeClass = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    timerDotClass = 'bg-amber-400 animate-pulse';
  } else if (isScreening) {
    statusBadgeText = 'SCREENING';
    statusBadgeClass = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    ambientClass = 'bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600';
    avatarBgClass = 'bg-blue-600 shadow-blue-600/30';
    timerBadgeClass = 'bg-sky-500/15 border-sky-500/30 text-sky-400';
    timerDotClass = 'bg-sky-400 animate-pulse';
  }

  // Format as mm:ss or hh:mm:ss like native iOS Phone
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="lg:hidden mx-3 mb-3 p-3.5 rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/15 shadow-2xl relative overflow-hidden animate-fadeIn select-none">
      {/* Top ambient threat illumination */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none transition-all ${ambientClass}`} />

      <div className="relative z-10 flex items-center justify-between gap-3">
        {/* Caller Avatar & Status with Apple Timer */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${avatarBgClass}`}
          >
            {isCritical ? (
              isAiVoice ? (
                <Bot className="w-5 h-5 animate-pulse" />
              ) : (
                <ShieldAlert className="w-5 h-5 animate-bounce" />
              )
            ) : isSuspicious ? (
              <AlertTriangle className="w-5 h-5" />
            ) : isScreening ? (
              <Mic className="w-5 h-5 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                {activeCaller?.name || activePresetTitle || (isMicActive ? 'Live Microphone' : 'Active Intercept')}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${statusBadgeClass}`}
              >
                {statusBadgeText}
              </span>
            </div>

            {/* Apple-style Persistent Real-Time Call Timer & Number */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border font-bold tabular-nums ${timerBadgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${timerDotClass}`} />
                <span>{formatTimer(elapsedSeconds)}</span>
              </span>
              <span className="text-neutral-500">&middot;</span>
              <span className="text-neutral-400 truncate max-w-[110px]">
                {activeCaller?.phone_number || (isMicActive ? 'Hardware Mic' : '+18002758777')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Mic Mute/Toggle + One-Tap Red Hang Up Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isMicActive && (
            <button
              onClick={onToggleMic}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
              title="Stop Microphone"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
            </button>
          )}

          <button
            onClick={onHangup}
            className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-lg shadow-red-600/40 text-xs font-bold transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
