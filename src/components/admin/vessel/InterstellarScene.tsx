import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import HUDGrid from "./HUDGrid";
import RISECoreEmblem from "./RISECoreEmblem";
import MetricRings from "./MetricRings";
import ScanSweep from "./ScanSweep";
import AIResponseMetrics from "./AIResponseMetrics";
import GlobalCommandMap from "./GlobalCommandMap";

/* ── Cursor-driven camera with parallax depth ── */
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

  useFrame(() => {
    target.current.x += (mouse.current.x * 0.6 - target.current.x) * 0.02;
    target.current.y += (-mouse.current.y * 0.4 - target.current.y) * 0.02;
    camera.position.x = target.current.x;
    camera.position.y = target.current.y + 1;
    const zt = isProcessing ? 6.5 : 8;
    zoomTarget.current += (zt - zoomTarget.current) * 0.012;
    camera.position.z = zoomTarget.current;
    camera.lookAt(0, 0.3, 0);
  });

  return null;
}

/* ── Deep space nebula layer ── */
function NebulaLayer() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.15) * 0.03;
    }
  });

  return (
    <mesh ref={ref} position={[0, 2, -40]}>
      <planeGeometry args={[120, 80]} />
      <meshBasicMaterial
        color="#0a1628"
        transparent
        opacity={0.08}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Deep ambient fog ── */
function AmbientFog({ isCrisis }: { isCrisis: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      const crisisBlend = isCrisis ? 0.04 : 0;
      mat.opacity = 0.12 + Math.sin(clock.getElapsedTime() * 0.4) * 0.03 + crisisBlend;
      if (isCrisis) {
        mat.color.lerp(new THREE.Color("#220000"), 0.02);
      } else {
        mat.color.lerp(new THREE.Color("#030810"), 0.02);
      }
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -25]}>
      <planeGeometry args={[120, 120]} />
      <meshBasicMaterial color="#030810" transparent opacity={0.12} depthWrite={false} />
    </mesh>
  );
}

/* ── Volumetric core spotlight ── */
function CoreSpotlight({ isCrisis }: { isCrisis: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + Math.sin(clock.getElapsedTime() * 0.6) * 0.02;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.3, -3]}>
      <circleGeometry args={[8, 64]} />
      <meshBasicMaterial
        color={isCrisis ? "#331111" : "#0a1520"}
        transparent
        opacity={0.05}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Cosmic dust particles ── */
function CosmicDust() {
  const ref = useRef<THREE.Points>(null);
  const count = 400;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * 0.04;
      if (arr[i * 3 + 1] > 12) arr[i * 3 + 1] = -12;
    }
    pos.needsUpdate = true;
    ref.current.rotation.y += delta * 0.002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#C8A24A"
        transparent
        opacity={0.12}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Deep starfield ── */
function DeepStarfield() {
  const ref = useRef<THREE.Points>(null);
  const count = 2500;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 100;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 2] = -10 - Math.random() * 60;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.004;
      ref.current.rotation.x += delta * 0.001;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Volumetric light beams ── */
function VolumetricBeams() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  const beams = useMemo(() => [
    { x: -8, angle: 0.15, width: 0.8, height: 25, opacity: 0.015 },
    { x: 6, angle: -0.1, width: 0.5, height: 30, opacity: 0.01 },
    { x: 0, angle: 0, width: 1.2, height: 35, opacity: 0.008 },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = beams[i].opacity + Math.sin(t * 0.3 + i * 1.5) * 0.005;
    });
  });

  return (
    <group>
      {beams.map((beam, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          position={[beam.x, beam.height / 2 - 5, -15]}
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
  isDay?: boolean;
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
          <ambientLight intensity={0.06} />

          {/* Primary core spotlight */}
          <pointLight
            position={[0, 0.3, 0]}
            intensity={isCrisis ? 4 : 2.5}
            color={isCrisis ? "#ff4444" : "#C8A24A"}
            distance={30}
            decay={2}
          />
          {/* Backlight for depth */}
          <pointLight position={[0, 3, -8]} intensity={0.5} color="#C8A24A" distance={25} decay={2} />

          {/* Galactic lighting */}
          <pointLight position={[8, 4, -6]} intensity={0.35} color="#00d4ff" distance={30} decay={2} />
          <pointLight position={[-7, -2, 5]} intensity={0.2} color="#00d4ff" distance={20} decay={2} />
          <pointLight position={[-4, 5, -4]} intensity={0.12} color="#10b981" distance={18} decay={2} />
          <directionalLight position={[0, 10, 0]} intensity={0.06} color="#eeeeff" />

          {/* Deep space layers */}
          <DeepStarfield />
          <NebulaLayer />
          <VolumetricBeams />

          {/* Environment */}
          <CoreSpotlight isCrisis={isCrisis} />
          <HUDGrid isDay={false} />
          <ScanSweep isCrisis={isCrisis} isDay={false} />
          <CosmicDust />
          <AmbientFog isCrisis={isCrisis} />

          {/* RISE Galactic Core */}
          <RISECoreEmblem
            isActive={isListening}
            isCrisis={isCrisis}
            pulseIntensity={pulseIntensity}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
          />

          {/* Metric satellites */}
          {metrics.length > 0 && <MetricRings metrics={metrics} isCrisis={isCrisis} />}
          {aiMetrics.length > 0 && <AIResponseMetrics metrics={aiMetrics} />}

          {/* Holographic Globe */}
          <GlobalCommandMap isDay={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
