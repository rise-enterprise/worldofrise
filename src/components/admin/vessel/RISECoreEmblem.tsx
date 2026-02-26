import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RISECoreEmblemProps {
  isActive?: boolean;
  isCrisis?: boolean;
  pulseIntensity?: number;
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

/* ── RISE diamond insignia shape ── */
function createRiseShape(): THREE.Shape {
  const s = new THREE.Shape();
  // Sharp diamond / chevron emblem
  s.moveTo(0, 1.0);
  s.lineTo(0.6, 0);
  s.lineTo(0.35, -0.15);
  s.lineTo(0, 0.4);
  s.lineTo(-0.35, -0.15);
  s.lineTo(-0.6, 0);
  s.closePath();
  return s;
}

/* ── Inner core facets ── */
function createInnerShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0.55);
  s.lineTo(0.3, 0.05);
  s.lineTo(0, 0.25);
  s.lineTo(-0.3, 0.05);
  s.closePath();
  return s;
}

export default function RISECoreEmblem({
  isActive = false,
  isCrisis = false,
  pulseIntensity = 0,
  isProcessing = false,
  isSpeaking = false,
}: RISECoreEmblemProps) {
  const emblemRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const particlesRef = useRef<THREE.Points>(null);
  const energyBeamRef = useRef<THREE.Mesh>(null);
  const waveRingRefs = useRef<(THREE.Mesh | null)[]>([]);

  const goldColor = new THREE.Color("#C8A24A");
  const crisisColor = new THREE.Color("#ff3333");
  const cyanColor = new THREE.Color("#00d4ff");
  const activeColor = new THREE.Color("#f0d878");

  const riseShape = useMemo(() => createRiseShape(), []);
  const innerShape = useMemo(() => createInnerShape(), []);

  // Particle field
  const particlePositions = useMemo(() => {
    const count = 300;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 2.5;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const baseColor = isCrisis ? crisisColor : goldColor;

    // Emblem float + reaction
    if (emblemRef.current) {
      const floatY = Math.sin(t * 0.8) * 0.08;
      const floatX = Math.sin(t * 0.5) * 0.02;
      emblemRef.current.position.y = 0.3 + floatY;
      emblemRef.current.position.x = floatX;
      // Subtle rotation
      emblemRef.current.rotation.z = Math.sin(t * 0.3) * 0.02;
    }

    // Core emblem material
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      const processingBoost = isProcessing ? 0.8 : 0;
      const speakingPulse = isSpeaking ? Math.sin(t * 8) * 0.4 : 0;
      const scale = 1 + pulseIntensity * 0.15 + Math.sin(t * 2) * 0.03 + (isProcessing ? Math.sin(t * 4) * 0.05 : 0);
      coreRef.current.scale.setScalar(scale);
      mat.emissiveIntensity = 1.2 + pulseIntensity * 2 + processingBoost + speakingPulse;
      mat.emissive.lerpColors(baseColor, activeColor, isActive ? 0.5 : 0);
    }

    // Inner facet
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshBasicMaterial;
      const glow = isActive || isProcessing ? 0.6 : 0.25;
      mat.opacity = glow + Math.sin(t * 3) * 0.1 + pulseIntensity * 0.3;
    }

    // Outer glow sphere
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      const speakGlow = isSpeaking ? 0.08 : 0;
      mat.opacity = 0.06 + pulseIntensity * 0.12 + Math.sin(t * 1.5) * 0.02 + speakGlow;
      const glowScale = 1.8 + pulseIntensity * 0.5 + (isProcessing ? 0.3 : 0);
      glowRef.current.scale.setScalar(glowScale);
    }

    // Orbital rings with varied behavior
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      if (i < 3) {
        // Orbital rings
        const speed = isProcessing ? 0.4 : 0.15;
        ring.rotation.x = t * (speed + i * 0.08);
        ring.rotation.y = t * (speed * 0.7 + i * 0.05);
        ring.rotation.z = i * Math.PI / 3;
      } else {
        // HUD arcs — faster when processing
        const speeds = [0.18, -0.12, 0.22, -0.15, 0.1, -0.08];
        const spd = speeds[i - 3] || 0.1;
        const processingMult = isProcessing ? 3 : 1;
        ring.rotation.z = t * spd * processingMult;
        // Pulse opacity for speaking
        if (isSpeaking) {
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.15 + Math.sin(t * 6 + i) * 0.08;
        }
      }
    });

    // Particle field
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.03;
      particlesRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.3 + pulseIntensity * 0.3;
    }

    // Energy beam (vertical — appears during processing)
    if (energyBeamRef.current) {
      const mat = energyBeamRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = isProcessing ? 0.15 + Math.sin(t * 5) * 0.08 : 0;
      mat.opacity += (targetOpacity - mat.opacity) * 0.1;
      energyBeamRef.current.scale.x = 1 + Math.sin(t * 8) * 0.2;
    }

    // Expanding wave rings (energy pulses)
    waveRingRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = (t * 0.5 + i * 0.33) % 1;
      const scale = 1 + phase * 5;
      ring.scale.setScalar(scale);
      const mat = ring.material as THREE.MeshBasicMaterial;
      mat.opacity = (isProcessing || isSpeaking) ? (1 - phase) * 0.12 : (1 - phase) * 0.03;
    });
  });

  const baseCol = isCrisis ? "#ff3333" : "#C8A24A";
  const accentCol = isCrisis ? "#ff4444" : "#00d4ff";

  return (
    <group ref={emblemRef}>
      {/* ── Core RISE Emblem ── */}
      <mesh ref={coreRef}>
        <shapeGeometry args={[riseShape]} />
        <meshStandardMaterial
          color={baseCol}
          emissive={baseCol}
          emissiveIntensity={1.2}
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner diamond facet */}
      <mesh ref={innerRef} position={[0, -0.05, 0.01]}>
        <shapeGeometry args={[innerShape]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial
          color={baseCol}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Orbital rings */}
      {[1.4, 1.9, 2.5].map((radius, i) => (
        <mesh
          key={`ring-${i}`}
          ref={(el) => { ringRefs.current[i] = el; }}
        >
          <torusGeometry args={[radius, 0.006, 8, 128]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? accentCol : baseCol}
            transparent
            opacity={0.25 - i * 0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* HUD arc segments — tactical display */}
      {[
        { radius: 2.9, arc: 0.5, color: accentCol, opacity: 0.18 },
        { radius: 3.3, arc: 0.3, color: baseCol, opacity: 0.14 },
        { radius: 3.7, arc: 0.45, color: accentCol, opacity: 0.1 },
        { radius: 4.1, arc: 0.2, color: baseCol, opacity: 0.08 },
        { radius: 4.5, arc: 0.35, color: accentCol, opacity: 0.06 },
        { radius: 4.9, arc: 0.15, color: baseCol, opacity: 0.05 },
      ].map((hud, i) => (
        <mesh
          key={`hud-arc-${i}`}
          ref={(el) => { ringRefs.current[3 + i] = el; }}
          rotation={[Math.PI / 2, 0, i * Math.PI / 3]}
        >
          <torusGeometry args={[hud.radius, 0.01, 4, 64, Math.PI * 2 * hud.arc]} />
          <meshBasicMaterial
            color={isCrisis ? "#ff4444" : hud.color}
            transparent
            opacity={hud.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Expanding energy wave rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={`wave-${i}`}
          ref={(el) => { waveRingRefs.current[i] = el; }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.3, 0]}
        >
          <torusGeometry args={[0.8, 0.015, 4, 64]} />
          <meshBasicMaterial
            color={accentCol}
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Vertical energy beam (processing indicator) */}
      <mesh ref={energyBeamRef} position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 20, 8]} />
        <meshBasicMaterial
          color={baseCol}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Micro particle field */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={300}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color={isCrisis ? "#ff6644" : "#C8A24A"}
          transparent
          opacity={0.3}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
