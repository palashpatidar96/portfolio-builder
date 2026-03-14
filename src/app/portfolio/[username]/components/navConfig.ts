// Maps portfolio sections to 3D mesh targets in the GLB scene.
// Section → Screen mesh it appears on + camera/HTML config.
export const navConfig: Record<
  string,
  {
    glass: string;
    text: string;
    target: string;
    cameraOffset: [number, number, number];
    htmlRotation: [number, number, number];
    htmlSizeAxis: ["x" | "y" | "z", "x" | "y" | "z"];
    htmlOffset: [number, number, number];
  }
> = {
  // About / Contact share the Phone screen (toggled via arrows)
  AboutMe: {
    glass: "AboutMe_Glass_Target",
    text: "AboutMe_Red_Text_Target",
    target: "Phone_Screen_White_Target",
    cameraOffset: [-1.5, 0, 0],
    htmlRotation: [0, -Math.PI / 2, 0],
    htmlSizeAxis: ["z", "x"],
    htmlOffset: [-0.001, 0, 0],
  },
  // Projects → Vending Machine screen
  Projects: {
    glass: "Projects_Glass_Target",
    text: "Projects_Red_Text_Target",
    target: "VendingMachine_Screen_White_Target",
    cameraOffset: [0, 0, 1],
    htmlRotation: [0, 0, 0],
    htmlSizeAxis: ["x", "y"],
    htmlOffset: [0, 0, 0.001],
  },
  // Skills → Arcade Machine screen (repurposed from "Games")
  Skills: {
    glass: "Games_Glass_Target",
    text: "Games_Red_Text_Target",
    target: "ArcadeMachine_Screen_White_Target",
    cameraOffset: [0, 0, -1.2],
    htmlRotation: [0, Math.PI, 0],
    htmlSizeAxis: ["x", "y"],
    htmlOffset: [0, 0, -0.001],
  },
  // Experience → Jackbox screen (repurposed from "Music")
  Experience: {
    glass: "Music_Glass_Target",
    text: "Music_Red_Text_Target",
    target: "Jackbox_Screen_White_Target",
    cameraOffset: [0, 0, -1.2],
    htmlRotation: [0, Math.PI, 0],
    htmlSizeAxis: ["x", "y"],
    htmlOffset: [0, 0, -0.001],
  },
  // Contact shares the Phone screen (toggled from About)
  Contact: {
    glass: "Contact_Glass_Target",
    text: "Contact_Red_Text_Target",
    target: "Phone_Screen_White_Target",
    cameraOffset: [-1.5, 0, 0],
    htmlRotation: [0, Math.PI / 2, 0],
    htmlSizeAxis: ["z", "x"],
    htmlOffset: [-0.001, 0, 0],
  },
};
