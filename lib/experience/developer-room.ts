import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Architectural Builder Workspace (Chapter 04):
 * - Triple-display workstation with real CSS3D projected ProgressiveEditor on center display
 * - Sleek low-profile input deck (no blocky keyboard-key grids or dangling under-desk cables)
 */
export function createDeveloperRoom(parent?: THREE.Object3D, editorWidth = 1080) {
  const room = new THREE.Group();
  parent?.add(room);
  const alloy = new THREE.MeshStandardMaterial({ color: "#253447", metalness: 0.82, roughness: 0.3 });
  const graphite = new THREE.MeshStandardMaterial({ color: "#111b29", metalness: 0.6, roughness: 0.32 });
  const rubber = new THREE.MeshStandardMaterial({ color: "#080e18", roughness: 0.75 });
  const light = new THREE.MeshBasicMaterial({ color: "#72d4e9" });
  const lavender = new THREE.MeshBasicMaterial({ color: "#9ca8db" });
  const screenBlack = new THREE.MeshBasicMaterial({ color: "#060c15" });
  const box = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, rounded = false) => {
    const geometry = rounded ? new RoundedBoxGeometry(w, h, d, 2, Math.min(0.075, d / 3)) : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    room.add(mesh);
    return mesh;
  };

  // Architectural shell: softly reflective floor, panelled rear wall, light coves.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 22),
    new THREE.MeshStandardMaterial({ color: "#101a26", metalness: 0.75, roughness: 0.25 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -2.3, 0);
  room.add(floor);
  box(23, 10, 0.2, graphite, 0, 2, -4.3);
  for (let i = 0; i < 20; i++) {
    box(0.055, 8, 0.08, alloy, -10.5 + i * 1.1, 2.6, -4.13);
  }
  box(17, 0.035, 0.06, light, 0, 5.4, -4.02);
  box(0.035, 6.8, 0.05, lavender, -9, 2.2, -4.0);
  box(0.035, 6.8, 0.05, light, 9, 2.2, -4.0);
  box(17, 0.6, 0.5, rubber, 0, 5.76, -4.1);
  for (const x of [-8.2, 8.2]) {
    const pillar = box(0.18, 8, 5, graphite, x, 1.6, -1.6);
    pillar.rotation.y = x < 0 ? -0.13 : 0.13;
  }

  // The work surface and its under-lit edge.
  box(15, 0.22, 4.7, graphite, 0, -0.55, 0.25, true);
  box(14.85, 0.025, 0.045, light, 0, -0.59, 2.62);
  for (const x of [-6.3, 6.3]) {
    box(0.24, 1.55, 3.7, alloy, x, -1.4, 0.3);
    box(1.1, 0.12, 4, graphite, x, -2.15, 0.3);
  }

  const makeMonitor = (x: number, y: number, z: number, width: number, height: number, angle: number, texture?: THREE.Texture) => {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = angle;
    const frame = new THREE.Mesh(new RoundedBoxGeometry(width + 0.18, height + 0.18, 0.19, 2, 0.07), alloy);
    group.add(frame);
    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      texture ? new THREE.MeshBasicMaterial({ map: texture }) : screenBlack
    );
    bezel.position.z = 0.103;
    group.add(bezel);
    const chin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.013, 0.01), light);
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
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#07101b";
    ctx.fillRect(0, 0, 640, 480);
    ctx.strokeStyle = "#203247";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(640, 52);
    ctx.stroke();
    ctx.font = "13px monospace";
    ctx.fillStyle = "#6da4ba";
    ctx.fillText(variant === "system" ? "BUDAI / INTELLIGENCE CORE" : "STILLEDEV / LOCAL TERMINAL", 25, 31);
    if (variant === "system") {
      const cx = 320, cy = 225;
      const stations = [
        [150, 125, "01 WRITE"],
        [135, 225, "02 AUTOMATE"],
        [150, 325, "03 DECIDE"],
        [490, 125, "04 SV / EN"],
        [505, 225, "05 MEMORY"],
        [490, 325, "06 VISION"],
      ] as const;
      stations.forEach(([sx, sy]) => {
        ctx.strokeStyle = "#35667d";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      });
      ctx.strokeStyle = "#77d4e8";
      ctx.fillStyle = "#123244";
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#c9f4fd";
      ctx.font = "11px monospace";
      ctx.fillText("CORE", cx - 16, cy + 4);
      stations.forEach(([sx, sy, label]) => {
        ctx.fillStyle = "#0d2130";
        ctx.strokeStyle = "#5696ad";
        ctx.beginPath();
        ctx.roundRect(sx - 50, sy - 18, 100, 36, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#a8d8e6";
        ctx.font = "10px monospace";
        ctx.fillText(label, sx - 36, sy + 4);
      });
      ctx.fillStyle = "#48667a";
      ctx.fillText("SIGNAL → STRUCTURE · 06 PATHWAYS", 25, 445);
    } else {
      const lines = [
        "~/budai $ npm run dev",
        "",
        "> next dev",
        "",
        "✓ TypeScript initialized",
        "✓ Neural core & pathways ready",
        "",
        "// Built with intention.",
        "// Shipped in public · Sweden.",
        "",
        "stilledev@budai ~ % ▌",
      ];
      lines.forEach((text, i) => {
        ctx.font = "15px monospace";
        ctx.fillStyle = i === 4 || i === 5 ? "#86c6b7" : i > 6 ? "#5c8096" : "#a8c6d6";
        ctx.fillText(text, 25, 90 + i * 28);
      });
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // The central display's contents are a REAL DOM editor rendered by CSS3DRenderer.
  const central = makeMonitor(0, 2.05, -0.85, 6.5, 3.64, 0);
  makeMonitor(-5.15, 1.85, -1.05, 3.4, 2.8, 0.36, dashboard("system"));
  makeMonitor(5.15, 1.85, -1.05, 3.4, 2.8, -0.36, dashboard("terminal"));

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

  const cyanLamp = new THREE.PointLight("#71c9e7", 32, 18, 2);
  cyanLamp.position.set(-4, 3, 2);
  room.add(cyanLamp);
  const fillLamp = new THREE.PointLight("#9fabe9", 24, 17, 2);
  fillLamp.position.set(5, 4, 1);
  room.add(fillLamp);
  const deskLamp = new THREE.PointLight("#a6e6ec", 12, 8, 2);
  deskLamp.position.set(0, 0.3, 2.5);
  room.add(deskLamp);

  return {
    group: room,
    screenPosition: central.position.clone().add(new THREE.Vector3(0, 0, 0.112)),
    screenScale: 6.5 / editorWidth,
    lamps: [cyanLamp, fillLamp, deskLamp],
  };
}
