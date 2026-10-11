import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface WireframeSphereProps {
  audioVolume: number;
  frequencyData?: Uint8Array | null;
  pitchVariance?: number;
  isStreaming: boolean;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isAiVoice: boolean;
}

export const WireframeSphere: React.FC<WireframeSphereProps> = ({
  audioVolume,
  frequencyData,
  pitchVariance = 0.15,
  isStreaming,
  threatLevel,
  isAiVoice,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'Default' | 'Advanced'>('Default');

  const sphereRef = useRef<THREE.Mesh | null>(null);
  const innerSphereRef = useRef<THREE.LineSegments | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const volumeRef = useRef(audioVolume);
  const pitchVarRef = useRef(pitchVariance);
  const threatLevelRef = useRef(threatLevel);
  const isAiVoiceRef = useRef(isAiVoice);

  useEffect(() => {
    volumeRef.current = audioVolume;
    pitchVarRef.current = pitchVariance;
    threatLevelRef.current = threatLevel;
    isAiVoiceRef.current = isAiVoice;
  }, [audioVolume, pitchVariance, threatLevel, isAiVoice]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Outer Icosahedron Wireframe
    const geometry = new THREE.IcosahedronGeometry(1.8, 3);
    const wireframeGeom = new THREE.WireframeGeometry(geometry);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const wireframeMesh = new THREE.LineSegments(wireframeGeom, lineMaterial);
    scene.add(wireframeMesh);
    innerSphereRef.current = wireframeMesh;

    // Node Vertex Cloud
    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute('position', geometry.attributes.position);

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffaa33,
      size: 0.045,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const pointsMesh = new THREE.Points(pointsGeom, pointsMaterial);
    scene.add(pointsMesh);
    pointsRef.current = pointsMesh;

    // Inner Resonating Core
    const coreGeom = new THREE.SphereGeometry(1.35, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    scene.add(coreMesh);
    sphereRef.current = coreMesh;

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const currentVol = volumeRef.current || 0;
      const currentPitchVar = pitchVarRef.current || 0.15;
      const currentAiVoice = isAiVoiceRef.current;
      const currentThreat = threatLevelRef.current;

      const pitchRateMultiplier = currentAiVoice || currentPitchVar < 0.08 ? 2.4 : 1.0;
      const rotationSpeed = (0.3 + currentVol * 1.8) * pitchRateMultiplier;

      if (innerSphereRef.current) {
        innerSphereRef.current.rotation.y += delta * rotationSpeed;
        innerSphereRef.current.rotation.x += delta * (rotationSpeed * 0.4);
      }
      if (pointsRef.current) {
        pointsRef.current.rotation.y += delta * rotationSpeed;
        pointsRef.current.rotation.x += delta * (rotationSpeed * 0.4);
      }
      if (sphereRef.current) {
        sphereRef.current.rotation.y -= delta * (rotationSpeed * 0.5);
      }

      const pulseAmplitude = currentVol * 0.75 + (currentAiVoice ? 0.1 : 0);
      const pulseFactor = 1.0 + pulseAmplitude;

      if (innerSphereRef.current) {
        innerSphereRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
      }
      if (pointsRef.current) {
        pointsRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
      }
      if (sphereRef.current) {
        const coreScale = 0.9 + pulseAmplitude * 0.6;
        sphereRef.current.scale.set(coreScale, coreScale, coreScale);
      }

      if (innerSphereRef.current) {
        const mat = innerSphereRef.current.material as THREE.LineBasicMaterial;
        if (currentThreat === 'CRITICAL') {
          mat.color.setHex(0xff1100);
          mat.opacity = 0.95;
        } else if (currentAiVoice || currentPitchVar < 0.08) {
          mat.color.setHex(0xff3300);
          mat.opacity = 0.85 + currentVol * 0.15;
        } else if (currentThreat === 'SUSPICIOUS') {
          mat.color.setHex(0xff6600);
          mat.opacity = 0.75;
        } else {
          mat.color.setHex(0xff8800);
          mat.opacity = 0.65 + currentVol * 0.3;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      wireframeGeom.dispose();
      lineMaterial.dispose();
      pointsGeom.dispose();
      pointsMaterial.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, []);

  const isUniformPitch = isAiVoice || pitchVariance < 0.08;
  const glowOpacity = Math.min(0.9, 0.2 + audioVolume * 0.7 + (isUniformPitch ? 0.3 : 0));
  const glowColor =
    threatLevel === 'CRITICAL'
      ? 'rgba(239, 68, 68, '
      : isUniformPitch
      ? 'rgba(255, 69, 0, '
      : 'rgba(245, 158, 11, ';

  return (
    <div className="liquid-tile relative flex flex-col items-center justify-center w-full py-4 px-3 sm:px-4 overflow-hidden shadow-xl">
      {/* Dynamic Audio-Reactive Glow Aura */}
      <div
        className="absolute w-64 sm:w-72 h-64 sm:h-72 rounded-full blur-3xl pointer-events-none transition-all duration-150"
        style={{
          backgroundColor: `${glowColor}${glowOpacity})`,
          transform: `scale(${1 + audioVolume * 0.5})`,
        }}
      />

      {/* Acoustic State Badge */}
      <div className="z-10 flex items-center gap-2 mb-1 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs text-neutral-300">
        <span
          className={`w-2 h-2 rounded-full transition-all duration-100 ${
            isStreaming
              ? threatLevel === 'CRITICAL'
                ? 'bg-red-500 animate-ping'
                : isUniformPitch
                ? 'bg-[#FF4500] animate-pulse'
                : 'bg-amber-400'
              : 'bg-neutral-500'
          }`}
        />
        <span className="font-mono text-[10px] sm:text-[11px] tracking-wider uppercase">
          {isStreaming
            ? isUniformPitch
              ? 'AI SYNTHETIC VOCODER // PITCH REGULARITY'
              : 'HUMAN HARMONIC RESONANCE // 16KHZ'
            : 'ACOUSTIC SENSOR // STANDBY'}
        </span>
      </div>

      {/* 3D Wireframe Canvas with responsive height */}
      <div
        ref={mountRef}
        className="relative w-full h-56 sm:h-72 flex items-center justify-center cursor-grab active:cursor-grabbing"
      />

      {/* Default / Advanced Segmented Selector */}
      <div className="z-10 flex items-center gap-1 p-1 mb-2.5 rounded-xl bg-black/60 border border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('Default')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'Default'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Default
        </button>
        <button
          onClick={() => setActiveTab('Advanced')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'Advanced'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Advanced Forensics
        </button>
      </div>

      {/* Status description */}
      <div className="z-10 text-center px-2 sm:px-4">
        <p className="text-xs sm:text-sm font-medium text-neutral-200">
          {threatLevel === 'CRITICAL'
            ? 'Critical Extortion Alert: Urgent Call Neutralization Protocol'
            : isUniformPitch && isStreaming
            ? 'Hyper-uniform pitch variance detected: Potential AI Voice Clone'
            : isStreaming
            ? 'Organic human pitch modulation detected (Natural Vocal Tract)'
            : 'Nice, no threats detected matching current parameters.'}
        </p>

        <p className="text-[10px] sm:text-xs text-neutral-400 mt-1 font-mono">
          {activeTab === 'Advanced'
            ? `Vol: ${(audioVolume * 100).toFixed(0)}% · Pitch Variance: ${pitchVariance.toFixed(
                3
              )} · Pulse Multiplier: ${isUniformPitch ? '2.4x (High Jitter)' : '1.0x (Organic)'}`
            : 'Continuous 3-second streaming spectrogram evaluation'}
        </p>
      </div>
    </div>
  );
};
