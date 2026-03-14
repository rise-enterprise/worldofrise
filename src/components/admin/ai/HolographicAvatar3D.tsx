import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { AIState } from "./AIAvatar";

// ─── Humanoid Head Geometry ──────────────────────────────────────────────────
function HumanoidHead({
  state,
  audioLevel,
  inputLevel,
  mousePos,
}: {
  state: AIState;
  audioLevel: number;
  inputLevel: number;
  mousePos: { x: number; y: number };
}) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const jawRef = useRef<THREE.Mesh>(null);
  const mouthGlowRef = useRef<THREE.Mesh>(null);
  const leftLidRef = useRef<THREE.Mesh>(null);
  const rightLidRef = useRef<THREE.Mesh>(null);
  const neuralAuraRef = useRef<THREE.Mesh>(null);
  const innerAuraRef = useRef<THREE.Mesh>(null);

  const blinkTimer = useRef(0);
  const blinkState = useRef(0); // 0=open, 1=closing, 2=opening
  const nextBlink = useRef(2 + Math.random() * 4);
  const breathPhase = useRef(0);
  const headIdlePhase = useRef(0);
  const thinkingPhase = useRef(0);

  // Materials
  const skinMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("hsl(220, 15%, 82%)"),
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.2,
      }),
    []
  );

  const eyeWhiteMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#e8eaf0"),
        metalness: 0.1,
        roughness: 0.2,
        clearcoat: 1,
      }),
    []
  );

  const pupilMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("hsl(270, 70%, 55%)"),
        emissive: new THREE.Color("hsl(270, 70%, 35%)"),
        emissiveIntensity: 0.8,
      }),
    []
  );

  const jawMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("hsl(220, 15%, 78%)"),
        metalness: 0.35,
        roughness: 0.35,
        clearcoat: 0.6,
      }),
    []
  );

  const lidMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("hsl(220, 15%, 76%)"),
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.5,
      }),
    []
  );

  const mouthGlowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("hsl(320, 75%, 55%)"),
        emissive: new THREE.Color("hsl(320, 75%, 55%)"),
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0,
      }),
    []
  );

  const auraMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("hsl(270, 70%, 55%)"),
        emissive: new THREE.Color("hsl(270, 70%, 55%)"),
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  const innerAuraMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("hsl(185, 90%, 50%)"),
        emissive: new THREE.Color("hsl(185, 90%, 50%)"),
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!headRef.current) return;

    const dt = Math.min(delta, 0.05);
    breathPhase.current += dt * 1.2;
    headIdlePhase.current += dt * 0.5;
    thinkingPhase.current += dt * 2.5;

    // ─── Breathing ───
    const breathY = Math.sin(breathPhase.current) * 0.008;
    const breathScale = 1 + Math.sin(breathPhase.current) * 0.003;

    // ─── Idle head movement ───
    let headRotX = Math.sin(headIdlePhase.current * 0.7) * 0.015;
    let headRotY = Math.sin(headIdlePhase.current * 0.5) * 0.02;
    let headRotZ = Math.sin(headIdlePhase.current * 0.3) * 0.005;

    // ─── Eye tracking (follow cursor) ───
    const eyeTargetX = mousePos.x * 0.06;
    const eyeTargetY = mousePos.y * 0.04;

    // Slight head follow toward cursor
    headRotY += mousePos.x * 0.04;
    headRotX -= mousePos.y * 0.025;

    // ─── State-specific behaviors ───
    if (state === "listening") {
      // Lean forward slightly, focused
      headRotX -= 0.03;
      // Audio-reactive subtle nod
      headRotX += inputLevel * 0.015 * Math.sin(breathPhase.current * 8);
    } else if (state === "thinking") {
      // Slight upward gaze, micro eye movement
      headRotX -= 0.02;
      headRotY += Math.sin(thinkingPhase.current) * 0.03;
    } else if (state === "speaking") {
      // Subtle head movement while talking
      headRotX += audioLevel * 0.012 * Math.sin(breathPhase.current * 6);
      headRotY += audioLevel * 0.01 * Math.sin(breathPhase.current * 4.3);
    }

    headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, breathY, 0.1);
    headRef.current.scale.setScalar(THREE.MathUtils.lerp(headRef.current.scale.x, breathScale, 0.1));
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, headRotX, 0.06);
    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, headRotY, 0.06);
    headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, headRotZ, 0.06);

    // ─── Pupils follow cursor ───
    if (leftPupilRef.current && rightPupilRef.current) {
      const px = THREE.MathUtils.lerp(leftPupilRef.current.position.x, eyeTargetX, 0.08);
      const py = THREE.MathUtils.lerp(leftPupilRef.current.position.y, eyeTargetY, 0.08);
      leftPupilRef.current.position.x = px;
      leftPupilRef.current.position.y = py;
      rightPupilRef.current.position.x = px;
      rightPupilRef.current.position.y = py;
    }

    // ─── Blinking ───
    blinkTimer.current += dt;
    if (blinkState.current === 0 && blinkTimer.current > nextBlink.current) {
      blinkState.current = 1;
      blinkTimer.current = 0;
    }
    if (blinkState.current === 1) {
      if (blinkTimer.current < 0.08) {
        const t = blinkTimer.current / 0.08;
        if (leftLidRef.current) leftLidRef.current.scale.y = 1 + t * 3;
        if (rightLidRef.current) rightLidRef.current.scale.y = 1 + t * 3;
      } else {
        blinkState.current = 2;
        blinkTimer.current = 0;
      }
    }
    if (blinkState.current === 2) {
      if (blinkTimer.current < 0.08) {
        const t = 1 - blinkTimer.current / 0.08;
        if (leftLidRef.current) leftLidRef.current.scale.y = 1 + t * 3;
        if (rightLidRef.current) rightLidRef.current.scale.y = 1 + t * 3;
      } else {
        blinkState.current = 0;
        blinkTimer.current = 0;
        nextBlink.current = 2 + Math.random() * 5;
        if (leftLidRef.current) leftLidRef.current.scale.y = 1;
        if (rightLidRef.current) rightLidRef.current.scale.y = 1;
      }
    }

    // ─── Jaw / mouth ───
    if (jawRef.current) {
      const jawOpen = state === "speaking" ? audioLevel * 0.06 : 0;
      jawRef.current.position.y = THREE.MathUtils.lerp(jawRef.current.position.y, -0.52 - jawOpen, 0.15);
    }

    // ─── Mouth glow ───
    if (mouthGlowRef.current) {
      const glowIntensity = state === "speaking" ? 0.5 + audioLevel * 2.5 : 0;
      const glowOpacity = state === "speaking" ? 0.3 + audioLevel * 0.6 : 0;
      mouthGlowMat.emissiveIntensity = THREE.MathUtils.lerp(
        mouthGlowMat.emissiveIntensity,
        glowIntensity,
        0.2
      );
      mouthGlowMat.opacity = THREE.MathUtils.lerp(mouthGlowMat.opacity, glowOpacity, 0.2);
      const scaleX = state === "speaking" ? 0.22 + audioLevel * 0.08 : 0.18;
      const scaleY = state === "speaking" ? 0.04 + audioLevel * 0.06 : 0.02;
      mouthGlowRef.current.scale.x = THREE.MathUtils.lerp(mouthGlowRef.current.scale.x, scaleX, 0.15);
      mouthGlowRef.current.scale.y = THREE.MathUtils.lerp(mouthGlowRef.current.scale.y, scaleY, 0.15);
    }

    // ─── Pupil emissive ───
    const isActive = state !== "idle";
    const emissiveTarget = state === "thinking" ? 1.5 : state === "listening" ? 1.2 : state === "speaking" ? 1.0 + audioLevel : 0.8;
    pupilMat.emissiveIntensity = THREE.MathUtils.lerp(pupilMat.emissiveIntensity, emissiveTarget, 0.08);
    if (state === "thinking") {
      pupilMat.emissive.setHSL(0.75, 0.7, 0.35 + Math.sin(thinkingPhase.current) * 0.1);
    }

    // ─── Neural aura ───
    if (neuralAuraRef.current) {
      const auraScale = isActive ? 1.25 + audioLevel * 0.15 : 1.18;
      const auraOpacity = isActive ? 0.1 + audioLevel * 0.08 : 0.06;
      neuralAuraRef.current.scale.setScalar(
        THREE.MathUtils.lerp(neuralAuraRef.current.scale.x, auraScale, 0.04)
      );
      auraMat.opacity = THREE.MathUtils.lerp(auraMat.opacity, auraOpacity, 0.05);
      auraMat.emissiveIntensity = THREE.MathUtils.lerp(
        auraMat.emissiveIntensity,
        isActive ? 0.4 + audioLevel * 0.5 : 0.3,
        0.05
      );
    }

    // ─── Inner aura (cyan for listening) ───
    if (innerAuraRef.current) {
      const show = state === "listening";
      const targetOpacity = show ? 0.08 + inputLevel * 0.12 : 0;
      innerAuraMat.opacity = THREE.MathUtils.lerp(innerAuraMat.opacity, targetOpacity, 0.06);
      const innerScale = show ? 1.15 + inputLevel * 0.1 : 1.1;
      innerAuraRef.current.scale.setScalar(
        THREE.MathUtils.lerp(innerAuraRef.current.scale.x, innerScale, 0.04)
      );
    }
  });

  // Geometries
  const headGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.52, 64, 48);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // Flatten sides slightly for a more refined skull shape
      const sideSquash = 1 - Math.max(0, Math.abs(x) - 0.3) * 0.35;
      // Narrow chin
      const chinNarrow = y < -0.1 ? 1 - ((-0.1 - y) * 0.5) : 1;
      // Forehead height
      const foreheadPush = y > 0.3 ? 1 + (y - 0.3) * 0.15 : 1;
      pos.setX(i, x * sideSquash * chinNarrow);
      pos.setZ(i, z * foreheadPush * sideSquash);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const eyeGeo = useMemo(() => new THREE.SphereGeometry(0.065, 32, 24), []);
  const pupilGeo = useMemo(() => new THREE.SphereGeometry(0.03, 24, 16), []);
  const jawGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.2, 32, 24, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
    return geo;
  }, []);
  const lidGeo = useMemo(() => new THREE.BoxGeometry(0.16, 0.015, 0.08), []);
  const mouthGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const auraGeo = useMemo(() => new THREE.SphereGeometry(0.52, 48, 32), []);

  return (
    <group ref={headRef} position={[0, 0.05, 0]}>
      {/* Main head */}
      <mesh geometry={headGeo} material={skinMat} />

      {/* Jaw */}
      <mesh ref={jawRef} geometry={jawGeo} material={jawMat} position={[0, -0.52, 0.05]} scale={[1.2, 0.6, 1]} />

      {/* Left eye */}
      <group position={[-0.155, 0.06, 0.44]}>
        <mesh ref={leftEyeRef} geometry={eyeGeo} material={eyeWhiteMat} />
        <mesh ref={leftPupilRef} geometry={pupilGeo} material={pupilMat} position={[0, 0, 0.04]} />
        <mesh ref={leftLidRef} geometry={lidGeo} material={lidMat} position={[0, 0.055, 0.02]} />
      </group>

      {/* Right eye */}
      <group position={[0.155, 0.06, 0.44]}>
        <mesh ref={rightEyeRef} geometry={eyeGeo} material={eyeWhiteMat} />
        <mesh ref={rightPupilRef} geometry={pupilGeo} material={pupilMat} position={[0, 0, 0.04]} />
        <mesh ref={rightLidRef} geometry={lidGeo} material={lidMat} position={[0, 0.055, 0.02]} />
      </group>

      {/* Mouth glow */}
      <mesh
        ref={mouthGlowRef}
        geometry={mouthGeo}
        material={mouthGlowMat}
        position={[0, -0.18, 0.5]}
        scale={[0.18, 0.02, 1]}
      />

      {/* Nose bridge — subtle ridge */}
      <mesh position={[0, 0, 0.48]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.04, 0.12, 0.04]} />
        <meshPhysicalMaterial color="hsl(220, 15%, 80%)" metalness={0.3} roughness={0.4} clearcoat={0.6} />
      </mesh>

      {/* Neural aura (purple) */}
      <mesh ref={neuralAuraRef} geometry={auraGeo} material={auraMat} scale={1.18} />

      {/* Inner aura (cyan — listening) */}
      <mesh ref={innerAuraRef} geometry={auraGeo} material={innerAuraMat} scale={1.12} />

      {/* Tech accent lines on temples */}
      <mesh position={[-0.5, 0.08, 0.05]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.005, 0.12, 0.005]} />
        <meshStandardMaterial color="hsl(270, 70%, 55%)" emissive="hsl(270, 70%, 55%)" emissiveIntensity={0.6} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.5, 0.08, 0.05]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.005, 0.12, 0.005]} />
        <meshStandardMaterial color="hsl(270, 70%, 55%)" emissive="hsl(270, 70%, 55%)" emissiveIntensity={0.6} transparent opacity={0.5} />
      </mesh>

      {/* Cheekbone highlights */}
      <mesh position={[-0.35, -0.05, 0.32]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.005, 0.06, 0.005]} />
        <meshStandardMaterial color="hsl(320, 75%, 55%)" emissive="hsl(320, 75%, 55%)" emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0.35, -0.05, 0.32]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.005, 0.06, 0.005]} />
        <meshStandardMaterial color="hsl(320, 75%, 55%)" emissive="hsl(320, 75%, 55%)" emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// ─── Holographic Ring ────────────────────────────────────────────────────────
function HolographicRing({
  state,
  audioLevel,
  inputLevel,
}: {
  state: AIState;
  audioLevel: number;
  inputLevel: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const ringMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("hsl(270, 70%, 55%)"),
        emissive: new THREE.Color("hsl(270, 70%, 55%)"),
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      }),
    []
  );

  const ring2Mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("hsl(185, 90%, 50%)"),
        emissive: new THREE.Color("hsl(185, 90%, 50%)"),
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      }),
    []
  );

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.3;
      const isActive = state !== "idle";
      const targetOpacity = isActive ? 0.2 + audioLevel * 0.3 : 0.1;
      ringMat.opacity = THREE.MathUtils.lerp(ringMat.opacity, targetOpacity, 0.05);
      ringMat.emissiveIntensity = THREE.MathUtils.lerp(
        ringMat.emissiveIntensity,
        isActive ? 0.5 + audioLevel * 0.8 : 0.3,
        0.05
      );
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.2;
      const show = state === "listening";
      ring2Mat.opacity = THREE.MathUtils.lerp(ring2Mat.opacity, show ? 0.15 + inputLevel * 0.2 : 0.04, 0.05);
    }
  });

  return (
    <>
      <mesh ref={ringRef} rotation={[Math.PI * 0.5, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[0.72, 0.008, 8, 128]} />
        <primitive object={ringMat} attach="material" />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI * 0.52, 0.1, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[0.78, 0.005, 8, 128]} />
        <primitive object={ring2Mat} attach="material" />
      </mesh>
    </>
  );
}

// ─── Floating Particles ──────────────────────────────────────────────────────
function NeuralParticles({ state, audioLevel }: { state: AIState; audioLevel: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 80;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 0.7 + Math.random() * 0.4;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    const speed = state !== "idle" ? 1 + audioLevel * 2 : 0.5;
    for (let i = 0; i < count; i++) {
      let x = pos.getX(i) + velocities[i * 3] * speed;
      let y = pos.getY(i) + velocities[i * 3 + 1] * speed;
      let z = pos.getZ(i) + velocities[i * 3 + 2] * speed;
      const dist = Math.sqrt(x * x + y * y + z * z);
      if (dist > 1.2 || dist < 0.6) {
        velocities[i * 3] *= -1;
        velocities[i * 3 + 1] *= -1;
        velocities[i * 3 + 2] *= -1;
      }
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="hsl(270, 80%, 72%)"
        transparent
        opacity={state !== "idle" ? 0.5 + audioLevel * 0.3 : 0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Scene wrapper to capture mouse ─────────────────────────────────────────
function SceneContent({
  state,
  audioLevel,
  inputLevel,
  mousePos,
}: {
  state: AIState;
  audioLevel: number;
  inputLevel: number;
  mousePos: { x: number; y: number };
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 4]} intensity={0.8} color="#e8e0f0" />
      <directionalLight position={[-2, 1, 3]} intensity={0.3} color="hsl(185, 90%, 50%)" />
      <pointLight position={[0, 0, 2]} intensity={0.5} color="hsl(270, 70%, 55%)" distance={5} />
      {state === "speaking" && (
        <pointLight
          position={[0, -0.3, 1.5]}
          intensity={audioLevel * 1.5}
          color="hsl(320, 75%, 55%)"
          distance={3}
        />
      )}

      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.15} floatingRange={[-0.02, 0.02]}>
        <HumanoidHead state={state} audioLevel={audioLevel} inputLevel={inputLevel} mousePos={mousePos} />
      </Float>

      <HolographicRing state={state} audioLevel={audioLevel} inputLevel={inputLevel} />
      <NeuralParticles state={state} audioLevel={audioLevel} />

      <Environment preset="city" background={false} />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface HolographicAvatar3DProps {
  state: AIState;
  audioLevel?: number;
  inputLevel?: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  clickLabel?: string;
  className?: string;
}

export default function HolographicAvatar3D({
  state,
  audioLevel = 0,
  inputLevel = 0,
  size = "lg",
  onClick,
  clickLabel,
  className,
}: HolographicAvatar3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setMousePos({ x, y });
  }, []);

  // Also track global mouse for eye follow even when not hovering directly
  useEffect(() => {
    const onGlobalMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.5)));
      const y = Math.max(-1, Math.min(1, -(e.clientY - cy) / (window.innerHeight * 0.5)));
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", onGlobalMove);
    return () => window.removeEventListener("mousemove", onGlobalMove);
  }, []);

  const sizeMap = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64 md:w-72 md:h-72",
  };

  const stateLabel =
    state === "idle"
      ? "RISE ONE"
      : state === "listening"
        ? "LISTENING"
        : state === "thinking"
          ? "ANALYZING"
          : "SPEAKING";

  const stateColor =
    state === "listening"
      ? "hsl(var(--neon-cyan))"
      : state === "thinking"
        ? "hsl(var(--neon-purple-light))"
        : state === "speaking"
          ? "hsl(var(--neon-magenta-light))"
          : "hsl(var(--muted-foreground) / 0.5)";

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center flex-col ${onClick ? "cursor-pointer group" : ""} ${className || ""}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Ambient background glow */}
      <div
        className={`absolute rounded-full pointer-events-none ${sizeMap[size]}`}
        style={{
          background: `radial-gradient(circle, hsl(var(--neon-purple) / ${state !== "idle" ? 0.2 + audioLevel * 0.15 : 0.08}) 0%, hsl(var(--neon-magenta) / ${state !== "idle" ? 0.1 : 0.04}) 40%, transparent 70%)`,
          filter: `blur(${state !== "idle" ? 35 + audioLevel * 15 : 20}px)`,
          transform: `scale(${state !== "idle" ? 1.4 + audioLevel * 0.2 : 1.2})`,
        }}
      />

      {/* 3D Canvas */}
      <div className={`relative ${sizeMap[size]} ${onClick ? "group-hover:scale-[1.02] transition-transform duration-500" : ""}`}>
        <Canvas
          camera={{ position: [0, 0, 1.8], fov: 40 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
          dpr={[1, 2]}
        >
          <SceneContent state={state} audioLevel={audioLevel} inputLevel={inputLevel} mousePos={mousePos} />
        </Canvas>

        {/* Corner HUD frames */}
        <div className="absolute -top-2 -left-2 w-6 h-6 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-neon-purple/40" />
          <div className="absolute top-0 left-0 w-px h-full bg-neon-purple/40" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-px bg-neon-purple/40" />
          <div className="absolute top-0 right-0 w-px h-full bg-neon-purple/40" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-full h-px bg-neon-magenta/30" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-neon-magenta/30" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-full h-px bg-neon-magenta/30" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-neon-magenta/30" />
        </div>

        {/* Hover glow */}
        {onClick && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: "0 0 40px hsl(var(--neon-purple) / 0.2)",
            }}
          />
        )}
      </div>

      {/* State label */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <span
          className="text-[9px] uppercase tracking-[0.25em] font-medium transition-colors duration-300"
          style={{ color: stateColor }}
        >
          {stateLabel}
        </span>
        {clickLabel && state === "idle" && (
          <span
            className="text-[8px] uppercase tracking-[0.2em] text-neon-purple/30 animate-fade-in"
            style={{ animationDelay: "2s", animationFillMode: "both" }}
          >
            {clickLabel}
          </span>
        )}
      </div>
    </div>
  );
}
