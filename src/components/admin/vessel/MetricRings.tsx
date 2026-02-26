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

const ORBIT_RADIUS = 3.2;
const ORBIT_Y = 0.3; // centered on the core
const ORBIT_SPEED = 0.08;

function OrbitalMetricSatellite({
  metric,
  index,
  total,
  isCrisis,
}: {
  metric: MetricData;
  index: number;
  total: number;
  isCrisis?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  const pct = metric.max > 0 ? Math.min(metric.value / metric.max, 1) : 0;
  const color = isCrisis ? "#ff4444" : metric.color;
  const angleOffset = (index / total) * Math.PI * 2;

  const innerEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.1, 0.75)),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = angleOffset + t * ORBIT_SPEED;

    if (groupRef.current) {
      // Elliptical orbit path
      groupRef.current.position.x = Math.cos(angle) * ORBIT_RADIUS;
      groupRef.current.position.z = Math.sin(angle) * (ORBIT_RADIUS * 0.4);
      groupRef.current.position.y =
        ORBIT_Y + Math.sin(t * 0.5 + index * 1.3) * 0.15;
    }

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isCrisis
        ? 0.08 + Math.sin(t * 4) * 0.05
        : 0.04 + Math.sin(t * 0.8 + index) * 0.02;
    }

    if (trailRef.current) {
      const mat = trailRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 1.2 + index * 0.5) * 0.1;
    }
  });

  const filledWidth = 0.85 * pct;

  return (
    <group ref={groupRef}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Hexagonal glow backdrop */}
        <mesh ref={glowRef} position={[0, 0, -0.02]}>
          <circleGeometry args={[0.65, 6]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Inner border frame */}
        <lineSegments geometry={innerEdges} position={[0, 0, -0.005]}>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </lineSegments>

        {/* Panel background */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.1, 0.75]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Label */}
        <Text
          position={[0, 0.22, 0]}
          fontSize={0.07}
          color="#889"
          anchorX="center"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.14}
        >
          {metric.label.toUpperCase()}
        </Text>

        {/* Value */}
        <Text
          position={[0, 0.02, 0]}
          fontSize={0.2}
          color={color}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {typeof metric.value === "number"
            ? metric.value.toLocaleString()
            : String(metric.value)}
        </Text>

        {/* Progress bar background */}
        <mesh position={[0, -0.18, 0]}>
          <planeGeometry args={[0.85, 0.04]} />
          <meshBasicMaterial color="#222" transparent opacity={0.5} />
        </mesh>

        {/* Progress bar fill */}
        <mesh
          ref={trailRef}
          position={[-(0.85 - filledWidth) / 2, -0.18, 0.001]}
        >
          <planeGeometry args={[filledWidth || 0.001, 0.04]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Percentage indicator */}
        <Text
          position={[0.48, -0.18, 0]}
          fontSize={0.045}
          color={color}
          anchorX="right"
          anchorY="middle"
          font={undefined}
        >
          {Math.round(pct * 100) + "%"}
        </Text>
      </Billboard>
    </group>
  );
}

/* Orbital ring visual (the path the satellites follow) */
function OrbitPath({ isCrisis }: { isCrisis?: boolean }) {
  const lineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(angle) * ORBIT_RADIUS,
          ORBIT_Y,
          Math.sin(angle) * (ORBIT_RADIUS * 0.4)
        )
      );
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: isCrisis ? "#ff4444" : "#C8A24A",
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, [isCrisis]);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.5) * 0.03;
  });

  return <primitive object={lineObj} />;
}

export default function MetricRings({ metrics, isCrisis }: MetricRingsProps) {
  const total = metrics.length;

  return (
    <group>
      <OrbitPath isCrisis={isCrisis} />
      {metrics.map((m, i) => (
        <OrbitalMetricSatellite
          key={m.label}
          metric={m}
          index={i}
          total={total}
          isCrisis={isCrisis}
        />
      ))}
    </group>
  );
}
