import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp, lerp, smooth } from "./timeline";

/** Original laminar architecture: six functional cartridges, one physical backplane.
 * No downloaded assets, floating UI cards, sphere or decorative cable network.
 */
export function createCapabilityEngine(parent: THREE.Group) {
  const root = new THREE.Group(); root.position.y = 1.4; parent.add(root);
  const assembly = new THREE.Group(); assembly.rotation.set(.07, -.5, -.035); root.add(assembly);
  const alloy = new THREE.MeshStandardMaterial({ color: "#283b48", roughness: .3, metalness: .8 });
  const black = new THREE.MeshStandardMaterial({ color: "#0b1721", roughness: .38, metalness: .65 });
  const silver = new THREE.MeshStandardMaterial({ color: "#9db6bd", roughness: .23, metalness: .85 });
  const signal = new THREE.MeshBasicMaterial({ color: "#99d8df" });
  const amber = new THREE.MeshBasicMaterial({ color: "#e4c598" });
  const box = (group: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, round = false) => {
    const mesh = new THREE.Mesh(round ? new RoundedBoxGeometry(w, h, d, 2, .045) : new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); group.add(mesh); return mesh;
  };
  // Fixed, dimensional chassis: backplane, two precision uprights and a foot.
  box(assembly, 2.85, 5.8, .23, 0, 0, -.83, black, true);
  for (const x of [-1.53, 1.53]) {
    box(assembly, .12, 5.95, .28, x, 0, -.65, silver, true);
    box(assembly, .018, 5.3, .025, x, 0, -.47, signal);
  }
  box(assembly, 3.5, .22, 2.35, 0, -3.1, .12, alloy, true);
  box(assembly, .07, 5.5, .08, 0, 0, -.62, amber);
  const layers: THREE.Group[] = [];
  const materials: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 6; i++) {
    const layer = new THREE.Group(); layers.push(layer); assembly.add(layer);
    const material = new THREE.MeshStandardMaterial({ color: "#304b5a", metalness: .72, roughness: .29, emissive: "#8ac9d5", emissiveIntensity: .025 }); materials.push(material);
    box(layer, 2.65, .55, 1.65, 0, 0, .18, material, true);
    box(layer, 2.37, .36, .04, 0, 0, 1.025, black, true);
    box(layer, .025, .22, .012, -1.04, 0, 1.055, signal);
    // Each module has a different physical function, not an arbitrary glow color.
    if (i === 0) { // writing: parallel sheets through a precision slot
      for (let j = 0; j < 4; j++) box(layer, .94 - j * .13, .022, .035, -.3 + j * .065, .12 - j * .075, 1.06, silver);
    } else if (i === 1) { // automation: a repeating stepped transport
      for (let j = 0; j < 4; j++) { box(layer, .3, .12, .08, -.61 + j * .4, j % 2 ? -.04 : .04, 1.08, j % 2 ? amber : silver, true); }
    } else if (i === 2) { // decision support: a weighted three-way fork
      for (let j = 0; j < 3; j++) { const prism = new THREE.Mesh(new THREE.ConeGeometry(.12, .21, 3), j === 1 ? amber : silver); prism.rotation.z = -Math.PI / 2; prism.position.set(-.53 + j * .5, 0, 1.09); layer.add(prism); }
    } else if (i === 3) { // two languages: paired bridges, one continuous output
      box(layer, .55, .16, .09, -.42, .045, 1.08, silver, true); box(layer, .55, .16, .09, .42, -.045, 1.08, amber, true); box(layer, .35, .02, .03, 0, 0, 1.1, signal);
    } else if (i === 4) { // memory: ordered, retained layers
      for (let j = 0; j < 5; j++) box(layer, .17, .22 - (j % 2) * .06, .04, -.52 + j * .26, 0, 1.07, j === 3 ? amber : silver, true);
    } else { // vision aperture and a literal audio waveform
      const aperture = new THREE.Mesh(new THREE.TorusGeometry(.115, .025, 6, 24), silver); aperture.position.set(-.47, 0, 1.09); layer.add(aperture);
      for (let j = 0; j < 7; j++) box(layer, .025, .04 + .18 * Math.sin(j / 6 * Math.PI), .04, -.06 + j * .1, 0, 1.08, signal);
    }
    for (let pin = 0; pin < 5; pin++) box(layer, .07, .025, .25, -.72 + pin * .36, -.285, -.33, silver);
  }
  const access = new THREE.Group(); root.add(access);
  for (let i = 0; i < 3; i++) {
    const gate = new THREE.Group(); gate.position.set((i - 1) * 3.5, -.25, i === 1 ? -.4 : 0); access.add(gate);
    box(gate, 2.7, .18, 2.5, 0, -1.45, 0, alloy, true);
    for (let depth = 0; depth <= i; depth++) {
      const z = .7 - depth * .6;
      for (const x of [-1.05, 1.05]) box(gate, .13, 2.6, .13, x, -.08, z, silver, true);
      box(gate, 2.2, .13, .13, 0, 1.2, z, silver, true);
    }
    // Every access level contains the SAME six capabilities. Only access expands.
    for (let j = 0; j < 6; j++) box(gate, .75, .06, .08, 0, -.35 + j * .14, .71, i === 0 ? signal : silver);
    box(gate, .1, .1, .1, -.82, 1.2, .8, i === 0 ? signal : amber, true);
  }
  return {
    root,
    update(progress: number, focus: number, morph: number) {
      const m = smooth(morph);
      assembly.visible = m < .999;
      assembly.scale.setScalar(lerp(1, .025, m));
      assembly.position.y = lerp(0, -.8, m);
      access.visible = m > .001;
      access.scale.setScalar(lerp(.025, 1, m));
      access.rotation.y = lerp(-.3, -.08, m);
      layers.forEach((layer, i) => {
        const active = focus === i;
        layer.position.set(active ? -.16 : 0, (2.5 - i) * (.82 + .055 * smooth(progress)), active ? .65 : .12 + .12 * smooth(clamp(progress * 6 - i)));
        materials[i].emissiveIntensity = active ? .28 : .025;
      });
      return m;
    },
  };
}
