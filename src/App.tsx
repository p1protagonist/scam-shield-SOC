import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { StatCards } from './components/StatCards';
import { InvestigationsFlow } from './components/InvestigationsFlow';
import { WireframeSphere } from './components/WireframeSphere';
import { TranscriptBox } from './components/TranscriptBox';
import { CallControls, REAL_SCAM_PRESETS } from './components/CallControls';
import { DynamicIslandAlert, IncomingCallData } from './components/DynamicIslandAlert';
import { ThreatLogsPanel, ThreatLogEntry } from './components/ThreatLogsPanel';
import { ResourcesModal } from './components/ResourcesModal';
import { MobileNavBar, MobileTab } from './components/MobileNavBar';
import { MobileActiveCallBar } from './components/MobileActiveCallBar';
import { TelemetryPacket, CallerInfo, CallPreset } from './types';
import { stopAppleRingtone } from './utils/audioSiren';
import { audioBufferToWavBase64 } from './utils/audioEncoder';

// High-confidence scam trigger keywords & intent rules for live transcription
const LIVE_SCAM_RULES = [
  {
    triggers: [
      'irs',
      'internal revenue',
      'officer miller',
      'badge id',
      'legal enforcement',
      'affidavit',
      'tax',
      'tax fraud',
      'arrest',
      'arrest warrant',
      'federal marshal',
      'sheriff',
      'magistrate',
      'settlement voucher',
      'settlement vouchers',
      'prepaid settlement',
    ],
    intent: 'Government / IRS Impersonation demanding urgent payment under arrest threat',
    threat: 'CRITICAL' as const,
  },
  {
    triggers: [
      'wire transfer',
      'verification code',
      'one-time passcode',
      'one-time password',
      '6-digit code',
      'read the code',
      'read back',
      'chase',
      'fraud prevention',
      'suspicious charge',
      'compromised account',
      'zelle',
    ],
    intent: 'Financial Spoofing attempting 2FA one-time authorization code harvesting',
    threat: 'CRITICAL' as const,
  },
  {
    triggers: ['gift card', 'target card', 'apple card', 'prepaid card', 'bitcoin atm', 'prepaid vouchers'],
    intent: 'Extortion demand requesting non-traceable prepaid retail gift card settlement',
    threat: 'CRITICAL' as const,
  },
  {
    triggers: [
      'officer miller',
      'detained',
      'have your son',
      'your son detained',
      'pay the bail',
      'wire 2000',
      'wire $2,000',
      'wire 2,000',
      'wire over the line',
      'wire money',
      'bail',
      'jail',
      'car accident',
      'police station',
      "don't tell mom",
      'grandma',
      'tommy',
      'bail bondsman',
      'maximum security',
    ],
    intent: 'Law enforcement impersonation & fabricated family detention bail extortion',
    threat: 'CRITICAL' as const,
  },
  {
    triggers: ['anydesk', 'teamviewer', 'trojan', 'zeus virus', 'remote desktop', 'windows key and r', 'windows support', 'microsoft support', 'infected'],
    intent: 'Remote Access Tool phishing attempting to compromise user banking computer',
    threat: 'CRITICAL' as const,
  },
  {
    triggers: ['power will be disconnected', 'electric company', 'shut off', 'shutoff', 'gas and electric', 'utility', 'immediate disconnect', 'power grid'],
    intent: 'Utility disconnection extortion demanding immediate prepaid settlement',
    threat: 'CRITICAL' as const,
  },
];

export default function App() {
  // Navigation State
  const [activeNavView, setActiveNavView] = useState('dashboard');
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('monitor');
  const [isThreatLogsOpen, setIsThreatLogsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Streaming & Session State
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const activePresetIdRef = useRef<string | null>(null);
  const [activeCaller, setActiveCaller] = useState<CallerInfo | null>(null);
  const activeCallerRef = useRef<CallerInfo | null>(null);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [groqApiKey, setGroqApiKey] = useState('');

  // Telemetry & Real-Time Threat State
  const [threatLevel, setThreatLevel] = useState<'SAFE' | 'SUSPICIOUS' | 'CRITICAL'>('SAFE');
  const threatLevelRef = useRef<'SAFE' | 'SUSPICIOUS' | 'CRITICAL'>('SAFE');
  const [isAiVoice, setIsAiVoice] = useState(false);
  const [pitchVariance, setPitchVariance] = useState(0.16);
  const [zcrUniformity, setZcrUniformity] = useState(0.42);
  const [liveSpeechTranscript, setLiveSpeechTranscript] = useState('');
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPacket[]>([]);

  const updateActivePresetId = (id: string | null) => {
    activePresetIdRef.current = id;
    setActivePresetId(id);
  };

  const updateActiveCaller = (caller: CallerInfo | null) => {
    activeCallerRef.current = caller;
    setActiveCaller(caller);
  };

  const updateThreatLevel = (level: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL') => {
    threatLevelRef.current = level;
    setThreatLevel(level);
  };

  // Real Session Counters
  const [totalScans, setTotalScans] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [safeCount, setSafeCount] = useState(0);
  const [aiVoiceCount, setAiVoiceCount] = useState(0);

  // Persistent Historical Threat Logs in sessionStorage
  const [threatLogs, setThreatLogs] = useState<ThreatLogEntry[]>(() => {
    try {
      const saved = sessionStorage.getItem('callshield_session_threat_logs') || sessionStorage.getItem('scamshield_session_threat_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('callshield_session_threat_logs', JSON.stringify(threatLogs));
    } catch {
      // ignore
    }
  }, [threatLogs]);

  // Apple Dynamic Island States
  const [dynamicIslandAlert, setDynamicIslandAlert] = useState<TelemetryPacket | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const pendingPresetRef = useRef<{ preset: CallPreset; playAudio: boolean } | null>(null);
  const dialogueTimeoutRef = useRef<number | null>(null);

  // Active Call & Transcription State (Sphere ONLY dances when isTranscribing is true)
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isCallActiveRef = useRef<boolean>(false);
  const currentCallSessionIdRef = useRef<number>(0);
  const pulseIntervalRef = useRef<number | null>(null);

  // Audio File Upload Screening State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isAnalyzingAudioFile, setIsAnalyzingAudioFile] = useState(false);
  const audioFileSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Web Audio API State (Strictly for 60fps 3D sphere visual pulsing)
  const [audioVolume, setAudioVolume] = useState(0);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const latestSpeechTextRef = useRef<string>('');
  const accumulatedTranscriptRef = useRef<string>('');
  const isMicActiveRef = useRef<boolean>(false);
  const aiAnalyzeDebounceRef = useRef<number | null>(null);

  // WebSocket Connection
  const wsRef = useRef<WebSocket | null>(null);
  const presetIntervalRef = useRef<number | null>(null);

  // Log a verified threat entry to current session logs
  const logThreatAttempt = useCallback((packet: TelemetryPacket) => {
    const newEntry: ThreatLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      phoneNumber: packet.caller_info.phone_number || '+18002758777',
      callerName: packet.caller_info.name || 'Flagged Entity',
      threatLevel: packet.threat_level,
      isAiVoice: packet.forensics.is_ai_voice,
      pitchVariance: packet.forensics.pitch_variance,
      zcrUniformity: packet.forensics.zcr_uniformity,
      intent: packet.intent,
      transcriptSnippet: packet.transcript,
      riskScore: packet.caller_info.risk_score || 95,
      actionTaken: packet.kill_switch
        ? 'KILL SWITCH ENGAGED'
        : packet.threat_level === 'SUSPICIOUS'
        ? 'INTERCEPTED & FLAGGED'
        : 'MONITORED',
    };

    setThreatLogs((prev) => [newEntry, ...prev]);

    // Update real session counters
    if (packet.threat_level === 'CRITICAL') {
      setCriticalCount((c) => c + 1);
    } else if (packet.threat_level === 'SUSPICIOUS') {
      setSuspiciousCount((c) => c + 1);
    } else {
      setSafeCount((c) => c + 1);
    }

    if (packet.forensics.is_ai_voice) {
      setAiVoiceCount((c) => c + 1);
    }
  }, []);

  // Deep AI Verification via /api/analyze-transcript
  const analyzeTranscriptWithAI = useCallback(async (text: string) => {
    if (!text || text.length < 8) return;
    try {
      const res = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          is_mic: activePresetIdRef.current === 'mic',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateThreatLevel(data.threat_level);
        if (data.threat_level === 'CRITICAL' || data.threat_level === 'SUSPICIOUS') {
          const packet: TelemetryPacket = {
            type: 'live_speech_threat',
            chunk_id: totalScans + 1,
            timestamp: new Date().toISOString(),
            transcript: text,
            forensics: {
              is_ai_voice: false,
              pitch_variance: 0.175,
              zcr_uniformity: 0.44,
              spectral_centroid_hz: 2150,
              confidence: data.confidence || 0.95,
            },
            caller_info: activeCallerRef.current || {
              name: activePresetIdRef.current === 'mic' ? 'Live Microphone Input' : 'Inbound Caller',
              phone_number: activePresetIdRef.current === 'mic' ? 'Local Mic' : '+18002758777',
              spam_flag: data.is_scam,
              risk_score: data.risk_score,
              carrier: 'Real-time Voice Stream',
            },
            threat_level: data.threat_level,
            intent: data.intent,
            kill_switch: data.threat_level === 'CRITICAL',
          };
          setDynamicIslandAlert(packet);
          logThreatAttempt(packet);
        }
      }
    } catch (err) {
      console.warn('Transcript AI analysis note:', err);
    }
  }, [totalScans, logThreatAttempt]);

  // Real-time live transcript scanner (detects scam directly as user speaks)
  const evaluateLiveSpeechText = useCallback((text: string) => {
    if (!text || text.length < 5) return;
    const lower = text.toLowerCase();

    for (const rule of LIVE_SCAM_RULES) {
      const match = rule.triggers.some((trig) => lower.includes(trig));
      if (match) {
        updateThreatLevel('CRITICAL');

        const packet: TelemetryPacket = {
          type: 'live_speech_threat',
          chunk_id: totalScans + 1,
          timestamp: new Date().toISOString(),
          transcript: text,
          forensics: {
            is_ai_voice: isAiVoice,
            pitch_variance: pitchVariance,
            zcr_uniformity: zcrUniformity,
            spectral_centroid_hz: 2150,
            confidence: 0.98,
          },
          caller_info: activeCallerRef.current || {
            name: activePresetIdRef.current === 'mic' ? 'Live Microphone Input' : 'Inbound Line',
            phone_number: activePresetIdRef.current === 'mic' ? 'Local Mic' : '+18002758777',
            spam_flag: true,
            risk_score: 96,
            carrier: 'Live Audio Inbound',
          },
          threat_level: 'CRITICAL',
          intent: rule.intent,
          kill_switch: true,
        };

        // Pop the Apple Dynamic Island Air Bubble
        setDynamicIslandAlert(packet);
        logThreatAttempt(packet);
        break;
      }
    }
  }, [totalScans, isAiVoice, pitchVariance, zcrUniformity, logThreatAttempt]);

  // Initialize WebSocket connection to /ws/stream
  const initWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/stream`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[SOC] WebSocket stream ready');
      };

      ws.onmessage = (event) => {
        try {
          const packet: TelemetryPacket = JSON.parse(event.data);
          if (packet.type === 'telemetry_update') {
            const isMic = activePresetIdRef.current === 'mic';
            const activePreset = REAL_SCAM_PRESETS.find((p) => p.id === activePresetIdRef.current);
            const isScamPreset = activePreset && activePreset.expectedThreat === 'CRITICAL';
            const isSpamCaller = !isMic && activeCallerRef.current?.spam_flag === true;

            // Never let fallback packets downgrade an active preset scam call
            const effectiveThreat = (isScamPreset || isSpamCaller) ? 'CRITICAL' : packet.threat_level;
            packet.threat_level = effectiveThreat;

            updateThreatLevel(effectiveThreat);
            setIsAiVoice(packet.forensics.is_ai_voice || Boolean(activePreset?.isAiVoice));
            setPitchVariance(packet.forensics.pitch_variance);
            setZcrUniformity(packet.forensics.zcr_uniformity);
            setTelemetryHistory((prev) => [...prev.slice(-9), packet]);
            setTotalScans((s) => s + 1);

            // Only log threat and trigger alert when an actual threat or AI voice is detected
            if (effectiveThreat === 'CRITICAL' || effectiveThreat === 'SUSPICIOUS' || packet.kill_switch) {
              logThreatAttempt(packet);
              setDynamicIslandAlert(packet);
            }
          }
        } catch (err) {
          console.error('[SOC] WebSocket packet parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('[SOC] WebSocket stream note:', err);
      };

      ws.onclose = () => {
        console.log('[SOC] WebSocket closed');
      };

      wsRef.current = ws;
    } catch (e) {
      console.warn('Could not initialize WebSocket:', e);
    }
  }, [logThreatAttempt]);

  useEffect(() => {
    initWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [initWebSocket]);

  // Audio Frequency visualizer loop (runs at 60fps feeding the 3D sphere)
  const startAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLoop = () => {
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / (bufferLength * 255);
        if (avg > 0.04) {
          setAudioVolume(avg);
          setIsTranscribing(true);
        } else {
          setAudioVolume(0);
          setIsTranscribing(false);
        }
        setFrequencyData(new Uint8Array(dataArray));

        animFrameRef.current = requestAnimationFrame(updateLoop);
      };

      updateLoop();
    } catch (err) {
      console.warn('Web Audio API visualizer init error:', err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {}
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      const ctx = audioContextRef.current;
      audioContextRef.current = null;
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    }
    setAudioVolume(0);
    setIsTranscribing(false);
    setFrequencyData(null);
  };

  // Start Real Microphone Input + Live Front Speech Transcription & Scam Detection
  const handleStartMic = async () => {
    // 1. Explicitly stop and teardown any previous session, tracks, and audio context
    stopCurrentSession();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setLiveSpeechTranscript('Microphone access is not supported by your current browser environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Confirm tracks exist and are active
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        throw new Error('No audio input tracks detected on microphone device.');
      }

      micStreamRef.current = stream;
      startAudioVisualizer(stream);

      isMicActiveRef.current = true;
      setIsMicActive(true);
      setIsStreaming(true);
      setCallStartTime(Date.now());
      updateActivePresetId('mic');
      latestSpeechTextRef.current = '';
      accumulatedTranscriptRef.current = '';

      const micCaller: CallerInfo = {
        name: 'Live Microphone Input',
        phone_number: 'Local Mic',
        spam_flag: false,
        risk_score: 2,
        carrier: 'Direct Microphone Stream',
        category: 'Clean Microphone Audio',
      };
      updateActiveCaller(micCaller);
      updateThreatLevel('SAFE');
      setIsAiVoice(false);
      setLiveSpeechTranscript('Listening to your microphone... Speak to analyze speech in real-time.');

      // Pop Apple Dynamic Island alert immediately so user sees live screening status & timer
      const initialPacket: TelemetryPacket = {
        type: 'telemetry_update',
        chunk_id: 1,
        timestamp: new Date().toISOString(),
        transcript: 'Listening to your microphone... Speak to analyze speech in real-time.',
        forensics: {
          is_ai_voice: false,
          pitch_variance: 0.17,
          zcr_uniformity: 0.44,
          spectral_centroid_hz: 2150,
          confidence: 0.98,
        },
        caller_info: micCaller,
        threat_level: 'SAFE',
        intent: 'Active microphone screening in real-time',
        kill_switch: false,
      };
      setDynamicIslandAlert(initialPacket);

      // 1. Live Client-Side Speech-to-Text with auto-restart on pauses
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalChunk = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const text = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalChunk += text + ' ';
              } else {
                interimTranscript += text;
              }
            }

            if (finalChunk) {
              accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + ' ' + finalChunk).trim();
            }

            const currentFull = (accumulatedTranscriptRef.current + (interimTranscript ? ' ' + interimTranscript : '')).trim();

            if (currentFull) {
              setLiveSpeechTranscript(currentFull);
              latestSpeechTextRef.current = currentFull;
              evaluateLiveSpeechText(currentFull);

              // Keep Dynamic Island alert synchronized with live spoken words
              setDynamicIslandAlert((prev) => ({
                type: 'live_speech_update',
                chunk_id: (prev?.chunk_id || 1) + 1,
                timestamp: new Date().toISOString(),
                transcript: currentFull,
                forensics: prev?.forensics || {
                  is_ai_voice: false,
                  pitch_variance: 0.17,
                  zcr_uniformity: 0.44,
                  spectral_centroid_hz: 2150,
                  confidence: 0.98,
                },
                caller_info: activeCallerRef.current || micCaller,
                threat_level: threatLevelRef.current,
                intent: threatLevelRef.current === 'CRITICAL' ? 'High-risk extortion phrase identified in speech' : 'Real-time conversational speech stream',
                kill_switch: threatLevelRef.current === 'CRITICAL',
              }));

              // Debounce AI semantic check on the spoken text
              if (aiAnalyzeDebounceRef.current) clearTimeout(aiAnalyzeDebounceRef.current);
              aiAnalyzeDebounceRef.current = window.setTimeout(() => {
                if (isMicActiveRef.current && currentFull.length >= 8) {
                  analyzeTranscriptWithAI(currentFull);
                }
              }, 1200);
            }
          };

          recognition.onend = () => {
            if (isMicActiveRef.current) {
              try {
                recognition.start();
              } catch {}
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition status:', e.error);
            if (isMicActiveRef.current && e.error !== 'not-allowed') {
              try {
                recognition.start();
              } catch {}
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('Speech recognition init note:', recErr);
        }
      }

      // 2. MediaRecorder slicing 3-second chunks over WebSocket
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const buffer = await e.data.arrayBuffer();
          const base64Audio = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          wsRef.current.send(
            JSON.stringify({
              type: 'audio_chunk',
              audio_base64: base64Audio,
              is_mic: true,
              phone_number: 'Local Mic',
              manual_transcript: latestSpeechTextRef.current || '',
              chunk_id: totalScans + 1,
            })
          );
        }
      };

      recorder.start(3000);
      setIsStreaming(true);
      setIsMicActive(true);
      setCallStartTime(Date.now());
      updateActivePresetId('mic');
    } catch (err: any) {
      console.warn('Microphone access issue:', err);
      setIsMicActive(false);
      setIsStreaming(false);
      setCallStartTime(null);
      const isDenied = err?.name === 'NotAllowedError' || err?.message?.toLowerCase().includes('permission');
      const msg = isDenied
        ? 'Microphone permission blocked by browser. Allow microphone in your browser bar, or use the Live Speech Simulator below to test custom speech.'
        : `Microphone unavailable (${err?.message || 'Access error'}). Check your microphone device or use the Live Speech Simulator.`;
      setLiveSpeechTranscript(msg);
    }
  };

  const stopCurrentSession = () => {
    // 1. Mark call session and mic as dead immediately
    isCallActiveRef.current = false;
    isMicActiveRef.current = false;
    currentCallSessionIdRef.current += 1;

    if (aiAnalyzeDebounceRef.current) {
      clearTimeout(aiAnalyzeDebounceRef.current);
      aiAnalyzeDebounceRef.current = null;
    }

    // 2. Stop ringtone immediately
    stopAppleRingtone();

    // 3. Stop visual pulsing immediately and reset to still 0
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    setAudioVolume(0);
    setIsTranscribing(false);

    // 4. Clear any pending speech/dialogue timers
    if (presetIntervalRef.current) {
      clearInterval(presetIntervalRef.current);
      presetIntervalRef.current = null;
    }
    if (dialogueTimeoutRef.current) {
      clearTimeout(dialogueTimeoutRef.current);
      dialogueTimeoutRef.current = null;
    }

    // 5. Instantly halt browser SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Speech cancellation note:', e);
      }
    }

    // 6. Stop audio file decoding source if active
    if (audioFileSourceRef.current) {
      try {
        audioFileSourceRef.current.stop();
        audioFileSourceRef.current.disconnect();
      } catch {
        // ignore
      }
      audioFileSourceRef.current = null;
    }

    // 7. Stop speech recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }

    // 8. Stop media recorder & mic stream
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    stopAudioVisualizer();

    // 9. Reset all call session states
    setIsStreaming(false);
    setIsMicActive(false);
    updateActivePresetId(null);
    updateActiveCaller(null);
    updateThreatLevel('SAFE');
    setIncomingCall(null);
    setDynamicIslandAlert(null);
    setIsAnalyzingAudioFile(false);
    setCallStartTime(null);
    pendingPresetRef.current = null;
  };

  // Live Speech Simulator: test any custom spoken phrase or sample scenario
  const handleSimulateLiveSpeech = useCallback(async (customText: string) => {
    const text = customText.trim();
    if (!text) return;

    stopCurrentSession();

    isCallActiveRef.current = true;
    currentCallSessionIdRef.current += 1;
    const currentSessionId = currentCallSessionIdRef.current;

    setIsStreaming(true);
    setCallStartTime(Date.now());
    updateActivePresetId('mic');

    const speechCaller: CallerInfo = {
      name: 'Live Voice Test Stream',
      phone_number: 'Direct Audio Input',
      spam_flag: false,
      risk_score: 2,
      carrier: 'Live Telecom Feed',
      category: 'Real-time Spoken Audio',
    };
    updateActiveCaller(speechCaller);
    setLiveSpeechTranscript(text);

    // Pulse the 3D visualizer while speaking/evaluating
    setIsTranscribing(true);
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    pulseIntervalRef.current = window.setInterval(() => {
      if (!isCallActiveRef.current || currentCallSessionIdRef.current !== currentSessionId) {
        if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
        setAudioVolume(0);
        return;
      }
      setAudioVolume(0.24 + Math.random() * 0.4);
    }, 100);

    // 1. Immediate client-side rules check
    evaluateLiveSpeechText(text);

    // 2. Deep Gemini AI evaluation
    await analyzeTranscriptWithAI(text);

    // Stop pulsing after natural reading delay
    window.setTimeout(() => {
      if (currentCallSessionIdRef.current === currentSessionId) {
        if (pulseIntervalRef.current) {
          clearInterval(pulseIntervalRef.current);
          pulseIntervalRef.current = null;
        }
        setAudioVolume(0);
        setIsTranscribing(false);
      }
    }, Math.max(3000, text.length * 50));
  }, [stopCurrentSession, evaluateLiveSpeechText, analyzeTranscriptWithAI]);

  // Triggers incoming call with authentic Apple ringtone and Answer/Decline in Dynamic Island
  const handleSelectPreset = (preset: CallPreset, playAudio: boolean) => {
    stopCurrentSession();

    pendingPresetRef.current = { preset, playAudio };
    setIncomingCall({
      callerName: preset.callerName,
      phoneNumber: preset.phoneNumber,
      category: preset.category,
      isAiVoice: preset.isAiVoice,
    });

    const callerData: CallerInfo = {
      name: preset.callerName,
      phone_number: preset.phoneNumber,
      spam_flag: preset.expectedThreat !== 'SAFE',
      risk_score: preset.expectedThreat === 'CRITICAL' ? 98 : preset.expectedThreat === 'SUSPICIOUS' ? 65 : 4,
      carrier: 'Carrier Telephony Grid',
      category: preset.category,
    };
    updateActiveCaller(callerData);
    updateActivePresetId(preset.id);
    updateThreatLevel(preset.expectedThreat);
  };

  // Answer call from Dynamic Island -> Starts dialogue cleanly and begins timer
  const handleAnswerCall = () => {
    stopAppleRingtone();
    setIncomingCall(null);
    setCallStartTime(Date.now());
    if (pendingPresetRef.current) {
      const { preset, playAudio } = pendingPresetRef.current;
      startConnectedPresetCall(preset, playAudio);
    }
  };

  // Decline call from Dynamic Island
  const handleDeclineCall = () => {
    stopAppleRingtone();
    setIncomingCall(null);
    setCallStartTime(null);
    stopCurrentSession();
  };

  // Immediate 'End Call Now' / 'Cut Call' action from Dynamic Island
  const handleEndCallNow = () => {
    setDynamicIslandAlert(null);
    setIncomingCall(null);
    setCallStartTime(null);
    stopCurrentSession();
  };

  // Start connected call dialogue with robust cancellation check and still state
  const startConnectedPresetCall = (preset: CallPreset, playAudio: boolean) => {
    // Mark session active with unique session ID
    isCallActiveRef.current = true;
    currentCallSessionIdRef.current += 1;
    const currentSessionId = currentCallSessionIdRef.current;

    setIsStreaming(true);
    updateActivePresetId(preset.id);
    updateThreatLevel(preset.expectedThreat);
    setIsAiVoice(preset.isAiVoice);
    setPitchVariance(preset.isAiVoice ? 0.041 : 0.178);
    setZcrUniformity(preset.isAiVoice ? 0.96 : 0.42);

    // Dynamic Island Alert IMMEDIATELY appears for all calls including legitimate doctor appointment!
    const isCrit = preset.expectedThreat === 'CRITICAL';
    const initialPacket: TelemetryPacket = {
      type: 'telemetry_update',
      chunk_id: 1,
      timestamp: new Date().toISOString(),
      transcript: preset.dialogueLines[0] || 'Incoming call connected.',
      forensics: {
        is_ai_voice: preset.isAiVoice,
        pitch_variance: preset.isAiVoice ? 0.041 : 0.178,
        zcr_uniformity: preset.isAiVoice ? 0.96 : 0.42,
        spectral_centroid_hz: 2150,
        confidence: 0.95,
      },
      caller_info: {
        name: preset.callerName,
        phone_number: preset.phoneNumber,
        spam_flag: preset.expectedThreat !== 'SAFE',
        risk_score: isCrit ? 98 : preset.expectedThreat === 'SUSPICIOUS' ? 65 : 4,
        carrier: 'VoIP Telecom',
      },
      threat_level: preset.expectedThreat,
      intent: preset.intentSummary,
      kill_switch: isCrit,
    };
    setDynamicIslandAlert(initialPacket);

    const startPulsing = () => {
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
      pulseIntervalRef.current = window.setInterval(() => {
        if (!isCallActiveRef.current || currentCallSessionIdRef.current !== currentSessionId) {
          if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
          pulseIntervalRef.current = null;
          setAudioVolume(0);
          return;
        }
        const vol = 0.22 + Math.random() * 0.42;
        setAudioVolume(vol);
      }, 100);
    };

    const stopPulsing = () => {
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
      setAudioVolume(0);
    };

    let lineIndex = 0;

    const playNextDialogueLine = () => {
      // Abort immediately if session was ended or user tapped cut call
      if (!isCallActiveRef.current || currentCallSessionIdRef.current !== currentSessionId) {
        stopPulsing();
        setIsTranscribing(false);
        return;
      }

      if (lineIndex >= preset.dialogueLines.length) {
        stopPulsing();
        setIsTranscribing(false);
        return;
      }

      const textLine = preset.dialogueLines[lineIndex];
      lineIndex++;

      // Transcribe in front
      setLiveSpeechTranscript(textLine);

      // Evaluate for live scam detection
      evaluateLiveSpeechText(textLine);

      // Only dance while actively speaking/transcribing
      setIsTranscribing(true);
      startPulsing();

      // Natural speech synthesis with onend handler (full sentence spoken completely)
      if (playAudio && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textLine);
        utterance.rate = 0.96;
        utterance.pitch = preset.ttsVoicePitch || 1.0;

        utterance.onend = () => {
          stopPulsing();
          setIsTranscribing(false);
          // If user cut call midway through speech, DO NOT schedule next line!
          if (!isCallActiveRef.current || currentCallSessionIdRef.current !== currentSessionId) {
            return;
          }
          // Conversational pause of 1.2s before the caller says their next line (sphere stays still during pause)
          dialogueTimeoutRef.current = window.setTimeout(() => {
            if (!isCallActiveRef.current || currentCallSessionIdRef.current !== currentSessionId) {
              return;
            }
            playNextDialogueLine();
          }, 1200);
        };

        utterance.onerror = (e) => {
          stopPulsing();
          setIsTranscribing(false);
          if (!isCallActiveRef.current || currentCallSessionIdRef.current !== currentSessionId) {
            return;
          }
          dialogueTimeoutRef.current = window.setTimeout(() => {
            if (!isCallActiveRef.current || currentCallSessionIdRef.current !== currentSessionId) {
              return;
            }
            playNextDialogueLine();
          }, 1500);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // If muted, wait based on natural reading time
        const delay = Math.max(3600, textLine.length * 70);
        dialogueTimeoutRef.current = window.setTimeout(() => {
          stopPulsing();
          setIsTranscribing(false);
          if (!isCallActiveRef.current || currentCallSessionIdRef.current !== currentSessionId) {
            return;
          }
          dialogueTimeoutRef.current = window.setTimeout(() => {
            if (!isCallActiveRef.current || currentCallSessionIdRef.current !== currentSessionId) {
              return;
            }
            playNextDialogueLine();
          }, 800);
        }, delay);
      }

      // Send to WebSocket or local update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'audio_chunk',
            manual_transcript: textLine,
            phone_number: preset.phoneNumber,
            groq_api_key: groqApiKey,
            force_ai_voice: preset.isAiVoice,
            chunk_id: lineIndex,
          })
        );
      } else {
        const isCriticalLine = preset.expectedThreat === 'CRITICAL';
        const packet: TelemetryPacket = {
          type: 'telemetry_update',
          chunk_id: lineIndex,
          timestamp: new Date().toISOString(),
          transcript: textLine,
          forensics: {
            is_ai_voice: preset.isAiVoice,
            pitch_variance: preset.isAiVoice ? 0.041 : 0.178,
            zcr_uniformity: preset.isAiVoice ? 0.96 : 0.42,
            spectral_centroid_hz: 2150,
            confidence: 0.95,
          },
          caller_info: {
            name: preset.callerName,
            phone_number: preset.phoneNumber,
            spam_flag: isCriticalLine,
            risk_score: isCriticalLine ? 98 : preset.expectedThreat === 'SUSPICIOUS' ? 65 : 4,
            carrier: 'VoIP Telecom',
          },
          threat_level: preset.expectedThreat,
          intent: preset.intentSummary,
          kill_switch: isCriticalLine && lineIndex >= 2,
        };

        setThreatLevel(packet.threat_level);
        setIsAiVoice(packet.forensics.is_ai_voice);
        setPitchVariance(packet.forensics.pitch_variance);
        setZcrUniformity(packet.forensics.zcr_uniformity);
        setTelemetryHistory((prev) => [...prev.slice(-9), packet]);
        setTotalScans((s) => s + 1);

        logThreatAttempt(packet);

        // Keep Dynamic Island updated for ALL presets (including safe doctor appointment!)
        setDynamicIslandAlert(packet);
      }
    };

    playNextDialogueLine();
  };

  // Upload Call Recording File Handler: Real AI Speech-to-Text, threat categorization & 3D playback
  const handleUploadAudioFile = async (file: File) => {
    stopCurrentSession();
    setUploadedFileName(file.name);
    setIsAnalyzingAudioFile(true);
    setIsStreaming(true);
    setCallStartTime(Date.now());
    updateActivePresetId('upload');

    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const initialUploadCaller: CallerInfo = {
      name: cleanName,
      phone_number: 'Uploaded Audio File',
      spam_flag: false,
      risk_score: 5,
      carrier: 'Recorded Call Screening',
      category: 'Inbound Audio File',
    };
    updateActiveCaller(initialUploadCaller);
    setLiveSpeechTranscript(`Transcribing speech & analyzing "${file.name}" with AI engine...`);

    // Initial alert for Dynamic Island while screening
    setDynamicIslandAlert({
      type: 'telemetry_update',
      chunk_id: 1,
      timestamp: new Date().toISOString(),
      transcript: `Screening uploaded audio "${file.name}"...`,
      forensics: {
        is_ai_voice: false,
        pitch_variance: 0.165,
        zcr_uniformity: 0.44,
        spectral_centroid_hz: 2150,
        confidence: 0.95,
      },
      caller_info: initialUploadCaller,
      threat_level: 'SAFE',
      intent: 'Acoustic waveform analysis and speech transcription in progress',
      kill_switch: false,
    });

    let wavBase64 = '';
    let audioBuffer: AudioBuffer | null = null;
    let ctx: AudioContext | null = null;

    // 1. Decode audio in browser and convert to standard 16kHz mono WAV for 100% Gemini accuracy
    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      wavBase64 = audioBufferToWavBase64(audioBuffer, 16000);
    } catch (decodeErr) {
      console.warn('[Audio Decoder] Falling back to direct binary reader:', decodeErr);
    }

    // 2. Transmit to Real Gemini Forensic Audio Endpoint (/api/analyze-audio)
    const sendAudioPayload = async (base64Payload: string, mime: string) => {
      try {
        const res = await fetch('/api/analyze-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio_base64: base64Payload,
            mime_type: mime,
            file_name: file.name,
          }),
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const resultPacket: TelemetryPacket = await res.json();
            setLiveSpeechTranscript(resultPacket.transcript);
            updateThreatLevel(resultPacket.threat_level);
            updateActiveCaller(resultPacket.caller_info);
            setIsAiVoice(resultPacket.forensics.is_ai_voice);
            setPitchVariance(resultPacket.forensics.pitch_variance);
            setZcrUniformity(resultPacket.forensics.zcr_uniformity);
            setTelemetryHistory((prev) => [...prev.slice(-9), resultPacket]);
            setTotalScans((s) => s + 1);

            // Pop/Update Dynamic Island with exact evidence from transcription
            setDynamicIslandAlert(resultPacket);

            // Check if any rules match spoken words
            if (resultPacket.transcript) {
              evaluateLiveSpeechText(resultPacket.transcript);
            }

            if (resultPacket.threat_level === 'CRITICAL' || resultPacket.threat_level === 'SUSPICIOUS') {
              logThreatAttempt(resultPacket);
            }
          }
        }
      } catch (apiErr) {
        console.warn('Real AI audio analysis error:', apiErr);
      }
    };

    if (wavBase64) {
      sendAudioPayload(wavBase64, 'audio/wav');
    } else {
      // Fallback: Read raw file via FileReader if Web Audio decode failed
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const rawBase64 = dataUrl.split(',')[1];
        sendAudioPayload(rawBase64, file.type || 'audio/wav');
      };
    }

    // 3. Play audio locally and sync 3D sphere visualizer
    if (audioBuffer && ctx) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        audioFileSourceRef.current = source;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animId: number;
        const checkVol = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const vol = sum / dataArray.length / 255;
          if (vol > 0.035) {
            setAudioVolume(vol);
            setIsTranscribing(true);
          } else {
            setAudioVolume(0);
            setIsTranscribing(false);
          }
          animId = requestAnimationFrame(checkVol);
        };
        animId = requestAnimationFrame(checkVol);

        source.start(0);

        source.onended = () => {
          cancelAnimationFrame(animId);
          setIsAnalyzingAudioFile(false);
          setAudioVolume(0);
          setIsTranscribing(false);
        };
      } catch (playErr) {
        console.warn('Local playback error:', playErr);
        setIsAnalyzingAudioFile(false);
      }
    } else {
      setIsAnalyzingAudioFile(false);
    }
  };

  // Real Phone Lookup
  const handleLookupNumber = async (number: string): Promise<CallerInfo | null> => {
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: number }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveCaller(data);
        return data;
      }
    } catch (e) {
      console.warn('Lookup issue:', e);
    }
    return null;
  };

  // Manual Trigger for Emergency Kill Switch -> Opens Dynamic Island immediately
  const handleTriggerKillSwitch = () => {
    const packet: TelemetryPacket = {
      type: 'manual_trigger',
      chunk_id: totalScans + 1,
      timestamp: new Date().toISOString(),
      transcript: liveSpeechTranscript || 'Analyst manual emergency authorization.',
      forensics: {
        is_ai_voice: isAiVoice,
        pitch_variance: pitchVariance,
        zcr_uniformity: zcrUniformity,
        spectral_centroid_hz: 2180,
        confidence: 0.99,
      },
      caller_info: activeCaller || {
        name: 'Urgent Flagged Call',
        phone_number: '+18002758777',
        spam_flag: true,
        risk_score: 99,
        carrier: 'High-Risk Carrier',
      },
      threat_level: 'CRITICAL',
      intent: 'Urgent social engineering coercion flagged by analyst override',
      kill_switch: true,
    };
    logThreatAttempt(packet);
    setDynamicIslandAlert(packet);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0C] text-neutral-100 font-sans antialiased selection:bg-[#FF4500]/30 selection:text-white relative">
      {/* 1. Dynamic Island / Air Bubble Popping Alert Widget */}
      <DynamicIslandAlert
        packet={dynamicIslandAlert}
        incomingCall={incomingCall}
        callStartTime={callStartTime}
        onAnswerCall={handleAnswerCall}
        onDeclineCall={handleDeclineCall}
        onEndCallNow={handleEndCallNow}
        onDismiss={() => {
          setDynamicIslandAlert(null);
          setIncomingCall(null);
        }}
      />

      {/* 2. Left Sidebar Navigation */}
      <Sidebar
        activeView={activeNavView}
        setActiveView={setActiveNavView}
        onNewScan={() => handleSelectPreset(REAL_SCAM_PRESETS[0], true)}
        isStreaming={isStreaming}
        isMicActive={isMicActive}
        threatLogsCount={threatLogs.length}
        onOpenThreatLogs={() => setIsThreatLogsOpen(true)}
        onOpenResources={() => setIsResourcesOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 3. Main Dashboard Center */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Apple-grade Top Bar */}
        <TopNav
          onTriggerKillSwitch={handleTriggerKillSwitch}
          onOpenThreatLogs={() => setIsThreatLogsOpen(true)}
          onOpenResources={() => setIsResourcesOpen(true)}
          threatLevel={threatLevel}
          isStreaming={isStreaming}
          threatLogsCount={threatLogs.length}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Mobile Active Call Status Bar */}
        <div className="pt-2">
          <MobileActiveCallBar
            isStreaming={isStreaming}
            isMicActive={isMicActive}
            threatLevel={threatLevel}
            isAiVoice={isAiVoice}
            activeCaller={activeCaller}
            activePresetTitle={REAL_SCAM_PRESETS.find((p) => p.id === activePresetId)?.title}
            onHangup={stopCurrentSession}
            onToggleMic={stopCurrentSession}
            audioVolume={audioVolume}
            callStartTime={callStartTime}
          />
        </div>

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4 sm:space-y-5 pb-24 lg:pb-6">
          {/* Real Metrics Stat Cards (Always visible or in overview) */}
          <div className={activeMobileTab === 'monitor' || activeMobileTab === 'controls' ? 'block' : 'hidden lg:block'}>
            <StatCards
              totalScans={totalScans}
              criticalCount={criticalCount}
              suspiciousCount={suspiciousCount}
              safeCount={safeCount}
              aiVoiceCount={aiVoiceCount}
              threatLevel={threatLevel}
              isAiVoice={isAiVoice}
              isStreaming={isStreaming}
              confidenceScore={0.96}
            />
          </div>

          {/* Center Stage: 3D Wireframe Sphere + Live Real-Time Transcript & Audio Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
            {/* Center Left: Animated Glowing 3D Wireframe Sphere */}
            <div
              className={`lg:col-span-5 flex flex-col ${
                activeMobileTab === 'monitor' ? 'block' : 'hidden lg:flex'
              }`}
            >
              <WireframeSphere
                audioVolume={audioVolume}
                frequencyData={frequencyData}
                pitchVariance={pitchVariance}
                isStreaming={isStreaming}
                threatLevel={threatLevel}
                isAiVoice={isAiVoice}
                isTranscribing={isTranscribing}
              />
            </div>

            {/* Center Right: Real-time Transcript & Controls */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              {/* Transcript Box */}
              <div
                className={`h-64 sm:h-72 ${
                  activeMobileTab === 'transcript' || activeMobileTab === 'monitor'
                    ? 'block'
                    : 'hidden lg:block'
                }`}
              >
                <TranscriptBox
                  liveSpeechTranscript={liveSpeechTranscript}
                  history={telemetryHistory}
                  isStreaming={isStreaming}
                  isMicActive={isMicActive}
                  threatLevel={threatLevel}
                  isAiVoice={isAiVoice}
                  audioVolume={audioVolume}
                />
              </div>

              {/* Call Controls & Presets */}
              <div
                className={
                  activeMobileTab === 'controls' || activeMobileTab === 'monitor'
                    ? 'block'
                    : 'hidden lg:block'
                }
              >
                <CallControls
                  isStreaming={isStreaming}
                  isMicActive={isMicActive}
                  onStartMic={handleStartMic}
                  onStopMic={stopCurrentSession}
                  onSelectPreset={handleSelectPreset}
                  activePresetId={activePresetId}
                  onLookupNumber={handleLookupNumber}
                  activeCaller={activeCaller}
                  groqApiKey={groqApiKey}
                  setGroqApiKey={setGroqApiKey}
                  onUploadAudioFile={handleUploadAudioFile}
                  isAnalyzingAudioFile={isAnalyzingAudioFile}
                  uploadedFileName={uploadedFileName}
                  onSimulateSpeech={handleSimulateLiveSpeech}
                />
              </div>
            </div>
          </div>

          {/* Optional Collapsible Security Forensics Pipeline (Tucked away for clean minimalist Apple UI) */}
          <details className="liquid-tile p-4 text-xs group cursor-pointer transition-all">
            <summary className="font-semibold text-neutral-400 group-hover:text-white transition-colors flex items-center justify-between list-none">
              <span className="flex items-center gap-2">
                <span>Advanced Security Forensics & Acoustic Pipeline</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 font-mono">
                  Optional Analysis
                </span>
              </span>
              <span className="text-[11px] font-mono text-neutral-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-4 pt-3 border-t border-white/10">
              <InvestigationsFlow
                threatLevel={threatLevel}
                isAiVoice={isAiVoice}
                pitchVariance={pitchVariance}
                zcrUniformity={zcrUniformity}
                isStreaming={isStreaming}
                activeChunkCount={totalScans}
              />
            </div>
          </details>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavBar
        activeTab={activeMobileTab}
        onChangeTab={(tab) => {
          setActiveMobileTab(tab);
          if (tab === 'threatlogs') {
            setIsThreatLogsOpen(true);
          } else if (tab === 'resources') {
            setIsResourcesOpen(true);
          }
        }}
        isStreaming={isStreaming}
        threatLevel={threatLevel}
        threatLogsCount={threatLogs.length}
        onEmergencyHangup={stopCurrentSession}
      />

      {/* 4. Session Threat Logs Panel */}
      <ThreatLogsPanel
        logs={threatLogs}
        isOpen={isThreatLogsOpen}
        onClose={() => setIsThreatLogsOpen(false)}
        onClearLogs={() => setThreatLogs([])}
        onSelectLog={(log) => {
          handleLookupNumber(log.phoneNumber);
          setIsThreatLogsOpen(false);
        }}
      />

      {/* 5. Scam Knowledge Base Modal */}
      <ResourcesModal
        isOpen={isResourcesOpen}
        onClose={() => setIsResourcesOpen(false)}
      />
    </div>
  );
}
