import React, { useState } from 'react';
import {
  Mic,
  Square,
  Search,
  Key,
  Play,
  Volume2,
  VolumeX,
  Bot,
} from 'lucide-react';
import { CallPreset, CallerInfo } from '../types';

interface CallControlsProps {
  isStreaming: boolean;
  isMicActive: boolean;
  onStartMic: () => void;
  onStopMic: () => void;
  onSelectPreset: (preset: CallPreset, playAudio: boolean) => void;
  activePresetId: string | null;
  onLookupNumber: (num: string) => Promise<CallerInfo | null>;
  activeCaller: CallerInfo | null;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
}

export const REAL_SCAM_PRESETS: CallPreset[] = [
  {
    id: 'ai_voice_grandchild',
    title: 'AI Cloned Grandchild Bail Extortion',
    tagline: 'Deepfake AI Voice Clone · Pitch Uniformity < 0.05',
    callerName: 'Private Number (Synthetic Voice Clone)',
    phoneNumber: '+12125550143',
    category: 'Deepfake Voice Cloning',
    isAiVoice: true,
    expectedThreat: 'CRITICAL',
    ttsVoicePitch: 0.95,
    intentSummary: 'Extortion using cloned AI voice of grandchild claiming urgent arrest & car accident bail.',
    dialogueLines: [
      "Grandma, please don't hang up! It's Tommy. I got into a really bad car accident in downtown and I'm sitting in jail right now.",
      "The public defender says if I don't post four thousand dollars bail before 5 PM they'll transfer me to maximum security.",
      "Please don't tell mom and dad, they'll kill me! The bail bondsman said you can wire the money or send it through Bitcoin right now. Please hurry!",
    ],
  },
  {
    id: 'irs_arrest_scam',
    title: 'IRS Federal Arrest Warrant Coercion',
    tagline: 'High-Pressure Government Impersonation',
    callerName: 'IRS Legal Enforcement Division (Spoofed)',
    phoneNumber: '+18002758777',
    category: 'Federal Impersonation',
    isAiVoice: false,
    expectedThreat: 'CRITICAL',
    ttsVoicePitch: 1.0,
    intentSummary: 'Coercive federal impostor demanding immediate prepaid card settlement under threat of same-day marshal arrest.',
    dialogueLines: [
      'This is Officer Miller badge ID 4921 calling from the Legal Enforcement Division of the Internal Revenue Service.',
      'A formal federal affidavit and arrest warrant have been signed by the magistrate judge for deliberate tax fraud on your file.',
      'Federal marshals are scheduled to dispatch to your physical home address in 40 minutes unless you settle the outstanding liability immediately with prepaid settlement vouchers.',
    ],
  },
  {
    id: 'bank_wire_otp',
    title: 'Chase Bank Fraud & OTP Token Hijack',
    tagline: 'Urgent Banking Spoofing & 2FA Harvesting',
    callerName: 'Chase Fraud Prevention Dept (Spoofed)',
    phoneNumber: '+18885550199',
    category: 'Financial Wire Fraud',
    isAiVoice: false,
    expectedThreat: 'CRITICAL',
    ttsVoicePitch: 1.0,
    intentSummary: 'Attempting to harvest 6-digit one-time passcode (OTP) to finalize unauthorized international wire transfer.',
    dialogueLines: [
      'This is Chase automated fraud prevention. An urgent wire transfer of eight thousand four hundred fifty dollars to an offshore account in Hong Kong was just flagged on your account.',
      'To verify you did not authorize this wire and cancel the transaction immediately, we have sent a 6-digit authorization code to your mobile device.',
      'Please speak the 6-digit verification code aloud right now into the phone so we can block the funds before settlement.',
    ],
  },
  {
    id: 'ceo_voice_clone',
    title: 'CEO Deepfake Wire Transfer Order',
    tagline: 'Synthetic Executive Voice · Corporate BEC Scam',
    callerName: 'Executive Office (Cloned Voice)',
    phoneNumber: '+13125550188',
    category: 'Executive Voice Deepfake',
    isAiVoice: true,
    expectedThreat: 'CRITICAL',
    ttsVoicePitch: 0.9,
    intentSummary: 'AI cloned executive voice instructing finance department to execute immediate confidential acquisition wire.',
    dialogueLines: [
      "Hey, it's David. I'm boarding a flight to London right now so I can only talk for thirty seconds. We have to close this strategic acquisition today.",
      "I need you to bypass normal vendor approval and wire three hundred and fifty thousand dollars to the escrow account details I just emailed you.",
      "Treat this as strictly confidential. Confirm as soon as the wire transfer reference number clears.",
    ],
  },
  {
    id: 'tech_support_virus',
    title: 'Microsoft Windows Security Trojan Extortion',
    tagline: 'Remote Access Tool Phishing & Ransom',
    callerName: 'Windows Certified Security (Spoofed)',
    phoneNumber: '+18005553456',
    category: 'Remote Access Scam',
    isAiVoice: false,
    expectedThreat: 'CRITICAL',
    ttsVoicePitch: 1.0,
    intentSummary: 'Urging victim to install AnyDesk/TeamViewer remote desktop software under false pretense of virus disinfection.',
    dialogueLines: [
      'Warning from Microsoft Security Center. We have detected malicious Trojan virus Zeus radiating from your Windows computer across the local network.',
      'Your online banking logins and passwords are actively transmitting to foreign servers.',
      'Press the Windows key and R right now, and download the secure remote support module at anydesk.com so our level 3 technician can lock down your hard drive.',
    ],
  },
  {
    id: 'safe_medical_clinic',
    title: 'Legitimate Medical Clinic Appointment',
    tagline: 'Organic Human Speech Baseline (SAFE Verification)',
    callerName: 'Westside Family Medicine',
    phoneNumber: '+14155552671',
    category: 'Legitimate Healthcare',
    isAiVoice: false,
    expectedThreat: 'SAFE',
    ttsVoicePitch: 1.05,
    intentSummary: 'Routine appointment confirmation with natural human vocal micro-inflection. Verified SAFE without false positive.',
    dialogueLines: [
      'Hi there, this is Rachel calling from Westside Family Medicine to confirm your routine check-up with Dr. Adams tomorrow morning at 10:15 AM.',
      'Please remember to bring your insurance card and a list of any current medications with you.',
      'If you need to reschedule or have any questions about parking, please give our front desk a call back at our direct clinic number. Have a wonderful day!',
    ],
  },
];

export const CallControls: React.FC<CallControlsProps> = ({
  isStreaming,
  isMicActive,
  onStartMic,
  onStopMic,
  onSelectPreset,
  activePresetId,
  onLookupNumber,
  activeCaller,
  groqApiKey,
  setGroqApiKey,
}) => {
  const [phoneInput, setPhoneInput] = useState('+18002758777');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [playAudioOutLoud, setPlayAudioOutLoud] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) return;
    setIsLookingUp(true);
    await onLookupNumber(phoneInput);
    setIsLookingUp(false);
  };

  return (
    <div className="space-y-4 select-none">
      {/* 1. Phone Number Search & Live Caller Lookup */}
      <div className="liquid-tile p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#FF4500]" />
            <h3 className="text-xs font-semibold text-white tracking-wide font-mono uppercase">
              Live Phone Lookup &middot; Truecaller API
            </h3>
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 text-[11px] font-mono border border-white/10 transition-colors"
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span>{groqApiKey ? 'Groq Whisper Active' : 'Configure Groq'}</span>
          </button>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Search phone number (e.g. +18002758777)..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white text-xs font-mono placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] transition-colors"
          />
          <button
            type="submit"
            disabled={isLookingUp}
            className="px-5 py-2.5 rounded-2xl bg-white/[0.1] hover:bg-white/[0.18] text-white text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 active:scale-98"
          >
            <span>{isLookingUp ? 'Searching...' : 'Search'}</span>
          </button>
        </form>

        {/* Live Caller Verification Result */}
        {activeCaller && (
          <div className="mt-3 p-3 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center justify-between text-xs animate-fadeIn">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-xs">{activeCaller.name}</span>
                {activeCaller.spam_flag ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-[10px] font-bold border border-red-500/30">
                    HIGH RISK ({activeCaller.risk_score}%)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/30">
                    CLEAN REPUTATION
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                {activeCaller.phone_number} &middot; {activeCaller.carrier} &middot; {activeCaller.category || 'General Inbound'}
              </div>
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">Verified Lookup</div>
          </div>
        )}
      </div>

      {/* 2. Audio Capture Stream & Presets Section */}
      <div className="liquid-tile p-4 sm:p-5">
        {/* Stream Header & Microphone Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Audio Intercept &middot; Live Mic or AI Presets
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Live microphone transcribes in front, or run realistic audio attack simulations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Voice Playback Toggle */}
            <button
              onClick={() => setPlayAudioOutLoud(!playAudioOutLoud)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-mono border transition-all ${
                playAudioOutLoud
                  ? 'bg-white/[0.08] border-white/20 text-white'
                  : 'bg-black/40 border-white/10 text-neutral-500'
              }`}
              title="Toggle audio voice synthesis for presets"
            >
              {playAudioOutLoud ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#FF4500]" />
                  <span>Audio Speech ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Muted</span>
                </>
              )}
            </button>

            {/* Microphone Toggle Button */}
            <button
              onClick={isMicActive ? onStopMic : onStartMic}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all active:scale-95 ${
                isMicActive
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 animate-pulse'
                  : 'bg-[#FF4500] hover:bg-[#e03d00] text-white shadow-lg shadow-[#FF4500]/25'
              }`}
            >
              {isMicActive ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Microphone</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Live Microphone</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Cards Grid (Responsive 1 col mobile, 2 col tablet, 3 col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {REAL_SCAM_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id && isStreaming;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset, playAudioOutLoud)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] ${
                  isSelected
                    ? 'bg-[#FF4500]/15 border-[#FF4500] text-white ring-1 ring-[#FF4500]/50 shadow-md'
                    : 'bg-white/[0.03] border-white/[0.06] text-neutral-300 hover:border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white truncate max-w-[170px]">
                    {preset.title}
                  </span>
                  {preset.isAiVoice ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/30 flex items-center gap-1">
                      <Bot className="w-2.5 h-2.5" />
                      <span>AI CLONE</span>
                    </span>
                  ) : preset.expectedThreat === 'CRITICAL' ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[9px] font-bold border border-red-500/30">
                      CRITICAL
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/30">
                      SAFE TEST
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-neutral-400 font-mono line-clamp-1 mb-2">
                  {preset.tagline}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.05] text-[10px] font-mono text-neutral-400">
                  <span>{preset.phoneNumber}</span>
                  <span className="flex items-center gap-1 text-[#FF4500] font-semibold">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Run Test</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Groq Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-tile w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Groq Cloud Integration</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-neutral-400 hover:text-white text-xs p-1"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Optionally enter a Groq API key to test with <code className="text-amber-300 font-mono">whisper-large-v3-turbo</code> transcription and <code className="text-amber-300 font-mono">llama-3.1-8b-instant</code>. Otherwise, the app seamlessly uses the pre-configured Gemini AI engine.
            </p>

            <input
              type="password"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#FF4500] mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setGroqApiKey('');
                  setShowKeyModal(false);
                }}
                className="px-3 py-2 text-neutral-400 hover:text-white text-xs"
              >
                Clear
              </button>
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-[#FF4500] hover:bg-[#e03d00] text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
