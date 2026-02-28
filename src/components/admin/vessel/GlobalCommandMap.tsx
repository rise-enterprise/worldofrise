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

/* Convert lat/lng to spherical coordinates on globe */
function latLngToSphere(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ── Stylized holographic globe ── */
function HolographicGlobe() {
  const globeRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.02 + Math.sin(clock.getElapsedTime() * 0.5) * 0.008;
    }
  });

  const GLOBE_R = 2.2;
  const color = "#00d4ff";

  return (
    <group ref={globeRef}>
      {/* Solid inner sphere — subtle glow */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[GLOBE_R - 0.05, 48, 48]} />
        <meshBasicMaterial
          color="#001828"
          transparent
          opacity={0.03}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe grid sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_R, 32, 24]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Latitude rings */}
      {[-60, -30, 0, 30, 60].map((lat, i) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const r = GLOBE_R * Math.sin(phi);
        const y = GLOBE_R * Math.cos(phi);
        return (
          <mesh key={`lat-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.005, r + 0.005, 96]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={lat === 0 ? 0.1 : 0.04}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Meridian rings */}
      {[0, 30, 60, 90, 120, 150].map((lng, i) => (
        <mesh key={`mer-${i}`} rotation={[0, (lng * Math.PI) / 180, 0]}>
          <ringGeometry args={[GLOBE_R - 0.005, GLOBE_R + 0.005, 96]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Outer energy ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[GLOBE_R + 0.3, GLOBE_R + 0.32, 128]} />
        <meshBasicMaterial
          color="#C8A24A"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Second outer ring — tilted */}
      <mesh rotation={[Math.PI / 2 + 0.3, 0.2, 0]}>
        <ringGeometry args={[GLOBE_R + 0.5, GLOBE_R + 0.515, 128]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ── Animated energy arc between two cities ── */
function EnergyArc({
  from,
  to,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
}) {
  const lineObj = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const dist = from.distanceTo(to);
    mid.normalize().multiplyScalar(2.2 + dist * 0.25);

    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const pts = curve.getPoints(48);
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: "#00d4ff",
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, [from, to]);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.opacity = 0.12 + Math.sin(clock.getElapsedTime() * 0.8) * 0.08;
  });

  return <primitive object={lineObj} />;
}

/* ── Pulsing city beacon on globe surface ── */
function CityBeacon({
  city,
  position,
}: {
  city: CityNode;
  position: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const gold = "#C8A24A";
  const cyan = "#00d4ff";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(t * 2.5 + position.x * 3) * 0.25;
      const s = hovered ? 1.6 : 1;
      beaconRef.current.scale.setScalar(
        beaconRef.current.scale.x + (s - beaconRef.current.scale.x) * 0.1
      );
    }

    if (ringRef.current) {
      const scale = 1 + ((t * 0.5 + position.x) % 2);
      ringRef.current.scale.setScalar(scale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.35 - (scale - 1) * 0.2);
    }

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 1.5) * 0.08;
    }
  });

  // Orient beacon outward from globe center
  const normal = position.clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);

  return (
    <group
      ref={groupRef}
      position={position}
      quaternion={quat}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Vertical data beam */}
      <mesh ref={beamRef} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.8, 6]} />
        <meshBasicMaterial
          color={cyan}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Core beacon sphere */}
      <mesh ref={beaconRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial
          color={gold}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Expanding pulse ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.08, 32]} />
        <meshBasicMaterial
          color={cyan}
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
          position={[0, 0.95, 0]}
          fontSize={0.09}
          color={gold}
          anchorX="center"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.2}
        >
          {city.name}
        </Text>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.045}
          color="#5a8aaa"
          anchorX="center"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.12}
        >
          {city.brand + " · " + city.branches + (city.branches > 1 ? " NODES" : " NODE")}
        </Text>
      </Billboard>

      {/* Hover intel panel */}
      {hovered && (
        <Billboard follow>
          <group position={[0, 1.4, 0]}>
            <mesh>
              <planeGeometry args={[1.3, 0.65]} />
              <meshBasicMaterial color="#001018" transparent opacity={0.82} depthWrite={false} />
            </mesh>
            <lineSegments geometry={new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.3, 0.65))}>
              <lineBasicMaterial color={cyan} transparent opacity={0.35} depthWrite={false} />
            </lineSegments>
            <Text position={[0, 0.2, 0.01]} fontSize={0.055} color={gold} anchorX="center" font={undefined} letterSpacing={0.15}>
              {city.name + " NEXUS"}
            </Text>
            <Text position={[-0.55, 0.06, 0.01]} fontSize={0.04} color="#5a7a8a" anchorX="left" font={undefined}>Active Nodes</Text>
            <Text position={[0.55, 0.06, 0.01]} fontSize={0.045} color={cyan} anchorX="right" font={undefined}>
              {city.id === "doha" ? "2,841" : city.id === "riyadh" ? "412" : "287"}
            </Text>
            <Text position={[-0.55, -0.06, 0.01]} fontSize={0.04} color="#5a7a8a" anchorX="left" font={undefined}>Retention Field</Text>
            <Text position={[0.55, -0.06, 0.01]} fontSize={0.045} color="#10b981" anchorX="right" font={undefined}>
              {city.id === "doha" ? "87%" : city.id === "riyadh" ? "92%" : "78%"}
            </Text>
            <Text position={[-0.55, -0.18, 0.01]} fontSize={0.04} color="#5a7a8a" anchorX="left" font={undefined}>Threat Level</Text>
            <Text position={[0.55, -0.18, 0.01]} fontSize={0.045} color={city.id === "london" ? "#ff6644" : gold} anchorX="right" font={undefined}>
              {city.id === "doha" ? "Stable" : city.id === "riyadh" ? "Stable" : "Elevated"}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}

/* ── Main Globe Component ── */
interface GlobalCommandMapProps {
  isDay?: boolean;
}

export default function GlobalCommandMap({ isDay = false }: GlobalCommandMapProps) {
  const groupRef = useRef<THREE.Group>(null);
  const GLOBE_R = 2.2;

  const cityData = useMemo(() => {
    return CITIES.map((city) => ({
      city,
      position: latLngToSphere(city.lat, city.lng, GLOBE_R),
    }));
  }, []);

  const connections = useMemo(() => {
    const doha = cityData.find(c => c.city.id === "doha")!;
    const riyadh = cityData.find(c => c.city.id === "riyadh")!;
    const london = cityData.find(c => c.city.id === "london")!;
    return [
      { from: doha.position, to: riyadh.position },
      { from: doha.position, to: london.position },
      { from: riyadh.position, to: london.position },
    ];
  }, [cityData]);

  return (
    <group ref={groupRef} position={[0, -4, -2]}>
      <HolographicGlobe />

      {/* Energy arcs between cities */}
      {connections.map((conn, i) => (
        <EnergyArc key={i} from={conn.from} to={conn.to} />
      ))}

      {/* City beacons */}
      {cityData.map(({ city, position }) => (
        <CityBeacon key={city.id} city={city} position={position} />
      ))}
    </group>
  );
}
