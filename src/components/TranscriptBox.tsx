import React, { useRef, useEffect } from 'react';
import { Volume2, Mic, Bot, User, ShieldAlert, Sparkles } from 'lucide-react';
import { TelemetryPacket } from '../types';

interface TranscriptBoxProps {
  liveSpeechTranscript: string;
  history: TelemetryPacket[];
  isStreaming: boolean;
  isMicActive: boolean;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isAiVoice: boolean;
  audioVolume: number;
  detectedKeywords?: string[];
}

// Scam trigger keywords for real-time live highlighting
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

  // Build regex matching triggers case-insensitively
  const pattern = new RegExp(`(${SCAM_TRIGGERS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
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

  // Check if live speech has any scam triggers
  const hasTriggerInLive = SCAM_TRIGGERS.some((t) =>
    liveSpeechTranscript.toLowerCase().includes(t.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full rounded-3xl bg-[#141418]/90 border border-white/[0.08] backdrop-blur-xl overflow-hidden select-none shadow-lg">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#FF4500]" />
          <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            {isMicActive ? 'Live Microphone Transcript' : 'Audio Stream & Live Transcription'}
          </h3>
        </div>

        {/* Audio Energy Levels */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 h-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-sm transition-all duration-75 ${
                  audioVolume * 10 > i
                    ? threatLevel === 'CRITICAL'
                      ? 'bg-red-500'
                      : 'bg-[#FF4500]'
                    : 'bg-white/10'
                }`}
                style={{ height: `${Math.max(25, Math.min(100, (i + 1) * 12))}%` }}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono text-neutral-400">
            {isStreaming ? (isMicActive ? 'MIC 16kHz' : 'STREAM 16kHz') : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Transcript Scrolling Body */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[220px] font-sans text-xs"
      >
        {history.length === 0 && !liveSpeechTranscript ? (
          <div className="flex flex-col items-center justify-center h-28 text-neutral-500 text-center">
            <Mic className="w-6 h-6 mb-2 text-neutral-600 opacity-60" />
            <p className="text-xs font-medium text-neutral-300">
              Microphone ready &bull; Awaiting speech or preset activation
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Speak into your mic to test real-time scam and AI voice detection
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
                    ? 'bg-orange-950/20 border-orange-500/30 text-orange-100'
                    : 'bg-white/[0.04] border-white/[0.06] text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    {entry.forensics.is_ai_voice ? (
                      <span className="flex items-center gap-1 text-purple-400 font-semibold">
                        <Bot className="w-3 h-3" />
                        <span>AI CLONED SYNTHETIC</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neutral-300">
                        <User className="w-3 h-3" />
                        <span>VOICE DETECTED</span>
                      </span>
                    )}
                    <span>&middot;</span>
                    <span className="text-neutral-500">Slice #{entry.chunk_id}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      entry.threat_level === 'CRITICAL'
                        ? 'bg-red-500/25 text-red-300 border border-red-500/30'
                        : entry.threat_level === 'SUSPICIOUS'
                        ? 'bg-orange-500/25 text-orange-300 border border-orange-500/30'
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
                  <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                    <span className="font-semibold text-neutral-300">Intent:</span>
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
                    ? 'bg-red-950/20 border-red-500/40 text-red-100'
                    : 'bg-[#FF4500]/10 border-[#FF4500]/40 text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="flex items-center gap-1 font-bold">
                    <Mic className="w-3 h-3 animate-pulse" />
                    <span>
                      {hasTriggerInLive
                        ? 'SCAM PATTERN RECOGNIZED IN LIVE SPEECH'
                        : 'LIVE SPEECH TRANSCRIBING'}
                    </span>
                  </span>
                  <span className="text-[9px] opacity-80">REAL-TIME</span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-100 font-medium">
                  "{highlightScamKeywords(liveSpeechTranscript)}"
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="px-5 py-2.5 border-t border-white/[0.06] bg-black/50 flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500">VOCAL JITTER:</span>
          <span className={`font-semibold ${isAiVoice ? 'text-purple-400' : 'text-emerald-400'}`}>
            {isAiVoice ? '0.041 (Hyper-Uniform AI)' : '0.178 (Natural Human)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500">AUDIO LEVEL:</span>
          <span className="text-neutral-200">
            {isStreaming ? `${(audioVolume * 100).toFixed(0)}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
};
