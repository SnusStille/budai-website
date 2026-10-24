import * as THREE from "three";
import type { FlyoverConfig, SceneConfig } from "scroll-flyover";
import type { Lang } from "@/lib/i18n";

const cyan = "#00e5ff";
const violet = "#8b70ff";
const ice = "#b8f8ff";
const blue = "#3677ff";

function metal(color: string, emissive = color, intensity = 0.35, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: intensity,
    roughness: 0.28,
    metalness: 0.48,
    transparent: opacity < 1,
    opacity,
    side: THREE.DoubleSide,
  });
}

function addMesh<T extends THREE.BufferGeometry>(
  group: THREE.Group,
  geometry: T,
  material: THREE.Material,
  position: THREE.Vector3Tuple = [0, 0, 0],
  rotation: THREE.EulerTuple = [0, 0, 0],
  shadows = true,
) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = shadows;
  mesh.receiveShadow = shadows;
  group.add(mesh);
  return mesh;
}

function tube(
  group: THREE.Group,
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material,
  segments = 48,
) {
  const curve = new THREE.CatmullRomCurve3(points);
  return addMesh(group, new THREE.TubeGeometry(curve, segments, radius, 6, false), material, [0, 0, 0], [0, 0, 0], false);
}

function torus(
  group: THREE.Group,
  radius: number,
  thickness: number,
  position: THREE.Vector3Tuple,
  rotation: THREE.EulerTuple,
  color: string,
  opacity = 1,
) {
  return addMesh(
    group,
    new THREE.TorusGeometry(radius, thickness, 10, 88),
    metal(color, color, 0.72, opacity),
    position,
    rotation,
    false,
  );
}

function axialPassage(
  group: THREE.Group,
  options: { startZ?: number; spacing?: number; count?: number; radius?: number; accent?: string; second?: string } = {},
) {
  const { startZ = 8, spacing = 4.6, count = 7, radius = 5.6, accent = cyan, second = violet } = options;
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < count; i += 1) {
    const z = startZ - i * spacing;
    const r = radius + Math.sin(i * 0.85) * 0.24;
    rings.push(torus(
      group,
      r,
      i % 3 === 0 ? 0.05 : 0.025,
      [Math.sin(i * 0.5) * 0.2, Math.cos(i * 0.72) * 0.18, z],
      [Math.sin(i * 0.42) * 0.07, Math.cos(i * 0.61) * 0.06, i * 0.11],
      i % 2 ? accent : second,
      i % 2 ? 0.5 : 0.82,
    ));
  }
  for (let rail = 0; rail < 8; rail += 1) {
    const angle = rail / 8 * Math.PI * 2;
    const points = Array.from({ length: count + 1 }, (_, i) => {
      const z = startZ + 1.5 - i * spacing;
      const r = radius + Math.sin(i * 0.72) * 0.22;
      return new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, z);
    });
    tube(group, points, 0.018, metal(rail % 3 === 0 ? second : accent, rail % 3 === 0 ? second : accent, 0.3), 64);
  }
  return rings;
}

function connect(group: THREE.Group, a: THREE.Vector3, b: THREE.Vector3, color = cyan, radius = 0.045) {
  const delta = b.clone().sub(a);
  const geometry = new THREE.CylinderGeometry(radius * 0.7, radius, delta.length(), 8, 1);
  const connector = addMesh(group, geometry, metal(color, color, 0.6), [0, 0, 0], [0, 0, 0], false);
  connector.position.copy(a).addScaledVector(delta, 0.5);
  connector.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return connector;
}

function addNode(group: THREE.Group, position: THREE.Vector3, radius: number, color: string, detail = 1) {
  const node = addMesh(
    group,
    new THREE.IcosahedronGeometry(radius, detail),
    metal(color, color, 0.9),
    [position.x, position.y, position.z],
    [0, 0, 0],
    true,
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.22, 12, 10),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.075, side: THREE.BackSide }),
  );
  halo.position.copy(position);
  group.add(halo);
  return node;
}

function signalScene(): THREE.Group {
  const group = new THREE.Group();
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i += 1) {
    const z = 10 - i * 3.25;
    const radius = 4.1 + Math.sin(i * 0.72) * 0.48;
    rings.push(torus(
      group,
      radius,
      i % 2 === 0 ? 0.052 : 0.028,
      [Math.sin(i * 0.77) * 0.34, Math.cos(i * 0.69) * 0.24, z],
      [Math.sin(i) * 0.11, Math.cos(i * 0.55) * 0.12, i * 0.22],
      i % 3 === 0 ? violet : cyan,
      i % 2 === 0 ? 0.92 : 0.55,
    ));
  }

  // Longitudinal rails make the portals read as a traversable 3D channel.
  for (let rail = 0; rail < 8; rail += 1) {
    const angle = (rail / 8) * Math.PI * 2;
    const points = Array.from({ length: 9 }, (_, step) => {
      const z = 11 - step * 2.75;
      const sway = Math.sin(step * 0.48 + rail) * 0.2;
      const r = 4.08 + Math.sin(step * 0.71) * 0.34;
      return new THREE.Vector3(Math.cos(angle) * r + sway, Math.sin(angle) * r, z);
    });
    tube(group, points, 0.022, metal(rail % 2 ? blue : cyan, rail % 2 ? blue : cyan, 0.36), 64);
  }

  const core = addMesh(group, new THREE.IcosahedronGeometry(1.45, 2), metal(ice, cyan, 1.35), [0, 0, -0.2]);
  addMesh(group, new THREE.IcosahedronGeometry(1.72, 1), new THREE.MeshBasicMaterial({ color: violet, wireframe: true, transparent: true, opacity: 0.7 }), [0, 0, -0.2], [0.2, 0.3, 0]);
  addMesh(group, new THREE.SphereGeometry(0.24, 24, 18), new THREE.MeshBasicMaterial({ color: "#ffffff" }), [0, 0, -0.2], [0, 0, 0], false);

  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2;
    const z = -5.5 + (i % 4) * 3.1;
    addNode(group, new THREE.Vector3(Math.cos(a) * 3.2, Math.sin(a) * 3.2, z), 0.12 + (i % 3) * 0.035, i % 3 ? cyan : violet, 0);
  }
  group.userData.tick = (time: number) => {
    core.rotation.y = time * 0.17;
    core.rotation.x = time * 0.11;
    rings.forEach((ring, index) => { ring.rotation.z += Math.sin(time * 0.35 + index) * 0.0007; });
  };
  return group;
}

function contextScene(): THREE.Group {
  const group = new THREE.Group();
  axialPassage(group, { startZ: 8, spacing: 5.5, count: 5, radius: 5.45, accent: blue, second: violet });
  const core = addNode(group, new THREE.Vector3(0, 0, 0), 1.22, ice, 1);
  const nodes = [
    new THREE.Vector3(-3.6, 1.8, 1.4),
    new THREE.Vector3(3.6, 1.4, -1.3),
    new THREE.Vector3(0.15, -3.4, 1.2),
    new THREE.Vector3(-0.2, 3.6, -2.4),
    new THREE.Vector3(-3.4, -1.8, -2.2),
    new THREE.Vector3(3.2, -2, 2.1),
  ];
  const colors = [cyan, violet, blue, ice, violet, cyan];
  nodes.forEach((position, index) => {
    addNode(group, position, 0.42 + (index % 2) * 0.12, colors[index], 1);
    connect(group, position, nodes[(index + 1) % nodes.length], index % 2 ? violet : cyan, 0.035);
    connect(group, position, new THREE.Vector3(0, 0, 0), colors[index], 0.027);
    torus(group, 0.72 + (index % 3) * 0.12, 0.025, [position.x, position.y, position.z], [Math.PI / 2, index * 0.62, 0.4], colors[index], 0.72);
  });
  torus(group, 4.15, 0.035, [0, 0, 0], [0.45, 0.2, 0.7], blue, 0.64);
  torus(group, 4.65, 0.022, [0, 0, 0], [1.1, -0.5, 0.2], violet, 0.52);
  group.userData.tick = (time: number) => {
    core.rotation.y = time * 0.23;
    core.rotation.z = time * 0.12;
    group.rotation.y = Math.sin(time * 0.18) * 0.06;
  };
  return group;
}

function reasoningScene(): THREE.Group {
  const group = new THREE.Group();
  const lattice = new THREE.Group();
  group.add(lattice);
  const shell = addMesh(
    lattice,
    new THREE.OctahedronGeometry(3.25, 2),
    new THREE.MeshStandardMaterial({ color: "#203a68", emissive: blue, emissiveIntensity: 0.4, wireframe: true, transparent: true, opacity: 0.38 }),
    [0, 0, 0],
    [0.22, 0.35, 0.1],
    false,
  );
  const core = addMesh(lattice, new THREE.DodecahedronGeometry(1.38, 1), metal("#4d368e", violet, 0.85), [0, 0, 0]);
  addMesh(lattice, new THREE.IcosahedronGeometry(1.62, 0), new THREE.MeshBasicMaterial({ color: ice, wireframe: true, transparent: true, opacity: 0.82 }), [0, 0, 0], [0, 0, 0], false);
  torus(group, 4.7, 0.045, [0, 0, 0], [1.12, 0.22, 0.28], cyan, 0.58);
  torus(group, 4.1, 0.032, [0, 0, 0], [0.42, 1.14, 0.85], violet, 0.68);
  torus(group, 3.7, 0.026, [0, 0, 0], [0.2, 0.6, 1.42], blue, 0.52);

  const anchors = Array.from({ length: 9 }, (_, i) => {
    const theta = (i / 9) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(theta) * 5.15, Math.sin(theta * 2) * 1.35, Math.sin(theta) * 5.15);
  });
  anchors.forEach((point, index) => {
    addNode(group, point, 0.19 + (index % 3) * 0.035, index % 3 === 0 ? violet : cyan, 0);
    connect(group, point, anchors[(index + 1) % anchors.length], violet, 0.018);
  });
  for (let i = 0; i < anchors.length; i += 1) {
    connect(group, anchors[i], anchors[(i + 3) % anchors.length], i % 2 ? blue : cyan, 0.018);
    connect(group, anchors[i], new THREE.Vector3(0, 0, 0), violet, 0.014);
  }
  group.userData.tick = (time: number) => {
    lattice.rotation.y = time * 0.19;
    lattice.rotation.x = Math.sin(time * 0.12) * 0.07;
    shell.rotation.y = -time * 0.12;
    core.rotation.y = time * 0.16;
  };
  return group;
}

function routingScene(): THREE.Group {
  const group = new THREE.Group();
  axialPassage(group, { startZ: 9, spacing: 4.5, count: 7, radius: 5.7, accent: cyan, second: blue });
  const routeColors = [cyan, violet, blue];
  const routeStarts = [
    new THREE.Vector3(-4.4, 1.8, 5.4),
    new THREE.Vector3(4.3, 1.5, 5.2),
    new THREE.Vector3(0, -3.8, 5.4),
  ];
  routeStarts.forEach((start, route) => {
    const end = new THREE.Vector3(start.x * 0.28, start.y * 0.2, -7.5);
    const middleA = start.clone().lerp(end, 0.34);
    middleA.x += route === 0 ? -0.85 : route === 1 ? 0.9 : 0.2;
    const middleB = start.clone().lerp(end, 0.72);
    middleB.y += route === 2 ? -0.8 : 0.85;
    const routePath = [start, middleA, middleB, end];
    tube(group, routePath, 0.055, metal(routeColors[route], routeColors[route], 0.78), 54);
    addNode(group, start, 0.7, routeColors[route], 1);
    addNode(group, middleA, 0.28, ice, 0);
    addNode(group, middleB, 0.34, routeColors[route], 0);
    addNode(group, end, 0.62, routeColors[route], 1);

    for (let gate = 0; gate < 3; gate += 1) {
      const at = routePath[Math.min(gate + 1, routePath.length - 1)];
      torus(group, 0.82 - gate * 0.08, 0.026, [at.x, at.y, at.z], [0.5 + route * 0.38, 0.25 * gate, 0.4], routeColors[route], 0.72);
    }
  });
  const hub = addMesh(group, new THREE.IcosahedronGeometry(1.36, 2), metal(ice, cyan, 1.2), [0, 0, 0]);
  torus(group, 2.1, 0.055, [0, 0, 0], [Math.PI / 2, 0, 0], cyan, 0.86);
  torus(group, 2.45, 0.035, [0, 0, 0], [0.8, 0.6, 0.25], violet, 0.7);
  group.userData.tick = (time: number) => {
    hub.rotation.y = time * 0.22;
    hub.rotation.x = Math.sin(time * 0.4) * 0.1;
    group.rotation.z = Math.sin(time * 0.16) * 0.035;
  };
  return group;
}

function responseScene(): THREE.Group {
  const group = new THREE.Group();
  // Carry the last passage past the camera's final keyframe so the route resolves
  // into a destination rather than ending in an empty frame.
  axialPassage(group, { startZ: 8, spacing: 4.1, count: 9, radius: 5.65, accent: cyan, second: violet });

  // The response core sits ahead of the final camera dwell: it is the visual answer
  // to the signals and routes encountered earlier, not just another decorative hub.
  const delivery = new THREE.Group();
  delivery.position.z = -8;
  group.add(delivery);

  const base = addMesh(delivery, new THREE.CylinderGeometry(3.8, 4.2, 0.26, 64, 1, true), metal("#122540", blue, 0.26, 0.78), [0, -3.3, 0]);
  base.rotation.x = 0.03;
  torus(delivery, 3.95, 0.055, [0, -3.12, 0], [0, 0, 0], cyan, 0.78);
  const core = addMesh(delivery, new THREE.IcosahedronGeometry(1.8, 2), metal(ice, cyan, 1.45), [0, 0, 0]);
  addMesh(delivery, new THREE.SphereGeometry(0.48, 32, 24), new THREE.MeshBasicMaterial({ color: "#ffffff" }), [0, 0, 0], [0, 0, 0], false);
  const orbitA = torus(delivery, 3.15, 0.05, [0, 0, 0], [Math.PI / 2, 0.18, 0.16], cyan, 0.9);
  const orbitB = torus(delivery, 3.75, 0.035, [0, 0, 0], [0.64, 0.6, 0.28], violet, 0.76);
  const orbitC = torus(delivery, 4.25, 0.025, [0, 0, 0], [1.12, 0.2, 0.85], blue, 0.58);
  const modules = [
    new THREE.Vector3(-2.55, 1.7, 0.2),
    new THREE.Vector3(2.45, -1.8, 0.4),
    new THREE.Vector3(0.3, 2.8, -0.6),
  ];
  modules.forEach((position, index) => {
    addNode(delivery, position, 0.48, index === 1 ? violet : cyan, 1);
    connect(delivery, position, new THREE.Vector3(0, 0, 0), index === 1 ? violet : cyan, 0.038);
  });
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2;
    const position = new THREE.Vector3(Math.cos(angle) * 4.7, Math.sin(angle) * 4.7, Math.sin(angle * 2) * 0.5);
    addMesh(delivery, new THREE.OctahedronGeometry(0.095 + (i % 3) * 0.025, 0), metal(i % 4 ? cyan : violet, i % 4 ? cyan : violet, 0.8), [position.x, position.y, position.z], [angle, angle * 0.6, 0], false);
  }
  delivery.userData.tick = (time: number) => {
    core.rotation.y = time * 0.18;
    core.rotation.z = Math.sin(time * 0.2) * 0.04;
    orbitA.rotation.z = time * 0.06;
    orbitB.rotation.x = 0.6 + Math.sin(time * 0.16) * 0.03;
    orbitC.rotation.y = 0.2 + time * 0.045;
  };
  return group;
}

export function createStatusScenes(lang: Lang): SceneConfig[] {
  const sv = lang === "sv";
  return [
    {
      eyebrow: sv ? "01 · Signal" : "01 · Signal",
      title: sv ? "En fråga blir en signal" : "A question becomes a signal",
      body: sv
        ? "Din prompt går in i BudAI:s arbetsyta. Här börjar resan — i en lugn, överblickbar tråd."
        : "Your prompt enters BudAI's workspace. The journey starts here: one calm, continuous thread.",
      tags: sv ? ["Text", "Röst", "Bilagor"] : ["Text", "Voice", "Attachments"],
      build: signalScene,
    },
    {
      eyebrow: sv ? "02 · Kontext" : "02 · Context",
      title: sv ? "Samlar det som spelar roll" : "Context comes into focus",
      body: sv
        ? "Språk, instruktioner och det du redan delat hjälper till att forma svaret. Sparat minne används bara när du har aktiverat det."
        : "Language, instructions and what you've shared shape the response. Saved memory is used only when you have enabled it.",
      tags: sv ? ["Svenska + engelska", "Instruktioner", "Minneskontroll"] : ["Swedish + English", "Instructions", "Memory controls"],
      build: contextScene,
    },
    {
      eyebrow: sv ? "03 · Resonemang" : "03 · Reasoning",
      title: sv ? "Arbetet får struktur" : "The work finds its structure",
      body: sv
        ? "BudAI formar en användbar riktning — ett utkast, en analys, en plan eller nästa fråga. Externa modellleverantörer kontrolleras inte av den här statussidan."
        : "BudAI shapes a useful direction — a draft, analysis, plan or next question. This status page does not probe external model providers.",
      tags: sv ? ["Utkast", "Analys", "Planering"] : ["Drafting", "Analysis", "Planning"],
      build: reasoningScene,
    },
    {
      eyebrow: sv ? "04 · Verktyg" : "04 · Tools",
      title: sv ? "Rätt väg, utan omvägar" : "A route through the right tools",
      body: sv
        ? "Text, bildfunktioner och röst beror på konfigurationen och din webbläsare. Statusen nedan skiljer mellan nåbar webbserver och aktiverade funktioner."
        : "Text, image features and voice depend on configuration and your browser. The checks below distinguish a reachable web app from enabled features.",
      tags: sv ? ["Konfiguration", "Webbläsare", "Integreringar"] : ["Configuration", "Browser", "Integrations"],
      build: routingScene,
    },
    {
      eyebrow: sv ? "05 · Leverans" : "05 · Delivery",
      title: sv ? "Ett svar att arbeta vidare med" : "An answer you can work with",
      body: sv
        ? "Resan landar i din tråd. Scrolla vidare för faktiska kontroller av BudAI:s webbserver och serverkonfigurerade funktioner — inte en gissning om leverantörernas drifttid."
        : "The journey lands in your thread. Continue below for real checks of BudAI's web route and configured features — not a guess at provider uptime.",
      tags: sv ? ["Användbart", "Redigerbart", "Ditt nästa steg"] : ["Useful", "Editable", "Your next step"],
      cta: sv ? "Kontrollera igen" : "Refresh live checks",
      onCta: () => window.dispatchEvent(new Event("budai:status-refresh")),
      build: responseScene,
    },
  ];
}

export function createStatusFlyoverConfig(lang: Lang, quality: "light" | "rich" = "light"): FlyoverConfig {
  const sv = lang === "sv";
  return {
    palette: {
      colors: ["#03050a", "#08111d", "#121b2a", "#201937", "#080c14"],
      accent: cyan,
    },
    shapeLanguage: "precision",
    cameraFeel: "swoop",
    // Reserve 2048px shadow maps for known high-memory, fine-pointer desktops.
    // Coarse-pointer and narrow devices are forced to light by the engine as well.
    performance: quality,
    dwellWeight: 2.35,
    seed: 20261024,
    layout: (count) => Array.from({ length: count }, (_, index) => {
      const phase = count > 1 ? index / (count - 1) : 0;
      return new THREE.Vector3(
        Math.sin(phase * Math.PI * 1.7) * 2.4,
        Math.sin(phase * Math.PI) * 1.1,
        -index * 25,
      );
    }),
    labels: {
      goToScene: (index, total) => sv ? `Gå till del ${index} av ${total}` : `Go to scene ${index} of ${total}`,
      ctaInScene: (label, title) => sv ? `${label} — ${title}` : `${label} — ${title}`,
      sceneAnnouncement: (index, total, title) => sv
        ? `Del ${index} av ${total}: ${title}`
        : `Scene ${index} of ${total}: ${title}`,
    },
    scenes: createStatusScenes(lang),
  };
}
