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
  revenue: string;
  growth: string;
}

const CITIES: CityNode[] = [
  { id: "doha", name: "DOHA", brand: "NOIR · SASSO", lat: 25.28, lng: 51.52, branches: 4, revenue: "QAR 2.4M", growth: "+18%" },
  { id: "riyadh", name: "RIYADH", brand: "NOIR", lat: 24.71, lng: 46.67, branches: 1, revenue: "SAR 890K", growth: "+24%" },
  { id: "london", name: "LONDON", brand: "NOIR · SASSO", lat: 51.51, lng: -0.13, branches: 2, revenue: "£1.1M", growth: "+9%" },
];

function latLngToSphere(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ── Holographic globe with luxury styling ── */
function HolographicGlobe() {
  const globeRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.025;
    }
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.015 + Math.sin(clock.getElapsedTime() * 0.4) * 0.006;
    }
  });

  const GLOBE_R = 2.2;
  const gold = "#C8A24A";
  const gridColor = "#C8A24A";

  return (
    <group ref={globeRef}>
      {/* Inner glow sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[GLOBE_R - 0.05, 48, 48]} />
        <meshBasicMaterial color="#0a0806" transparent opacity={0.02} depthWrite={false} />
      </mesh>

      {/* Wireframe — subtle gold grid */}
      <mesh>
        <sphereGeometry args={[GLOBE_R, 32, 24]} />
        <meshBasicMaterial
          color={gridColor}
          wireframe
          transparent
          opacity={0.03}
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
            <ringGeometry args={[r - 0.004, r + 0.004, 96]} />
            <meshBasicMaterial
              color={gridColor}
              transparent
              opacity={lat === 0 ? 0.08 : 0.03}
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
          <ringGeometry args={[GLOBE_R - 0.004, GLOBE_R + 0.004, 96]} />
          <meshBasicMaterial
            color={gridColor}
            transparent
            opacity={0.025}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Outer executive ring — gold */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[GLOBE_R + 0.3, GLOBE_R + 0.315, 128]} />
        <meshBasicMaterial
          color={gold}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Second ring — tilted accent */}
      <mesh rotation={[Math.PI / 2 + 0.25, 0.15, 0]}>
        <ringGeometry args={[GLOBE_R + 0.5, GLOBE_R + 0.51, 128]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ── Energy arc connection ── */
function EnergyArc({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const lineObj = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const dist = from.distanceTo(to);
    mid.normalize().multiplyScalar(2.2 + dist * 0.22);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const pts = curve.getPoints(48);
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: "#C8A24A",
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, [from, to]);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.6) * 0.06;
  });

  return <primitive object={lineObj} />;
}

/* ── City beacon — executive data marker ── */
function CityBeacon({ city, position }: { city: CityNode; position: THREE.Vector3 }) {
  const beaconRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const gold = "#C8A24A";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(t * 2 + position.x * 3) * 0.2;
      const s = hovered ? 1.5 : 1;
      beaconRef.current.scale.setScalar(
        beaconRef.current.scale.x + (s - beaconRef.current.scale.x) * 0.1
      );
    }
    if (ringRef.current) {
      const scale = 1 + ((t * 0.4 + position.x) % 2);
      ringRef.current.scale.setScalar(scale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.3 - (scale - 1) * 0.18);
    }
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 1.2) * 0.06;
    }
  });

  const normal = position.clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);

  return (
    <group
      position={position}
      quaternion={quat}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Data beam rising from surface */}
      <mesh ref={beamRef} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.8, 6]} />
        <meshBasicMaterial color={gold} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Core beacon */}
      <mesh ref={beaconRef}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={gold} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.075, 32]} />
        <meshBasicMaterial color={gold} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* City label */}
      <Billboard follow>
        <Text position={[0, 0.95, 0]} fontSize={0.085} color={gold} anchorX="center" anchorY="middle" font={undefined} letterSpacing={0.2}>
          {city.name}
        </Text>
        <Text position={[0, 0.8, 0]} fontSize={0.04} color="#6a6058" anchorX="center" anchorY="middle" font={undefined} letterSpacing={0.12}>
          {city.brand + " · " + city.branches + (city.branches > 1 ? " BRANCHES" : " BRANCH")}
        </Text>
      </Billboard>

      {/* Hover intel panel — executive war room style */}
      {hovered && (
        <Billboard follow>
          <group position={[0, 1.5, 0]}>
            <mesh>
              <planeGeometry args={[1.4, 0.8]} />
              <meshBasicMaterial color="#0a0806" transparent opacity={0.88} depthWrite={false} />
            </mesh>
            {/* Gold border */}
            <lineSegments geometry={new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.4, 0.8))}>
              <lineBasicMaterial color={gold} transparent opacity={0.25} depthWrite={false} />
            </lineSegments>
            <Text position={[0, 0.28, 0.01]} fontSize={0.055} color={gold} anchorX="center" font={undefined} letterSpacing={0.15}>
              {city.name + " OPERATIONS"}
            </Text>
            <Text position={[-0.6, 0.12, 0.01]} fontSize={0.038} color="#6a6058" anchorX="left" font={undefined}>Active Members</Text>
            <Text position={[0.6, 0.12, 0.01]} fontSize={0.042} color="#00d4ff" anchorX="right" font={undefined}>
              {city.id === "doha" ? "2,841" : city.id === "riyadh" ? "412" : "287"}
            </Text>
            <Text position={[-0.6, -0.02, 0.01]} fontSize={0.038} color="#6a6058" anchorX="left" font={undefined}>Revenue</Text>
            <Text position={[0.6, -0.02, 0.01]} fontSize={0.042} color={gold} anchorX="right" font={undefined}>
              {city.revenue}
            </Text>
            <Text position={[-0.6, -0.14, 0.01]} fontSize={0.038} color="#6a6058" anchorX="left" font={undefined}>Growth</Text>
            <Text position={[0.6, -0.14, 0.01]} fontSize={0.042} color="#10b981" anchorX="right" font={undefined}>
              {city.growth}
            </Text>
            <Text position={[-0.6, -0.26, 0.01]} fontSize={0.038} color="#6a6058" anchorX="left" font={undefined}>Risk Level</Text>
            <Text position={[0.6, -0.26, 0.01]} fontSize={0.042} color={city.id === "london" ? "#ef4444" : gold} anchorX="right" font={undefined}>
              {city.id === "doha" ? "Stable" : city.id === "riyadh" ? "Low" : "Elevated"}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}

/* ── Main Globe ── */
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
      {connections.map((conn, i) => (
        <EnergyArc key={i} from={conn.from} to={conn.to} />
      ))}
      {cityData.map(({ city, position }) => (
        <CityBeacon key={city.id} city={city} position={position} />
      ))}
    </group>
  );
}
