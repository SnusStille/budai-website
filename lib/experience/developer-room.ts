import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp, lerp, smooth } from "./timeline";

/**
 * Architectural Builder & "FROM THOUGHT TO REALITY" Creation Environment (Chapter 04):
 * - Leaves the abstract neural brain behind and shows ideas becoming tangible digital products.
 * - Center Display: Real CSS3D projected ProgressiveEditor composing TypeScript/Next.js code.
 * - Left Creation Assembly: A 3D Website Interface & Live Analytics Dashboard that physically
 *   assembles from separate 3D building blocks (Header, Hero Card, KPI Chart, Feature Grid) as the visitor scrolls.
 * - Right Creation Assembly: A 3D Mobile Application Interface & 4-Stage Structured Workflow Board
 *   whose UI layers converge and lock into a finished mobile product as scroll progresses.
 * - Dynamic Lighting: The studio opens up and becomes clearer, brighter, and more grounded as the creations lock into place.
 */
export function createDeveloperRoom(parent?: THREE.Object3D, editorWidth = 1080) {
  const room = new THREE.Group();
  parent?.add(room);
  const alloy = new THREE.MeshStandardMaterial({ color: "#283a4f", metalness: 0.82, roughness: 0.25 });
  const graphite = new THREE.MeshStandardMaterial({ color: "#121e2e", metalness: 0.62, roughness: 0.28 });
  const rubber = new THREE.MeshStandardMaterial({ color: "#09101b", roughness: 0.72 });
  const light = new THREE.MeshBasicMaterial({ color: "#7be0f6" });
  const emerald = new THREE.MeshBasicMaterial({ color: "#6ee7b7" });
  const lavender = new THREE.MeshBasicMaterial({ color: "#a4b0ec" });
  const screenBlack = new THREE.MeshBasicMaterial({ color: "#060c15" });
  const edgeWireMat = new THREE.LineBasicMaterial({
    color: "#7ae2f8",
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const box = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, rounded = false) => {
    const geometry = rounded ? new RoundedBoxGeometry(w, h, d, 2, Math.min(0.075, d / 3)) : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    room.add(mesh);
    return mesh;
  };

  // Architectural shell: reflective studio floor, slatted acoustic/light wall, and skylight coves.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 22),
    new THREE.MeshStandardMaterial({ color: "#111d2b", metalness: 0.78, roughness: 0.22 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -2.3, 0);
  room.add(floor);

  const floorGridPts: THREE.Vector3[] = [];
  for (let gx = -9; gx <= 9; gx += 3) {
    floorGridPts.push(new THREE.Vector3(gx, -2.29, -3.8), new THREE.Vector3(gx, -2.29, 5.5));
  }
  for (let gz = -3; gz <= 4.5; gz += 2.5) {
    floorGridPts.push(new THREE.Vector3(-9, -2.29, gz), new THREE.Vector3(9, -2.29, gz));
  }
  const floorGrid = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(floorGridPts),
    new THREE.LineBasicMaterial({ color: "#58b8d4", transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  room.add(floorGrid);

  box(23, 10, 0.2, graphite, 0, 2, -4.3);
  for (let i = 0; i < 20; i++) {
    box(0.055, 8, 0.08, alloy, -10.5 + i * 1.1, 2.6, -4.13);
  }
  box(17, 0.045, 0.06, light, 0, 5.4, -4.02);
  box(14, 0.03, 0.04, emerald, 0, 4.45, -4.04);
  box(0.035, 6.8, 0.05, lavender, -9, 2.2, -4.0);
  box(0.035, 6.8, 0.05, light, 9, 2.2, -4.0);
  box(17, 0.6, 0.5, rubber, 0, 5.76, -4.1);
  for (const x of [-8.2, 8.2]) {
    const pillar = box(0.18, 8, 5, graphite, x, 1.6, -1.6);
    pillar.rotation.y = x < 0 ? -0.13 : 0.13;
  }

  // Work surface with illuminated cyan/emerald leading edge.
  box(15, 0.22, 4.7, graphite, 0, -0.55, 0.25, true);
  box(14.85, 0.028, 0.045, light, 0, -0.59, 2.62);
  box(14.6, 0.018, 0.035, emerald, 0, -0.43, -2.06);
  for (const x of [-6.3, 6.3]) {
    box(0.24, 1.55, 3.7, alloy, x, -1.4, 0.3);
    box(1.1, 0.12, 4, graphite, x, -2.15, 0.3);
  }

  const makeMonitor = (x: number, y: number, z: number, width: number, height: number, angle: number, texture?: THREE.Texture) => {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = angle;
    const frameGeo = new RoundedBoxGeometry(width + 0.18, height + 0.18, 0.19, 2, 0.07);
    const frame = new THREE.Mesh(frameGeo, alloy);
    group.add(frame);
    const frameRim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(width + 0.16, height + 0.16, 0.18)), edgeWireMat);
    group.add(frameRim);
    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      texture ? new THREE.MeshBasicMaterial({ map: texture }) : screenBlack
    );
    bezel.position.z = 0.103;
    group.add(bezel);
    const chin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.015, 0.01), light);
    chin.position.set(0, -height / 2 - 0.035, 0.105);
    group.add(chin);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1, 0.19), alloy);
    stem.position.set(0, -height / 2 - 0.5, -0.12);
    group.add(stem);
    const foot = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.08, 0.75, 1, 0.035), graphite);
    foot.position.set(0, -y - 0.37, 0.1);
    group.add(foot);
    room.add(group);
    return group;
  };

  // Tangible product canvases for the Left (Live Website & Analytics Dashboard) and Right (Workflow & Mobile Build) displays
  const createProductDisplayTexture = (variant: "dashboard" | "workflow") => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 576;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#071320";
    ctx.fillRect(0, 0, 768, 576);

    // Top app chrome
    ctx.fillStyle = "#0d2236";
    ctx.fillRect(0, 0, 768, 58);
    ctx.strokeStyle = "#326886";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 58);
    ctx.lineTo(768, 58);
    ctx.stroke();

    ctx.fillStyle = "#6ee7b7";
    ctx.beginPath();
    ctx.arc(28, 29, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "700 14px monospace";
    ctx.fillStyle = "#d8f8ff";
    ctx.fillText(
      variant === "dashboard"
        ? "CREATED PRODUCT 01 · WEBSITE & ANALYTICS DASHBOARD"
        : "CREATED PRODUCT 02 · WORKFLOW & MOBILE INTERFACE",
      48,
      34
    );

    if (variant === "dashboard") {
      // Assembled Website Hero + KPI Cards + Live Chart
      ctx.fillStyle = "#102a42";
      ctx.fillRect(28, 82, 712, 130);
      ctx.strokeStyle = "#78d5ea";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, 82, 712, 130);
      ctx.fillStyle = "#e8fcff";
      ctx.font = "700 20px sans-serif";
      ctx.fillText("Nordic Operations Portal · Built with BudAI", 52, 126);
      ctx.fillStyle = "#8ccce0";
      ctx.font = "14px sans-serif";
      ctx.fillText("Bilingual SV / EN interface, executive summaries & live metrics.", 52, 158);
      ctx.fillStyle = "#6ee7b7";
      ctx.fillRect(570, 112, 142, 42);
      ctx.fillStyle = "#051821";
      ctx.font = "700 13px monospace";
      ctx.fillText("LIVE PREVIEW", 590, 138);

      // 3 KPI Metric Cards
      const kpis = [
        { title: "WEEKLY TIME SAVED", val: "14.2 hrs", col: "#6ee7b7" },
        { title: "BILINGUAL DOCS", val: "128 SV/EN", col: "#78d5ea" },
        { title: "PLAYBOOK RUNS", val: "99.4% OK", col: "#a4b0ec" },
      ];
      kpis.forEach((k, idx) => {
        const kx = 28 + idx * 244;
        ctx.fillStyle = "#0c2135";
        ctx.fillRect(kx, 234, 224, 112);
        ctx.strokeStyle = k.col;
        ctx.strokeRect(kx, 234, 224, 112);
        ctx.fillStyle = "#8ab8cc";
        ctx.font = "600 11px monospace";
        ctx.fillText(k.title, kx + 18, 266);
        ctx.fillStyle = "#f0fcff";
        ctx.font = "700 26px sans-serif";
        ctx.fillText(k.val, kx + 18, 314);
      });

      // Bottom Analytics Bar Chart
      ctx.fillStyle = "#0a1c2e";
      ctx.fillRect(28, 368, 712, 178);
      ctx.strokeStyle = "#2b5872";
      ctx.strokeRect(28, 368, 712, 178);
      const bars = [68, 92, 84, 118, 108, 132, 144, 126, 148, 154];
      bars.forEach((bh, bIdx) => {
        ctx.fillStyle = bIdx % 2 === 0 ? "#78d5ea" : "#6ee7b7";
        ctx.fillRect(58 + bIdx * 66, 526 - bh, 42, bh * 0.85);
      });
    } else {
      // Structured 4-Step Workflow Board + Mobile App Companion Preview
      const steps = [
        ["01 · IDEA PROMPT", "Natural SV / EN intent"],
        ["02 · ARCHITECTURE", "TypeScript + UI schema"],
        ["03 · INTERFACE", "Dashboard & Mobile UI"],
        ["04 · REALITY", "Ready-to-ship output"],
      ];
      steps.forEach(([title, sub], sIdx) => {
        const sy = 84 + sIdx * 108;
        ctx.fillStyle = "#0e263c";
        ctx.fillRect(28, sy, 430, 88);
        ctx.strokeStyle = sIdx === 3 ? "#6ee7b7" : "#78d5ea";
        ctx.lineWidth = 1.6;
        ctx.strokeRect(28, sy, 430, 88);
        ctx.fillStyle = "#e4fbff";
        ctx.font = "700 15px monospace";
        ctx.fillText(title, 50, sy + 36);
        ctx.fillStyle = "#8cc2d6";
        ctx.font = "13px sans-serif";
        ctx.fillText(sub, 50, sy + 64);
      });

      // Right-hand Mobile App Preview Frame inside display
      ctx.fillStyle = "#102840";
      ctx.fillRect(486, 84, 252, 460);
      ctx.strokeStyle = "#6ee7b7";
      ctx.lineWidth = 2;
      ctx.strokeRect(486, 84, 252, 460);
      ctx.fillStyle = "#d8f8ff";
      ctx.font = "700 13px monospace";
      ctx.fillText("MOBILE INTERFACE", 542, 118);
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = c === 0 ? "rgba(110, 231, 183, 0.28)" : "rgba(120, 213, 234, 0.2)";
        ctx.fillRect(508, 144 + c * 92, 208, 74);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // Central display hosts the real DOM ProgressiveEditor via CSS3DRenderer.
  const central = makeMonitor(0, 2.05, -0.85, 6.5, 3.64, 0);
  makeMonitor(-5.15, 1.85, -1.05, 3.4, 2.8, 0.36, createProductDisplayTexture("dashboard"));
  makeMonitor(5.15, 1.85, -1.05, 3.4, 2.8, -0.36, createProductDisplayTexture("workflow"));

  // ============================================================================
  // FROM THOUGHT TO REALITY: 3D ASSEMBLING PRODUCT CREATIONS (Scroll-Driven)
  // ============================================================================
  const creationWireMat = new THREE.LineBasicMaterial({
    color: "#9cf4ff",
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const creationSolidMat = new THREE.MeshStandardMaterial({
    color: "#102a3f",
    emissive: "#1f6c88",
    emissiveIntensity: 0.85,
    metalness: 0.78,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
  });
  const creationEmeraldMat = new THREE.MeshBasicMaterial({
    color: "#6ee7b7",
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // 1. Left 3D Creation Assembly: Website Interface & Dashboard Cards assembling in 3D space
  const websiteAssemblyGroup = new THREE.Group();
  websiteAssemblyGroup.position.set(-4.35, 1.95, 0.45);
  websiteAssemblyGroup.rotation.y = 0.34;
  room.add(websiteAssemblyGroup);

  const websiteParts: Array<{
    mesh: THREE.Group;
    startPos: [number, number, number];
    endPos: [number, number, number];
  }> = [];

  const webSpecs: Array<{
    w: number;
    h: number;
    startPos: [number, number, number];
    endPos: [number, number, number];
    accent?: boolean;
  }> = [
    { w: 2.35, h: 0.24, startPos: [-0.85, 1.45, 0.95], endPos: [0, 0.72, 0.12], accent: true }, // Website Nav Bar
    { w: 2.35, h: 0.62, startPos: [-1.15, 0.45, 1.25], endPos: [0, 0.18, 0.16] },              // Hero Interface Card
    { w: 1.1, h: 0.56, startPos: [-0.95, -0.85, 1.1], endPos: [-0.62, -0.52, 0.2] },            // Left Analytics Card
    { w: 1.1, h: 0.56, startPos: [0.65, -0.95, 1.3], endPos: [0.62, -0.52, 0.2], accent: true }, // Right KPI Chart Card
  ];

  webSpecs.forEach(ws => {
    const pGroup = new THREE.Group();
    const pGeo = new RoundedBoxGeometry(ws.w, ws.h, 0.05, 2, 0.018);
    pGroup.add(new THREE.Mesh(pGeo, creationSolidMat));
    pGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(pGeo), creationWireMat));
    if (ws.accent) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(ws.w * 0.82, 0.035, 0.02), creationEmeraldMat);
      strip.position.z = 0.032;
      pGroup.add(strip);
    }
    pGroup.position.set(...ws.startPos);
    websiteAssemblyGroup.add(pGroup);
    websiteParts.push({ mesh: pGroup, startPos: ws.startPos, endPos: ws.endPos });
  });

  // 2. Right 3D Creation Assembly: Mobile Application Chassis & 3 Assembling UI Cards + Workflow Nodes
  const mobileAssemblyGroup = new THREE.Group();
  mobileAssemblyGroup.position.set(4.35, 1.88, 0.52);
  mobileAssemblyGroup.rotation.y = -0.34;
  room.add(mobileAssemblyGroup);

  const phoneChassisGeo = new RoundedBoxGeometry(1.28, 2.24, 0.08, 3, 0.06);
  const phoneChassis = new THREE.Mesh(phoneChassisGeo, graphite);
  mobileAssemblyGroup.add(phoneChassis);
  mobileAssemblyGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(phoneChassisGeo), creationWireMat));

  const mobileParts: Array<{
    mesh: THREE.Group;
    startPos: [number, number, number];
    endPos: [number, number, number];
  }> = [];

  const mobSpecs: Array<{
    w: number;
    h: number;
    startPos: [number, number, number];
    endPos: [number, number, number];
  }> = [
    { w: 1.08, h: 0.36, startPos: [0.95, 1.25, 1.05], endPos: [0, 0.68, 0.07] },
    { w: 1.08, h: 0.62, startPos: [1.25, 0.15, 1.2], endPos: [0, 0.06, 0.09] },
    { w: 1.08, h: 0.42, startPos: [0.85, -1.05, 0.95], endPos: [0, -0.62, 0.07] },
  ];

  mobSpecs.forEach((ms, idx) => {
    const mGroup = new THREE.Group();
    const mGeo = new RoundedBoxGeometry(ms.w, ms.h, 0.04, 2, 0.015);
    mGroup.add(new THREE.Mesh(mGeo, creationSolidMat));
    mGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(mGeo), creationWireMat));
    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(ms.w * 0.72, 0.032, 0.015),
      idx === 1 ? creationEmeraldMat : light
    );
    badge.position.z = 0.028;
    mGroup.add(badge);
    mGroup.position.set(...ms.startPos);
    mobileAssemblyGroup.add(mGroup);
    mobileParts.push({ mesh: mGroup, startPos: ms.startPos, endPos: ms.endPos });
  });

  // 3. Desk Holographic Creation Pedestal (Left foreground of desk)
  const holoGroup = new THREE.Group();
  holoGroup.position.set(-3.75, -0.1, 1.15);
  room.add(holoGroup);
  const holoBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.56, 0.08, 6), alloy);
  holoBase.position.y = -0.3;
  holoGroup.add(holoBase);
  const holoBaseRing = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 6, 36), emerald);
  holoBaseRing.rotation.x = Math.PI / 2;
  holoBaseRing.position.y = -0.25;
  holoGroup.add(holoBaseRing);
  const holoCore = new THREE.Mesh(
    new RoundedBoxGeometry(0.38, 0.26, 0.06, 2, 0.015),
    new THREE.MeshBasicMaterial({ color: "#9bf0ff", transparent: true, opacity: 0.88 })
  );
  holoCore.position.y = 0.08;
  holoGroup.add(holoCore);
  const holoCage = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.52, 0.38, 0.24)),
    new THREE.LineBasicMaterial({ color: "#6ee7b7", transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending })
  );
  holoCage.position.y = 0.08;
  holoGroup.add(holoCage);
  const holoOrbit = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.009, 6, 40), lavender);
  holoOrbit.position.y = 0.08;
  holoOrbit.rotation.set(1.1, 0.3, 0);
  holoGroup.add(holoOrbit);

  // Sleek low-profile architectural desk mat and flush anodized input surfaces.
  box(5.6, 0.02, 1.55, rubber, 0.25, -0.43, 1.42, true);
  box(2.95, 0.045, 0.92, alloy, -0.35, -0.395, 1.42, true);
  box(2.75, 0.012, 0.02, light, -0.35, -0.368, 0.98);
  for (let row = 0; row < 4; row++) {
    box(2.68, 0.008, 0.14, graphite, -0.35, -0.37, 1.12 + row * 0.18);
  }
  box(0.82, 0.04, 0.88, graphite, 1.85, -0.4, 1.42, true);
  box(0.02, 0.01, 0.24, light, 1.85, -0.375, 1.42);

  // Workstation chassis with status rings.
  box(1.3, 2.35, 2.0, graphite, 5.8, 0.7, 0.7, true);
  box(
    0.035,
    2.18,
    1.8,
    new THREE.MeshStandardMaterial({ color: "#234458", metalness: 0.6, roughness: 0.18, transparent: true, opacity: 0.7 }),
    5.13,
    0.7,
    0.7
  );
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.024, 6, 40), i ? emerald : light);
    ring.position.set(5.8, 0.2 + i, 1.72);
    room.add(ring);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 12), graphite);
    hub.rotation.x = Math.PI / 2;
    hub.position.copy(ring.position);
    room.add(hub);
  }

  // Foreground architectural chair.
  const chair = new THREE.Group();
  chair.position.set(-4.2, -1.1, 4);
  chair.rotation.y = -0.32;
  const seat = new THREE.Mesh(new RoundedBoxGeometry(1.85, 0.18, 1.6, 2, 0.08), rubber);
  chair.add(seat);
  const back = new THREE.Mesh(new RoundedBoxGeometry(1.8, 2.1, 0.15, 2, 0.07), graphite);
  back.position.set(0, 1, 0.75);
  back.rotation.x = -0.12;
  chair.add(back);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8), alloy);
  post.position.y = -0.5;
  chair.add(post);
  room.add(chair);

  const cyanLamp = new THREE.PointLight("#71c9e7", 34, 18, 2);
  cyanLamp.position.set(-4, 3, 2);
  room.add(cyanLamp);
  const fillLamp = new THREE.PointLight("#9fabe9", 26, 17, 2);
  fillLamp.position.set(5, 4, 1);
  room.add(fillLamp);
  const deskLamp = new THREE.PointLight("#a6e6ec", 14, 8, 2);
  deskLamp.position.set(0, 0.3, 2.5);
  room.add(deskLamp);

  return {
    group: room,
    screenPosition: central.position.clone().add(new THREE.Vector3(0, 0, 0.112)),
    screenScale: 6.5 / editorWidth,
    lamps: [cyanLamp, fillLamp, deskLamp],
    holo: { core: holoCore, cage: holoCage, orbit: holoOrbit },
    update(builderProgress: number, time: number) {
      const p = smooth(clamp(builderProgress));
      // 1. Assemble the 3D Website & Dashboard blocks on the left as scroll progresses
      websiteParts.forEach((part, idx) => {
        const localP = smooth(clamp((p - idx * 0.12) / 0.55));
        part.mesh.position.set(
          lerp(part.startPos[0], part.endPos[0], localP),
          lerp(part.startPos[1], part.endPos[1], localP) + Math.sin(time * 1.3 + idx) * 0.02 * (1 - localP),
          lerp(part.startPos[2], part.endPos[2], localP)
        );
        part.mesh.rotation.set(
          (1 - localP) * 0.25,
          (1 - localP) * -0.32,
          (1 - localP) * 0.12
        );
      });

      // 2. Assemble the 3D Mobile Interface & Workflow blocks on the right as scroll progresses
      mobileParts.forEach((part, idx) => {
        const localP = smooth(clamp((p - idx * 0.14) / 0.55));
        part.mesh.position.set(
          lerp(part.startPos[0], part.endPos[0], localP),
          lerp(part.startPos[1], part.endPos[1], localP) + Math.cos(time * 1.4 + idx) * 0.02 * (1 - localP),
          lerp(part.startPos[2], part.endPos[2], localP)
        );
        part.mesh.rotation.set(
          (1 - localP) * -0.22,
          (1 - localP) * 0.35,
          0
        );
      });

      // 3. Brighten and clarify studio lighting as creations materialize into reality
      creationSolidMat.emissiveIntensity = lerp(0.65, 1.25, p);
      cyanLamp.intensity = lerp(30, 46, p) + Math.sin(time * 0.6) * 2;
      fillLamp.intensity = lerp(24, 38, p);
      deskLamp.intensity = lerp(12, 24, p);
    },
  };
}
