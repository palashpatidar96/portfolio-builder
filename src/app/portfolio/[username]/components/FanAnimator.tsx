"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  fans: THREE.Mesh[];
}

export default function FanAnimator({ fans }: Props) {
  useFrame((_, delta) => {
    for (const fan of fans) {
      fan.rotation.z += delta * 8;
    }
  });

  return null;
}
