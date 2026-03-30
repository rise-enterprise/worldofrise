import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Floating particles in the infinite dark space
 */
export function ParticleField({ count = 800 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      sz[i] = Math.random() * 0.03 + 0.005;
    }
    return [pos, sz];
  }, [count]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.008;
    mesh.current.rotation.x += delta * 0.003;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#a48b5c"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Subtle ambient light trails that drift through space
 */
export function AmbientDrift() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.15;
    ref.current.rotation.z = Math.sin(t) * 0.1;
    ref.current.rotation.x = Math.cos(t * 0.7) * 0.05;
  });

  return (
    <mesh ref={ref} position={[0, 0, -5]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial
        color="#1a1510"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
