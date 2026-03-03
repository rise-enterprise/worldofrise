import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import RISECoreEmblem from "./RISECoreEmblem";
import MetricRings from "./MetricRings";
import AIResponseMetrics from "./AIResponseMetrics";
import GlobalCommandMap from "./GlobalCommandMap";
import { useEffect } from "react";

/* ── Smooth camera with micro parallax ── */
function CameraController({ isProcessing }: { isProcessing?: boolean }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const zoomTarget = useRef(8);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    target.current.x += (mouse.current.x * 0.2 - target.current.x) * 0.008;
    target.current.y += (-mouse.current.y * 0.12 - target.current.y) * 0.008;
    camera.position.x = target.current.x + Math.sin(t * 0.08) * 0.015;
    camera.position.y = target.current.y + 1.2 + Math.sin(t * 0.12) * 0.01;
    const zt = isProcessing ? 6.5 : 8;
    zoomTarget.current += (zt - zoomTarget.current) * 0.006;
    camera.position.z = zoomTarget.current;
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}

/* ── Luminous crystal particles — luxury showroom atmosphere ── */
function CrystalParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 35;
      arr[i * 3 + 1] = Math.random() * 12 - 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * 0.008;
      if (arr[i * 3 + 1] > 10) arr[i * 3 + 1] = -2;
    }
    pos.needsUpdate = true;
    ref.current.rotation.y += delta * 0.0008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#d4b86a"
        transparent
        opacity={0.12}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Marble reflection floor ── */
function MarbleFloor() {
  return (
    <group>
      {/* Subtle warm gold grid — marble-like shimmer */}
      <gridHelper
        args={[60, 40, "#C8A24A", "#C8A24A"]}
        position={[0, -3, 0]}
        material-transparent
        material-opacity={0.012}
        material-blending={THREE.AdditiveBlending}
        material-depthWrite={false}
      />
      {/* Dark reflective floor plane */}
      <mesh position={[0, -3.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#0a0a0f" transparent opacity={0.9} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Premium showroom lighting — warm champagne ── */
function LuxuryLighting({ isCrisis }: { isCrisis: boolean }) {
  return (
    <group>
      <ambientLight intensity={0.06} color="#f0ece4" />
      {/* Main champagne overhead */}
      <pointLight position={[0, 10, 0]} color={isCrisis ? "#b84a4a" : "#d4b86a"} intensity={0.2} distance={25} decay={2} />
      {/* Core emblem warm glow */}
      <pointLight position={[0, 0.3, 0]} intensity={0.5} color="#C8A24A" distance={8} decay={2} />
      {/* Soft fill lights */}
      <pointLight position={[-6, 8, -3]} color="#d4b86a" intensity={0.06} distance={18} decay={2} />
      <pointLight position={[6, 8, 3]} color="#d4b86a" intensity={0.06} distance={18} decay={2} />
      {/* Warm ambient fill */}
      <directionalLight position={[0, 5, 0]} intensity={0.015} color="#f0ece4" />
    </group>
  );
}

/* ── Gentle champagne sweep ── */
function LuxurySweep() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.03;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.01 + Math.sin(clock.getElapsedTime() * 0.3) * 0.004;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.98, 0]}>
      <circleGeometry args={[18, 4, 0, Math.PI / 8]} />
      <meshBasicMaterial
        color="#C8A24A"
        transparent
        opacity={0.012}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface InterstellarSceneProps {
  isListening?: boolean;
  isCrisis?: boolean;
  pulseIntensity?: number;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  metrics?: { label: string; value: number; max: number; color: string }[];
  aiMetrics?: { label: string; value: number }[];
}

export default function InterstellarScene({
  isListening = false,
  isCrisis = false,
  pulseIntensity = 0,
  isProcessing = false,
  isSpeaking = false,
  metrics = [],
  aiMetrics = [],
}: InterstellarSceneProps) {
  return (
    <div className="absolute inset-0 z-0" style={{ backgroundColor: "#0a0a0f" }}>
      <Canvas
        camera={{ position: [0, 1.2, 8], fov: 50, near: 0.1, far: 150 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ background: "#0a0a0f" }}
      >
        <Suspense fallback={null}>
          <CameraController isProcessing={isProcessing} />

          {/* Premium showroom lighting */}
          <LuxuryLighting isCrisis={isCrisis} />

          {/* Marble reflection floor */}
          <MarbleFloor />

          {/* Crystal facet particles */}
          <CrystalParticles />

          {/* Champagne sweep */}
          <LuxurySweep />

          {/* ── Central RISE Crystal Emblem ── */}
          <group position={[0, 0.2, 0]}>
            <RISECoreEmblem
              isActive={isListening}
              isCrisis={isCrisis}
              pulseIntensity={pulseIntensity}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
            />
          </group>

          {/* Orbital metric panels */}
          {metrics.length > 0 && <MetricRings metrics={metrics} isCrisis={isCrisis} />}
          {aiMetrics.length > 0 && <AIResponseMetrics metrics={aiMetrics} />}

          {/* Global presence map */}
          <GlobalCommandMap />
        </Suspense>
      </Canvas>
    </div>
  );
}
