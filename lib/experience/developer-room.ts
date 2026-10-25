import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Architectural Builder Workspace (Chapter 04):
 * - Triple-display workstation with real CSS3D projected ProgressiveEditor on center display
 * - 3D Desk Holographic Neural Core sculpture echoing Chapter 03's Intelligence Core
 * - High-DPI side telemetry displays & sleek low-profile input deck
 */
export function createDeveloperRoom(parent?: THREE.Object3D, editorWidth = 1080) {
  const room = new THREE.Group();
  parent?.add(room);
  const alloy = new THREE.MeshStandardMaterial({ color: "#253447", metalness: 0.82, roughness: 0.28 });
  const graphite = new THREE.MeshStandardMaterial({ color: "#111b29", metalness: 0.62, roughness: 0.3 });
  const rubber = new THREE.MeshStandardMaterial({ color: "#080e18", roughness: 0.75 });
  const light = new THREE.MeshBasicMaterial({ color: "#72d4e9" });
  const lavender = new THREE.MeshBasicMaterial({ color: "#9ca8db" });
  const screenBlack = new THREE.MeshBasicMaterial({ color: "#060c15" });
  const edgeWireMat = new THREE.LineBasicMaterial({
    color: "#6ecbe2",
    transparent: true,
    opacity: 0.28,
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

  // Architectural shell: softly reflective floor, panelled rear wall, light coves & ceiling ribs.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 22),
    new THREE.MeshStandardMaterial({ color: "#101a26", metalness: 0.78, roughness: 0.23 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -2.3, 0);
  room.add(floor);

  // Subtle architectural floor grid lines in front of the desk
  const floorGridPts: THREE.Vector3[] = [];
  for (let gx = -9; gx <= 9; gx += 3) {
    floorGridPts.push(new THREE.Vector3(gx, -2.29, -3.8), new THREE.Vector3(gx, -2.29, 5.5));
  }
  for (let gz = -3; gz <= 4.5; gz += 2.5) {
    floorGridPts.push(new THREE.Vector3(-9, -2.29, gz), new THREE.Vector3(9, -2.29, gz));
  }
  const floorGrid = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(floorGridPts),
    new THREE.LineBasicMaterial({ color: "#4aa3be", transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  room.add(floorGrid);

  box(23, 10, 0.2, graphite, 0, 2, -4.3);
  for (let i = 0; i < 20; i++) {
    box(0.055, 8, 0.08, alloy, -10.5 + i * 1.1, 2.6, -4.13);
  }
  box(17, 0.04, 0.06, light, 0, 5.4, -4.02);
  box(14, 0.025, 0.04, lavender, 0, 4.45, -4.04);
  box(0.035, 6.8, 0.05, lavender, -9, 2.2, -4.0);
  box(0.035, 6.8, 0.05, light, 9, 2.2, -4.0);
  box(17, 0.6, 0.5, rubber, 0, 5.76, -4.1);
  for (const x of [-8.2, 8.2]) {
    const pillar = box(0.18, 8, 5, graphite, x, 1.6, -1.6);
    pillar.rotation.y = x < 0 ? -0.13 : 0.13;
  }

  // The work surface and its under-lit cyan/lavender edge.
  box(15, 0.22, 4.7, graphite, 0, -0.55, 0.25, true);
  box(14.85, 0.028, 0.045, light, 0, -0.59, 2.62);
  box(14.6, 0.018, 0.035, lavender, 0, -0.43, -2.06);
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
    const frameRim = new THREE.LineSegments(new THREE.EdgesGeometry( new THREE.BoxGeometry(width + 0.16, height + 0.16, 0.18)), edgeWireMat);
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

  const dashboard = (variant: "system" | "terminal") => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 576;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#060e19";
    ctx.fillRect(0, 0, 768, 576);

    // Top telemetry header bar
    ctx.fillStyle = "#0b1929";
    ctx.fillRect(0, 0, 768, 58);
    ctx.strokeStyle = "#24435c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 58);
    ctx.lineTo(768, 58);
    ctx.stroke();

    ctx.fillStyle = "#77d6ec";
    ctx.beginPath();
    ctx.arc(28, 29, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "600 14px monospace";
    ctx.fillStyle = "#9ad7e8";
    ctx.fillText(
      variant === "system" ? "BUDAI / NEURAL ARCHITECTURE · 06 PATHWAYS" : "STILLEDEV / PRODUCTION TELEMETRY · SWEDEN",
      44,
      34
    );
    ctx.font = "12px monospace";
    ctx.fillStyle = "#527a91";
    ctx.fillText(variant === "system" ? "CORE v5.2" : "SE-NORTH", 668, 34);

    if (variant === "system") {
      const cx = 384, cy = 262;
      // Outer orbital rings on diagram
      [66, 98, 134].forEach((r, idx) => {
        ctx.strokeStyle = idx === 0 ? "rgba(119, 212, 232, 0.35)" : "rgba(156, 168, 223, 0.16)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      const stations = [
        [156, 138, "01 WRITE", "EDITORIAL"],
        [132, 262, "02 AUTOMATE", "WORKFLOW"],
        [156, 386, "03 DECIDE", "SYNTHESIS"],
        [612, 138, "04 SV / EN", "BILINGUAL"],
        [636, 262, "05 MEMORY", "CONTEXT"],
        [612, 386, "06 VISION", "MULTIMODAL"],
      ] as const;

      stations.forEach(([sx, sy]) => {
        ctx.strokeStyle = "#3c7690";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.bezierCurveTo((cx + sx) * 0.5, cy, (cx + sx) * 0.5, sy, sx, sy);
        ctx.stroke();

        // Midpoint signal node
        const mx = (cx + sx) * 0.5;
        const my = (cy + sy) * 0.5;
        ctx.fillStyle = "#8ce7fa";
        ctx.beginPath();
        ctx.arc(mx, my, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central core emblem
      ctx.strokeStyle = "#8ce7fa";
      ctx.lineWidth = 2;
      ctx.fillStyle = "#102d3f";
      ctx.beginPath();
      ctx.arc(cx, cy, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#d4f7ff";
      ctx.font = "600 13px monospace";
      ctx.fillText("BUDAI", cx - 22, cy - 3);
      ctx.font = "11px monospace";
      ctx.fillStyle = "#7bcce0";
      ctx.fillText("CORE", cx - 16, cy + 14);

      stations.forEach(([sx, sy, label, sub]) => {
        ctx.fillStyle = "#0c1f2f";
        ctx.strokeStyle = "#5ea4be";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(sx - 62, sy - 24, 124, 48, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#c9f3fd";
        ctx.font = "600 12px monospace";
        ctx.fillText(label, sx - 46, sy - 4);
        ctx.fillStyle = "#699bb0";
        ctx.font = "10px monospace";
        ctx.fillText(sub, sx - 46, sy + 13);
      });

      // Bottom telemetry strip
      ctx.fillStyle = "#091522";
      ctx.fillRect(24, 492, 720, 56);
      ctx.strokeStyle = "#213f56";
      ctx.strokeRect(24, 492, 720, 56);
      ctx.fillStyle = "#76cbe0";
      ctx.font = "12px monospace";
      ctx.fillText("SIGNAL → STRUCTURE · 06 WAVEGUIDES ONLINE · LATENCY 14ms", 42, 525);
    } else {
      const lines = [
        "~/budai $ npm run dev",
        "",
        "  ▲ Next.js 14 · BudAI Intelligence Platform",
        "  ✓ TypeScript & GLSL shaders compiled",
        "  ✓ 3D Neural Cortex & 06 Capability Waveguides ready",
        "  ✓ Bilingual Swedish + English streaming active",
        "",
        "  // Built with intention by Stilledev.",
        "  // Shipped in public · Stockholm, Sweden.",
        "",
        "stilledev@budai ~ % ▌",
      ];
      lines.forEach((text, i) => {
        ctx.font = "15px monospace";
        ctx.fillStyle =
          i >= 3 && i <= 5 ? "#80dfca" : i === 2 ? "#8bdbf0" : i >= 7 && i <= 8 ? "#6892ab" : "#b8d7e6";
        ctx.fillText(text, 30, 96 + i * 31);
      });

      // Bottom system metrics box
      ctx.fillStyle = "#091522";
      ctx.fillRect(28, 466, 712, 82);
      ctx.strokeStyle = "#254963";
      ctx.strokeRect(28, 466, 712, 82);
      ctx.font = "12px monospace";
      ctx.fillStyle = "#8ce7fa";
      ctx.fillText("WEBGL2 PIPELINE: ACTIVE          MEMORY ENGINE: SUPABASE RLS", 46, 498);
      ctx.fillStyle = "#6c9bb2";
      ctx.fillText("MODELS: BUDAI CORE / FAST / PRO  LANGUAGE: SV + EN NATIVE", 46, 526);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // The central display's contents are a REAL DOM editor rendered by CSS3DRenderer.
  const central = makeMonitor(0, 2.05, -0.85, 6.5, 3.64, 0);
  makeMonitor(-5.15, 1.85, -1.05, 3.4, 2.8, 0.36, dashboard("system"));
  makeMonitor(5.15, 1.85, -1.05, 3.4, 2.8, -0.36, dashboard("terminal"));

  // 3D Desk Holographic Neural Core Sculpture on left side of desk (echoing Chapter 03 Core)
  const holoGroup = new THREE.Group();
  holoGroup.position.set(-3.75, -0.1, 1.15);
  room.add(holoGroup);
  const holoBase = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.54, 0.08, 6), alloy);
  holoBase.position.y = -0.3;
  holoGroup.add(holoBase);
  const holoBaseRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.01, 6, 36), light);
  holoBaseRing.rotation.x = Math.PI / 2;
  holoBaseRing.position.y = -0.25;
  holoGroup.add(holoBaseRing);
  const holoCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.MeshBasicMaterial({ color: "#9bf0ff", transparent: true, opacity: 0.85 })
  );
  holoCore.position.y = 0.06;
  holoGroup.add(holoCore);
  const holoCage = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.32, 1)),
    new THREE.LineBasicMaterial({ color: "#78d8ee", transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending })
  );
  holoCage.position.y = 0.06;
  holoGroup.add(holoCage);
  const holoOrbit = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.008, 6, 40), lavender);
  holoOrbit.position.y = 0.06;
  holoOrbit.rotation.set(1.1, 0.3, 0);
  holoGroup.add(holoOrbit);

  // Sleek low-profile architectural desk mat and flush anodized input surfaces (no blocky keys or cables).
  box(5.6, 0.02, 1.55, rubber, 0.25, -0.43, 1.42, true);
  box(2.95, 0.045, 0.92, alloy, -0.35, -0.395, 1.42, true);
  box(2.75, 0.012, 0.02, light, -0.35, -0.368, 0.98);
  for (let row = 0; row < 4; row++) {
    box(2.68, 0.008, 0.14, graphite, -0.35, -0.37, 1.12 + row * 0.18);
  }
  box(0.82, 0.04, 0.88, graphite, 1.85, -0.4, 1.42, true);
  box(0.02, 0.01, 0.24, light, 1.85, -0.375, 1.42);

  // Clean workstation chassis with subtle status rings.
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
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.024, 6, 40), i ? lavender : light);
    ring.position.set(5.8, 0.2 + i, 1.72);
    room.add(ring);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 12), graphite);
    hub.rotation.x = Math.PI / 2;
    hub.position.copy(ring.position);
    room.add(hub);
  }

  // Low foreground architectural chair for human scale and parallax.
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
  };
}
