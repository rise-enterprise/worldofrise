import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AICoreOrbProps {
  isActive?: boolean;
  isCrisis?: boolean;
  pulseIntensity?: number; // 0-1 for voice/activity
}

export default function AICoreOrb({ isActive = false, isCrisis = false, pulseIntensity = 0 }: AICoreOrbProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const particlesRef = useRef<THREE.Points>(null);

  const baseColor = isCrisis ? new THREE.Color("#ff3333") : new THREE.Color("#D4A843");
  const activeColor = new THREE.Color("#f0d878");

  // Particle positions for micro field
  const particlePositions = useMemo(() => {
    const count = 200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2 + Math.random() * 1.5;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2) * 0.05 + pulseIntensity * 0.15;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + pulseIntensity * 1.5 + Math.sin(t * 3) * 0.2;
      mat.emissive.lerpColors(baseColor, activeColor, isActive ? 0.6 : 0);
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse * 1.8);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + pulseIntensity * 0.12 + Math.sin(t * 2.5) * 0.03;
    }

    // Rotate orbital rings + HUD arcs
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        if (i < 3) {
          // Original orbital rings
          ring.rotation.x = t * (0.15 + i * 0.08);
          ring.rotation.y = t * (0.1 + i * 0.05);
          ring.rotation.z = i * Math.PI / 3;
        } else {
          // HUD arc segments — slower, more deliberate rotation
          const speeds = [0.12, -0.08, 0.15, -0.1];
          const spd = speeds[i - 3] || 0.1;
          ring.rotation.z = t * spd;
        }
      }
    });

    // Rotate particle field
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.05;
      particlesRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* Core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.6, 64, 64]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Orbital rings */}
      {[1.2, 1.6, 2.1].map((radius, i) => (
        <mesh
          key={`ring-${i}`}
          ref={(el) => { ringRefs.current[i] = el; }}
        >
          <torusGeometry args={[radius, 0.008, 8, 128]} />
          <meshBasicMaterial
            color={isCrisis ? "#ff4444" : i % 2 === 0 ? "#00d4ff" : "#C8A24A"}
            transparent
            opacity={0.3 - i * 0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* HUD arc segments — Jarvis-style partial arcs */}
      {[
        { radius: 2.6, arc: 0.6, speed: 0.12, color: "#00d4ff", opacity: 0.2 },
        { radius: 3.0, arc: 0.35, speed: -0.08, color: "#C8A24A", opacity: 0.15 },
        { radius: 3.4, arc: 0.5, speed: 0.15, color: "#00d4ff", opacity: 0.12 },
        { radius: 3.8, arc: 0.25, speed: -0.1, color: "#C8A24A", opacity: 0.1 },
      ].map((hud, i) => (
        <mesh
          key={`hud-arc-${i}`}
          ref={(el) => { if (!ringRefs.current[3 + i]) ringRefs.current[3 + i] = el; }}
          rotation={[Math.PI / 2, 0, i * Math.PI / 2]}
        >
          <torusGeometry args={[hud.radius, 0.012, 4, 64, Math.PI * 2 * hud.arc]} />
          <meshBasicMaterial
            color={isCrisis ? "#ff4444" : hud.color}
            transparent
            opacity={hud.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Micro particle field */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color={isCrisis ? "#ff6644" : "#C8A24A"}
          transparent
          opacity={0.4}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
