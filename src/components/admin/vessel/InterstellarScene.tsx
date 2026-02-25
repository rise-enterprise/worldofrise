import { Suspense, useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import StarField from "./StarField";
import AICoreOrb from "./AICoreOrb";
import MetricRings from "./MetricRings";

/* ── Cursor-driven camera ── */
function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

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
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Ambient vignette fog plane ── */
function AmbientFog({ isCrisis }: { isCrisis: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      const crisisBlend = isCrisis ? 0.04 : 0;
      mat.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02 + crisisBlend;
      if (isCrisis) {
        mat.color.lerp(new THREE.Color("#220000"), 0.02);
      } else {
        mat.color.lerp(new THREE.Color("#050508"), 0.02);
      }
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -20]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="#050508" transparent opacity={0.15} depthWrite={false} />
    </mesh>
  );
}

interface InterstellarSceneProps {
  isListening?: boolean;
  isCrisis?: boolean;
  pulseIntensity?: number;
  metrics?: { label: string; value: number; max: number; color: string }[];
}

export default function InterstellarScene({
  isListening = false,
  isCrisis = false,
  pulseIntensity = 0,
  metrics = [],
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
          <CameraController />
          <ambientLight intensity={0.15} />
          <pointLight position={[0, 0, 0]} intensity={isCrisis ? 3 : 1.5} color={isCrisis ? "#ff4444" : "#C8A24A"} distance={20} decay={2} />
          <pointLight position={[5, 3, -5]} intensity={0.3} color="#4488ff" distance={15} decay={2} />
          
          <StarField count={1500} />
          <AICoreOrb isActive={isListening} isCrisis={isCrisis} pulseIntensity={pulseIntensity} />
          {metrics.length > 0 && <MetricRings metrics={metrics} isCrisis={isCrisis} />}
          <AmbientFog isCrisis={isCrisis} />
        </Suspense>
      </Canvas>
    </div>
  );
}
