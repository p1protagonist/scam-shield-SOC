# AI Scam Call Analyzer — Cyber SOC & Forensics Command Center

A real-time cybersecurity Security Operations Center (SOC) dashboard backed by a **Python FastAPI backend with WebSockets** (`librosa` + `truecallerpy`) and a **Next.js / Tailwind CSS frontend**.

### Architecture Separation & Core Principles

- **Python FastAPI Backend**:
  - Exposes REST `/api/lookup` for caller identification and spam reputation via `truecallerpy`.
  - Exposes WebSocket `/ws/stream` for continuous 3-second base64 audio chunk ingestion.
  - Server-side acoustic digital signal processing (DSP) using `librosa` (`librosa.yin` / `piptrack` for pitch variance, `librosa.feature.zero_crossing_rate` for temporal harmonic uniformity). If pitch variance is unnaturally uniform ($< 0.085$) and ZCR uniformity is high ($> 0.82$), flags `is_ai_voice = True`.
  - Runs Groq (`whisper-large-v3-turbo` + `llama-3.1-8b-instant`) / Gemini semantic intent classification, outputting structured JSON (`threat_level`, `intent`, `kill_switch`).
- **Frontend Web Audio API (Strict Visual & Siren Boundary)**:
  - The client Web Audio API is used *strictly* to power real-time 60fps frequency spectrum visualization (driving the dynamic glow intensity, vertex pulse, and shudder rate of the Three.js 3D wireframe sphere) and to synthesize the acoustic alarm siren. No acoustic forensics computation runs on the frontend.
- **Persistent Threat Logs**: Session-persistent audit panel tracking all scam attempts with timestamps, severity levels, forensic metrics, and export actions.
- **Scam Defense Knowledge Base**: 'Resources & Learn More' directory with common scam types, red flags, best practices, and official cybersecurity reporting links (FTC, CISA, IC3, APWG).

---

### Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js / React)                          │
│                                                                             │
│  ┌───────────────────┐    ┌────────────────────┐    ┌────────────────────┐  │
│  │ Cyfocus Sidebar   │    │ 3D Wireframe Orb   │    │ Stat KPI Cards     │  │
│  │ (#FF4500 Button)  │    │ (Three.js WebGL)   │    │ & Threat Donut Ring│  │
│  └───────────────────┘    └────────────────────┘    └────────────────────┘  │
│            │                         ▲                         │            │
│            ▼                         │ Real-Time FFT (60fps)   ▼            │
│  ┌───────────────────┐    ┌────────────────────┐    ┌────────────────────┐  │
│  │ Threat Logs Panel │    │ Web Audio Analyser │    │ Investigations Flow│  │
│  │ (Session Storage) │    │ (Vis Only: Volume) │    │ Node Shimmer Cues  │  │
│  └───────────────────┘    └────────────────────┘    └────────────────────┘  │
│            │                         ▲                         │            │
│            ▼                         │ Mic Stream              ▼            │
│  ┌───────────────────┐    ┌────────────────────┐    ┌────────────────────┐  │
│  │ Resources Modal   │    │ MediaRecorder      │    │ Emergency HUD      │  │
│  │ (FTC, CISA, IC3)  │    │ (3s .webm slices)  │    │ (Strobe + Siren)   │  │
│  └───────────────────┘    └──────────┬─────────┘    └────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────▲────────────┘
                                       │                         │
                                       │ WebSocket: Audio Chunks │ JSON Telemetry
                                       ▼                         │
┌────────────────────────────────────────────────────────────────┴─────────────┐
│                    BACKEND (Python FastAPI + uvicorn)                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ /ws/stream (WebSocket Pipeline)                                       │  │
│  │                                                                       │  │
│  │  1. Librosa Acoustic Forensics (Server-Side In Memory):               │  │
│  │     • Pitch Variance: librosa.yin / piptrack (F0 micro-jitter)        │  │
│  │     • Zero-Crossing Rate: librosa.feature.zero_crossing_rate          │  │
│  │     • Spectral Centroid: librosa.feature.spectral_centroid            │  │
│  │     • Decision Flag: is_ai_voice = True/False                         │  │
│  │                                                                       │  │
│  │  2. Transcription Engine:                                             │  │
│  │     • Groq Whisper (whisper-large-v3-turbo) / Gemini 3.5 Transcribe   │  │
│  │                                                                       │  │
│  │  3. Semantic Intent Engine:                                           │  │
│  │     • Groq Llama 3.1 8B (llama-3.1-8b-instant) / Gemini 3.8 Flash    │  │
│  │     • Output: {"threat_level", "intent", "kill_switch"}               │  │
│  │                                                                       │  │
│  │  4. Broadcast Full Telemetry Packet to Client                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ /api/lookup (REST Endpoint)                                           │  │
│  │  • truecallerpy database & live caller reputation search              │  │
│  │  • Returns caller name, carrier, category, and spam score flag        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Telemetry Contracts
1. **WebSocket Inbound Payload**:
   ```json
   {
     "type": "audio_chunk",
     "chunk_id": 1,
     "audio_base64": "<base64_encoded_webm>",
     "phone_number": "+18002758777",
     "groq_api_key": "gsk_..."
   }
   ```
2. **WebSocket Outbound Telemetry**:
   ```json
   {
     "chunk_id": 1,
     "transcript": "This is Officer Miller from the IRS, there is an active warrant for your arrest...",
     "forensics": {
       "is_ai_voice": true,
       "pitch_variance": 0.041,
       "zcr_uniformity": 0.96,
       "spectral_centroid_hz": 2150
     },
     "caller_info": {
       "name": "IRS Legal Enforcement Division",
       "spam_flag": true,
       "risk_score": 98
     },
     "threat_level": "CRITICAL",
     "intent": "Impersonation of federal agent demanding immediate settlement",
     "kill_switch": true
   }
   ```
