import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

interface AIMetric {
  label: string;
  value: number;
}

interface AIResponseMetricsProps {
  metrics: AIMetric[];
}

function AIMetricPanel({
  metric,
  position,
  index,
}: {
  metric: AIMetric;
  position: [number, number, number];
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const outerGlowRef = useRef<THREE.LineSegments>(null);
  const [scale, setScale] = useState(0);

  // Scale-in animation
  useEffect(() => {
    setScale(0);
    const raf = requestAnimationFrame(() => setScale(1));
    return () => cancelAnimationFrame(raf);
  }, [metric.label, metric.value]);

  const innerEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.2, 0.8)), []);
  const outerEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.3, 0.9)), []);

  const CYAN = "#00d4ff";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + index * 1.2) * 0.04;
      // Spring-like scale animation
      const currentScale = groupRef.current.scale.x;
      const target = scale;
      const next = currentScale + (target - currentScale) * 0.08;
      groupRef.current.scale.setScalar(next);
    }
    if (outerGlowRef.current) {
      const mat = outerGlowRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.1 + Math.sin(t * 1.5 + index * 0.7) * 0.06;
    }
  });

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
    if (v >= 1_000) return (v / 1_000).toFixed(v >= 10_000 ? 0 : 1) + "K";
    return v.toLocaleString();
  };

  return (
    <group ref={groupRef} position={position} scale={0}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Outer glow border */}
        <lineSegments ref={outerGlowRef} geometry={outerEdges} position={[0, 0, -0.008]}>
          <lineBasicMaterial
            color={CYAN}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* Inner border */}
        <lineSegments geometry={innerEdges} position={[0, 0, -0.005]}>
          <lineBasicMaterial color={CYAN} transparent opacity={0.3} depthWrite={false} />
        </lineSegments>

        {/* Glow backdrop */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.3, 0.9]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* AI tag */}
        <Text
          position={[-0.5, 0.3, 0]}
          fontSize={0.06}
          color={CYAN}
          anchorX="left"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.2}
        >
          AI
        </Text>

        {/* Label */}
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.08}
          color="#88aacc"
          anchorX="center"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.12}
        >
          {metric.label.toUpperCase()}
        </Text>

        {/* Value */}
        <Text
          position={[0, -0.02, 0]}
          fontSize={0.22}
          color={CYAN}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {formatValue(metric.value)}
        </Text>

        {/* Underline accent */}
        <mesh position={[0, -0.2, 0]}>
          <planeGeometry args={[0.8, 0.008]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

export default function AIResponseMetrics({ metrics }: AIResponseMetricsProps) {
  const display = metrics.slice(0, 6);
  const spacing = 1.7;
  const startX = -((display.length - 1) * spacing) / 2;
  const y = 2.5;

  return (
    <group>
      {display.map((m, i) => (
        <AIMetricPanel
          key={`${m.label}-${m.value}`}
          metric={m}
          index={i}
          position={[startX + i * spacing, y, 0]}
        />
      ))}
    </group>
  );
}
