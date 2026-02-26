import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import HUDGrid from "./HUDGrid";
import RISECoreEmblem from "./RISECoreEmblem";
import MetricRings from "./MetricRings";
import ScanSweep from "./ScanSweep";
import AIResponseMetrics from "./AIResponseMetrics";
import { useEffect } from "react";

/* ── Cursor-driven camera with micro-zoom ── */
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
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    target.current.x += (mouse.current.x * 0.4 - target.current.x) * 0.03;
    target.current.y += (-mouse.current.y * 0.3 - target.current.y) * 0.03;
    camera.position.x = target.current.x;
    camera.position.y = target.current.y + 1;

    // Micro-zoom when processing
    const zt = isProcessing ? 7.2 : 8;
    zoomTarget.current += (zt - zoomTarget.current) * 0.02;
    camera.position.z = zoomTarget.current;

    camera.lookAt(0, 0.3, 0);
  });

  return null;
}

/* ── Deep ambient fog layer ── */
function AmbientFog({ isCrisis }: { isCrisis: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      const crisisBlend = isCrisis ? 0.04 : 0;
      mat.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 0.4) * 0.03 + crisisBlend;
      if (isCrisis) {
        mat.color.lerp(new THREE.Color("#220000"), 0.02);
      } else {
        mat.color.lerp(new THREE.Color("#020610"), 0.02);
      }
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -25]}>
      <planeGeometry args={[120, 120]} />
      <meshBasicMaterial color="#020610" transparent opacity={0.15} depthWrite={false} />
    </mesh>
  );
}

/* ── Volumetric spotlight behind emblem ── */
function CoreSpotlight({ isCrisis }: { isCrisis: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.6) * 0.015;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.3, -3]}>
      <circleGeometry args={[6, 64]} />
      <meshBasicMaterial
        color={isCrisis ? "#331111" : "#1a1508"}
        transparent
        opacity={0.04}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Ambient dust particles ── */
function DustParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 400;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * 0.05;
      if (arr[i * 3 + 1] > 10) arr[i * 3 + 1] = -10;
    }
    pos.needsUpdate = true;
    ref.current.rotation.y += delta * 0.003;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#C8A24A"
        transparent
        opacity={0.15}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
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
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1, 8], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <CameraController isProcessing={isProcessing} />
          <ambientLight intensity={0.08} />

          {/* Primary core spotlight */}
          <pointLight
            position={[0, 0.3, 0]}
            intensity={isCrisis ? 3.5 : 2}
            color={isCrisis ? "#ff4444" : "#C8A24A"}
            distance={25}
            decay={2}
          />
          {/* Backlight for depth */}
          <pointLight position={[0, 2, -5]} intensity={0.6} color="#C8A24A" distance={20} decay={2} />
          {/* Cyan accent lights */}
          <pointLight position={[6, 3, -6]} intensity={0.4} color="#00d4ff" distance={25} decay={2} />
          <pointLight position={[-6, -2, 4]} intensity={0.25} color="#00d4ff" distance={18} decay={2} />
          {/* Cool white fill from above */}
          <directionalLight position={[0, 8, 0]} intensity={0.08} color="#eeeeff" />

          {/* Environment */}
          <CoreSpotlight isCrisis={isCrisis} />
          <HUDGrid />
          <ScanSweep isCrisis={isCrisis} />
          <DustParticles />
          <AmbientFog isCrisis={isCrisis} />

          {/* RISE Intelligence Core */}
          <RISECoreEmblem
            isActive={isListening}
            isCrisis={isCrisis}
            pulseIntensity={pulseIntensity}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
          />

          {/* Data panels */}
          {metrics.length > 0 && <MetricRings metrics={metrics} isCrisis={isCrisis} />}
          {aiMetrics.length > 0 && <AIResponseMetrics metrics={aiMetrics} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
