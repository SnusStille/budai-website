import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/** Original BudAI geometry. No model, gaming brand, remote textures or video. */
export function createDeveloperRoom(parent?: THREE.Object3D, editorWidth = 1080) {
  const room = new THREE.Group();
  parent?.add(room);
  const alloy = new THREE.MeshStandardMaterial({ color: "#253447", metalness: .82, roughness: .3 });
  const graphite = new THREE.MeshStandardMaterial({ color: "#111b29", metalness: .6, roughness: .32 });
  const rubber = new THREE.MeshStandardMaterial({ color: "#080e18", roughness: .75 });
  const light = new THREE.MeshBasicMaterial({ color: "#72d4e9" });
  const lavender = new THREE.MeshBasicMaterial({ color: "#9ca8db" });
  const screenBlack = new THREE.MeshBasicMaterial({ color: "#060c15" });
  const box = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, rounded = false) => {
    const geometry = rounded ? new RoundedBoxGeometry(w, h, d, 2, Math.min(.075, d / 3)) : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); room.add(mesh); return mesh;
  };

  // Architectural shell: softly reflective floor, panelled rear wall, light coves.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 22), new THREE.MeshStandardMaterial({ color: "#101a26", metalness: .75, roughness: .25 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -2.3, 0); room.add(floor);
  box(23, 10, .2, graphite, 0, 2, -4.3);
  for (let i = 0; i < 20; i++) {
    box(.055, 8, .08, alloy, -10.5 + i * 1.1, 2.6, -4.13);
  }
  box(17, .035, .06, light, 0, 5.4, -4.02);
  box(.035, 6.8, .05, lavender, -9, 2.2, -4.0);
  box(.035, 6.8, .05, light, 9, 2.2, -4.0);
  box(17, .6, .5, rubber, 0, 5.76, -4.1);
  for (const x of [-8.2, 8.2]) {
    const pillar = box(.18, 8, 5, graphite, x, 1.6, -1.6);
    pillar.rotation.y = x < 0 ? -.13 : .13;
  }

  // The work surface and its under-lit edge. Everything has actual thickness.
  box(15, .22, 4.7, graphite, 0, -.55, .25, true);
  box(14.85, .025, .045, light, 0, -.59, 2.62);
  for (const x of [-6.3, 6.3]) {
    box(.24, 1.55, 3.7, alloy, x, -1.4, .3);
    box(1.1, .12, 4, graphite, x, -2.15, .3);
  }

  const makeMonitor = (x: number, y: number, z: number, width: number, height: number, angle: number, texture?: THREE.Texture) => {
    const group = new THREE.Group(); group.position.set(x, y, z); group.rotation.y = angle;
    const frame = new THREE.Mesh(new RoundedBoxGeometry(width + .18, height + .18, .19, 2, .07), alloy);
    group.add(frame);
    const bezel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), texture ? new THREE.MeshBasicMaterial({ map: texture }) : screenBlack);
    bezel.position.z = .103; group.add(bezel);
    const chin = new THREE.Mesh(new THREE.BoxGeometry(.3, .013, .01), light); chin.position.set(0, -height / 2 - .035, .105); group.add(chin);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(.16, 1, .19), alloy); stem.position.set(0, -height / 2 - .5, -.12); group.add(stem);
    const foot = new THREE.Mesh(new RoundedBoxGeometry(1.5, .08, .75, 1, .035), graphite); foot.position.set(0, -y - .37, .1); group.add(foot);
    room.add(group); return group;
  };

  const dashboard = (variant: "system" | "terminal") => {
    const canvas = document.createElement("canvas"); canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#07101b"; ctx.fillRect(0, 0, 640, 480);
    ctx.strokeStyle = "#203247"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(640, 52); ctx.stroke();
    ctx.font = "13px monospace"; ctx.fillStyle = "#6da4ba"; ctx.fillText(variant === "system" ? "BUDAI / ARCHITECTURE" : "STILLEDEV / LOCAL TERMINAL", 25, 31);
    if (variant === "system") {
      const nodes = [[320, 210], [180, 130], [460, 130], [180, 310], [460, 310]];
      nodes.slice(1).forEach(([x, y]) => { ctx.strokeStyle = "#2e5569"; ctx.beginPath(); ctx.moveTo(320, 210); ctx.lineTo(x, y); ctx.stroke(); });
      nodes.forEach(([x, y], i) => { ctx.fillStyle = i ? "#0e2333" : "#153747"; ctx.strokeStyle = "#5898af"; ctx.beginPath(); ctx.roundRect(x - 46, y - 23, 92, 46, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#9fcede"; ctx.font = "11px monospace"; ctx.fillText(["CORE", "CONTEXT", "INPUT", "REASON", "OUTPUT"][i], x - 23, y + 4); });
      ctx.fillStyle = "#425c6f"; ctx.fillText("ILLUSTRATIVE SYSTEM VIEW", 25, 445);
    } else {
      const lines = ["~/budai $ npm run dev", "", "> next dev", "", "✓ TypeScript initialized", "✓ Local environment ready", "", "// Built with intention.", "// Shipped in public.", "", "stilledev@budai ~ % ▌"];
      lines.forEach((text, i) => { ctx.font = "15px monospace"; ctx.fillStyle = i === 4 || i === 5 ? "#86c6b7" : i > 6 ? "#5c8096" : "#a8c6d6"; ctx.fillText(text, 25, 90 + i * 28); });
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  };

  // The central display's contents are a REAL DOM editor rendered by CSS3DRenderer.
  const central = makeMonitor(0, 2.05, -.85, 6.5, 3.64, 0);
  makeMonitor(-5.15, 1.85, -1.05, 3.4, 2.8, .36, dashboard("system"));
  makeMonitor(5.15, 1.85, -1.05, 3.4, 2.8, -.36, dashboard("terminal"));

  // Instancing: 78 keyboard keys cost one draw call.
  box(3.2, .11, 1.04, rubber, -.25, -.36, 1.4, true);
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(.18, .055, .15), alloy, 78);
  const transform = new THREE.Object3D();
  for (let i = 0; i < 78; i++) {
    transform.position.set(-1.67 + (i % 13) * .235, -.275, .96 + Math.floor(i / 13) * .145);
    transform.updateMatrix(); keys.setMatrixAt(i, transform.matrix);
  }
  room.add(keys);
  box(.75, .08, .93, graphite, 2.2, -.37, 1.45, true);
  box(.02, .01, .25, light, 2.2, -.325, 1.5);
  const puck = new THREE.Mesh(new THREE.CylinderGeometry(.42, .48, .12, 32), alloy); puck.position.set(-3.4, -.35, 1.4); room.add(puck);
  const puckRing = new THREE.Mesh(new THREE.TorusGeometry(.37, .014, 5, 48), light); puckRing.rotation.x = Math.PI / 2; puckRing.position.set(-3.4, -.28, 1.4); room.add(puckRing);

  // Original small workstation tower, perforations and two quiet cooling rings.
  box(1.3, 2.35, 2.0, graphite, 5.8, .7, .7, true);
  box(.035, 2.18, 1.8, new THREE.MeshStandardMaterial({ color: "#234458", metalness: .6, roughness: .18, transparent: true, opacity: .7 }), 5.13, .7, .7);
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.35, .028, 6, 40), i ? lavender : light); ring.position.set(5.8, .2 + i, 1.72); room.add(ring);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .06, 12), graphite); hub.rotation.x = Math.PI / 2; hub.position.copy(ring.position); room.add(hub);
  }
  // Cables have volume, rather than painted lines.
  for (const x of [-5, 0, 5]) {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, -.1, -1.1), new THREE.Vector3(x + .4, -.8, -2), new THREE.Vector3(3, -1.1, -2.3), new THREE.Vector3(6, -.2, -.3)]);
    room.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 18, .025, 4, false), rubber));
  }
  // A low foreground chair gives parallax and an immediately human sense of scale.
  const chair = new THREE.Group(); chair.position.set(-4.2, -1.1, 4); chair.rotation.y = -.32;
  const seat = new THREE.Mesh(new RoundedBoxGeometry(1.85, .18, 1.6, 2, .08), rubber); chair.add(seat);
  const back = new THREE.Mesh(new RoundedBoxGeometry(1.8, 2.1, .15, 2, .07), graphite); back.position.set(0, 1, .75); back.rotation.x = -.12; chair.add(back);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, .8, 8), alloy); post.position.y = -.5; chair.add(post);
  room.add(chair);

  const cyanLamp = new THREE.PointLight("#71c9e7", 32, 18, 2); cyanLamp.position.set(-4, 3, 2); room.add(cyanLamp);
  const fillLamp = new THREE.PointLight("#9fabe9", 24, 17, 2); fillLamp.position.set(5, 4, 1); room.add(fillLamp);
  const deskLamp = new THREE.PointLight("#a6e6ec", 12, 8, 2); deskLamp.position.set(0, .3, 2.5); room.add(deskLamp);
  return { group: room, screenPosition: central.position.clone().add(new THREE.Vector3(0, 0, .112)), screenScale: 6.5 / editorWidth, lamps: [cyanLamp, fillLamp, deskLamp] };
}
