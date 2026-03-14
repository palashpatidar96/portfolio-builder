"use client";

import { useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import SceneWrapper from "./SceneWrapper";
import NavControls from "./NavControls";
import Preloader3D from "./Preloader3D";
import { UserProfile, Experience, Project, Skill, Education } from "@/types/portfolio";

interface Props {
  profile: UserProfile;
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
  onOpenChat: () => void;
}

export default function Portfolio3DCanvas({
  profile,
  experiences,
  projects,
  skills,
  onOpenChat,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [cameraReset, setCameraReset] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleReset = useCallback(() => {
    if (isAnimating) return;
    setCameraReset((v) => !v);
  }, [isAnimating]);

  // Keyboard shortcut: Escape → reset camera
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isAnimating) handleReset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAnimating, handleReset]);

  return (
    <>
      {showPreloader && (
        <Preloader3D
          loaded={loaded}
          onDone={() => setShowPreloader(false)}
        />
      )}

      <Canvas
        camera={{ position: [16.5, 4, 14.5], fov: 35 }}
        className="!fixed inset-0"
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <SceneWrapper
            profile={profile}
            experiences={experiences}
            projects={projects}
            skills={skills}
            setLoaded={setLoaded}
            cameraReset={cameraReset}
            setIsAnimating={setIsAnimating}
            onOpenChat={onOpenChat}
          />
        </Suspense>
      </Canvas>

      {!showPreloader && (
        <NavControls
          onReset={handleReset}
          name={profile.full_name}
        />
      )}
    </>
  );
}
