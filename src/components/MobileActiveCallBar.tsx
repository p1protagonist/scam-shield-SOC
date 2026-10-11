import React from 'react';
import { PhoneOff, Mic, Square, ShieldAlert, Sparkles, Bot, UserCheck } from 'lucide-react';
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
  audioVolume,
}) => {
  if (!isStreaming) return null;

  const isCritical = threatLevel === 'CRITICAL';

  return (
    <div className="lg:hidden mx-3 mb-3 p-3.5 rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/15 shadow-2xl relative overflow-hidden animate-fadeIn select-none">
      {/* Top ambient threat illumination */}
      <div
        className={`absolute inset-0 opacity-20 pointer-events-none transition-all ${
          isCritical
            ? 'bg-gradient-to-r from-red-600 via-orange-600 to-red-600 animate-pulse'
            : isAiVoice
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600'
        }`}
      />

      <div className="relative z-10 flex items-center justify-between gap-3">
        {/* Caller Avatar & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
              isCritical
                ? 'bg-red-600 shadow-red-600/40'
                : isAiVoice
                ? 'bg-purple-600 shadow-purple-600/40'
                : 'bg-emerald-600 shadow-emerald-600/30'
            }`}
          >
            {isAiVoice ? (
              <Bot className="w-5 h-5 animate-pulse" />
            ) : isCritical ? (
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            ) : (
              <UserCheck className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">
                {activeCaller?.name || activePresetTitle || (isMicActive ? 'Live Microphone' : 'Active Intercept')}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                  isCritical
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : isAiVoice
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isCritical ? 'SCAM' : isAiVoice ? 'AI CLONE' : 'SECURE'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
              <span>{activeCaller?.phone_number || (isMicActive ? 'Hardware Mic' : '+18002758777')}</span>
              <span>&middot;</span>
              <span className="text-neutral-300 font-sans">
                Vol: {(audioVolume * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Mic Mute/Toggle + One-Tap Red Hang Up Button */}
        <div className="flex items-center gap-2 shrink-0">
          {isMicActive && (
            <button
              onClick={onToggleMic}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
              title="Stop Microphone"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          )}

          <button
            onClick={onHangup}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-lg shadow-red-600/40 text-xs font-bold transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
