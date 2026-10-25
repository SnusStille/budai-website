import * as THREE from "three";
import { createPointField } from "./information-field";
import { capabilityRecords } from "./information-patterns";
import { clamp, lerp, smooth } from "./timeline";

/**
 * Cohesive 3D Capability Intelligence System & Three-Tier Access Architecture:
 *
 * Visual 1 (Assembly — `[data-capability-viewport]`):
 * - Multi-layered 3D Central Intelligence Core (faceted geodesic shell, translucent inner crystal,
 *   radiant nucleus, 3 counter-rotating gimbal rings, vertical axial energy column).
 * - Six 3D volumetric TubeGeometry neural pathways + travelling dual-pulse signal trains.
 * - Six purpose-built 3D capability sculptures:
 *   01 Write: Layered 3D editorial document planes with glowing typographic composition bars.
 *   02 Automate: Four interlocking 3D hexagonal workflow relay stages + stepping execution ring.
 *   03 Decide: 3D analytical decision prism with converging input vectors & selected output trajectory.
 *   04 Swedish + English: Twin 3D double-helix harmonic ribbons linked by 6 cross-translation rungs.
 *   05 Memory: Four stacked 3D crystalline memory vault strata locking retained knowledge cores.
 *   06 Vision & Voice: 3D multi-ring optical lens aperture + 7 oscillating 3D acoustic waveform pillars.
 *
 * Visual 2 (Access Architecture — `[data-access-architecture]`):
 * - Three monumental 3D Tier Stations connected by a 3D Horizontal Intelligence Conduit:
 *   01 Basic: Personal Core Station (1 orbital ring + 6 capability columns).
 *   02 Consumer: Deep-Memory Personal Station (icosahedral core + 2 counter-rotating rings + 3 memory strata).
 *   03 Business: Multi-Account Team Constellation (central team core + 3 orbital rings + 4 networked satellite account nodes).
 */
export function createCapabilityEngine(parent: THREE.Group) {
  const root = new THREE.Group();
  root.position.y = 1.4;
  parent.add(root);

  const assembly = new THREE.Group();
  root.add(assembly);

  // Subtle ambient harmonic field behind the 3D sculptures
  const records = capabilityRecords();
  const field = createPointField(records, 3.0);
  assembly.add(field);

  // ============================================================================
  // 1. CENTRAL INTELLIGENCE CORE at (-1.26, 0, 0.18)
  // ============================================================================
  const coreGroup = new THREE.Group();
  coreGroup.position.set(-1.26, 0, 0.18);
  assembly.add(coreGroup);

  const coreShellMat = new THREE.MeshStandardMaterial({
    color: "#143448",
    emissive: "#2b829e",
    emissiveIntensity: 0.95,
    metalness: 0.82,
    roughness: 0.18,
    transparent: true,
    opacity: 0.92,
  });
  const coreCrystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 1), coreShellMat);
  coreGroup.add(coreCrystal);

  const coreInnerMat = new THREE.MeshStandardMaterial({
    color: "#7ae2f5",
    emissive: "#57cbe2",
    emissiveIntensity: 1.2,
    metalness: 0.5,
    roughness: 0.15,
    transparent: true,
    opacity: 0.88,
  });
  const coreInner = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), coreInnerMat);
  coreGroup.add(coreInner);

  const coreWireMat = new THREE.LineBasicMaterial({
    color: "#a8f3ff",
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.46, 1)),
    coreWireMat
  );
  coreGroup.add(coreWire);

  const coreNucleusMat = new THREE.MeshBasicMaterial({
    color: "#ecfcff",
    transparent: true,
    opacity: 0.98,
  });
  const coreNucleus = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), coreNucleusMat);
  coreGroup.add(coreNucleus);

  const ringMatA = new THREE.MeshBasicMaterial({
    color: "#86e4f7",
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ringMatB = new THREE.MeshBasicMaterial({
    color: "#a4b2ee",
    transparent: true,
    opacity: 0.58,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ringMatC = new THREE.MeshBasicMaterial({
    color: "#67cbe0",
    transparent: true,
    opacity: 0.44,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.015, 12, 72), ringMatA);
  ringA.rotation.set(0.95, 0.32, 0);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.80, 0.011, 12, 72), ringMatB);
  ringB.rotation.set(-0.78, 0.26, 0.42);
  const ringC = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.008, 10, 72), ringMatC);
  ringC.rotation.set(0.35, -0.85, 0.2);
  coreGroup.add(ringA, ringB, ringC);

  const spineMat = new THREE.MeshBasicMaterial({
    color: "#76d4e8",
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const axialSpine = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 4.1, 10), spineMat);
  coreGroup.add(axialSpine);

  // ============================================================================
  // 2. SIX VOLUMETRIC 3D PATHWAYS & PURPOSE-BUILT CAPABILITY SCULPTURES
  // ============================================================================
  const pathwayCurves: THREE.CatmullRomCurve3[] = [];
  const pathwayMats: THREE.MeshBasicMaterial[] = [];
  const stationRings: THREE.Mesh[] = [];
  const stationMats: THREE.MeshBasicMaterial[] = [];
  const signalPulsesA: THREE.Mesh[] = [];
  const signalPulsesB: THREE.Mesh[] = [];
  const pulseMats: THREE.MeshBasicMaterial[] = [];
  const moduleGroups: THREE.Group[] = [];
  const modulePrimaryMats: THREE.MeshStandardMaterial[] = [];
  const moduleAccentMats: THREE.MeshBasicMaterial[] = [];
  const moduleWireMats: THREE.LineBasicMaterial[] = [];

  // Dynamic sub-elements for per-capability live animation
  const writeBars: THREE.Mesh[] = [];
  let automateCursor: THREE.Mesh | null = null;
  let decidePrism: THREE.Mesh | null = null;
  const memoryPlates: THREE.Mesh[] = [];
  const voiceBars: THREE.Mesh[] = [];
  let visionAperture: THREE.Mesh | null = null;

  const stationGeo = new THREE.TorusGeometry(0.16, 0.011, 10, 48);
  const pulseGeo = new THREE.SphereGeometry(0.048, 12, 12);

  for (let i = 0; i < 6; i++) {
    const y = (2.5 - i) * 0.72;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.26, y * 0.16, 0.18),
      new THREE.Vector3(-0.88, y * 0.76, 0.10),
      new THREE.Vector3(-0.38, y, 0.02),
      new THREE.Vector3(0.05, y, 0),
    ]);
    pathwayCurves.push(curve);

    const pMat = new THREE.MeshBasicMaterial({
      color: "#7ad8ec",
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    pathwayMats.push(pMat);
    const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.014, 8, false);
    assembly.add(new THREE.Mesh(tubeGeo, pMat));

    const sMat = new THREE.MeshBasicMaterial({
      color: "#96e8f9",
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    stationMats.push(sMat);
    const sRing = new THREE.Mesh(stationGeo, sMat);
    sRing.position.set(-0.38, y, 0.02);
    stationRings.push(sRing);
    assembly.add(sRing);

    const pulseMat = new THREE.MeshBasicMaterial({
      color: "#ecfcff",
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    pulseMats.push(pulseMat);
    const pA = new THREE.Mesh(pulseGeo, pulseMat);
    const pB = new THREE.Mesh(pulseGeo, pulseMat);
    signalPulsesA.push(pA);
    signalPulsesB.push(pB);
    assembly.add(pA, pB);

    // Capability 3D Module Group at (0.52, y, 0)
    const mod = new THREE.Group();
    mod.position.set(0.52, y, 0);
    moduleGroups.push(mod);
    assembly.add(mod);

    const mPrimary = new THREE.MeshStandardMaterial({
      color: "#153245",
      emissive: "#246e88",
      emissiveIntensity: 0.65,
      metalness: 0.78,
      roughness: 0.24,
      transparent: true,
      opacity: 0.9,
    });
    modulePrimaryMats.push(mPrimary);

    const mAccent = new THREE.MeshBasicMaterial({
      color: "#9ceeff",
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    moduleAccentMats.push(mAccent);

    const mWire = new THREE.LineBasicMaterial({
      color: "#8ce5f7",
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    moduleWireMats.push(mWire);

    if (i === 0) {
      // 01 WRITE: Three layered 3D editorial document planes + glowing typographic bars
      for (let sheet = 0; sheet < 3; sheet++) {
        const sheetGeo = new THREE.BoxGeometry(0.68, 0.38, 0.018);
        const mesh = new THREE.Mesh(sheetGeo, mPrimary);
        mesh.position.set((sheet - 1) * 0.14, (1 - sheet) * 0.04, -sheet * 0.07);
        mesh.rotation.y = -0.18;
        mod.add(mesh);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(sheetGeo), mWire);
        edges.position.copy(mesh.position);
        edges.rotation.copy(mesh.rotation);
        mod.add(edges);
      }
      for (let row = 0; row < 4; row++) {
        const w = 0.46 - (row === 3 ? 0.16 : row * 0.04);
        const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.026, 0.012), mAccent);
        bar.position.set(-0.14 - (0.46 - w) * 0.5, 0.11 - row * 0.062, 0.022);
        bar.rotation.y = -0.18;
        writeBars.push(bar);
        mod.add(bar);
      }
    } else if (i === 1) {
      // 02 AUTOMATE: 4 interlocking 3D hexagonal workflow relay stages + execution ring
      const stagePositions: THREE.Vector3[] = [];
      for (let k = 0; k < 4; k++) {
        const sx = -0.42 + k * 0.29;
        const sy = (1.5 - k) * 0.055;
        const hexGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.045, 6);
        const hex = new THREE.Mesh(hexGeo, mPrimary);
        hex.rotation.x = Math.PI / 2;
        hex.position.set(sx, sy, 0);
        mod.add(hex);
        const hexEdge = new THREE.LineSegments(new THREE.EdgesGeometry(hexGeo), mWire);
        hexEdge.rotation.x = Math.PI / 2;
        hexEdge.position.set(sx, sy, 0);
        mod.add(hexEdge);
        stagePositions.push(new THREE.Vector3(sx, sy, 0.03));
      }
      const pipeCurve = new THREE.CatmullRomCurve3(stagePositions);
      mod.add(new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 24, 0.012, 8, false), mAccent));
      automateCursor = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.014, 10, 36), mAccent);
      automateCursor.position.copy(stagePositions[0]);
      mod.add(automateCursor);
    } else if (i === 2) {
      // 03 DECIDE: 3D analytical decision prism + 3 branching evaluation trajectories + target halo
      const prismGeo = new THREE.OctahedronGeometry(0.17, 0);
      decidePrism = new THREE.Mesh(prismGeo, mPrimary);
      decidePrism.position.set(-0.22, 0, 0.02);
      mod.add(decidePrism);
      const prismWire = new THREE.LineSegments(new THREE.EdgesGeometry(prismGeo), mWire);
      prismWire.position.copy(decidePrism.position);
      mod.add(prismWire);
      [-0.18, 0, 0.18].forEach((by, bIdx) => {
        const branchCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.22, 0, 0.02),
          new THREE.Vector3(0.12, by * 0.65, 0),
          new THREE.Vector3(0.48, by, 0),
        ]);
        mod.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(branchCurve, 20, bIdx === 1 ? 0.016 : 0.009, 8, false),
            bIdx === 1 ? mAccent : mPrimary
          )
        );
        const endNode = new THREE.Mesh(
          new THREE.SphereGeometry(bIdx === 1 ? 0.055 : 0.035, 12, 12),
          bIdx === 1 ? mAccent : mPrimary
        );
        endNode.position.set(0.48, by, 0);
        mod.add(endNode);
      });
      const targetHalo = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 10, 36), mAccent);
      targetHalo.position.set(0.48, 0, 0);
      mod.add(targetHalo);
    } else if (i === 3) {
      // 04 SWEDISH + ENGLISH: Twin 3D double-helix harmonic ribbons + 6 cross-translation bridge rungs
      const ptsA: THREE.Vector3[] = [];
      const ptsB: THREE.Vector3[] = [];
      for (let k = 0; k <= 24; k++) {
        const t = k / 24;
        const x = -0.45 + t * 0.96;
        const ang = t * Math.PI * 2.2;
        ptsA.push(new THREE.Vector3(x, Math.sin(ang) * 0.14, Math.cos(ang) * 0.08));
        ptsB.push(new THREE.Vector3(x, -Math.sin(ang) * 0.14, -Math.cos(ang) * 0.08));
      }
      mod.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ptsA), 32, 0.015, 8, false), mAccent));
      mod.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ptsB), 32, 0.015, 8, false), mPrimary));
      for (let r = 0; r < 6; r++) {
        const t = (r + 0.5) / 6;
        const x = -0.45 + t * 0.96;
        const ang = t * Math.PI * 2.2;
        const rungCurve = new THREE.LineCurve3(
          new THREE.Vector3(x, Math.sin(ang) * 0.14, Math.cos(ang) * 0.08),
          new THREE.Vector3(x, -Math.sin(ang) * 0.14, -Math.cos(ang) * 0.08)
        );
        mod.add(new THREE.Mesh(new THREE.TubeGeometry(rungCurve, 6, 0.008, 6, false), mAccent));
      }
    } else if (i === 4) {
      // 05 MEMORY: 4 stacked 3D crystalline memory vault strata + retained knowledge cores
      for (let layer = 0; layer < 4; layer++) {
        const ly = -0.15 + layer * 0.10;
        const plateGeo = new THREE.BoxGeometry(0.72, 0.028, 0.34);
        const plate = new THREE.Mesh(plateGeo, mPrimary);
        plate.position.set(0, ly, 0);
        plate.rotation.y = -0.22;
        plate.rotation.x = 0.12;
        memoryPlates.push(plate);
        mod.add(plate);
        const plateEdges = new THREE.LineSegments(new THREE.EdgesGeometry(plateGeo), mWire);
        plateEdges.position.copy(plate.position);
        plateEdges.rotation.copy(plate.rotation);
        mod.add(plateEdges);
        const memNode = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), mAccent);
        memNode.position.set(-0.18 + layer * 0.12, ly + 0.028, 0.04);
        mod.add(memNode);
      }
    } else if (i === 5) {
      // 06 VISION & VOICE: 3D multi-ring optical lens aperture + 7 oscillating 3D acoustic waveform pillars
      visionAperture = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.016, 12, 48), mAccent);
      visionAperture.position.set(-0.24, 0, 0.02);
      mod.add(visionAperture);
      const innerLens = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.010, 10, 36), mPrimary);
      innerLens.position.set(-0.24, 0, 0.02);
      mod.add(innerLens);
      const sensorCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), mAccent);
      sensorCore.position.set(-0.24, 0, 0.02);
      mod.add(sensorCore);
      for (let b = 0; b < 7; b++) {
        const bh = 0.10 + Math.sin((b / 6) * Math.PI) * 0.22;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.036, bh, 0.036), b % 2 === 0 ? mAccent : mPrimary);
        bar.position.set(0.06 + b * 0.078, 0, 0);
        voiceBars.push(bar);
        mod.add(bar);
      }
    }
  }

  // ============================================================================
  // 3. THREE-TIER ACCESS ARCHITECTURE (`[data-access-architecture]`)
  // ============================================================================
  const access = new THREE.Group();
  root.add(access);

  const accessBands: ReturnType<typeof createPointField>[] = [];
  const tierStations: THREE.Group[] = [];
  const tierPrimaryMats: THREE.MeshStandardMaterial[] = [];
  const tierAccentMats: THREE.MeshBasicMaterial[] = [];
  const tierWireMats: THREE.LineBasicMaterial[] = [];
  const tierOrbitalRings: THREE.Mesh[][] = [];
  const tierSatellites: THREE.Group[] = [];

  // 3D Horizontal Intelligence Conduit connecting Basic (-3.3) -> Consumer (0) -> Business (+3.3)
  const conduitCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.3, 0, -0.05),
    new THREE.Vector3(-1.65, 0.14, 0.05),
    new THREE.Vector3(0, 0, 0.08),
    new THREE.Vector3(1.65, 0.14, 0.05),
    new THREE.Vector3(3.3, 0, -0.05),
  ]);
  const bridgeMat = new THREE.MeshBasicMaterial({
    color: "#7ee0f4",
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  access.add(new THREE.Mesh(new THREE.TubeGeometry(conduitCurve, 48, 0.016, 8, false), bridgeMat));

  const conduitPulses: THREE.Mesh[] = [];
  for (let p = 0; p < 3; p++) {
    const cp = new THREE.Mesh(pulseGeo, bridgeMat);
    conduitPulses.push(cp);
    access.add(cp);
  }

  for (let i = 0; i < 3; i++) {
    const cx = (i - 1) * 3.3;
    // Ambient background capability constellation per tier
    const band = createPointField(
      records.map(p => ({
        x: cx + p.x * 0.55,
        y: p.y * 0.58,
        z: p.z - 0.35,
        lane: p.lane,
      })),
      2.6
    );
    band.material.uniforms.uOpacity.value = 0;
    accessBands.push(band);
    access.add(band);

    const station = new THREE.Group();
    station.position.set(cx, 0, 0.12);
    tierStations.push(station);
    access.add(station);

    const tPrimary = new THREE.MeshStandardMaterial({
      color: i === 0 ? "#16384c" : i === 1 ? "#1b3f58" : "#22385c",
      emissive: i === 0 ? "#287c98" : i === 1 ? "#3694b5" : "#5274bd",
      emissiveIntensity: 0.88,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0,
    });
    tierPrimaryMats.push(tPrimary);

    const tAccent = new THREE.MeshBasicMaterial({
      color: i === 0 ? "#8ce8fa" : i === 1 ? "#b0f5ff" : "#a9b8ff",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    tierAccentMats.push(tAccent);

    const tWire = new THREE.LineBasicMaterial({
      color: i === 2 ? "#b8c6ff" : "#9ef0ff",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    tierWireMats.push(tWire);

    // Hexagonal architectural pedestal base
    const baseRadius = 0.68 + i * 0.12;
    const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius * 1.12, 0.08, 6);
    const baseMesh = new THREE.Mesh(baseGeo, tPrimary);
    baseMesh.position.y = -0.78;
    station.add(baseMesh);
    const baseWire = new THREE.LineSegments(new THREE.EdgesGeometry(baseGeo), tWire);
    baseWire.position.y = -0.78;
    station.add(baseWire);

    // Central Tier Intelligence Core
    const coreRadius = 0.28 + i * 0.05;
    const coreGeo = i === 0
      ? new THREE.OctahedronGeometry(coreRadius, 0)
      : new THREE.IcosahedronGeometry(coreRadius, 1);
    const coreMesh = new THREE.Mesh(coreGeo, tPrimary);
    station.add(coreMesh);
    const coreEdge = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), tWire);
    station.add(coreEdge);
    const innerGlow = new THREE.Mesh(new THREE.SphereGeometry(coreRadius * 0.45, 16, 16), tAccent);
    station.add(innerGlow);

    // 6 Capability Indicator Pillars around the back arc of each tier (showing all 6 capabilities in every plan)
    for (let cap = 0; cap < 6; cap++) {
      const ang = Math.PI * 0.18 + (cap / 5) * Math.PI * 0.64;
      const pr = baseRadius * 0.86;
      const ph = 0.26 + i * 0.11;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.042, ph, 0.042), tAccent);
      pillar.position.set(Math.cos(ang) * pr, -0.72 + ph * 0.5, -Math.sin(ang) * pr * 0.6);
      station.add(pillar);
    }

    // Concentric Orbital Capacity Rings (1 for Basic, 2 for Consumer, 3 for Business)
    const rings: THREE.Mesh[] = [];
    for (let r = 0; r <= i; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.56 + r * 0.22, 0.013 - r * 0.002, 12, 64),
        r === 0 ? tAccent : tPrimary
      );
      ring.rotation.x = 0.62 - r * 0.18;
      ring.rotation.y = (r - 0.5) * 0.28;
      rings.push(ring);
      station.add(ring);
    }
    tierOrbitalRings.push(rings);

    // Tier-specific architectural features:
    if (i === 1) {
      // 02 CONSUMER: 3 stacked deep-memory strata halos above and below the core
      for (const sy of [-0.42, 0.42, 0.58]) {
        const strata = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.009, 10, 48), tAccent);
        strata.rotation.x = Math.PI / 2;
        strata.position.y = sy;
        station.add(strata);
      }
    } else if (i === 2) {
      // 03 BUSINESS: 4 networked team-account satellite nodes linked by 3D spokes
      const satGroup = new THREE.Group();
      tierSatellites.push(satGroup);
      station.add(satGroup);
      for (let s = 0; s < 4; s++) {
        const ang = (s / 4) * Math.PI * 2 + Math.PI * 0.25;
        const sx = Math.cos(ang) * 0.92;
        const sy = Math.sin(ang) * 0.52;
        const sz = Math.sin(ang * 2) * 0.18;
        const satGeo = new THREE.OctahedronGeometry(0.12, 0);
        const sat = new THREE.Mesh(satGeo, tAccent);
        sat.position.set(sx, sy, sz);
        satGroup.add(sat);
        const spokeCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(sx, sy, sz));
        satGroup.add(new THREE.Mesh(new THREE.TubeGeometry(spokeCurve, 8, 0.008, 6, false), tAccent));
      }
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
      assembly.rotation.y = lerp(-0.10, 0.04, smooth(progress));

      field.material.uniforms.uOpacity.value = 0.28 * vis;
      field.material.uniforms.uFocus.value = focus;

      // Animate Central Intelligence Core
      coreShellMat.opacity = 0.92 * vis;
      coreInnerMat.opacity = 0.88 * vis;
      coreWireMat.opacity = 0.92 * vis;
      coreNucleusMat.opacity = 0.98 * vis;
      ringMatA.opacity = 0.78 * vis;
      ringMatB.opacity = 0.62 * vis;
      ringMatC.opacity = 0.46 * vis;
      spineMat.opacity = 0.42 * vis;

      const focusY = (2.5 - Math.max(0, focus)) * 0.72;
      coreCrystal.rotation.y = time * 0.42 + progress * 1.5;
      coreCrystal.rotation.x = time * 0.24 + focusY * 0.12;
      coreInner.rotation.y = -time * 0.65;
      coreInner.rotation.z = time * 0.35;
      coreWire.rotation.y = -time * 0.30;
      coreWire.rotation.z = time * 0.18;
      ringA.rotation.z = time * 0.48 + progress * 1.6;
      ringB.rotation.y = -time * 0.38 - progress * 1.2;
      ringC.rotation.x = time * 0.32 + progress * 0.9;

      // Animate 6 Pathways & 6 Sculptural Capability Modules
      for (let i = 0; i < 6; i++) {
        const isFocused = focus === i;
        pathwayMats[i].opacity = vis * (isFocused ? 0.95 : 0.36);
        pathwayMats[i].color.set(isFocused ? "#b8f7ff" : "#6ecce2");
        stationMats[i].opacity = vis * (isFocused ? 0.95 : 0.48);
        stationRings[i].scale.setScalar(isFocused ? 1.28 : 1);
        stationRings[i].rotation.z = time * (isFocused ? 0.9 : 0.25) + i;

        const localProgress = smooth(clamp(progress * 6 - i));
        const tA = (time * (isFocused ? 0.52 : 0.26) + localProgress * 0.5 + i * 0.17) % 1;
        const tB = (tA + 0.5) % 1;
        pathwayCurves[i].getPointAt(0.08 + 0.84 * tA, signalPulsesA[i].position);
        pathwayCurves[i].getPointAt(0.08 + 0.84 * tB, signalPulsesB[i].position);
        pulseMats[i].opacity = vis * (isFocused ? 0.98 : 0.52);
        signalPulsesA[i].scale.setScalar(isFocused ? 1.35 : 0.85);
        signalPulsesB[i].scale.setScalar(isFocused ? 1.15 : 0.72);

        const mod = moduleGroups[i];
        mod.scale.setScalar(isFocused ? 1.16 : 0.94);
        mod.rotation.y = Math.sin(time * 0.5 + i) * (isFocused ? 0.10 : 0.04);
        modulePrimaryMats[i].opacity = vis * (isFocused ? 0.96 : 0.62);
        modulePrimaryMats[i].emissiveIntensity = isFocused ? 1.25 : 0.48;
        moduleAccentMats[i].opacity = vis * (isFocused ? 0.98 : 0.52);
        moduleWireMats[i].opacity = vis * (isFocused ? 0.92 : 0.42);
      }

      // Live internal animations on the 6 Capability Sculptures
      writeBars.forEach((bar, row) => {
        bar.scale.x = 0.78 + 0.22 * Math.sin(time * 2.2 - row * 0.8);
      });
      if (automateCursor) {
        const step = Math.floor((time * 1.6) % 4);
        automateCursor.position.set(-0.42 + step * 0.29, (1.5 - step) * 0.055, 0.03);
        automateCursor.rotation.z = time * 1.4;
      }
      if (decidePrism) {
        decidePrism.rotation.y = time * 0.85;
        decidePrism.rotation.x = time * 0.45;
      }
      memoryPlates.forEach((plate, layer) => {
        plate.position.y = -0.15 + layer * 0.10 + Math.sin(time * 1.5 + layer * 0.9) * 0.008;
      });
      if (visionAperture) {
        visionAperture.rotation.z = time * 0.75;
      }
      voiceBars.forEach((bar, b) => {
        bar.scale.y = 0.65 + 0.55 * Math.abs(Math.sin(time * 3.2 + b * 0.65));
      });

      // Animate Three-Tier Access Architecture
      access.scale.setScalar(lerp(0.84, 1, m));
      bridgeMat.opacity = m * 0.72;
      conduitPulses.forEach((cp, idx) => {
        const ct = (time * 0.22 + idx / 3) % 1;
        conduitCurve.getPointAt(ct, cp.position);
      });
      accessBands.forEach((band, i) => {
        band.material.uniforms.uOpacity.value = (i === 0 ? 0.35 : 0.28) * m;
      });
      tierStations.forEach((station, i) => {
        station.rotation.y = Math.sin(time * 0.35 + i * 0.9) * 0.14;
        tierPrimaryMats[i].opacity = m * 0.92;
        tierAccentMats[i].opacity = m * 0.92;
        tierWireMats[i].opacity = m * 0.85;
        tierOrbitalRings[i].forEach((ring, r) => {
          ring.rotation.z = time * (0.42 - r * 0.1) * (r % 2 === 0 ? 1 : -1);
        });
      });
      tierSatellites.forEach(satGroup => {
        satGroup.rotation.z = time * 0.28;
      });

      return m;
    },
  };
}
