"use client";

import { Html } from "@react-three/drei";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import { Vector3, Mesh } from "three";
import { navConfig } from "./navConfig";

interface Props {
  mesh: Mesh;
  children: React.ReactNode;
}

export default function AttachHtmlToMesh({ mesh, children }: Props) {
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [isMedium, setIsMedium] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  const htmlRef = useRef(null);

  const configEntry = Object.values(navConfig).find(
    (entry) => entry.target === mesh?.name
  );

  // Step 1: Compute size from mesh bounding box
  useLayoutEffect(() => {
    if (!mesh || !configEntry) return;
    mesh.geometry?.computeBoundingBox();
    const box = mesh.geometry?.boundingBox;
    if (!box) return;

    const axisMap: Record<string, number> = {
      x: box.max.x - box.min.x,
      y: box.max.y - box.min.y,
      z: box.max.z - box.min.z,
    };

    setSize({
      width: axisMap[configEntry.htmlSizeAxis[0]] || 1,
      height: axisMap[configEntry.htmlSizeAxis[1]] || 1,
    });
  }, [mesh, configEntry]);

  // Step 2: Compute world position after size is set
  useEffect(() => {
    if (!mesh || !configEntry) return;
    const raf = requestAnimationFrame(() => {
      const box = mesh.geometry?.boundingBox;
      if (!box) return;
      const center = new Vector3();
      box.getCenter(center);
      mesh.localToWorld(center);
      setPosition([
        center.x + configEntry.htmlOffset[0],
        center.y + configEntry.htmlOffset[1],
        center.z + configEntry.htmlOffset[2],
      ]);
    });
    return () => cancelAnimationFrame(raf);
  }, [size, mesh, configEntry]);

  useEffect(() => {
    const onResize = () => setIsMedium(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!mesh || !configEntry) return null;

  const distanceFactor = isMedium ? 0.4 : 0.6;
  const multiplier = isMedium ? 1000 : 700;

  return (
    <Html
      ref={htmlRef}
      position={position}
      rotation={configEntry.htmlRotation}
      transform
      occlude="blending"
      center
      distanceFactor={distanceFactor}
      style={{
        width: `${size.width * multiplier}px`,
        height: `${size.height * multiplier}px`,
      }}
    >
      <div className="w-full h-full flex items-center justify-center">
        {children}
      </div>
    </Html>
  );
}
