import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ScanSweepProps {
  isCrisis?: boolean;
  isDay?: boolean;
}

export default function ScanSweep({ isCrisis = false, isDay = false }: ScanSweepProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.3;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (isDay ? 0.03 : 0.04) + Math.sin(clock.getElapsedTime() * 2) * 0.015;
      if (isCrisis) {
        mat.color.lerp(new THREE.Color("#ff3333"), 0.05);
      } else {
        mat.color.lerp(new THREE.Color(isDay ? "#C8A24A" : "#00d4ff"), 0.05);
      }
    }
  });

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(20, -1.5);
  shape.lineTo(20, 1.5);
  shape.closePath();

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.95, 0]}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial
        color={isCrisis ? "#ff3333" : isDay ? "#C8A24A" : "#00d4ff"}
        transparent
        opacity={isDay ? 0.03 : 0.04}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
