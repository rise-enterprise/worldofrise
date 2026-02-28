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
    target.current.x += (mouse.current.x * 0.5 - target.current.x) * 0.015;
    target.current.y += (-mouse.current.y * 0.3 - target.current.y) * 0.015;
    camera.position.x = target.current.x;
    camera.position.y = target.current.y + 1;
    const zt = isProcessing ? 6.5 : 8;
    zoomTarget.current += (zt - zoomTarget.current) * 0.01;
    camera.position.z = zoomTarget.current;
    camera.lookAt(0, 0.3, 0);
  });

  return null;
}

/* ── Neural Network Nodes — Living intelligence connections ── */
function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const nodeCount = 120;
  const connectionCount = 80;

  const { positions, connections, linePositions } = useMemo(() => {
    const pos = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      // Distribute in a rough sphere with bias toward center
      const r = 3 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = (r * Math.cos(phi)) * 0.5 - 2; // flatten vertically
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 15;
    }

    // Create connections between nearby nodes
    const conns: [number, number][] = [];
    for (let i = 0; i < connectionCount; i++) {
      const a = Math.floor(Math.random() * nodeCount);
      let b = Math.floor(Math.random() * nodeCount);
      if (a === b) b = (a + 1) % nodeCount;
      conns.push([a, b]);
    }

    const lp = new Float32Array(conns.length * 6);
    for (let i = 0; i < conns.length; i++) {
      const [a, b] = conns[i];
      lp[i * 6] = pos[a * 3];
      lp[i * 6 + 1] = pos[a * 3 + 1];
      lp[i * 6 + 2] = pos[a * 3 + 2];
      lp[i * 6 + 3] = pos[b * 3];
      lp[i * 6 + 4] = pos[b * 3 + 1];
      lp[i * 6 + 5] = pos[b * 3 + 2];
    }

    return { positions: pos, connections: conns, linePositions: lp };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.02) * 0.05;

    // Pulse node opacity
    if (nodesRef.current) {
      const mat = nodesRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 0.4) * 0.05;
    }

    // Pulse connection opacity
    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.3) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Neural nodes */}
      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={nodeCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#C8A24A"
          transparent
          opacity={0.18}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Neural connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={connections.length * 2} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#C8A24A"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/* ── Executive marble/stone ambient layer ── */
function ExecutiveAmbience({ isCrisis }: { isCrisis: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.2) * 0.02;
      if (isCrisis) {
        mat.color.lerp(new THREE.Color("#1a0808"), 0.02);
      } else {
        mat.color.lerp(new THREE.Color("#0a0810"), 0.02);
      }
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -30]}>
      <planeGeometry args={[120, 80]} />
      <meshBasicMaterial color="#0a0810" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}

/* ── Volumetric core spotlight — top-down executive lighting ── */
function CoreSpotlight({ isCrisis }: { isCrisis: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.5) * 0.015;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.3, -3]}>
      <circleGeometry args={[6, 64]} />
      <meshBasicMaterial
        color={isCrisis ? "#2a0a0a" : "#0c0a06"}
        transparent
        opacity={0.04}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Subtle gold dust particles ── */
function GoldDust() {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

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
      arr[i * 3 + 1] += delta * 0.03;
      if (arr[i * 3 + 1] > 10) arr[i * 3 + 1] = -10;
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
        size={0.01}
        color="#C8A24A"
        transparent
        opacity={0.1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Minimal starfield — far background ── */
function SubtleStarfield() {
  const ref = useRef<THREE.Points>(null);
  const count = 800;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 100;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 2] = -20 - Math.random() * 50;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.002;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#ffffff"
        transparent
        opacity={0.2}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Soft gold volumetric beams — executive top-down light ── */
function ExecutiveBeams() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  const beams = useMemo(() => [
    { x: -6, angle: 0.1, width: 0.6, height: 25, opacity: 0.012 },
    { x: 0, angle: 0, width: 1, height: 30, opacity: 0.008 },
    { x: 5, angle: -0.08, width: 0.5, height: 25, opacity: 0.01 },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = beams[i].opacity + Math.sin(t * 0.25 + i * 1.2) * 0.004;
    });
  });

  return (
    <group>
      {beams.map((beam, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          position={[beam.x, beam.height / 2 - 5, -12]}
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
          <ambientLight intensity={0.04} />

          {/* Executive top-down spotlight */}
          <pointLight
            position={[0, 6, 2]}
            intensity={isCrisis ? 3 : 1.8}
            color={isCrisis ? "#ff4444" : "#C8A24A"}
            distance={25}
            decay={2}
          />
          {/* Core glow */}
          <pointLight position={[0, 0.3, 0]} intensity={1.5} color="#C8A24A" distance={15} decay={2} />
          {/* Subtle blue rim */}
          <pointLight position={[6, 3, -5]} intensity={0.2} color="#00d4ff" distance={20} decay={2} />
          <pointLight position={[-5, -1, 4]} intensity={0.1} color="#00d4ff" distance={15} decay={2} />
          <directionalLight position={[0, 8, 0]} intensity={0.04} color="#eee8dd" />

          {/* Background layers */}
          <SubtleStarfield />
          <ExecutiveAmbience isCrisis={isCrisis} />
          <ExecutiveBeams />

          {/* Neural intelligence network */}
          <NeuralNetwork />

          {/* Environment */}
          <CoreSpotlight isCrisis={isCrisis} />
          <HUDGrid isDay={false} />
          <ScanSweep isCrisis={isCrisis} isDay={false} />
          <GoldDust />

          {/* RISE Neural Core */}
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

          {/* Global Expansion Map */}
          <GlobalCommandMap isDay={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
