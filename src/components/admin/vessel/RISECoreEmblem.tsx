import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

interface RISECoreEmblemProps {
  isActive?: boolean;
  isCrisis?: boolean;
  pulseIntensity?: number;
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

/* ── Data orbit particles ── */
function DataOrbitParticles({ isCrisis, pulseIntensity }: { isCrisis: boolean; pulseIntensity: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 500;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 3.2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
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
      // Gravitational pull toward center
      const dx = arr[ix], dy = arr[iy], dz = arr[iz];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const pull = 0.001 + pulseIntensity * 0.003;

      arr[ix] += velocities[ix] - (dx / dist) * pull;
      arr[iy] += velocities[iy] - (dy / dist) * pull;
      arr[iz] += velocities[iz] - (dz / dist) * pull;

      // Orbital rotation
      const angle = 0.003 + pulseIntensity * 0.005;
      const nx = arr[ix] * Math.cos(angle) - arr[iz] * Math.sin(angle);
      const nz = arr[ix] * Math.sin(angle) + arr[iz] * Math.cos(angle);
      arr[ix] = nx;
      arr[iz] = nz;

      // Reset if too close or too far
      const newDist = Math.sqrt(arr[ix] ** 2 + arr[iy] ** 2 + arr[iz] ** 2);
      if (newDist < 0.8 || newDist > 6) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2 + Math.random() * 3;
        arr[ix] = r * Math.sin(phi) * Math.cos(theta);
        arr[iy] = r * Math.sin(phi) * Math.sin(theta);
        arr[iz] = r * Math.cos(phi);
      }
    }
    posAttr.needsUpdate = true;

    ref.current.rotation.y = t * 0.02;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.35 + pulseIntensity * 0.4;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={isCrisis ? "#ff4444" : "#C8A24A"}
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Rotating light rings ── */
function LightRing({
  radius,
  color,
  speed,
  tiltX,
  tiltY,
  thickness = 0.008,
  opacity = 0.3,
  isProcessing,
}: {
  radius: number;
  color: string;
  speed: number;
  tiltX: number;
  tiltY: number;
  thickness?: number;
  opacity?: number;
  isProcessing?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const spd = isProcessing ? speed * 3 : speed;
    ref.current.rotation.x = tiltX + t * spd * 0.5;
    ref.current.rotation.y = tiltY + t * spd;
    ref.current.rotation.z = t * spd * 0.3;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 16, 128]} />
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

/* ── Golden ripple effect ── */
function GoldenRipples({ isActive, isSpeaking }: { isActive: boolean; isSpeaking: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = (t * 0.4 + i * 0.33) % 1;
      const scale = 0.8 + phase * 4;
      ring.scale.setScalar(scale);
      const mat = ring.material as THREE.MeshBasicMaterial;
      const intensity = isSpeaking ? 0.18 : isActive ? 0.1 : 0.03;
      mat.opacity = (1 - phase) * intensity;
    });
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <torusGeometry args={[1, 0.012, 4, 96]} />
          <meshBasicMaterial
            color="#C8A24A"
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Waveform sphere (listening state) ── */
function WaveformSphere({ isListening, pulseIntensity }: { isListening: boolean; pulseIntensity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const originalPositions = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry as THREE.SphereGeometry;
    const posAttr = geo.attributes.position;

    if (!originalPositions.current) {
      originalPositions.current = new Float32Array(posAttr.array);
    }

    const t = clock.getElapsedTime();
    const arr = posAttr.array as Float32Array;
    const orig = originalPositions.current;
    const targetScale = isListening ? 1.3 + pulseIntensity * 0.4 : 0.9;

    for (let i = 0; i < posAttr.count; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      const ox = orig[ix], oy = orig[iy], oz = orig[iz];

      if (isListening) {
        const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const wave = Math.sin(t * 6 + dist * 8) * 0.08 * pulseIntensity;
        const s = targetScale + wave;
        arr[ix] = ox * s;
        arr[iy] = oy * s;
        arr[iz] = oz * s;
      } else {
        arr[ix] += (ox * targetScale - arr[ix]) * 0.05;
        arr[iy] += (oy * targetScale - arr[iy]) * 0.05;
        arr[iz] += (oz * targetScale - arr[iz]) * 0.05;
      }
    }
    posAttr.needsUpdate = true;

    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = isListening ? 0.08 + pulseIntensity * 0.1 : 0.02;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshBasicMaterial
        color="#C8A24A"
        transparent
        opacity={0.02}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        wireframe
      />
    </mesh>
  );
}

/* ── Processing data fragments ── */
function DataFragments({ isProcessing }: { isProcessing: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const fragCount = 24;

  const fragments = useMemo(() => {
    return Array.from({ length: fragCount }, (_, i) => ({
      theta: (i / fragCount) * Math.PI * 2,
      radius: 2 + Math.random() * 2,
      speed: 0.5 + Math.random() * 1.5,
      size: 0.03 + Math.random() * 0.04,
      yOffset: (Math.random() - 0.5) * 2,
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
      const r = isProcessing ? frag.radius * (1 - progress * 0.8) : frag.radius;
      const angle = frag.theta + t * 0.3;

      mesh.position.x = Math.cos(angle) * r;
      mesh.position.z = Math.sin(angle) * r;
      mesh.position.y = frag.yOffset * (1 - progress);

      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = isProcessing ? 0.6 * (1 - progress) : 0;
      mesh.scale.setScalar(isProcessing ? frag.size * (1 + progress) : 0);
    });
  });

  return (
    <group ref={groupRef}>
      {fragments.map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <octahedronGeometry args={[0.04, 0]} />
          <meshBasicMaterial
            color="#C8A24A"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Main Quantum Core ── */
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
  const crisisColor = "#ff3333";
  const baseCol = isCrisis ? crisisColor : goldColor;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Floating motion
    if (groupRef.current) {
      groupRef.current.position.y = 0.3 + Math.sin(t * 0.6) * 0.1;
      groupRef.current.position.x = Math.sin(t * 0.35) * 0.03;
    }

    // Monogram rotation — slow idle, faster processing
    if (monogramRef.current) {
      const rotSpeed = isProcessing ? 0.5 : 0.08;
      monogramRef.current.rotation.y += rotSpeed * 0.016;

      // Breathing scale
      const breathe = 1 + Math.sin(t * 1.5) * 0.02;
      const activeScale = isActive ? 1.05 : 1;
      const processScale = isProcessing ? 1 + Math.sin(t * 4) * 0.05 : 1;
      const speakScale = isSpeaking ? 1 + Math.sin(t * 8) * 0.03 : 1;
      monogramRef.current.scale.setScalar(breathe * activeScale * processScale * speakScale);
    }

    // Outer glow
    if (glowSphereRef.current) {
      const mat = glowSphereRef.current.material as THREE.MeshBasicMaterial;
      const speakGlow = isSpeaking ? 0.06 : 0;
      const processGlow = isProcessing ? 0.04 : 0;
      mat.opacity = 0.04 + pulseIntensity * 0.1 + Math.sin(t * 1.2) * 0.015 + speakGlow + processGlow;
      const s = 2 + pulseIntensity * 0.5 + (isProcessing ? 0.4 : 0);
      glowSphereRef.current.scale.setScalar(s);
    }

    // Inner core glow
    if (innerGlowRef.current) {
      const mat = innerGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + pulseIntensity * 0.2 + Math.sin(t * 2) * 0.04;
      const s = 0.7 + Math.sin(t * 1.8) * 0.05;
      innerGlowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* ── 3D "RISE" Monogram ── */}
      <group ref={monogramRef}>
        <Center>
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={0.55}
            height={0.15}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.01}
            bevelOffset={0}
            bevelSegments={8}
            curveSegments={32}
          >
            RISE
            <meshStandardMaterial
              color={baseCol}
              emissive={baseCol}
              emissiveIntensity={1.5 + pulseIntensity * 2}
              metalness={0.98}
              roughness={0.05}
              envMapIntensity={2}
            />
          </Text3D>
        </Center>

        {/* White edge highlights */}
        <Center>
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={0.55}
            height={0.16}
            bevelEnabled
            bevelThickness={0.025}
            bevelSize={0.015}
            bevelOffset={0}
            bevelSegments={4}
            curveSegments={32}
          >
            RISE
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.06}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              wireframe
            />
          </Text3D>
        </Center>
      </group>

      {/* ── Inner core glow ── */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial
          color={baseCol}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Outer glow sphere ── */}
      <mesh ref={glowSphereRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={baseCol}
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Rotating light rings ── */}
      <LightRing radius={1.5} color="#C8A24A" speed={0.15} tiltX={0.5} tiltY={0} opacity={0.25} isProcessing={isProcessing} />
      <LightRing radius={1.9} color="#00d4ff" speed={-0.12} tiltX={-0.3} tiltY={0.8} opacity={0.18} isProcessing={isProcessing} />
      <LightRing radius={2.4} color="#C8A24A" speed={0.1} tiltX={0.7} tiltY={-0.4} opacity={0.14} isProcessing={isProcessing} />
      <LightRing radius={2.9} color="#00d4ff" speed={-0.08} tiltX={-0.6} tiltY={0.3} thickness={0.006} opacity={0.1} isProcessing={isProcessing} />
      <LightRing radius={3.5} color={isCrisis ? "#ff4444" : "#C8A24A"} speed={0.06} tiltX={0.2} tiltY={-0.7} thickness={0.005} opacity={0.07} isProcessing={isProcessing} />

      {/* ── HUD arc segments ── */}
      {[
        { radius: 3.2, arc: 0.4, color: "#00d4ff", opacity: 0.15, speed: 0.18 },
        { radius: 3.8, arc: 0.25, color: "#C8A24A", opacity: 0.1, speed: -0.12 },
        { radius: 4.2, arc: 0.35, color: "#00d4ff", opacity: 0.08, speed: 0.22 },
        { radius: 4.6, arc: 0.2, color: "#C8A24A", opacity: 0.06, speed: -0.15 },
      ].map((hud, i) => (
        <HUDArc key={i} {...hud} index={i} isCrisis={isCrisis} isProcessing={isProcessing} />
      ))}

      {/* ── Waveform sphere (listening) ── */}
      <WaveformSphere isListening={isActive} pulseIntensity={pulseIntensity} />

      {/* ── Data orbit particles ── */}
      <DataOrbitParticles isCrisis={isCrisis} pulseIntensity={pulseIntensity} />

      {/* ── Processing data fragments ── */}
      <DataFragments isProcessing={isProcessing} />

      {/* ── Golden ripples (responding) ── */}
      <GoldenRipples isActive={isActive} isSpeaking={isSpeaking} />

      {/* ── Gravitational distortion sphere ── */}
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.03}
          metalness={1}
          roughness={0}
          envMapIntensity={3}
        />
      </mesh>
    </group>
  );
}

/* ── HUD Arc sub-component ── */
function HUDArc({
  radius,
  arc,
  color,
  opacity,
  speed,
  index,
  isCrisis,
  isProcessing,
}: {
  radius: number;
  arc: number;
  color: string;
  opacity: number;
  speed: number;
  index: number;
  isCrisis: boolean;
  isProcessing: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const mult = isProcessing ? 3 : 1;
    ref.current.rotation.z = t * speed * mult;
  });

  return (
    <mesh
      ref={ref}
      rotation={[Math.PI / 2, 0, index * Math.PI / 2]}
    >
      <torusGeometry args={[radius, 0.01, 4, 64, Math.PI * 2 * arc]} />
      <meshBasicMaterial
        color={isCrisis ? "#ff4444" : color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
