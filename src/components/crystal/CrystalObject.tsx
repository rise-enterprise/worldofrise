import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Text, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface CrystalObjectProps {
  memberName?: string;
  tierName?: string;
  isExpanded: boolean;
  onToggle: () => void;
  activeLayer: number | null;
  onLayerHover: (layer: number | null) => void;
}

/** The central crystal identity object */
export function CrystalObject({
  memberName = 'RISE',
  tierName = 'Crystal',
  isExpanded,
  onToggle,
  activeLayer,
  onLayerHover,
}: CrystalObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mainCrystalRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Crystal geometry — a faceted slab
  const crystalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 1.8, h = 2.6, bevel = 0.15;
    shape.moveTo(-w / 2 + bevel, -h / 2);
    shape.lineTo(w / 2 - bevel, -h / 2);
    shape.lineTo(w / 2, -h / 2 + bevel);
    shape.lineTo(w / 2, h / 2 - bevel);
    shape.lineTo(w / 2 - bevel, h / 2);
    shape.lineTo(-w / 2 + bevel, h / 2);
    shape.lineTo(-w / 2, h / 2 - bevel);
    shape.lineTo(-w / 2, -h / 2 + bevel);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.04,
      bevelSegments: 3,
    });
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Slow idle rotation
    groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.08 + (hovered ? pointer.x * 0.15 : 0);
    groupRef.current.rotation.x = Math.cos(t * 0.1) * 0.04 + (hovered ? pointer.y * 0.08 : 0);

    // Breathing scale
    const breathe = 1 + Math.sin(t * 0.5) * 0.008;
    groupRef.current.scale.setScalar(breathe);
  });

  const layerOffsets = isExpanded ? [0, 1.2, 2.4, 3.6] : [0, 0, 0, 0];

  const privileges = [
    'Priority Access',
    'Private Tastings',
    'Personal Concierge',
    'Bespoke Experiences',
  ];

  return (
    <group ref={groupRef}>
      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.3}>
        {/* Main crystal slab */}
        <mesh
          ref={mainCrystalRef}
          geometry={crystalGeometry}
          position={[0, 0, -0.175]}
          onClick={onToggle}
          onPointerEnter={() => {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerLeave={() => {
            setHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={0.5}
            chromaticAberration={0.15}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            ior={1.5}
            color="#f5f0e8"
            roughness={0.02}
            transmission={0.97}
            clearcoat={1}
            clearcoatRoughness={0.02}
          />
        </mesh>

        {/* Engraved member name */}
        <Text
          position={[0, 0.5, 0.2]}
          fontSize={0.28}
          letterSpacing={0.22}
          color="#a48b5c"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.7}
        >
          {memberName.toUpperCase()}
        </Text>

        {/* Tier glow text */}
        <Text
          position={[0, -0.1, 0.2]}
          fontSize={0.11}
          letterSpacing={0.35}
          color="#c4a87a"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.5}
        >
          {tierName.toUpperCase()}
        </Text>

        {/* RISE logo engraved */}
        <Text
          position={[0, -0.65, 0.2]}
          fontSize={0.06}
          letterSpacing={0.5}
          color="#a48b5c"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.3}
        >
          RISE PRIVATE MEMBERSHIP
        </Text>

        {/* Inner light source */}
        <pointLight
          position={[0, 0, 0.5]}
          intensity={hovered ? 0.6 : 0.25}
          color="#d4b896"
          distance={4}
          decay={2}
        />

        {/* Privilege layers — visible when expanded */}
        {isExpanded &&
          privileges.map((privilege, i) => (
            <group
              key={i}
              position={[0, 0, layerOffsets[i]]}
              onPointerEnter={() => onLayerHover(i)}
              onPointerLeave={() => onLayerHover(null)}
            >
              <mesh position={[0, -1.5 + i * 0.7, 0.8 + i * 0.3]}>
                <planeGeometry args={[1.6, 0.35]} />
                <meshStandardMaterial
                  color={activeLayer === i ? '#c4a87a' : '#2a2520'}
                  transparent
                  opacity={activeLayer === i ? 0.2 : 0.08}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <Text
                position={[0, -1.5 + i * 0.7, 0.82 + i * 0.3]}
                fontSize={0.07}
                letterSpacing={0.25}
                color={activeLayer === i ? '#d4b896' : '#8a8070'}
                anchorX="center"
                anchorY="middle"
                font="/fonts/inter-var.woff2"
              >
                {privilege.toUpperCase()}
              </Text>
            </group>
          ))}
      </Float>

      {/* Rim light — edge highlight */}
      <directionalLight position={[3, 2, 5]} intensity={0.4} color="#f5efe4" />
      <directionalLight position={[-3, -1, 3]} intensity={0.15} color="#a48b5c" />

      <Environment preset="studio" environmentIntensity={0.15} />
    </group>
  );
}
