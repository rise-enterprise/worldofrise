import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

interface RISECoreEmblemProps {
  isActive?: boolean;
  isCrisis?: boolean;
  pulseIntensity?: number;
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

/* ── Elegant concentric halo rings ── */
function HaloRing({ radius, speed, phase, isSpeaking, isProcessing, isCrisis }: {
  radius: number; speed: number; phase: number;
  isSpeaking?: boolean; isProcessing?: boolean; isCrisis?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const wave = Math.sin(t * speed + phase);
    const mult = isSpeaking ? 1.4 : isProcessing ? 1.2 : 1;
    ref.current.scale.setScalar(1 + wave * 0.05 * mult);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.abs(wave) * 0.04 * mult;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.005, radius + 0.005, 128]} />
      <meshBasicMaterial color={isCrisis ? "#b84a4a" : "#D4A843"} transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Gentle ambient glow pulse ── */
function AmbientGlow({ isCrisis, offset = 0 }: { isCrisis?: boolean; offset?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const cycle = ((clock.getElapsedTime() * 0.25) + offset) % 4;
    ref.current.scale.setScalar(1 + cycle * 0.8);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.06 - cycle * 0.016);
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.0, 1.02, 96]} />
      <meshBasicMaterial color={isCrisis ? "#b84a4a" : "#d4b86a"} transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function RISECoreEmblem({ isActive = false, isCrisis = false, pulseIntensity = 0, isProcessing = false, isSpeaking = false }: RISECoreEmblemProps) {
  const textRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const [font, setFont] = useState<Font | null>(null);
  const [textGeom, setTextGeom] = useState<TextGeometry | null>(null);

  useEffect(() => {
    new FontLoader().load("/fonts/helvetiker_bold.typeface.json", setFont);
  }, []);

  useEffect(() => {
    if (!font) return;
    const geom = new TextGeometry("RISE", { font, size: 0.7, depth: 0.12, curveSegments: 12, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.008, bevelSegments: 5 });
    geom.computeBoundingBox();
    geom.center();
    setTextGeom(geom);
    return () => geom.dispose();
  }, [font]);

  const baseColor = isCrisis ? new THREE.Color("#b84a4a") : new THREE.Color("#C8A24A");

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (textRef.current) {
      const mat = textRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + pulseIntensity * 0.8 * (isProcessing ? 1.3 : 1) + Math.sin(t * 1.5) * 0.1;
      textRef.current.scale.setScalar(1 + Math.sin(t * 1) * 0.005);
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + pulseIntensity * 0.06 + Math.sin(t * 2) * 0.015;
      glowRef.current.scale.setScalar(1.04 + Math.sin(t * 1) * 0.008);
    }
    if (frameRef.current) frameRef.current.rotation.z = t * 0.008;
  });

  if (!textGeom) return <mesh><sphereGeometry args={[0.15, 16, 16]} /><meshBasicMaterial color="#C8A24A" transparent opacity={0.3} /></mesh>;

  return (
    <group>
      {/* Crystal-like RISE text — high metalness, low roughness */}
      <mesh ref={textRef} geometry={textGeom}>
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.5} metalness={0.95} roughness={0.08} transparent opacity={0.95} />
      </mesh>
      {/* Soft outer glow */}
      <mesh ref={glowRef} geometry={textGeom}>
        <meshBasicMaterial color={baseColor} transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Elegant concentric halos */}
      <HaloRing radius={1.6} speed={1.2} phase={0} isSpeaking={isSpeaking} isProcessing={isProcessing} isCrisis={isCrisis} />
      <HaloRing radius={1.9} speed={1.0} phase={1.2} isSpeaking={isSpeaking} isProcessing={isProcessing} isCrisis={isCrisis} />
      <HaloRing radius={2.2} speed={0.8} phase={2.4} isSpeaking={isSpeaking} isProcessing={isProcessing} isCrisis={isCrisis} />
      <HaloRing radius={2.5} speed={0.6} phase={3.6} isSpeaking={isSpeaking} isProcessing={isProcessing} isCrisis={isCrisis} />

      {/* Gentle ambient glow pulses */}
      <AmbientGlow isCrisis={isCrisis} />
      <AmbientGlow isCrisis={isCrisis} offset={2} />

      {/* Thin champagne gold torus frame */}
      <mesh ref={frameRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.01, 8, 128]} />
        <meshStandardMaterial color="#C8A24A" metalness={0.95} roughness={0.15} transparent opacity={0.25} />
      </mesh>
      {/* Inner halo ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.004, 8, 128]} />
        <meshBasicMaterial color="#d4b86a" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Floor ambient circle */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 64]} />
        <meshBasicMaterial color={isCrisis ? "#b84a4a" : "#C8A24A"} transparent opacity={0.015} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
