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

const OUTER_ORBIT_RADIUS = 4.5;
const OUTER_ORBIT_Y = 0.6;
const OUTER_ORBIT_SPEED = -0.05; // counter-rotate

function AIOrbitSatellite({
  metric,
  index,
  total,
}: {
  metric: AIMetric;
  index: number;
  total: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0);

  const CYAN = "#00d4ff";
  const angleOffset = (index / total) * Math.PI * 2;

  useEffect(() => {
    setScale(0);
    const raf = requestAnimationFrame(() => setScale(1));
    return () => cancelAnimationFrame(raf);
  }, [metric.label, metric.value]);

  const innerEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.0, 0.7)),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = angleOffset + t * OUTER_ORBIT_SPEED;

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * OUTER_ORBIT_RADIUS;
      groupRef.current.position.z =
        Math.sin(angle) * (OUTER_ORBIT_RADIUS * 0.35);
      groupRef.current.position.y =
        OUTER_ORBIT_Y + Math.sin(t * 0.7 + index * 1.5) * 0.12;

      // Smooth scale-in
      const cur = groupRef.current.scale.x;
      groupRef.current.scale.setScalar(cur + (scale - cur) * 0.06);
    }

    if (pulseRef.current) {
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(t * 1.5 + index * 0.8) * 0.02;
    }
  });

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
    if (v >= 1_000) return (v / 1_000).toFixed(v >= 10_000 ? 0 : 1) + "K";
    return v.toLocaleString();
  };

  return (
    <group ref={groupRef} scale={0}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Glow orb behind */}
        <mesh ref={pulseRef} position={[0, 0, -0.02]}>
          <circleGeometry args={[0.55, 32]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Frame */}
        <lineSegments geometry={innerEdges} position={[0, 0, -0.005]}>
          <lineBasicMaterial
            color={CYAN}
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </lineSegments>

        {/* Backdrop */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.0, 0.7]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={0.02}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* AI tag */}
        <Text
          position={[-0.42, 0.25, 0]}
          fontSize={0.05}
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
          position={[0, 0.16, 0]}
          fontSize={0.065}
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
          position={[0, -0.04, 0]}
          fontSize={0.18}
          color={CYAN}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {formatValue(metric.value)}
        </Text>

        {/* Accent line */}
        <mesh position={[0, -0.2, 0]}>
          <planeGeometry args={[0.65, 0.006]} />
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

/* Outer orbit ring path */
function OuterOrbitPath() {
  const lineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(angle) * OUTER_ORBIT_RADIUS,
          OUTER_ORBIT_Y,
          Math.sin(angle) * (OUTER_ORBIT_RADIUS * 0.35)
        )
      );
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: "#00d4ff",
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, []);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.opacity = 0.06 + Math.sin(clock.getElapsedTime() * 0.7) * 0.02;
  });

  return <primitive object={lineObj} />;
}

export default function AIResponseMetrics({ metrics }: AIResponseMetricsProps) {
  const display = metrics.slice(0, 6);
  const total = display.length;

  return (
    <group>
      <OuterOrbitPath />
      {display.map((m, i) => (
        <AIOrbitSatellite
          key={`${m.label}-${m.value}`}
          metric={m}
          index={i}
          total={total}
        />
      ))}
    </group>
  );
}
