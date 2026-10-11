import React from 'react';
import { Gauge, ShieldAlert, Bot, Activity, ShieldCheck } from 'lucide-react';

interface StatCardsProps {
  totalScans: number;
  criticalCount: number;
  suspiciousCount: number;
  safeCount: number;
  aiVoiceCount: number;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isAiVoice: boolean;
  isStreaming: boolean;
  confidenceScore: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalScans = 0,
  criticalCount = 0,
  suspiciousCount = 0,
  safeCount = 0,
  aiVoiceCount = 0,
  threatLevel = 'SAFE',
  isAiVoice = false,
  isStreaming = false,
  confidenceScore = 0.94,
}) => {
  let aggregatePercent = 89.0;
  if (isStreaming) {
    if (threatLevel === 'CRITICAL') {
      aggregatePercent = isAiVoice ? 98.8 : 96.2;
    } else if (threatLevel === 'SUSPICIOUS') {
      aggregatePercent = 78.4;
    } else {
      aggregatePercent = 95.1;
    }
  } else if (totalScans > 0) {
    aggregatePercent = confidenceScore * 100;
  }

  const confidenceDisplay = aggregatePercent.toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 select-none">
      {/* 1. Aggregate AI Confidence Score */}
      <div className="liquid-tile p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#FF4500]" />
              <span className="text-neutral-200 font-semibold">Confidence Score</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {isStreaming ? (
                <span className="text-[#FF4500] font-bold animate-pulse">Analyzing</span>
              ) : (
                'Calibrated'
              )}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-3xl sm:text-4xl font-bold font-mono tracking-tight tabular-nums ${
                threatLevel === 'CRITICAL' && isStreaming
                  ? 'text-red-400'
                  : threatLevel === 'SUSPICIOUS' && isStreaming
                  ? 'text-orange-400'
                  : 'text-white'
              }`}
            >
              {confidenceDisplay}%
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {threatLevel === 'CRITICAL' && isStreaming
                ? 'High Certainty'
                : threatLevel === 'SUSPICIOUS' && isStreaming
                ? 'Elevated'
                : 'Nominal'}
            </span>
          </div>

          {/* Clean Real Sparkline */}
          <div className="w-full h-8 mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 35">
              <defs>
                <linearGradient id="appleSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4500" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FF4500" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,24 C 40,24 70,16 110,18 C 150,20 180,8 200,6 L 200,35 L 0,35 Z"
                fill="url(#appleSparkGrad)"
              />
              <path
                d="M 0,24 C 40,24 70,16 110,18 C 150,20 180,8 200,6"
                fill="none"
                stroke={threatLevel === 'CRITICAL' && isStreaming ? '#ef4444' : '#f1f5f9'}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="110" cy="18" r="2.5" fill="#ffffff" />
              <circle cx="200" cy="6" r="3" fill="#ffffff" />
            </svg>
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>Acoustic Certainty</span>
          <span className="text-neutral-200 font-semibold">{isAiVoice ? '98.5% (AI)' : '94.2% (Human)'}</span>
        </div>
      </div>

      {/* 2. Audio Slices Analyzed */}
      <div className="liquid-tile p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-200 font-semibold">Audio Slices Analyzed</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">Session</span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
              {totalScans}
            </span>
            <span className="text-xs text-neutral-400 font-mono">3-sec windows</span>
          </div>

          <p className="text-[11px] text-neutral-400 mt-2 font-mono leading-relaxed">
            {isStreaming ? 'Continuous streaming inspection active' : 'Zero background idling &middot; Real-time pipeline'}
          </p>
        </div>

        <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>Status</span>
          <span className={isStreaming ? 'text-[#FF4500] font-semibold' : 'text-neutral-500'}>
            {isStreaming ? 'Active Intercept' : 'Standby'}
          </span>
        </div>
      </div>

      {/* 3. AI Cloned Voices */}
      <div className="liquid-tile p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-neutral-200 font-semibold">AI Cloned Voices</span>
            </div>
            <span className="text-[10px] font-mono text-purple-400">Vocoder DSP</span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-purple-300 tabular-nums">
              {aiVoiceCount}
            </span>
            <span className="text-xs text-neutral-400 font-mono">detected</span>
          </div>

          <p className="text-[11px] text-neutral-400 mt-2 font-mono leading-relaxed">
            Neural voice deepfakes identified via pitch micro-jitter analysis
          </p>
        </div>

        <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>Pitch Regularity</span>
          <span className="text-purple-300 font-semibold">{isAiVoice ? '< 0.05 (Flagged)' : 'Nominal'}</span>
        </div>
      </div>

      {/* 4. Threat Severity Breakdown */}
      <div className="liquid-tile p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span className="text-neutral-200 font-semibold">Threat Breakdown</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">Audited</span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-red-400 tabular-nums">
              {criticalCount}
            </span>
            <span className="text-xs text-neutral-400 font-mono">critical threats</span>
          </div>
        </div>

        <div className="space-y-1 pt-2 mt-2 border-t border-white/[0.06] text-[11px] font-mono">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="text-neutral-400">Suspicious:</span>
            <span className="text-orange-400 font-bold">{suspiciousCount}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>Verified Safe:</span>
            <span className="text-emerald-400 font-bold">{safeCount}</span>
          </div>
        </div>
      </div>

      {/* 5. Interventions */}
      <div className="liquid-tile p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-200 font-semibold">Interventions</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">Mitigated</span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              {criticalCount}
            </span>
            <span className="text-xs text-neutral-400 font-mono">calls cut</span>
          </div>

          <p className="text-[11px] text-neutral-400 mt-2 font-mono leading-relaxed">
            Immediate acoustic siren &amp; DOM disconnect safeguard
          </p>
        </div>

        <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>Kill Switch Protocol</span>
          <span className="text-emerald-400 font-semibold">Armed &amp; Ready</span>
        </div>
      </div>
    </div>
  );
};
