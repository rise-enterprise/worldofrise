import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ScanSweepProps {
  isCrisis?: boolean;
  isDay?: boolean;
}

export default function ScanSweep({ isCrisis = false }: ScanSweepProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      // Slower, more mechanical rotation
      ref.current.rotation.y = clock.getElapsedTime() * 0.08;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.018 + Math.sin(clock.getElapsedTime() * 0.6) * 0.006;
      if (isCrisis) {
        mat.color.lerp(new THREE.Color("#b84a4a"), 0.04);
      } else {
        mat.color.lerp(new THREE.Color("#8a8a94"), 0.04);
      }
    }
  });

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(18, -1);
  shape.lineTo(18, 1);
  shape.closePath();

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.95, 0]}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial
        color={isCrisis ? "#b84a4a" : "#8a8a94"}
        transparent
        opacity={0.018}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
