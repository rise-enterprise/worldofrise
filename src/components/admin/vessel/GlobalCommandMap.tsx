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

/* ── Elegant globe with soft gold outlines ── */
function LuxuryGlobe() {
  const globeRef = useRef<THREE.Group>(null);
  const gold = "#D4A843";

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.015;
    }
  });

  const GLOBE_R = 2.2;

  return (
    <group ref={globeRef}>
      {/* Soft sphere fill */}
      <mesh>
        <sphereGeometry args={[GLOBE_R - 0.05, 48, 48]} />
        <meshBasicMaterial color="#0a0a0f" transparent opacity={0.03} depthWrite={false} />
      </mesh>

      {/* Wireframe — soft gold */}
      <mesh>
        <sphereGeometry args={[GLOBE_R, 28, 20]} />
        <meshBasicMaterial
          color={gold}
          wireframe
          transparent
          opacity={0.02}
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
            <ringGeometry args={[r - 0.003, r + 0.003, 96]} />
            <meshBasicMaterial
              color={gold}
              transparent
              opacity={lat === 0 ? 0.05 : 0.015}
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
          <ringGeometry args={[GLOBE_R - 0.003, GLOBE_R + 0.003, 96]} />
          <meshBasicMaterial
            color={gold}
            transparent
            opacity={0.012}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Outer champagne ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[GLOBE_R + 0.3, GLOBE_R + 0.31, 128]} />
        <meshBasicMaterial
          color={gold}
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Second halo ring */}
      <mesh rotation={[Math.PI / 2 + 0.2, 0.12, 0]}>
        <ringGeometry args={[GLOBE_R + 0.48, GLOBE_R + 0.49, 128]} />
        <meshBasicMaterial
        color="#E0C06A"
          transparent
          opacity={0.025}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ── Premium airline route arc ── */
function RouteArc({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const lineObj = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const dist = from.distanceTo(to);
    mid.normalize().multiplyScalar(2.2 + dist * 0.2);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const pts = curve.getPoints(48);
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: "#D4A843",
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, [from, to]);

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineBasicMaterial;
    mat.opacity = 0.05 + Math.sin(clock.getElapsedTime() * 0.4) * 0.03;
  });

  return <primitive object={lineObj} />;
}

/* ── City beacon — warm gold marker ── */
function CityBeacon({ city, position }: { city: CityNode; position: THREE.Vector3 }) {
  const beaconRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const gold = "#D4A843";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(t * 1.2 + position.x * 3) * 0.12;
      const s = hovered ? 1.3 : 1;
      beaconRef.current.scale.setScalar(
        beaconRef.current.scale.x + (s - beaconRef.current.scale.x) * 0.06
      );
    }
    if (ringRef.current) {
      const scale = 1 + ((t * 0.3 + position.x) % 2);
      ringRef.current.scale.setScalar(scale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.15 - (scale - 1) * 0.1);
    }
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.06 + Math.sin(t * 0.8) * 0.03;
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
      {/* Data beam */}
      <mesh ref={beamRef} position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.7, 6]} />
        <meshBasicMaterial color={gold} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Core beacon */}
      <mesh ref={beaconRef}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={gold} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.065, 32]} />
        <meshBasicMaterial color={gold} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* City label */}
      <Billboard follow>
        <Text position={[0, 0.85, 0]} fontSize={0.075} color={gold} anchorX="center" anchorY="middle" font={undefined} letterSpacing={0.18}>
          {city.name}
        </Text>
        <Text position={[0, 0.72, 0]} fontSize={0.035} color="#8a8578" anchorX="center" anchorY="middle" font={undefined} letterSpacing={0.1}>
          {city.brand}
        </Text>
      </Billboard>

      {/* Hover intel panel */}
      {hovered && (
        <Billboard follow>
          <group position={[0, 1.4, 0]}>
            <mesh>
              <planeGeometry args={[1.3, 0.75]} />
              <meshBasicMaterial color="#12121a" transparent opacity={0.92} depthWrite={false} />
            </mesh>
            {/* Border */}
            <lineSegments geometry={new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.3, 0.75))}>
              <lineBasicMaterial color={gold} transparent opacity={0.1} depthWrite={false} />
            </lineSegments>
            <Text position={[0, 0.26, 0.01]} fontSize={0.05} color={gold} anchorX="center" font={undefined} letterSpacing={0.12}>
              {city.name}
            </Text>
            <Text position={[-0.55, 0.1, 0.01]} fontSize={0.035} color="#8a8578" anchorX="left" font={undefined}>Members</Text>
            <Text position={[0.55, 0.1, 0.01]} fontSize={0.038} color="#E0C06A" anchorX="right" font={undefined}>
              {city.id === "doha" ? "2,841" : city.id === "riyadh" ? "412" : "287"}
            </Text>
            <Text position={[-0.55, -0.03, 0.01]} fontSize={0.035} color="#8a8578" anchorX="left" font={undefined}>Revenue</Text>
            <Text position={[0.55, -0.03, 0.01]} fontSize={0.038} color={gold} anchorX="right" font={undefined}>
              {city.revenue}
            </Text>
            <Text position={[-0.55, -0.14, 0.01]} fontSize={0.035} color="#8a8578" anchorX="left" font={undefined}>Growth</Text>
            <Text position={[0.55, -0.14, 0.01]} fontSize={0.038} color="#5a8a6a" anchorX="right" font={undefined}>
              {city.growth}
            </Text>
            <Text position={[-0.55, -0.25, 0.01]} fontSize={0.035} color="#8a8578" anchorX="left" font={undefined}>Status</Text>
            <Text position={[0.55, -0.25, 0.01]} fontSize={0.038} color={city.id === "london" ? "#c45a5a" : "#5a8a6a"} anchorX="right" font={undefined}>
              {city.id === "doha" ? "Stable" : city.id === "riyadh" ? "Strong" : "Elevated"}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}

/* ── Main Globe ── */
export default function GlobalCommandMap({ isDay = false }: { isDay?: boolean }) {
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
      <LuxuryGlobe />
      {connections.map((conn, i) => (
        <RouteArc key={i} from={conn.from} to={conn.to} />
      ))}
      {cityData.map(({ city, position }) => (
        <CityBeacon key={city.id} city={city} position={position} />
      ))}
    </group>
  );
}
