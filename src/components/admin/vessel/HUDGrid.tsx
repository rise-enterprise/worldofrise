import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Warm gold grid floor — marble shimmer ── */
function GridFloor() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.02 + Math.sin(clock.getElapsedTime() * 0.2) * 0.006;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshBasicMaterial
        color="#D4A843"
        wireframe
        transparent
        opacity={0.02}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Second grid (subtle offset) ── */
function GridFloorSecondary() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, -3.03, 0]}>
      <planeGeometry args={[40, 40, 20, 20]} />
      <meshBasicMaterial
        color="#E0C06A"
        wireframe
        transparent
        opacity={0.008}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Warm luminous gold particles ── */
function LuminousParticles({ count = 250 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const col = Math.floor(Math.random() * 16);
      const angle = (col / 16) * Math.PI * 2;
      const radius = 6 + Math.random() * 20;
      arr[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.5;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.5;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * (0.5 + (i % 4) * 0.1);
      if (arr[i * 3 + 1] > 12) arr[i * 3 + 1] = -12;
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
        size={0.02}
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

/* ── Ambient warmth particles ── */
function AmbientParticles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.001;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#d4b86a"
        transparent
        opacity={0.06}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ── Main ── */
export default function HUDGrid({ isDay = false }: { isDay?: boolean }) {
  return (
    <group>
      <GridFloor />
      <GridFloorSecondary />
      <LuminousParticles count={200} />
      <AmbientParticles count={60} />
    </group>
  );
}
