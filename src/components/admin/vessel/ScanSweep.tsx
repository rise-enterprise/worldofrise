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
      ref.current.rotation.y = clock.getElapsedTime() * 0.2;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.025 + Math.sin(clock.getElapsedTime() * 1.5) * 0.01;
      if (isCrisis) {
        mat.color.lerp(new THREE.Color("#b84a4a"), 0.04);
      } else {
        mat.color.lerp(new THREE.Color("#C8A24A"), 0.04);
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
        color={isCrisis ? "#b84a4a" : "#C8A24A"}
        transparent
        opacity={0.025}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
