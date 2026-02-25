import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
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

const BAR_WIDTH = 0.8;
const BAR_HEIGHT = 0.04;

function MetricPanel({
  metric,
  position,
  index,
  isCrisis,
}: {
  metric: MetricData;
  position: [number, number, number];
  index: number;
  isCrisis?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const barRef = useRef<THREE.Mesh>(null);

  const pct = metric.max > 0 ? Math.min(metric.value / metric.max, 1) : 0;
  const color = isCrisis ? "#ff4444" : metric.color;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(t * 0.6 + index * 0.9) * 0.05;
    }
    // Crisis pulse on value text opacity
    if (barRef.current) {
      const mat = barRef.current.material as THREE.MeshBasicMaterial;
      if (isCrisis) {
        mat.opacity = 0.7 + Math.sin(t * 4) * 0.3;
      } else {
        mat.opacity = 0.85;
      }
    }
  });

  const filledWidth = BAR_WIDTH * pct;

  return (
    <group ref={groupRef} position={position}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Glow backdrop */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1, 0.7]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Label */}
        <Text
          position={[0, 0.18, 0]}
          fontSize={0.07}
          color="#667"
          anchorX="center"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.12}
        >
          {metric.label.toUpperCase()}
        </Text>

        {/* Value */}
        <Text
          position={[0, 0.02, 0]}
          fontSize={0.16}
          color={color}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {typeof metric.value === "number"
            ? metric.value.toLocaleString()
            : String(metric.value)}
        </Text>

        {/* Bar background */}
        <mesh position={[0, -0.15, 0]}>
          <planeGeometry args={[BAR_WIDTH, BAR_HEIGHT]} />
          <meshBasicMaterial color="#222" transparent opacity={0.5} />
        </mesh>

        {/* Bar fill */}
        <mesh
          ref={barRef}
          position={[-(BAR_WIDTH - filledWidth) / 2, -0.15, 0.001]}
        >
          <planeGeometry args={[filledWidth || 0.001, BAR_HEIGHT]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

export default function MetricRings({ metrics, isCrisis }: MetricRingsProps) {
  // Layout: top row up to 5, bottom row the rest
  const topRow = metrics.slice(0, Math.min(5, metrics.length));
  const bottomRow = metrics.slice(5);

  const topSpacing = 1.6;
  const topY = -2;
  const bottomY = -3;
  const bottomSpacing = 1.6;

  const topStartX = -((topRow.length - 1) * topSpacing) / 2;
  const bottomStartX = -((bottomRow.length - 1) * bottomSpacing) / 2;

  return (
    <group>
      {topRow.map((m, i) => (
        <MetricPanel
          key={m.label}
          metric={m}
          index={i}
          isCrisis={isCrisis}
          position={[topStartX + i * topSpacing, topY, 0]}
        />
      ))}
      {bottomRow.map((m, i) => (
        <MetricPanel
          key={m.label}
          metric={m}
          index={i + topRow.length}
          isCrisis={isCrisis}
          position={[bottomStartX + i * bottomSpacing, bottomY, 0]}
        />
      ))}
    </group>
  );
}
