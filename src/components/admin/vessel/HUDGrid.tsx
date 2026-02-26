import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Wireframe grid floor ── */
function GridFloor({ isDay }: { isDay: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (isDay ? 0.04 : 0.07) + Math.sin(clock.getElapsedTime() * 0.4) * 0.015;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[60, 60, 60, 60]} />
      <meshBasicMaterial
        color={isDay ? "#C8A24A" : "#00d4ff"}
        wireframe
        transparent
        opacity={isDay ? 0.04 : 0.07}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Second grid (gold, slightly offset) ── */
function GridFloorGold({ isDay }: { isDay: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, -3.05, 0]}>
      <planeGeometry args={[50, 50, 25, 25]} />
      <meshBasicMaterial
        color="#C8A24A"
        wireframe
        transparent
        opacity={isDay ? 0.02 : 0.03}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Vertical data stream particles ── */
function DataStreams({ count = 600, isDay }: { count?: number; isDay: boolean }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const col = Math.floor(Math.random() * 20);
      const angle = (col / 20) * Math.PI * 2;
      const radius = 8 + Math.random() * 25;
      arr[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * (1.5 + (i % 5) * 0.3);
      if (arr[i * 3 + 1] > 15) arr[i * 3 + 1] = -15;
    }
    pos.needsUpdate = true;
    ref.current.rotation.y += delta * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={isDay ? "#C8A24A" : "#00d4ff"}
        transparent
        opacity={isDay ? 0.2 : 0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Gold ambient particles ── */
function AmbientParticles({ count = 200, isDay }: { count?: number; isDay: boolean }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#C8A24A"
        transparent
        opacity={isDay ? 0.15 : 0.25}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Main export ── */
export default function HUDGrid({ isDay = false }: { isDay?: boolean }) {
  return (
    <group>
      <GridFloor isDay={isDay} />
      <GridFloorGold isDay={isDay} />
      <DataStreams count={500} isDay={isDay} />
      <AmbientParticles count={150} isDay={isDay} />
    </group>
  );
}
