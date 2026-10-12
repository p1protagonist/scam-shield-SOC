import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WireframeSphereProps {
  audioVolume: number;
  frequencyData?: Uint8Array | null;
  pitchVariance?: number;
  isStreaming: boolean;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isAiVoice: boolean;
  isTranscribing?: boolean;
}

export const WireframeSphere: React.FC<WireframeSphereProps> = ({
  audioVolume,
  pitchVariance = 0.15,
  isStreaming,
  threatLevel,
  isAiVoice,
  isTranscribing = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const volumeRef = useRef(audioVolume);
  const pitchVarRef = useRef(pitchVariance);
  const threatLevelRef = useRef(threatLevel);
  const isAiVoiceRef = useRef(isAiVoice);
  const isTranscribingRef = useRef(isTranscribing);

  useEffect(() => {
    volumeRef.current = audioVolume;
    pitchVarRef.current = pitchVariance;
    threatLevelRef.current = threatLevel;
    isAiVoiceRef.current = isAiVoice;
    isTranscribingRef.current = isTranscribing;
  }, [audioVolume, pitchVariance, threatLevel, isAiVoice, isTranscribing]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

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
      color: 0x30d158,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const wireframeMesh = new THREE.LineSegments(wireframeGeom, lineMaterial);
    scene.add(wireframeMesh);

    // Inner Glowing Core Sphere
    const innerGeom = new THREE.SphereGeometry(1.1, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x30d158,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const innerSphere = new THREE.Mesh(innerGeom, innerMat);
    scene.add(innerSphere);

    // Subtle particles
    const particleCount = 70;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 0.4;
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    let animId: number;
    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const isTranscribingNow = isTranscribingRef.current;
      const currentVol = isTranscribingNow ? (volumeRef.current || 0) : 0;
      const currentThreat = threatLevelRef.current;
      const currentIsAi = isAiVoiceRef.current;

      // Color scheme based on state
      if (currentThreat === 'CRITICAL') {
        lineMaterial.color.setHex(0xff3b30); // Apple Red
        innerMat.color.setHex(0xff3b30);
        particleMat.color.setHex(0xff453a);
      } else if (currentIsAi) {
        lineMaterial.color.setHex(0xbf5af2); // Apple Purple
        innerMat.color.setHex(0xbf5af2);
        particleMat.color.setHex(0xda8fff);
      } else if (currentThreat === 'SUSPICIOUS') {
        lineMaterial.color.setHex(0xff9f0a); // Apple Amber
        innerMat.color.setHex(0xff9f0a);
        particleMat.color.setHex(0xffd60a);
      } else {
        lineMaterial.color.setHex(0x30d158); // Apple Green
        innerMat.color.setHex(0x30d158);
        particleMat.color.setHex(0x86efac);
      }

      // CRITICAL REQUIREMENT:
      // Must ONLY dance when actively transcribing something!
      // Otherwise, it must stay still (zero violent dancing, resting scale & position).
      if (isTranscribingNow && currentVol > 0.02) {
        // Active transcription: dance smoothly to audio volume
        const rotSpeed = 0.45 + currentVol * 1.8;
        wireframeMesh.rotation.x += delta * rotSpeed * 0.6;
        wireframeMesh.rotation.y += delta * rotSpeed;
        innerSphere.rotation.x -= delta * rotSpeed * 0.5;
        innerSphere.rotation.y += delta * rotSpeed * 0.7;
        particles.rotation.y -= delta * 0.2;

        const pulse = 1.0 + currentVol * 0.42;
        wireframeMesh.scale.set(pulse, pulse, pulse);
        innerSphere.scale.set(pulse * 0.9, pulse * 0.9, pulse * 0.9);
      } else {
        // Not transcribing: stay still!
        // Return scale smoothly to rest 1.0, no rotation, no violent bouncing
        const targetScale = 1.0;
        const currentScale = wireframeMesh.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * 0.15;
        wireframeMesh.scale.set(newScale, newScale, newScale);
        innerSphere.scale.set(newScale * 0.9, newScale * 0.9, newScale * 0.9);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      wireframeGeom.dispose();
      lineMaterial.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        try {
          container.removeChild(renderer.domElement);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const glowColor =
    threatLevel === 'CRITICAL'
      ? 'rgba(255,59,48,'
      : isAiVoice
      ? 'rgba(191,90,242,'
      : threatLevel === 'SUSPICIOUS'
      ? 'rgba(255,159,10,'
      : 'rgba(48,209,88,';

  return (
    <div className="liquid-tile p-5 flex flex-col items-center justify-between relative overflow-hidden select-none h-full min-h-[300px]">
      {/* Background radial glow */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          backgroundColor: `${glowColor}${isTranscribing ? 0.18 + audioVolume * 0.25 : 0.08})`,
          transform: `scale(${isTranscribing ? 1 + audioVolume * 0.35 : 1})`,
        }}
      />

      {/* Apple-style Call Protection Pill */}
      <div className="z-10 flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-neutral-200">
        <span
          className={`w-2 h-2 rounded-full ${
            threatLevel === 'CRITICAL' && isStreaming
              ? 'bg-red-500 animate-ping'
              : isAiVoice && isStreaming
              ? 'bg-purple-400 animate-pulse'
              : isTranscribing
              ? 'bg-emerald-400 animate-pulse'
              : isStreaming
              ? 'bg-emerald-500'
              : 'bg-neutral-500'
          }`}
        />
        <span className="font-medium text-[11px]">
          {threatLevel === 'CRITICAL' && isStreaming
            ? 'Scam Call Detected'
            : isAiVoice && isStreaming
            ? 'AI Voice Clone Flagged'
            : isTranscribing
            ? 'Transcribing Speech...'
            : isStreaming
            ? 'Call Screening Active'
            : 'Call Security Active'}
        </span>
      </div>

      {/* 3D Wireframe Canvas */}
      <div
        ref={mountRef}
        className="relative w-full h-52 sm:h-60 flex items-center justify-center"
      />

      {/* Plain English Verdict */}
      <div className="z-10 text-center px-4">
        <p className="text-xs sm:text-sm font-semibold text-white">
          {threatLevel === 'CRITICAL' && isStreaming
            ? 'High-Risk Fraud Attempt Detected'
            : isAiVoice && isStreaming
            ? 'Synthetic AI Voice Clone Detected'
            : isTranscribing
            ? 'Transcribing & analyzing live conversation...'
            : isStreaming
            ? 'Call connected & protected in real-time'
            : 'All incoming calls are protected in real-time'}
        </p>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          {isTranscribing
            ? 'Live acoustic waveform & linguistic analysis active'
            : isStreaming
            ? 'Listening for speech patterns'
            : 'Tap "Screen My Microphone" or test any scenario below'}
        </p>
      </div>
    </div>
  );
};
