import { useRef, useMemo } from "react";
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

const BAR_WIDTH = 1.1;
const BAR_HEIGHT = 0.055;

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
  const outerGlowRef = useRef<THREE.LineSegments>(null);

  const pct = metric.max > 0 ? Math.min(metric.value / metric.max, 1) : 0;
  const color = isCrisis ? "#ff4444" : metric.color;

  const innerEdges = useMemo(() => {
    const plane = new THREE.PlaneGeometry(1.3, 0.85);
    return new THREE.EdgesGeometry(plane);
  }, []);

  const outerEdges = useMemo(() => {
    const plane = new THREE.PlaneGeometry(1.4, 0.95);
    return new THREE.EdgesGeometry(plane);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(t * 0.6 + index * 0.9) * 0.05;
    }
    if (barRef.current) {
      const mat = barRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isCrisis ? 0.7 + Math.sin(t * 4) * 0.3 : 0.85;
    }
    if (outerGlowRef.current) {
      const mat = outerGlowRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = isCrisis
        ? 0.06 + Math.sin(t * 3) * 0.06
        : 0.06 + Math.sin(t * 1.2 + index) * 0.04;
    }
  });

  const filledWidth = BAR_WIDTH * pct;

  return (
    <group ref={groupRef} position={position}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Outer glow border */}
        <lineSegments ref={outerGlowRef} geometry={outerEdges} position={[0, 0, -0.008]}>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* Inner border */}
        <lineSegments geometry={innerEdges} position={[0, 0, -0.005]}>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </lineSegments>

        {/* Glow backdrop */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.4, 0.9]} />
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
          position={[0, 0.24, 0]}
          fontSize={0.09}
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
          fontSize={0.22}
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
        <mesh position={[0, -0.2, 0]}>
          <planeGeometry args={[BAR_WIDTH, BAR_HEIGHT]} />
          <meshBasicMaterial color="#222" transparent opacity={0.5} />
        </mesh>

        {/* Bar fill */}
        <mesh
          ref={barRef}
          position={[-(BAR_WIDTH - filledWidth) / 2, -0.2, 0.001]}
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
  const topRow = metrics.slice(0, Math.min(5, metrics.length));
  const bottomRow = metrics.slice(5);

  const topSpacing = 1.9;
  const topY = -2;
  const bottomY = -3;
  const bottomSpacing = 1.9;

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
