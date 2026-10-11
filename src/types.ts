export interface ForensicsData {
  is_ai_voice: boolean;
  pitch_variance: number;
  zcr_uniformity: number;
  spectral_centroid_hz: number;
  confidence: number;
}

export interface CallerInfo {
  phone_number: string;
  name: string;
  spam_flag: boolean;
  risk_score: number;
  carrier: string;
  category?: string;
  verified_by?: string;
}

export interface TelemetryPacket {
  type: string;
  chunk_id: number;
  timestamp: string;
  transcript: string;
  forensics: ForensicsData;
  caller_info: CallerInfo;
  threat_level: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  intent: string;
  kill_switch: boolean;
}

export interface CallPreset {
  id: string;
  title: string;
  tagline: string;
  callerName: string;
  phoneNumber: string;
  category: string;
  isAiVoice: boolean;
  expectedThreat: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  intentSummary: string;
  ttsVoicePitch?: number; // Pitch setting for synthetic vocoder simulation (e.g. 0.85)
  dialogueLines: string[];
}
