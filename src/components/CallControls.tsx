import React, { useState, useRef } from 'react';
import {
  Mic,
  Square,
  Search,
  PhoneCall,
  Volume2,
  VolumeX,
  Bot,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  FileAudio,
  CheckCircle,
  Sparkles,
  Send,
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
  groqApiKey?: string;
  setGroqApiKey?: (key: string) => void;
  onUploadAudioFile: (file: File) => void;
  isAnalyzingAudioFile?: boolean;
  uploadedFileName?: string | null;
  onSimulateSpeech?: (text: string) => void;
}

export const REAL_SCAM_PRESETS: CallPreset[] = [
  {
    id: 'ai_voice_grandchild',
    title: 'AI Cloned Grandchild Bail',
    tagline: 'Deepfake AI Voice · Fabricated emergency bail demand',
    callerName: 'Private Number (AI Voice Clone)',
    phoneNumber: '+1 (212) 555-0143',
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
    title: 'IRS Federal Arrest Threat',
    tagline: 'Impersonating federal officers with immediate arrest threats',
    callerName: 'IRS Legal Enforcement (Spoofed)',
    phoneNumber: '+1 (800) 275-8777',
    category: 'Government Impersonation',
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
    title: 'Bank 2FA Passcode Theft',
    tagline: 'Stealing one-time authorization security passcodes',
    callerName: 'Chase Fraud Prevention (Spoofed)',
    phoneNumber: '+1 (888) 555-0199',
    category: 'Financial Wire Fraud',
    isAiVoice: false,
    expectedThreat: 'CRITICAL',
    ttsVoicePitch: 1.0,
    intentSummary: 'Attempting to harvest 6-digit one-time passcode (OTP) to finalize unauthorized international wire transfer.',
    dialogueLines: [
      'This is Chase automated fraud prevention. An urgent wire transfer of eight thousand four hundred fifty dollars to an offshore account was just flagged.',
      'To verify you did not authorize this wire and cancel the transaction immediately, we have sent a 6-digit authorization code to your mobile device.',
      'Please speak the 6-digit verification code aloud right now into the phone so we can block the funds before settlement.',
    ],
  },
  {
    id: 'safe_medical_clinic',
    title: 'Legitimate Doctor Appointment',
    tagline: 'Routine health check confirmation (Verified Safe baseline)',
    callerName: 'Westside Family Medicine',
    phoneNumber: '+1 (415) 555-2671',
    category: 'Legitimate Healthcare',
    isAiVoice: false,
    expectedThreat: 'SAFE',
    ttsVoicePitch: 1.05,
    intentSummary: 'Routine appointment confirmation with natural human vocal tone. Verified SAFE.',
    dialogueLines: [
      'Hi there, this is Rachel calling from Westside Family Medicine to confirm your routine check-up with Dr. Adams tomorrow morning at 10:15 AM.',
      'Please remember to bring your insurance card and a list of any current medications with you.',
      'If you need to reschedule or have any questions, please give our front desk a call. Have a wonderful day!',
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
  onUploadAudioFile,
  isAnalyzingAudioFile = false,
  uploadedFileName = null,
  onSimulateSpeech,
}) => {
  const [phoneInput, setPhoneInput] = useState('+18002758777');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [playAudioOutLoud, setPlayAudioOutLoud] = useState(true);
  const [customSpeechText, setCustomSpeechText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomSpeechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSpeechText.trim() || !onSimulateSpeech) return;
    onSimulateSpeech(customSpeechText.trim());
    setCustomSpeechText('');
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) return;
    setIsLookingUp(true);
    await onLookupNumber(phoneInput);
    setIsLookingUp(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAudioFile(file);
    }
  };

  return (
    <div className="space-y-3.5 select-none">
      {/* 1. Main Action Bar: Live Microphone & Speech Simulation */}
      <div className="liquid-tile p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Screening Controls
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Screen your live microphone or trigger incoming test calls
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Voice Toggle */}
            <button
              onClick={() => setPlayAudioOutLoud(!playAudioOutLoud)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all border ${
                playAudioOutLoud
                  ? 'bg-white/[0.08] border-white/20 text-neutral-200'
                  : 'bg-black/40 border-white/10 text-neutral-500'
              }`}
              title="Voice audio playback"
            >
              {playAudioOutLoud ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#30D158]" />
                  <span>Voice Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Muted</span>
                </>
              )}
            </button>

            {/* Microphone Screening Toggle */}
            <button
              onClick={isMicActive ? onStopMic : onStartMic}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                isMicActive
                  ? 'bg-[#FF3B30] hover:bg-[#e03126] text-white shadow-lg shadow-[#FF3B30]/30 animate-pulse'
                  : 'bg-white/[0.12] hover:bg-white/[0.2] text-white border border-white/20'
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
                  <span>Screen My Microphone</span>
                </>
              )}
            </button>

            {/* End Active Call Button (if preset call or screening is active) */}
            {isStreaming && !isMicActive && (
              <button
                onClick={onStopMic}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-[#FF3B30] hover:bg-[#e03126] text-white shadow-lg shadow-[#FF3B30]/35 active:scale-95 cursor-pointer transition-all"
                title="End current call immediately"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>End Active Call</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Speech Forensics Simulator (Test any spoken phrase with AI) */}
        <div className="mb-4 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#30D158]" />
              <span>Live Speech Forensics Simulator</span>
            </span>
            <span className="text-[10px] text-neutral-400">
              Type or test any custom spoken sentence
            </span>
          </div>

          <form onSubmit={handleCustomSpeechSubmit} className="flex gap-2">
            <input
              type="text"
              value={customSpeechText}
              onChange={(e) => setCustomSpeechText(e.target.value)}
              placeholder="Type any spoken phrase (e.g. 'Dr. Adams appointment' or 'IRS arrest warrant')..."
              className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              disabled={!customSpeechText.trim()}
              className="px-3 py-2 rounded-xl bg-[#30D158]/20 hover:bg-[#30D158]/30 text-[#30D158] font-semibold text-xs border border-[#30D158]/30 flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Simulate</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <button
              type="button"
              onClick={() => onSimulateSpeech?.('Hi, this is Westside Family Medicine confirming your routine appointment with Dr. Adams tomorrow morning at 10 AM.')}
              className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-colors cursor-pointer"
            >
              + Safe Clinic Visit
            </button>
            <button
              type="button"
              onClick={() => onSimulateSpeech?.('This is Officer Miller from the Internal Revenue Service. A federal arrest warrant has been issued, pay with settlement vouchers immediately.')}
              className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors cursor-pointer"
            >
              + IRS Warrant Extortion
            </button>
            <button
              type="button"
              onClick={() => onSimulateSpeech?.('Chase fraud alert: an unauthorized international wire transfer was flagged. Read the 6-digit passcode sent to your phone right now.')}
              className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors cursor-pointer"
            >
              + Bank OTP Theft
            </button>
            <button
              type="button"
              onClick={() => onSimulateSpeech?.('Grandma, please help! It is Tommy. I got into a bad car accident downtown and I am in jail, please send bail money.')}
              className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors cursor-pointer"
            >
              + AI Grandchild Bail
            </button>
          </div>
        </div>

        {/* 2. Simulation Test Scenarios (Clean Apple Tiles with Incoming Call Ringing) */}
        <div>
          <div className="text-[11px] font-medium text-neutral-400 mb-2">
            Incoming Test Scenarios (Dynamic Island Ringing):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {REAL_SCAM_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id && isStreaming;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset, playAudioOutLoud)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-white/[0.12] border-white/30 text-white shadow-md'
                      : 'bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:border-white/20 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white">
                      {preset.title}
                    </span>
                    {preset.isAiVoice ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold flex items-center gap-1">
                        <Bot className="w-2.5 h-2.5" />
                        <span>AI CLONE</span>
                      </span>
                    ) : preset.expectedThreat === 'CRITICAL' ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[9px] font-bold">
                        SCAM
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                        SAFE
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 line-clamp-1 mb-2">
                    {preset.tagline}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] text-neutral-400">
                    <span className="font-mono">{preset.phoneNumber}</span>
                    <span className="flex items-center gap-1 text-[#30D158] font-semibold">
                      <PhoneCall className="w-2.5 h-2.5" />
                      <span>Ring Call</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Upload Call Recording Section (Apple-style audio file detector) */}
      <div className="liquid-tile p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#30D158]" />
            <h3 className="text-xs font-semibold text-white tracking-tight">
              Upload Call Recording
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            MP3 &middot; WAV &middot; M4A &middot; AAC &middot; WEBM
          </span>
        </div>

        <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
          Upload recorded phone calls from your device storage to screen for deepfake AI voice synthesis, extortion scripts, and wire fraud patterns.
        </p>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Trigger Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-2xl border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-300 shrink-0">
              <FileAudio className="w-5 h-5 text-[#30D158]" />
            </div>
            <div>
              <div className="text-xs font-medium text-white">
                {uploadedFileName ? (
                  <span className="text-[#30D158] flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Loaded: {uploadedFileName}</span>
                  </span>
                ) : (
                  'Choose audio recording from storage'
                )}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {isAnalyzingAudioFile
                  ? 'Screening audio stream and extracting acoustic forensics...'
                  : 'Click or drop audio file here to start forensic detection'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-white/[0.1] hover:bg-white/[0.18] text-white text-xs font-semibold border border-white/10 transition-colors shrink-0"
          >
            {uploadedFileName ? 'Choose Another File' : 'Select Audio File'}
          </button>
        </div>
      </div>

      {/* 4. Phone Number Screening (Minimal Spotlight bar) */}
      <div className="liquid-tile p-4">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="Check a phone number (e.g. +1 800 275 8777)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white text-xs font-mono placeholder:text-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLookingUp}
            className="px-4 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <span>{isLookingUp ? 'Checking...' : 'Check Number'}</span>
          </button>
        </form>

        {/* Checked Caller Card */}
        {activeCaller && (
          <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs animate-fadeIn">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{activeCaller.name}</span>
                {activeCaller.spam_flag ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-[10px] font-bold border border-red-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span>HIGH RISK SCAM</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>VERIFIED SAFE</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                {activeCaller.phone_number} &middot; {activeCaller.carrier}
              </div>
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">Carrier Record</div>
          </div>
        )}
      </div>
    </div>
  );
};
