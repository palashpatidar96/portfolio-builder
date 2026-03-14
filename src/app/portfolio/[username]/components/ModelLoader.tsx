"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface Props {
  onMeshReady: (meshes: THREE.Mesh[]) => void;
  onFansReady: (fans: THREE.Mesh[]) => void;
  setLoaded: (loaded: boolean) => void;
}

export default function ModelLoader({ onMeshReady, onFansReady, setLoaded }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/3dPortfolio.glb");

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const textureMap: Record<string, string> = {
      First: "/textures/First.webp",
      Second: "/textures/Second.webp",
      Third: "/textures/Third.webp",
    };
    const loaded: Record<string, THREE.Texture> = {};
    for (const [key, path] of Object.entries(textureMap)) {
      const tex = loader.load(path);
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      loaded[key] = tex;
    }
    return loaded;
  }, []);

  useEffect(() => {
    const interactive: THREE.Mesh[] = [];
    const fans: THREE.Mesh[] = [];

    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      // Apply named textures
      for (const key in textures) {
        if (mesh.name.includes(key)) {
          mesh.material = new THREE.MeshBasicMaterial({ map: textures[key] });
          (mesh.material as THREE.MeshBasicMaterial).map!.minFilter = THREE.LinearFilter;
        }
      }

      // Glass material
      if (mesh.name.includes("Glass")) {
        mesh.material = new THREE.MeshPhysicalMaterial({
          transparent: true,
          transmission: 1,
          roughness: 0,
          metalness: 0,
          opacity: 1,
          ior: 1.5,
          thickness: 0.1,
          specularIntensity: 1,
          clearcoat: 1,
          clearcoatRoughness: 0,
        });
      } else if (mesh.name.includes("Red_Text")) {
        mesh.material = new THREE.MeshBasicMaterial({ color: 0xff2222 });
      } else if (mesh.name.includes("White_Target")) {
        mesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      }

      // Collect fans
      if (mesh.name.includes("Fan")) fans.push(mesh);

      // Collect interactive target meshes
      if (mesh.name.includes("Target") || mesh.name.includes("First")) {
        if (!mesh.userData.initialScale) {
          mesh.userData.initialScale = mesh.scale.clone();
        }
        interactive.push(mesh);
      }
    });

    onMeshReady(interactive);
    onFansReady(fans);
    setLoaded(true);
  }, [scene, textures, onMeshReady, onFansReady, setLoaded]);

  return <primitive object={scene} ref={groupRef} />;
}

useGLTF.preload("/models/3dPortfolio.glb");
