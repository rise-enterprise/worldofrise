import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface MetricData {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface MetricRingsProps {
  metrics: MetricData[];
  isCrisis?: boolean;
}

function MetricArc({ metric, index, total, isCrisis }: { metric: MetricData; index: number; total: number; isCrisis?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const arcRef = useRef<THREE.Mesh>(null);

  const angle = (index / total) * Math.PI * 2;
  const radius = 4;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const pct = metric.max > 0 ? metric.value / metric.max : 0;
  const arcLength = Math.PI * 1.5 * pct;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5 + index) * 0.15;
      groupRef.current.rotation.y = t * 0.1;
    }
  });

  const color = isCrisis ? "#ff4444" : metric.color;

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* Background ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.02, 8, 64]} />
        <meshBasicMaterial color="#333" transparent opacity={0.3} />
      </mesh>

      {/* Value arc */}
      <mesh ref={arcRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.035, 8, 64, arcLength]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.12}
        color="#888"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {metric.label}
      </Text>

      {/* Value */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {typeof metric.value === "number" ? metric.value.toLocaleString() : String(metric.value)}
      </Text>
    </group>
  );
}

export default function MetricRings({ metrics, isCrisis }: MetricRingsProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {metrics.map((m, i) => (
        <MetricArc key={m.label} metric={m} index={i} total={metrics.length} isCrisis={isCrisis} />
      ))}
    </group>
  );
}
