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

const OUTER_ORBIT_RADIUS = 4.2;
const OUTER_ORBIT_Y = 0.5;
const OUTER_ORBIT_SPEED = -0.035;

function AIOrbitSatellite({ metric, index, total }: { metric: AIMetric; index: number; total: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0);
  const angleOffset = (index / total) * Math.PI * 2;
  const accentColor = "#D4A843";

  useEffect(() => {
    setScale(0);
    const raf = requestAnimationFrame(() => setScale(1));
    return () => cancelAnimationFrame(raf);
  }, [metric.label, metric.value]);

  const innerEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.9, 0.6)),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = angleOffset + t * OUTER_ORBIT_SPEED;

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * OUTER_ORBIT_RADIUS;
      groupRef.current.position.z = Math.sin(angle) * (OUTER_ORBIT_RADIUS * 0.3);
      groupRef.current.position.y = OUTER_ORBIT_Y + Math.sin(t * 0.5 + index * 1.3) * 0.06;
      const cur = groupRef.current.scale.x;
      groupRef.current.scale.setScalar(cur + (scale - cur) * 0.04);
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
        {/* Frame — champagne */}
        <lineSegments geometry={innerEdges} position={[0, 0, -0.005]}>
          <lineBasicMaterial color={accentColor} transparent opacity={0.1} depthWrite={false} />
        </lineSegments>

        {/* Backdrop — warm glass */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.9, 0.6]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.012} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* AI tag */}
        <Text position={[-0.38, 0.22, 0]} fontSize={0.04} color="#d4b86a" anchorX="left" anchorY="middle" font={undefined} letterSpacing={0.18}>
          AI
        </Text>

        {/* Label — warm stone */}
        <Text position={[0, 0.13, 0]} fontSize={0.055} color="#8a8578" anchorX="center" anchorY="middle" font={undefined} letterSpacing={0.15}>
          {metric.label.toUpperCase()}
        </Text>

        {/* Value — champagne gold */}
        <Text position={[0, -0.04, 0]} fontSize={0.15} color={accentColor} anchorX="center" anchorY="middle" font={undefined}>
          {formatValue(metric.value)}
        </Text>

        {/* Accent line */}
        <mesh position={[0, -0.18, 0]}>
          <planeGeometry args={[0.55, 0.004]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
      </Billboard>
    </group>
  );
}

function OuterOrbitPath() {
  const lineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * OUTER_ORBIT_RADIUS,
        OUTER_ORBIT_Y,
        Math.sin(angle) * (OUTER_ORBIT_RADIUS * 0.3)
      ));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: "#C8A24A",
      transparent: true,
      opacity: 0.03,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, []);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.opacity = 0.03 + Math.sin(clock.getElapsedTime() * 0.5) * 0.012;
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
        <AIOrbitSatellite key={`${m.label}-${m.value}`} metric={m} index={i} total={total} />
      ))}
    </group>
  );
}
