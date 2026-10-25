import * as THREE from "three";
import { createPointField } from "./information-field";
import { capabilityRecords } from "./information-patterns";
import { clamp, lerp, smooth } from "./timeline";

/**
 * Cohesive 3D Capability Intelligence System:
 * - Central Intelligence Core (faceted icosahedral nucleus, gimballed signal rings, axial spine)
 * - Six meaningful architectural pathways connecting the core to the six capability lanes
 * - Travelling signal pulses + station rings + structured capability constellations
 * - Three-tier Access Architecture with shared capability constellations and tier cores
 */
export function createCapabilityEngine(parent: THREE.Group) {
  const root = new THREE.Group();
  root.position.y = 1.4;
  parent.add(root);

  const assembly = new THREE.Group();
  root.add(assembly);

  const records = capabilityRecords();
  const field = createPointField(records, 4.2);
  assembly.add(field);

  // Central Intelligence Core at (-1.32, 0, 0.16) feeding all 6 capability pathways
  const coreGroup = new THREE.Group();
  coreGroup.position.set(-1.32, 0, 0.16);
  assembly.add(coreGroup);

  const coreMat = new THREE.MeshStandardMaterial({
    color: "#112c3e",
    emissive: "#26748e",
    emissiveIntensity: 0.85,
    metalness: 0.8,
    roughness: 0.22,
    transparent: true,
    opacity: 0.92,
  });
  const coreCrystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), coreMat);
  coreGroup.add(coreCrystal);

  const coreWireMat = new THREE.LineBasicMaterial({
    color: "#92ebfa",
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.39, 1)),
    coreWireMat
  );
  coreGroup.add(coreWire);

  const coreNucleusMat = new THREE.MeshBasicMaterial({
    color: "#dafaff",
    transparent: true,
    opacity: 0.95,
  });
  const coreNucleus = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 18), coreNucleusMat);
  coreGroup.add(coreNucleus);

  const ringMatA = new THREE.MeshBasicMaterial({
    color: "#7ddbef",
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ringMatB = new THREE.MeshBasicMaterial({
    color: "#9caae8",
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.011, 10, 64), ringMatA);
  ringA.rotation.set(0.92, 0.35, 0);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.008, 10, 72), ringMatB);
  ringB.rotation.set(-0.75, 0.24, 0.4);
  coreGroup.add(ringA, ringB);

  const spineMat = new THREE.LineBasicMaterial({
    color: "#72cee3",
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const axialSpine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -2.05, 0),
      new THREE.Vector3(0, 2.05, 0),
    ]),
    spineMat
  );
  coreGroup.add(axialSpine);

  // Six meaningful pathways from the Central Intelligence Core to each capability lane
  const pathwayCurves: THREE.CatmullRomCurve3[] = [];
  const pathwayMats: THREE.LineBasicMaterial[] = [];
  const stationRings: THREE.Mesh[] = [];
  const stationMats: THREE.MeshBasicMaterial[] = [];
  const signalPulses: THREE.Mesh[] = [];
  const pulseMats: THREE.MeshBasicMaterial[] = [];

  const stationGeo = new THREE.TorusGeometry(0.13, 0.008, 8, 40);
  const pulseGeo = new THREE.SphereGeometry(0.042, 10, 10);

  for (let i = 0; i < 6; i++) {
    const y = (2.5 - i) * 0.72;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.32, y * 0.18, 0.16),
      new THREE.Vector3(-0.92, y * 0.78, 0.08),
      new THREE.Vector3(-0.42, y, 0),
      new THREE.Vector3(0.35, y, 0),
    ]);
    pathwayCurves.push(curve);

    const pMat = new THREE.LineBasicMaterial({
      color: "#7ad6ea",
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    pathwayMats.push(pMat);
    assembly.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)), pMat)
    );

    const sMat = new THREE.MeshBasicMaterial({
      color: "#8fe3f5",
      transparent: true,
      opacity: 0.54,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    stationMats.push(sMat);
    const sRing = new THREE.Mesh(stationGeo, sMat);
    sRing.position.set(-0.42, y, 0);
    stationRings.push(sRing);
    assembly.add(sRing);

    const pulseMat = new THREE.MeshBasicMaterial({
      color: "#dffaff",
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    pulseMats.push(pulseMat);
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    signalPulses.push(pulseMesh);
    assembly.add(pulseMesh);
  }

  // Three-Tier Access Architecture (01 / BASIC, 02 / CONSUMER, 03 / BUSINESS)
  const access = new THREE.Group();
  root.add(access);

  const accessBands: ReturnType<typeof createPointField>[] = [];
  const tierCores: THREE.Group[] = [];
  const tierMats: THREE.MeshBasicMaterial[] = [];

  const bridgeMat = new THREE.LineBasicMaterial({
    color: "#76d1e6",
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  access.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-3.3, 0, 0),
        new THREE.Vector3(3.3, 0, 0),
      ]),
      bridgeMat
    )
  );

  for (let i = 0; i < 3; i++) {
    const cx = (i - 1) * 3.3;
    const band = createPointField(
      records.map(p => ({
        x: cx + p.x * 0.6,
        y: p.y * 0.62,
        z: p.z - 0.2 * i,
        lane: p.lane,
      })),
      3.8
    );
    band.material.uniforms.uOpacity.value = i === 0 ? 0.88 : 0.65;
    accessBands.push(band);
    access.add(band);

    const tg = new THREE.Group();
    tg.position.set(cx, 0, 0.08);
    tierCores.push(tg);
    access.add(tg);

    const tMat = new THREE.MeshBasicMaterial({
      color: i === 1 ? "#a4f0fd" : "#80d6e9",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    tierMats.push(tMat);

    tg.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.18 + i * 0.03, 0), tMat));
    for (let r = 0; r <= i; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.42 + r * 0.18, 0.009, 10, 56),
        tMat
      );
      ring.rotation.x = 0.52 - r * 0.16;
      ring.rotation.y = (r - 0.5) * 0.24;
      tg.add(ring);
    }
  }

  return {
    root,
    update(progress: number, focus: number, morph: number, time = 0) {
      const m = smooth(morph);
      const vis = 1 - m;
      assembly.visible = m < 0.999;
      access.visible = m > 0.001;
      assembly.scale.setScalar(lerp(1, 0.84, m));
      assembly.position.z = -m * 0.6;
      assembly.rotation.y = lerp(-0.12, 0, smooth(progress));

      field.material.uniforms.uOpacity.value = vis;
      field.material.uniforms.uFocus.value = focus;

      coreMat.opacity = 0.92 * vis;
      coreWireMat.opacity = 0.82 * vis;
      coreNucleusMat.opacity = 0.95 * vis;
      ringMatA.opacity = 0.62 * vis;
      ringMatB.opacity = 0.48 * vis;
      spineMat.opacity = 0.34 * vis;

      const focusY = (2.5 - Math.max(0, focus)) * 0.72;
      coreCrystal.rotation.y = time * 0.38 + progress * 1.4;
      coreCrystal.rotation.x = time * 0.22 + focusY * 0.12;
      coreWire.rotation.y = -time * 0.28;
      coreWire.rotation.z = time * 0.16;
      ringA.rotation.z = time * 0.45 + progress * 1.5;
      ringB.rotation.y = -time * 0.36 - progress * 1.1;

      for (let i = 0; i < 6; i++) {
        const isFocused = focus === i;
        pathwayMats[i].opacity = vis * (isFocused ? 0.92 : 0.34);
        pathwayMats[i].color.set(isFocused ? "#b4f5ff" : "#74d2e7");
        stationMats[i].opacity = vis * (isFocused ? 0.92 : 0.46);
        stationRings[i].scale.setScalar(isFocused ? 1.28 : 1);
        stationRings[i].rotation.z = time * (isFocused ? 0.8 : 0.25) + i;

        const localProgress = smooth(clamp(progress * 6 - i));
        const pulseT = isFocused
          ? (0.18 + 0.74 * ((time * 0.48 + localProgress * 0.5) % 1))
          : (0.12 + 0.78 * ((time * 0.24 + i * 0.17) % 1));
        pathwayCurves[i].getPointAt(pulseT, signalPulses[i].position);
        pulseMats[i].opacity = vis * (isFocused ? 0.98 : 0.58) * Math.sin(pulseT * Math.PI);
        signalPulses[i].scale.setScalar(isFocused ? 1.35 : 0.9);
      }

      access.scale.setScalar(lerp(0.84, 1, m));
      bridgeMat.opacity = m * 0.38;
      accessBands.forEach((band, i) => {
        band.material.uniforms.uOpacity.value = (i === 0 ? 0.9 : 0.66) * m;
      });
      tierCores.forEach((tg, i) => {
        tg.rotation.y = time * 0.3 + i * 0.7;
        tierMats[i].opacity = m * (i === 1 ? 0.76 : 0.58);
      });
      return m;
    },
  };
}
