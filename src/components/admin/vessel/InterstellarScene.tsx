import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import RISECoreEmblem from "./RISECoreEmblem";
import MetricRings from "./MetricRings";
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
    const t = clock.getElapsedTime();
    target.current.x += (mouse.current.x * 0.25 - target.current.x) * 0.01;
    target.current.y += (-mouse.current.y * 0.15 - target.current.y) * 0.01;
    camera.position.x = target.current.x + Math.sin(t * 0.12) * 0.02;
    camera.position.y = target.current.y + 1.2 + Math.sin(t * 0.18) * 0.015;
    const zt = isProcessing ? 6.5 : 8;
    zoomTarget.current += (zt - zoomTarget.current) * 0.008;
    camera.position.z = zoomTarget.current;
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}

/* ── Industrial dust particles ── */
function IndustrialDust() {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = Math.random() * 15 - 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * 0.015;
      if (arr[i * 3 + 1] > 12) arr[i * 3 + 1] = -3;
    }
    pos.needsUpdate = true;
    ref.current.rotation.y += delta * 0.001;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#8a8a94"
        transparent
        opacity={0.1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Steel grid floor ── */
function SteelGridFloor() {
  return (
    <group>
      <gridHelper
        args={[60, 60, "#3a3a44", "#2a2a30"]}
        position={[0, -3, 0]}
        material-transparent
        material-opacity={0.035}
        material-blending={THREE.AdditiveBlending}
        material-depthWrite={false}
      />
      {/* Dark floor plane */}
      <mesh position={[0, -3.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#060608" transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Industrial ceiling light cones ── */
function CeilingLights({ isCrisis }: { isCrisis: boolean }) {
  return (
    <group>
      <ambientLight intensity={0.035} color="#8a8a94" />
      <pointLight position={[0, 12, 0]} color={isCrisis ? "#b84a4a" : "#C8A24A"} intensity={0.25} distance={30} decay={2} />
      <pointLight position={[0, 0.3, 0]} intensity={0.6} color="#C8A24A" distance={10} decay={2} />
      <pointLight position={[-8, 10, -4]} color="#C8A24A" intensity={0.08} distance={20} decay={2} />
      <pointLight position={[8, 10, 4]} color="#C8A24A" intensity={0.08} distance={20} decay={2} />
      <pointLight position={[0, 8, 8]} color="#6a7a8a" intensity={0.06} distance={15} decay={2} />
      <directionalLight position={[0, 6, 0]} intensity={0.02} color="#e8e4dc" />
    </group>
  );
}

/* ── Scanner sweep ── */
function ScanSweep() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.08;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.015 + Math.sin(clock.getElapsedTime() * 0.5) * 0.005;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.98, 0]}>
      <circleGeometry args={[18, 4, 0, Math.PI / 6]} />
      <meshBasicMaterial
        color="#8a8a94"
        transparent
        opacity={0.02}
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
    <div className="absolute inset-0 z-0" style={{ backgroundColor: "#060608" }}>
      <Canvas
        camera={{ position: [0, 1.2, 8], fov: 50, near: 0.1, far: 150 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ background: "#060608" }}
      >
        <Suspense fallback={null}>
          <CameraController isProcessing={isProcessing} />

          {/* Industrial warehouse lighting */}
          <CeilingLights isCrisis={isCrisis} />

          {/* Steel grid floor */}
          <SteelGridFloor />

          {/* Industrial dust */}
          <IndustrialDust />

          {/* Scanner sweep */}
          <ScanSweep />

          {/* ── Central RISE 3D Text Emblem ── */}
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

          {/* Tactical globe */}
          <GlobalCommandMap />
        </Suspense>
      </Canvas>
    </div>
  );
}
