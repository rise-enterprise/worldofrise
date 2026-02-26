import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

/* ── City Node Data ── */
interface CityNode {
  id: string;
  name: string;
  brand: string;
  lat: number;
  lng: number;
  branches: number;
}

const CITIES: CityNode[] = [
  { id: "doha", name: "DOHA", brand: "NOIR · SASSO", lat: 25.28, lng: 51.52, branches: 4 },
  { id: "riyadh", name: "RIYADH", brand: "NOIR", lat: 24.71, lng: 46.67, branches: 1 },
  { id: "london", name: "LONDON", brand: "NOIR · SASSO", lat: 51.51, lng: -0.13, branches: 2 },
];

/* Convert lat/lng to flat map coords */
function latLngToXZ(lat: number, lng: number, scale = 0.06): [number, number] {
  // Center around ~35N, 25E (midpoint of our region)
  const x = (lng - 25) * scale;
  const z = -(lat - 38) * scale;
  return [x, z];
}

/* ── Animated connection line between two cities ── */
function ConnectionLine({
  from,
  to,
  isDay,
}: {
  from: [number, number];
  to: [number, number];
  isDay: boolean;
}) {
  const lineObj = useMemo(() => {
    const midX = (from[0] + to[0]) / 2;
    const midZ = (from[1] + to[1]) / 2;
    const dist = Math.sqrt((to[0] - from[0]) ** 2 + (to[1] - from[1]) ** 2);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(from[0], 0, from[1]),
      new THREE.Vector3(midX, dist * 0.3, midZ),
      new THREE.Vector3(to[0], 0, to[1])
    );

    const pts = curve.getPoints(64);
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: isDay ? "#C8A24A" : "#00d4ff",
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, [from, to, isDay]);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.opacity = 0.1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.08;
  });

  return <primitive object={lineObj} />;
}

/* ── Pulsing city beacon ── */
function CityBeacon({
  city,
  position,
  isDay,
}: {
  city: CityNode;
  position: [number, number, number];
  isDay: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const gold = "#C8A24A";
  const cyan = "#00d4ff";
  const color = isDay ? gold : cyan;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.6 + Math.sin(t * 2 + position[0]) * 0.3;
      const s = hovered ? 1.4 : 1;
      beaconRef.current.scale.setScalar(
        beaconRef.current.scale.x + (s - beaconRef.current.scale.x) * 0.1
      );
    }

    if (ringRef.current) {
      const scale = 1 + (t * 0.4 + position[0] * 0.5) % 1.5;
      ringRef.current.scale.setScalar(scale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.3 - (scale - 1) * 0.3);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Vertical beam */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.6, 6]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Core beacon dot */}
      <mesh ref={beaconRef}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Expanding pulse ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.08, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* City label */}
      <Billboard follow>
        <Text
          position={[0, 0.7, 0]}
          fontSize={0.08}
          color={color}
          anchorX="center"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.2}
        >
          {city.name}
        </Text>
        <Text
          position={[0, 0.58, 0]}
          fontSize={0.04}
          color={isDay ? "#998866" : "#6688aa"}
          anchorX="center"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.15}
        >
          {city.brand + " · " + city.branches + (city.branches > 1 ? " LOCATIONS" : " LOCATION")}
        </Text>
      </Billboard>

      {/* Hover: expanded glass intel panel */}
      {hovered && (
        <Billboard follow>
          <group position={[0, 1.1, 0]}>
            {/* Panel background */}
            <mesh>
              <planeGeometry args={[1.2, 0.6]} />
              <meshBasicMaterial
                color={isDay ? "#1a1508" : "#001122"}
                transparent
                opacity={0.75}
                depthWrite={false}
              />
            </mesh>
            {/* Border */}
            <lineSegments
              geometry={new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.2, 0.6))}
            >
              <lineBasicMaterial
                color={color}
                transparent
                opacity={0.4}
                depthWrite={false}
              />
            </lineSegments>

            <Text position={[0, 0.18, 0.01]} fontSize={0.055} color={color} anchorX="center" font={undefined} letterSpacing={0.15}>
              {city.name + " INTELLIGENCE"}
            </Text>
            <Text position={[-0.5, 0.04, 0.01]} fontSize={0.04} color="#889" anchorX="left" font={undefined}>
              {"Active Members"}
            </Text>
            <Text position={[0.5, 0.04, 0.01]} fontSize={0.045} color={color} anchorX="right" font={undefined}>
              {city.id === "doha" ? "2,841" : city.id === "riyadh" ? "412" : "287"}
            </Text>
            <Text position={[-0.5, -0.06, 0.01]} fontSize={0.04} color="#889" anchorX="left" font={undefined}>
              {"VIP Retention"}
            </Text>
            <Text position={[0.5, -0.06, 0.01]} fontSize={0.045} color="#10b981" anchorX="right" font={undefined}>
              {city.id === "doha" ? "87%" : city.id === "riyadh" ? "92%" : "78%"}
            </Text>
            <Text position={[-0.5, -0.16, 0.01]} fontSize={0.04} color="#889" anchorX="left" font={undefined}>
              {"Churn Risk"}
            </Text>
            <Text position={[0.5, -0.16, 0.01]} fontSize={0.045} color={city.id === "london" ? "#ff6644" : "#C8A24A"} anchorX="right" font={undefined}>
              {city.id === "doha" ? "Low" : city.id === "riyadh" ? "Low" : "Medium"}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}

/* ── Minimal wireframe globe outline ── */
function GlobeWireframe({ isDay }: { isDay: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  const color = isDay ? "#C8A24A" : "#00d4ff";

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* Equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.98, 3.0, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Meridian rings */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((rot, i) => (
        <mesh key={i} rotation={[0, rot, 0]}>
          <ringGeometry args={[2.98, 3.0, 128]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Main Map Component ── */
interface GlobalCommandMapProps {
  isDay?: boolean;
}

export default function GlobalCommandMap({ isDay = false }: GlobalCommandMapProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Compute positions
  const cityPositions = useMemo(() => {
    return CITIES.map((city) => {
      const [x, z] = latLngToXZ(city.lat, city.lng);
      return { city, position: [x, 0, z] as [number, number, number] };
    });
  }, []);

  // Connection pairs
  const connections = useMemo(() => {
    const doha = cityPositions.find((c) => c.city.id === "doha")!;
    const riyadh = cityPositions.find((c) => c.city.id === "riyadh")!;
    const london = cityPositions.find((c) => c.city.id === "london")!;
    return [
      { from: doha, to: riyadh },
      { from: doha, to: london },
      { from: riyadh, to: london },
    ];
  }, [cityPositions]);

  return (
    <group ref={groupRef} position={[0, -4.5, -2]}>
      <GlobeWireframe isDay={isDay} />

      {/* Connection arcs */}
      {connections.map((conn, i) => (
        <ConnectionLine
          key={i}
          from={[conn.from.position[0], conn.from.position[2]]}
          to={[conn.to.position[0], conn.to.position[2]]}
          isDay={isDay}
        />
      ))}

      {/* City beacons */}
      {cityPositions.map(({ city, position }) => (
        <CityBeacon
          key={city.id}
          city={city}
          position={position}
          isDay={isDay}
        />
      ))}
    </group>
  );
}
