import React from 'react';
import {
  ShieldAlert,
  Mic,
  Activity,
  FileText,
  History,
  BookOpen,
  PhoneOff,
  Radio,
} from 'lucide-react';

export type MobileTab = 'monitor' | 'controls' | 'transcript' | 'investigation' | 'threatlogs' | 'resources';

interface MobileNavBarProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  isStreaming: boolean;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  threatLogsCount: number;
  onEmergencyHangup: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  onChangeTab,
  isStreaming,
  threatLevel,
  threatLogsCount,
  onEmergencyHangup,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E12]/92 backdrop-blur-2xl border-t border-white/[0.08] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.6)] select-none"
    >
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {/* Tab 1: Live 3D Monitor */}
        <button
          onClick={() => onChangeTab('monitor')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
            activeTab === 'monitor'
              ? 'text-white bg-white/[0.08]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="relative">
            <Radio
              className={`w-4 h-4 ${
                isStreaming
                  ? threatLevel === 'CRITICAL'
                    ? 'text-red-400 animate-pulse'
                    : 'text-[#FF4500]'
                  : activeTab === 'monitor'
                  ? 'text-white'
                  : 'text-neutral-400'
              }`}
            />
            {isStreaming && (
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                  threatLevel === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-[#FF4500]'
                }`}
              />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Monitor</span>
        </button>

        {/* Tab 2: Call Controls & Presets */}
        <button
          onClick={() => onChangeTab('controls')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
            activeTab === 'controls'
              ? 'text-white bg-white/[0.08]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Mic
            className={`w-4 h-4 ${
              activeTab === 'controls' ? 'text-[#FF4500]' : 'text-neutral-400'
            }`}
          />
          <span className="text-[10px] font-medium tracking-tight mt-1">Intercept</span>
        </button>

        {/* Emergency Hangup Quick Button when active call/stream */}
        {isStreaming ? (
          <button
            onClick={onEmergencyHangup}
            className="flex-none px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg shadow-red-600/40 border border-red-400/30 -mt-2 animate-bounce"
            title="Emergency Disconnect"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="text-[9px] font-bold tracking-wider uppercase">Hang Up</span>
          </button>
        ) : null}

        {/* Tab 3: Real-Time Transcript */}
        <button
          onClick={() => onChangeTab('transcript')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
            activeTab === 'transcript'
              ? 'text-white bg-white/[0.08]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText
            className={`w-4 h-4 ${
              activeTab === 'transcript' ? 'text-white' : 'text-neutral-400'
            }`}
          />
          <span className="text-[10px] font-medium tracking-tight mt-1">Transcript</span>
        </button>

        {/* Tab 4: DSP Investigations Pipeline */}
        <button
          onClick={() => onChangeTab('investigation')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
            activeTab === 'investigation'
              ? 'text-white bg-white/[0.08]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Activity
            className={`w-4 h-4 ${
              activeTab === 'investigation' ? 'text-[#FF4500]' : 'text-neutral-400'
            }`}
          />
          <span className="text-[10px] font-medium tracking-tight mt-1">Forensics</span>
        </button>

        {/* Tab 5: Historical Threat Logs */}
        <button
          onClick={() => onChangeTab('threatlogs')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all relative ${
            activeTab === 'threatlogs'
              ? 'text-white bg-white/[0.08]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="relative">
            <History
              className={`w-4 h-4 ${
                activeTab === 'threatlogs' ? 'text-amber-400' : 'text-neutral-400'
              }`}
            />
            {threatLogsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 rounded-full bg-red-600 text-white font-mono text-[8px] font-bold leading-tight">
                {threatLogsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Threat Logs</span>
        </button>
      </div>
    </nav>
  );
};
