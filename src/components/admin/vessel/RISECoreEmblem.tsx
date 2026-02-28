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

/* ── Data orbit particles — controlled, not chaotic ── */
function DataOrbitParticles({ isCrisis, pulseIntensity }: { isCrisis: boolean; pulseIntensity: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 2.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      vel[i * 3] = (Math.random() - 0.5) * 0.015;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      const dx = arr[ix], dy = arr[iy], dz = arr[iz];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const pull = 0.0008 + pulseIntensity * 0.002;

      arr[ix] += velocities[ix] - (dx / dist) * pull;
      arr[iy] += velocities[iy] - (dy / dist) * pull;
      arr[iz] += velocities[iz] - (dz / dist) * pull;

      const angle = 0.002 + pulseIntensity * 0.004;
      const nx = arr[ix] * Math.cos(angle) - arr[iz] * Math.sin(angle);
      const nz = arr[ix] * Math.sin(angle) + arr[iz] * Math.cos(angle);
      arr[ix] = nx;
      arr[iz] = nz;

      const newDist = Math.sqrt(arr[ix] ** 2 + arr[iy] ** 2 + arr[iz] ** 2);
      if (newDist < 0.7 || newDist > 5) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.5 + Math.random() * 2.5;
        arr[ix] = r * Math.sin(phi) * Math.cos(theta);
        arr[iy] = r * Math.sin(phi) * Math.sin(theta);
        arr[iz] = r * Math.cos(phi);
      }
    }
    posAttr.needsUpdate = true;
    ref.current.rotation.y = t * 0.015;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.2 + pulseIntensity * 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={isCrisis ? "#b84a4a" : "#C8A24A"}
        transparent
        opacity={0.2}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Rotating ring — mechanical elegance ── */
function TacticalRing({
  radius, color, speed, tiltX, tiltY, thickness = 0.006, opacity = 0.2, isProcessing,
}: {
  radius: number; color: string; speed: number; tiltX: number; tiltY: number;
  thickness?: number; opacity?: number; isProcessing?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const spd = isProcessing ? speed * 2.5 : speed;
    ref.current.rotation.x = tiltX + t * spd * 0.4;
    ref.current.rotation.y = tiltY + t * spd;
    ref.current.rotation.z = t * spd * 0.2;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 12, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Golden ripples (speaking response) ── */
function GoldenRipples({ isActive, isSpeaking }: { isActive: boolean; isSpeaking: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = (t * 0.35 + i * 0.3) % 1;
      const scale = 0.6 + phase * 3;
      ring.scale.setScalar(scale);
      const mat = ring.material as THREE.MeshBasicMaterial;
      const intensity = isSpeaking ? 0.12 : isActive ? 0.06 : 0.02;
      mat.opacity = (1 - phase) * intensity;
    });
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <torusGeometry args={[1, 0.008, 4, 96]} />
          <meshBasicMaterial
            color="#C8A24A"
            transparent
            opacity={0.02}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Waveform sphere (listening) ── */
function WaveformSphere({ isListening, pulseIntensity }: { isListening: boolean; pulseIntensity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const originalPositions = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry as THREE.SphereGeometry;
    const posAttr = geo.attributes.position;
    if (!originalPositions.current) originalPositions.current = new Float32Array(posAttr.array);

    const t = clock.getElapsedTime();
    const arr = posAttr.array as Float32Array;
    const orig = originalPositions.current;
    const targetScale = isListening ? 1.2 + pulseIntensity * 0.3 : 0.9;

    for (let i = 0; i < posAttr.count; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      const ox = orig[ix], oy = orig[iy], oz = orig[iz];
      if (isListening) {
        const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const wave = Math.sin(t * 5 + dist * 7) * 0.06 * pulseIntensity;
        const s = targetScale + wave;
        arr[ix] = ox * s; arr[iy] = oy * s; arr[iz] = oz * s;
      } else {
        arr[ix] += (ox * targetScale - arr[ix]) * 0.04;
        arr[iy] += (oy * targetScale - arr[iy]) * 0.04;
        arr[iz] += (oz * targetScale - arr[iz]) * 0.04;
      }
    }
    posAttr.needsUpdate = true;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = isListening ? 0.05 + pulseIntensity * 0.07 : 0.015;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 40, 40]} />
      <meshBasicMaterial color="#C8A24A" transparent opacity={0.015} blending={THREE.AdditiveBlending} depthWrite={false} wireframe />
    </mesh>
  );
}

/* ── Processing fragments ── */
function DataFragments({ isProcessing }: { isProcessing: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const fragCount = 18;

  const fragments = useMemo(() => {
    return Array.from({ length: fragCount }, (_, i) => ({
      theta: (i / fragCount) * Math.PI * 2,
      radius: 1.8 + Math.random() * 1.5,
      speed: 0.4 + Math.random() * 1.2,
      size: 0.025 + Math.random() * 0.03,
      yOffset: (Math.random() - 0.5) * 1.5,
    }));
  }, []);

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const frag = fragments[i];
      const progress = isProcessing ? (t * frag.speed) % 1 : 0;
      const r = isProcessing ? frag.radius * (1 - progress * 0.7) : frag.radius;
      const angle = frag.theta + t * 0.25;
      mesh.position.x = Math.cos(angle) * r;
      mesh.position.z = Math.sin(angle) * r;
      mesh.position.y = frag.yOffset * (1 - progress);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = isProcessing ? 0.4 * (1 - progress) : 0;
      mesh.scale.setScalar(isProcessing ? frag.size * (1 + progress) : 0);
    });
  });

  return (
    <group ref={groupRef}>
      {fragments.map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <octahedronGeometry args={[0.03, 0]} />
          <meshBasicMaterial color="#C8A24A" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ── HUD Arc segment ── */
function HUDArc({
  radius, arc, color, opacity, speed, index, isCrisis, isProcessing,
}: {
  radius: number; arc: number; color: string; opacity: number; speed: number;
  index: number; isCrisis: boolean; isProcessing: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mult = isProcessing ? 2.5 : 1;
    ref.current.rotation.z = clock.getElapsedTime() * speed * mult;
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, index * Math.PI / 2]}>
      <torusGeometry args={[radius, 0.008, 4, 64, Math.PI * 2 * arc]} />
      <meshBasicMaterial
        color={isCrisis ? "#b84a4a" : color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Main RISE Core ── */
export default function RISECoreEmblem({
  isActive = false,
  isCrisis = false,
  pulseIntensity = 0,
  isProcessing = false,
  isSpeaking = false,
}: RISECoreEmblemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const monogramRef = useRef<THREE.Group>(null);
  const glowSphereRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);

  const goldColor = "#C8A24A";
  const crisisColor = "#b84a4a";
  const baseCol = isCrisis ? crisisColor : goldColor;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.position.y = 0.3 + Math.sin(t * 0.5) * 0.06;
      groupRef.current.position.x = Math.sin(t * 0.3) * 0.02;
    }

    if (monogramRef.current) {
      const rotSpeed = isProcessing ? 0.4 : 0.06;
      monogramRef.current.rotation.y += rotSpeed * 0.016;
      const breathe = 1 + Math.sin(t * 1.2) * 0.015;
      const activeScale = isActive ? 1.03 : 1;
      const processScale = isProcessing ? 1 + Math.sin(t * 3.5) * 0.04 : 1;
      const speakScale = isSpeaking ? 1 + Math.sin(t * 6) * 0.02 : 1;
      monogramRef.current.scale.setScalar(breathe * activeScale * processScale * speakScale);
    }

    if (glowSphereRef.current) {
      const mat = glowSphereRef.current.material as THREE.MeshBasicMaterial;
      const speakGlow = isSpeaking ? 0.04 : 0;
      const processGlow = isProcessing ? 0.03 : 0;
      mat.opacity = 0.03 + pulseIntensity * 0.08 + Math.sin(t * 1) * 0.01 + speakGlow + processGlow;
      const s = 1.8 + pulseIntensity * 0.4 + (isProcessing ? 0.3 : 0);
      glowSphereRef.current.scale.setScalar(s);
    }

    if (innerGlowRef.current) {
      const mat = innerGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + pulseIntensity * 0.15 + Math.sin(t * 1.5) * 0.03;
      const s = 0.6 + Math.sin(t * 1.4) * 0.04;
      innerGlowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core sphere */}
      <group ref={monogramRef}>
        <mesh>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshBasicMaterial
            color={baseCol}
            transparent
            opacity={0.5 + pulseIntensity * 0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Inner glow */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color={baseCol} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowSphereRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={baseCol} transparent opacity={0.03} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Tactical rings — controlled, mechanical */}
      <TacticalRing radius={1.3} color="#C8A24A" speed={0.12} tiltX={0.4} tiltY={0} opacity={0.15} isProcessing={isProcessing} />
      <TacticalRing radius={1.7} color="#6b93b8" speed={-0.1} tiltX={-0.25} tiltY={0.7} opacity={0.1} isProcessing={isProcessing} />
      <TacticalRing radius={2.1} color="#C8A24A" speed={0.08} tiltX={0.6} tiltY={-0.35} opacity={0.08} isProcessing={isProcessing} />
      <TacticalRing radius={2.6} color="#6b93b8" speed={-0.06} tiltX={-0.5} tiltY={0.25} thickness={0.005} opacity={0.06} isProcessing={isProcessing} />

      {/* HUD arcs */}
      {[
        { radius: 2.8, arc: 0.35, color: "#6b93b8", opacity: 0.08, speed: 0.15 },
        { radius: 3.2, arc: 0.22, color: "#C8A24A", opacity: 0.06, speed: -0.1 },
        { radius: 3.5, arc: 0.3, color: "#6b93b8", opacity: 0.05, speed: 0.18 },
      ].map((hud, i) => (
        <HUDArc key={i} {...hud} index={i} isCrisis={isCrisis} isProcessing={isProcessing} />
      ))}

      <WaveformSphere isListening={isActive} pulseIntensity={pulseIntensity} />
      <DataOrbitParticles isCrisis={isCrisis} pulseIntensity={pulseIntensity} />
      <DataFragments isProcessing={isProcessing} />
      <GoldenRipples isActive={isActive} isSpeaking={isSpeaking} />

      {/* Gravitational distortion */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.02} metalness={1} roughness={0} envMapIntensity={2} />
      </mesh>
    </group>
  );
}
