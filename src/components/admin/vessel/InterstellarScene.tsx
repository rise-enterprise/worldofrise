import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import HUDGrid from "./HUDGrid";
import RISECoreEmblem from "./RISECoreEmblem";
import MetricRings from "./MetricRings";
import ScanSweep from "./ScanSweep";
import AIResponseMetrics from "./AIResponseMetrics";
import GlobalCommandMap from "./GlobalCommandMap";

/* ── Cursor-driven camera with micro parallax ── */
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
    // Micro float + parallax
    const t = clock.getElapsedTime();
    target.current.x += (mouse.current.x * 0.35 - target.current.x) * 0.012;
    target.current.y += (-mouse.current.y * 0.2 - target.current.y) * 0.012;
    camera.position.x = target.current.x + Math.sin(t * 0.15) * 0.03;
    camera.position.y = target.current.y + 1 + Math.sin(t * 0.2) * 0.02;
    const zt = isProcessing ? 6.5 : 8;
    zoomTarget.current += (zt - zoomTarget.current) * 0.008;
    camera.position.z = zoomTarget.current;
    camera.lookAt(0, 0.3, 0);
  });

  return null;
}

/* ── Deep matte black environment plane ── */
function TacticalBackdrop({ isCrisis }: { isCrisis: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(clock.getElapsedTime() * 0.15) * 0.02;
      if (isCrisis) {
        mat.color.lerp(new THREE.Color("#120808"), 0.015);
      } else {
        mat.color.lerp(new THREE.Color("#0a0a0e"), 0.015);
      }
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -30]}>
      <planeGeometry args={[120, 80]} />
      <meshBasicMaterial color="#0a0a0e" transparent opacity={0.12} depthWrite={false} />
    </mesh>
  );
}

/* ── Gold volumetric top-down spotlight ── */
function TacticalSpotlight({ isCrisis }: { isCrisis: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + Math.sin(clock.getElapsedTime() * 0.4) * 0.01;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.3, -3]}>
      <circleGeometry args={[5, 64]} />
      <meshBasicMaterial
        color={isCrisis ? "#1a0606" : "#0c0a06"}
        transparent
        opacity={0.03}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Minimal gold dust (luxury ambient) ── */
function GoldDust() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 35;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * 0.02;
      if (arr[i * 3 + 1] > 9) arr[i * 3 + 1] = -9;
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
        size={0.008}
        color="#C8A24A"
        transparent
        opacity={0.08}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Very subtle background stars ── */
function MinimalStarfield() {
  const ref = useRef<THREE.Points>(null);
  const count = 400;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 2] = -25 - Math.random() * 40;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.001;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#ffffff"
        transparent
        opacity={0.1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Soft gold volumetric beams ── */
function ExecutiveBeams() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  const beams = useMemo(() => [
    { x: -5, angle: 0.08, width: 0.4, height: 22, opacity: 0.008 },
    { x: 0, angle: 0, width: 0.7, height: 26, opacity: 0.006 },
    { x: 4, angle: -0.06, width: 0.35, height: 22, opacity: 0.007 },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = beams[i].opacity + Math.sin(t * 0.2 + i * 1.5) * 0.003;
    });
  });

  return (
    <group>
      {beams.map((beam, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          position={[beam.x, beam.height / 2 - 5, -10]}
          rotation={[0, 0, beam.angle]}
        >
          <planeGeometry args={[beam.width, beam.height]} />
          <meshBasicMaterial
            color="#C8A24A"
            transparent
            opacity={beam.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
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
        camera={{ position: [0, 1, 8], fov: 50, near: 0.1, far: 150 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <CameraController isProcessing={isProcessing} />

          {/* Minimal ambient — executive lighting */}
          <ambientLight intensity={0.03} />
          <pointLight position={[0, 5, 2]} intensity={isCrisis ? 2 : 1.2} color={isCrisis ? "#b84040" : "#C8A24A"} distance={20} decay={2} />
          <pointLight position={[0, 0.3, 0]} intensity={1} color="#C8A24A" distance={12} decay={2} />
          <pointLight position={[5, 2, -4]} intensity={0.12} color="#6b93b8" distance={18} decay={2} />
          <directionalLight position={[0, 6, 0]} intensity={0.03} color="#e8e4dc" />

          {/* Background layers */}
          <MinimalStarfield />
          <TacticalBackdrop isCrisis={isCrisis} />
          <ExecutiveBeams />

          {/* Environment */}
          <TacticalSpotlight isCrisis={isCrisis} />
          <HUDGrid isDay={false} />
          <ScanSweep isCrisis={isCrisis} isDay={false} />
          <GoldDust />

          {/* RISE Core */}
          <RISECoreEmblem
            isActive={isListening}
            isCrisis={isCrisis}
            pulseIntensity={pulseIntensity}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
          />

          {/* Tactical Data Zones — metric satellites */}
          {metrics.length > 0 && <MetricRings metrics={metrics} isCrisis={isCrisis} />}
          {aiMetrics.length > 0 && <AIResponseMetrics metrics={aiMetrics} />}

          {/* Tactical World Map */}
          <GlobalCommandMap isDay={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
