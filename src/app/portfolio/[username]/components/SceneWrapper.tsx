"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import ModelLoader from "./ModelLoader";
import AttachHtmlToMesh from "./AttachHtmlToMesh";
import FanAnimator from "./FanAnimator";
import { navConfig } from "./navConfig";
import { UserProfile, Experience, Project, Skill } from "@/types/portfolio";
import AboutPanel from "./sections/AboutPanel";
import ContactPanel from "./sections/ContactPanel";
import ExperiencePanel from "./sections/ExperiencePanel";
import SkillsPanel from "./sections/SkillsPanel";
import ProjectsPanel from "./sections/ProjectsPanel";

interface Props {
  profile: UserProfile;
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  setLoaded: (v: boolean) => void;
  cameraReset: boolean;
  setIsAnimating: (v: boolean) => void;
  onOpenChat: () => void;
}

export default function SceneWrapper({
  profile,
  experiences,
  projects,
  skills,
  setLoaded,
  cameraReset,
  setIsAnimating,
  onOpenChat,
}: Props) {
  const [interactives, setInteractives] = useState<THREE.Mesh[]>([]);
  const [fans, setFans] = useState<THREE.Mesh[]>([]);
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  // Which "screen" the phone shows: about or contact
  const [phoneView, setPhoneView] = useState<"about" | "contact">("about");
  const { camera } = useThree();

  // Camera reset effect
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current as unknown as {
      target: THREE.Vector3;
      enabled: boolean;
      enableZoom: boolean;
      update: () => void;
    };
    controls.enabled = false;
    controls.enableZoom = false;

    gsap.killTweensOf([controls.target, camera.position]);

    gsap.to(controls.target, {
      x: 0, y: 2, z: 0,
      duration: 2,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(camera.position, {
      x: 16.5, y: 4, z: 14.5,
      duration: 2,
      ease: "power2.out",
      overwrite: "auto",
      onUpdate: () => {
        camera.lookAt(controls.target);
        controls.update();
      },
      onComplete: () => {
        controls.enabled = true;
        controls.enableZoom = true;
        setIsAnimating(false);
      },
    });
  }, [cameraReset]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial controls setup
  useEffect(() => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current as unknown as {
      target: THREE.Vector3;
      enablePan: boolean;
      minPolarAngle: number;
      maxPolarAngle: number;
      update: () => void;
    };
    ctrl.target.set(0, 2, 0);
    ctrl.update();
    ctrl.enablePan = false;
    ctrl.minPolarAngle = 0;
    ctrl.maxPolarAngle = Math.PI / 2;
  }, []);

  // Raycasting for click-to-navigate
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const { gl } = useThree();

  const focusCameraOnMesh = useCallback(
    (mesh: THREE.Mesh) => {
      if (!controlsRef.current) return;
      const controls = controlsRef.current as unknown as {
        target: THREE.Vector3;
        enabled: boolean;
        enableZoom: boolean;
        update: () => void;
      };

      const configEntry = Object.values(navConfig).find(
        (c) => c.target === mesh.name
      );
      if (!configEntry) return;

      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      const cameraZ = Math.abs((maxDim / 2 / Math.tan(fov / 2)) * 1.5);

      const offsetDir = new THREE.Vector3(...configEntry.cameraOffset).normalize();
      const newPos = center.clone().add(offsetDir.multiplyScalar(cameraZ));

      setIsAnimating(true);
      controls.enabled = false;
      controls.enableZoom = false;

      gsap.killTweensOf([controls.target, camera.position]);

      gsap.to(controls.target, {
        x: center.x, y: center.y, z: center.z,
        duration: 2,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(camera.position, {
        x: newPos.x, y: newPos.y, z: newPos.z,
        duration: 2,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          camera.lookAt(controls.target);
          controls.update();
        },
        onComplete: () => {
          controls.enabled = true;
          controls.enableZoom = true;
          setIsAnimating(false);
        },
      });
    },
    [camera, setIsAnimating]
  );

  const handleClick = useCallback(
    (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(pointer.current, camera);
      const hits = raycaster.current.intersectObjects(interactives, false);

      if (hits.length > 0) {
        const hit = hits[0].object as THREE.Mesh;
        // Find which screen this target corresponds to
        const entry = Object.values(navConfig).find(
          (c) => c.glass === hit.name || c.text === hit.name
        );
        if (entry) {
          const screenMesh = interactives.find((m) => m.name === entry.target);
          if (screenMesh) focusCameraOnMesh(screenMesh);

          // If clicking contact target, switch phone view
          if (entry.text === navConfig.Contact.text) {
            setPhoneView("contact");
          } else if (entry.text === navConfig.AboutMe.text) {
            setPhoneView("about");
          }
        }
      }
    },
    [camera, gl.domElement, interactives, focusCameraOnMesh]
  );

  useEffect(() => {
    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [gl.domElement, handleClick]);

  const phoneMesh = interactives.find((m) => m.name === "Phone_Screen_White_Target");
  const vendingMesh = interactives.find((m) => m.name === "VendingMachine_Screen_White_Target");
  const jackboxMesh = interactives.find((m) => m.name === "Jackbox_Screen_White_Target");
  const arcadeMesh = interactives.find((m) => m.name === "ArcadeMachine_Screen_White_Target");

  return (
    <>
      <ModelLoader
        onMeshReady={setInteractives}
        onFansReady={setFans}
        setLoaded={setLoaded}
      />

      {/* Phone screen: About ↔ Contact */}
      {phoneMesh && (
        <AttachHtmlToMesh mesh={phoneMesh}>
          {phoneView === "about" ? (
            <AboutPanel
              profile={profile}
              onShowContact={() => setPhoneView("contact")}
            />
          ) : (
            <ContactPanel
              profile={profile}
              onShowAbout={() => setPhoneView("about")}
              onOpenChat={onOpenChat}
            />
          )}
        </AttachHtmlToMesh>
      )}

      {/* Vending Machine: Projects */}
      {vendingMesh && (
        <AttachHtmlToMesh mesh={vendingMesh}>
          <ProjectsPanel projects={projects} />
        </AttachHtmlToMesh>
      )}

      {/* Jackbox: Experience */}
      {jackboxMesh && (
        <AttachHtmlToMesh mesh={jackboxMesh}>
          <ExperiencePanel experiences={experiences} />
        </AttachHtmlToMesh>
      )}

      {/* Arcade Machine: Skills */}
      {arcadeMesh && (
        <AttachHtmlToMesh mesh={arcadeMesh}>
          <SkillsPanel skills={skills} />
        </AttachHtmlToMesh>
      )}

      <FanAnimator fans={fans} />
      <OrbitControls ref={controlsRef} />
    </>
  );
}
