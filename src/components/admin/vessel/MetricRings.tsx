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

const ORBIT_RADIUS = 3;
const ORBIT_Y = 0.3;
const ORBIT_SPEED = 0.05;

function OrbitalMetricSatellite({
  metric, index, total, isCrisis,
}: {
  metric: MetricData; index: number; total: number; isCrisis?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  const pct = metric.max > 0 ? Math.min(metric.value / metric.max, 1) : 0;
  const color = isCrisis ? "#b84a4a" : metric.color;
  const angleOffset = (index / total) * Math.PI * 2;

  const innerEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 0.65)),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = angleOffset + t * ORBIT_SPEED;

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * ORBIT_RADIUS;
      groupRef.current.position.z = Math.sin(angle) * (ORBIT_RADIUS * 0.35);
      groupRef.current.position.y = ORBIT_Y + Math.sin(t * 0.3 + index * 1.2) * 0.08;
    }

    if (trailRef.current) {
      const mat = trailRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + Math.sin(t * 0.8 + index * 0.4) * 0.05;
    }
  });

  const filledWidth = 0.75 * pct;

  return (
    <group ref={groupRef}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Panel bg — warm glass */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1, 0.65]} />
          <meshBasicMaterial color={color} transparent opacity={0.012} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* Champagne border */}
        <lineSegments geometry={innerEdges} position={[0, 0, -0.005]}>
          <lineBasicMaterial color={color} transparent opacity={0.1} depthWrite={false} />
        </lineSegments>

        {/* Label — warm stone */}
        <Text position={[0, 0.2, 0]} fontSize={0.06} color="#8a8578" anchorX="center" anchorY="middle" font={undefined} letterSpacing={0.15}>
          {metric.label.toUpperCase()}
        </Text>

        {/* Value — champagne gold */}
        <Text position={[0, 0, 0]} fontSize={0.18} color={color} anchorX="center" anchorY="middle" font={undefined}>
          {typeof metric.value === "number" ? metric.value.toLocaleString() : String(metric.value)}
        </Text>

        {/* Progress bar bg */}
        <mesh position={[0, -0.17, 0]}>
          <planeGeometry args={[0.75, 0.03]} />
          <meshBasicMaterial color="#12121a" transparent opacity={0.3} />
        </mesh>

        {/* Progress bar fill — champagne */}
        <mesh ref={trailRef} position={[-(0.75 - filledWidth) / 2, -0.17, 0.001]}>
          <planeGeometry args={[filledWidth || 0.001, 0.03]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Percentage */}
        <Text position={[0.42, -0.17, 0]} fontSize={0.04} color={color} anchorX="right" anchorY="middle" font={undefined}>
          {Math.round(pct * 100) + "%"}
        </Text>
      </Billboard>
    </group>
  );
}

function OrbitPath({ isCrisis }: { isCrisis?: boolean }) {
  const lineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * ORBIT_RADIUS,
        ORBIT_Y,
        Math.sin(angle) * (ORBIT_RADIUS * 0.35)
      ));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: isCrisis ? "#b84a4a" : "#C8A24A",
      transparent: true,
      opacity: 0.035,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, [isCrisis]);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.opacity = 0.035 + Math.sin(clock.getElapsedTime() * 0.3) * 0.015;
  });

  return <primitive object={lineObj} />;
}

export default function MetricRings({ metrics, isCrisis }: MetricRingsProps) {
  const total = metrics.length;

  return (
    <group>
      <OrbitPath isCrisis={isCrisis} />
      {metrics.map((m, i) => (
        <OrbitalMetricSatellite key={m.label} metric={m} index={i} total={total} isCrisis={isCrisis} />
      ))}
    </group>
  );
}
