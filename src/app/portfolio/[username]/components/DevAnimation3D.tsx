"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─── floating particles ────────────────────────────── */
function Particles() {
  const ref = useRef<THREE.Group>(null);
  const data = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        x: (Math.random() - 0.5) * 7,
        y: (Math.random() - 0.5) * 5,
        z: (Math.random() - 0.5) * 5,
        speed: Math.random() * 0.4 + 0.15,
        offset: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const p = data[i];
      child.position.y = p.y + Math.sin(clock.elapsedTime * p.speed + p.offset) * 0.35;
    });
  });

  return (
    <group ref={ref}>
      {data.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#e8c547" emissive="#e8c547" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── code line on monitor ──────────────────────────── */
function CodeLines() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    // pulse glow on each line
    ref.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(clock.elapsedTime * 1.5 + i * 0.9) * 0.35;
    });
  });

  const lines = [
    { w: 0.55, x: -0.3, y: 0.28 },
    { w: 0.35, x: -0.1, y: 0.14 },
    { w: 0.65, x: -0.15, y: 0.0 },
    { w: 0.25, x: -0.25, y: -0.14 },
    { w: 0.5, x: -0.2, y: -0.28 },
  ];

  const colors = ["#47c8b0", "#e8c547", "#9b8ec4", "#47c8b0", "#e85d4a"];

  return (
    <group ref={ref} position={[0.05, -0.08, -0.49]}>
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x + l.w / 2, l.y, 0]}>
          <boxGeometry args={[l.w, 0.04, 0.001]} />
          <meshStandardMaterial
            color={colors[i]}
            emissive={colors[i]}
            emissiveIntensity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── main scene ────────────────────────────────────── */
function DeveloperScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.14;
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.06 - 0.25;
  });

  return (
    <group ref={groupRef}>
      {/* ── desk surface ── */}
      <mesh position={[0, -0.78, 0]}>
        <boxGeometry args={[3.6, 0.07, 1.9]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* desk legs */}
      {(
        [
          [-1.6, -1.28, -0.8],
          [1.6, -1.28, -0.8],
          [-1.6, -1.28, 0.8],
          [1.6, -1.28, 0.8],
        ] as [number, number, number][]
      ).map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.07, 0.92, 0.07]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}

      {/* ── monitor stand ── */}
      <mesh position={[0, -0.6, -0.55]}>
        <boxGeometry args={[0.14, 0.27, 0.14]} />
        <meshStandardMaterial color="#1e1e1e" />
      </mesh>

      {/* monitor bezel */}
      <mesh position={[0, -0.13, -0.6]}>
        <boxGeometry args={[2.1, 1.32, 0.07]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>

      {/* screen glow backing */}
      <mesh position={[0, -0.11, -0.565]}>
        <boxGeometry args={[1.9, 1.12, 0.01]} />
        <meshStandardMaterial color="#080f0a" emissive="#0a1a10" emissiveIntensity={1} />
      </mesh>

      {/* code lines on screen */}
      <CodeLines />

      {/* ── keyboard ── */}
      <mesh position={[0, -0.75, 0.18]}>
        <boxGeometry args={[1.25, 0.03, 0.42]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.9} />
      </mesh>

      {/* keyboard key rows */}
      {[-0.05, 0.07].map((z, i) => (
        <mesh key={i} position={[0, -0.725, 0.18 + z]}>
          <boxGeometry args={[1.15, 0.01, 0.06]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      ))}

      {/* ── mouse ── */}
      <mesh position={[0.82, -0.765, 0.22]}>
        <boxGeometry args={[0.17, 0.025, 0.28]} />
        <meshStandardMaterial color="#1e1e1e" />
      </mesh>

      {/* ── coffee mug ── */}
      <mesh position={[-1.2, -0.66, 0.12]}>
        <cylinderGeometry args={[0.1, 0.085, 0.24, 16]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* mug handle */}
      <mesh position={[-1.08, -0.66, 0.12]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.06, 0.015, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* coffee surface */}
      <mesh position={[-1.2, -0.54, 0.12]}>
        <cylinderGeometry args={[0.09, 0.09, 0.005, 16]} />
        <meshStandardMaterial color="#3a2010" emissive="#3a2010" emissiveIntensity={0.3} />
      </mesh>

      {/* ── notepad ── */}
      <mesh position={[1.3, -0.755, 0.25]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.01, 0.65]} />
        <meshStandardMaterial color="#f0ece2" roughness={1} />
      </mesh>

      {/* ── chair seat ── */}
      <mesh position={[0, -1.08, 1.0]}>
        <boxGeometry args={[0.95, 0.07, 0.92]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* chair back */}
      <mesh position={[0, -0.52, 1.45]}>
        <boxGeometry args={[0.92, 0.95, 0.07]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* chair legs */}
      {(
        [
          [-0.4, -1.42, 0.6],
          [0.4, -1.42, 0.6],
          [-0.4, -1.42, 1.4],
          [0.4, -1.42, 1.4],
        ] as [number, number, number][]
      ).map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.055, 0.7, 0.055]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}

      {/* ── developer torso ── */}
      <mesh position={[0, -0.55, 0.88]}>
        <boxGeometry args={[0.48, 0.68, 0.32]} />
        <meshStandardMaterial color="#e8c547" roughness={0.85} />
      </mesh>

      {/* hoodie detail */}
      <mesh position={[0, -0.58, 0.75]}>
        <boxGeometry args={[0.3, 0.08, 0.04]} />
        <meshStandardMaterial color="#c9a830" />
      </mesh>

      {/* developer head */}
      <mesh position={[0, -0.12, 0.78]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f0d8b0" roughness={0.85} />
      </mesh>

      {/* hair */}
      <mesh position={[0, 0.04, 0.74]}>
        <sphereGeometry args={[0.19, 16, 8]} />
        <meshStandardMaterial color="#1a1008" />
      </mesh>

      {/* developer arms — reaching toward keyboard */}
      <mesh position={[-0.28, -0.72, 0.52]} rotation={[0.6, 0, 0.2]}>
        <capsuleGeometry args={[0.055, 0.38, 4, 8]} />
        <meshStandardMaterial color="#e8c547" roughness={0.85} />
      </mesh>
      <mesh position={[0.28, -0.72, 0.52]} rotation={[0.6, 0, -0.2]}>
        <capsuleGeometry args={[0.055, 0.38, 4, 8]} />
        <meshStandardMaterial color="#e8c547" roughness={0.85} />
      </mesh>
    </group>
  );
}

/* ─── exported component ─────────────────────────────── */
export default function DevAnimation3D() {
  return (
    <Canvas
      camera={{ position: [2.8, 1.6, 4.2], fov: 40 }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.45} color="#f0ece2" />
      <pointLight position={[0, 2.5, 1.5]} color="#47c8b0" intensity={2.2} distance={7} />
      <pointLight position={[-3, 0.5, 2]} color="#e8c547" intensity={1.0} distance={6} />
      <pointLight position={[2, -0.5, 2]} color="#9b8ec4" intensity={0.5} distance={5} />
      <DeveloperScene />
      <Particles />
    </Canvas>
  );
}
