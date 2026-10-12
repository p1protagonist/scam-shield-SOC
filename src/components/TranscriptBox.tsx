import React, { useRef, useEffect } from 'react';
import { Volume2, Mic, Bot, User, Sparkles } from 'lucide-react';
import { TelemetryPacket } from '../types';

interface TranscriptBoxProps {
  liveSpeechTranscript: string;
  history: TelemetryPacket[];
  isStreaming: boolean;
  isMicActive: boolean;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isAiVoice: boolean;
  audioVolume: number;
}

// High-confidence scam trigger keywords for live speech highlighting
const SCAM_TRIGGERS = [
  'irs',
  'arrest',
  'warrant',
  'gift card',
  'target card',
  'apple card',
  'wire transfer',
  'verification code',
  'one-time passcode',
  'one time password',
  '6-digit code',
  'read back the code',
  'read the code',
  'bail',
  'jail',
  'bitcoin',
  'anydesk',
  'teamviewer',
  'trojan',
  'zeus',
  'federal marshal',
  'immediate settlement',
  'police',
  'sheriff',
  'freeze your account',
  'four thousand dollars',
];

function highlightScamKeywords(text: string) {
  if (!text) return null;

  const pattern = new RegExp(
    `(${SCAM_TRIGGERS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isTrigger = SCAM_TRIGGERS.some((t) => t.toLowerCase() === part.toLowerCase());
    if (isTrigger) {
      return (
        <span
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-red-500/25 text-red-300 font-semibold border border-red-500/40 font-mono text-[11px] inline-block my-0.5"
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export const TranscriptBox: React.FC<TranscriptBoxProps> = ({
  liveSpeechTranscript,
  history,
  isStreaming,
  isMicActive,
  threatLevel,
  isAiVoice,
  audioVolume,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveSpeechTranscript, history]);

  const hasTriggerInLive = SCAM_TRIGGERS.some((t) =>
    liveSpeechTranscript.toLowerCase().includes(t.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full rounded-3xl bg-[#000000]/60 border border-white/[0.08] backdrop-blur-2xl overflow-hidden select-none shadow-xl">
      {/* Header bar */}
      <div className="px-4 sm:px-5 py-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-neutral-300" />
          <h3 className="text-xs font-semibold text-white tracking-tight">
            {isMicActive ? 'Live Microphone Transcript' : 'Conversation Transcript'}
          </h3>
        </div>

        {/* Subtle Apple Audio Bars */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 h-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-75 ${
                  audioVolume * 8 > i
                    ? threatLevel === 'CRITICAL'
                      ? 'bg-red-500'
                      : 'bg-white'
                    : 'bg-white/10'
                }`}
                style={{ height: `${Math.max(25, Math.min(100, (i + 1) * 16))}%` }}
              />
            ))}
          </div>

          <span className="text-[10px] text-neutral-400 font-mono">
            {isStreaming ? (isMicActive ? 'Mic Active' : 'Live Stream') : 'Standby'}
          </span>
        </div>
      </div>

      {/* Transcript Scrolling Body */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 space-y-2.5 overflow-y-auto max-h-[240px] font-sans text-xs"
      >
        {history.length === 0 && !liveSpeechTranscript ? (
          <div className="flex flex-col items-center justify-center h-28 text-neutral-500 text-center">
            <Mic className="w-5 h-5 mb-2 text-neutral-600 opacity-60" />
            <p className="text-xs font-medium text-neutral-300">
              Awaiting conversation audio
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Screening microphone or test call audio in real-time
            </p>
          </div>
        ) : (
          <>
            {history.map((entry, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  entry.threat_level === 'CRITICAL'
                    ? 'bg-red-950/25 border-red-500/30 text-red-100'
                    : entry.threat_level === 'SUSPICIOUS'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                    : 'bg-white/[0.04] border-white/[0.08] text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    {entry.forensics.is_ai_voice ? (
                      <span className="flex items-center gap-1 text-purple-400 font-semibold">
                        <Bot className="w-3 h-3" />
                        <span>AI VOICE CLONE</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neutral-300">
                        <User className="w-3 h-3" />
                        <span>CALLER</span>
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                      entry.threat_level === 'CRITICAL'
                        ? 'bg-red-500/25 text-red-300 border border-red-500/30'
                        : entry.threat_level === 'SUSPICIOUS'
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {entry.threat_level}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-neutral-100 font-normal">
                  "{highlightScamKeywords(entry.transcript)}"
                </p>

                {entry.intent && (
                  <div className="mt-1.5 pt-1.5 border-t border-white/[0.06] flex items-center gap-1 text-[10px] text-neutral-400">
                    <span className="font-semibold text-neutral-300">Pattern:</span>
                    <span className="truncate">{entry.intent}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Live speech transcribing right now in front */}
            {liveSpeechTranscript && (
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  hasTriggerInLive
                    ? 'bg-red-950/25 border-red-500/40 text-red-100'
                    : 'bg-white/[0.08] border-white/20 text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="flex items-center gap-1 font-bold">
                    <Mic className="w-3 h-3 animate-pulse text-[#FF3B30]" />
                    <span>
                      {hasTriggerInLive
                        ? 'SCAM PHRASE DETECTED IN LIVE SPEECH'
                        : 'LIVE SPEECH'}
                    </span>
                  </span>
                  <span className="text-[9px] opacity-80 font-mono">REAL-TIME</span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-100 font-medium">
                  "{highlightScamKeywords(liveSpeechTranscript)}"
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Clean Footer Bar */}
      <div className="px-4 sm:px-5 py-2 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-[11px] text-neutral-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-neutral-300" />
          <span>Real-time speech transcription & pattern detection</span>
        </span>
        <span className="font-mono text-[10px]">
          {isAiVoice ? (
            <span className="text-purple-300 font-semibold">AI Cloned Voice</span>
          ) : (
            <span className="text-emerald-400">Organic Speech</span>
          )}
        </span>
      </div>
    </div>
  );
};
