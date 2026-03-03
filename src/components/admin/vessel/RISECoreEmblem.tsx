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

function WaveRing({ radius, speed, phase, isSpeaking, isProcessing, isCrisis }: {
  radius: number; speed: number; phase: number;
  isSpeaking?: boolean; isProcessing?: boolean; isCrisis?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const wave = Math.sin(t * speed + phase);
    const mult = isSpeaking ? 1.6 : isProcessing ? 1.3 : 1;
    ref.current.scale.setScalar(1 + wave * 0.08 * mult);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.abs(wave) * 0.06 * mult;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.008, radius + 0.008, 128]} />
      <meshBasicMaterial color={isCrisis ? "#b84a4a" : "#8a8a94"} transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function LightPulse({ isCrisis, offset = 0 }: { isCrisis?: boolean; offset?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const cycle = ((clock.getElapsedTime() * 0.4) + offset) % 3;
    ref.current.scale.setScalar(1 + cycle * 1.2);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.1 - cycle * 0.035);
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.0, 1.03, 96]} />
      <meshBasicMaterial color={isCrisis ? "#b84a4a" : "#C8A24A"} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
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
      mat.emissiveIntensity = 0.6 + pulseIntensity * 1.2 * (isProcessing ? 1.5 : 1) + Math.sin(t * 2) * 0.15;
      textRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.008);
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + pulseIntensity * 0.1 + Math.sin(t * 2.5) * 0.02;
      glowRef.current.scale.setScalar(1.05 + Math.sin(t * 1.5) * 0.01);
    }
    if (frameRef.current) frameRef.current.rotation.z = t * 0.015;
  });

  if (!textGeom) return <mesh><sphereGeometry args={[0.15, 16, 16]} /><meshBasicMaterial color="#C8A24A" transparent opacity={0.3} /></mesh>;

  return (
    <group>
      <mesh ref={textRef} geometry={textGeom}>
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.6} metalness={0.92} roughness={0.15} transparent opacity={0.95} />
      </mesh>
      <mesh ref={glowRef} geometry={textGeom}>
        <meshBasicMaterial color={baseColor} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <WaveRing radius={1.6} speed={2.0} phase={0} isSpeaking={isSpeaking} isProcessing={isProcessing} isCrisis={isCrisis} />
      <WaveRing radius={1.9} speed={1.7} phase={1.2} isSpeaking={isSpeaking} isProcessing={isProcessing} isCrisis={isCrisis} />
      <WaveRing radius={2.2} speed={1.4} phase={2.4} isSpeaking={isSpeaking} isProcessing={isProcessing} isCrisis={isCrisis} />
      <WaveRing radius={2.5} speed={1.1} phase={3.6} isSpeaking={isSpeaking} isProcessing={isProcessing} isCrisis={isCrisis} />
      <LightPulse isCrisis={isCrisis} />
      <LightPulse isCrisis={isCrisis} offset={1.5} />
      <mesh ref={frameRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.015, 8, 128]} />
        <meshStandardMaterial color="#5a5a64" metalness={0.95} roughness={0.3} transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.006, 8, 128]} />
        <meshBasicMaterial color="#8a8a94" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 64]} />
        <meshBasicMaterial color={isCrisis ? "#b84a4a" : "#C8A24A"} transparent opacity={0.02} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
