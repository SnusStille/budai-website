import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createPointField } from "./information-field";
import { createCapabilityEngine } from "./capability-engine";
import { domViewOffset, worldUnitsPerPixel } from "./projection";
import { createDeveloperRoom } from "./developer-room";
import { cameraAt, worldChapterAt, worldOpacityAt, clamp, lerp, smooth, type JourneyFrame } from "./timeline";

const CYAN = "#79cfe4";
const LAVENDER = "#9ca7df";

/**
 * A single, persistent WebGL world. Camera-scrub / quality / disposal techniques
 * informed by scroll-flyover and AETumi (MIT); original geometry and choreography.
 * There is no scroll handler, RAF, virtual scroller, downloaded model or video here.
 */
export function createWorld(host: HTMLElement, editor: HTMLElement, onFailure: () => void) {
  let mobile = window.innerWidth < 768;
  const nav = navigator as Navigator & { deviceMemory?: number };
  let lite = mobile || (nav.deviceMemory ?? 8) <= 4 || navigator.hardwareConcurrency <= 4;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !lite, powerPreference: "low-power", stencil: false });
  const scene = new THREE.Scene();
  const cssScene = new THREE.Scene();
  let cssRenderer: CSS3DRenderer | undefined;
  let environment: THREE.WebGLRenderTarget | null = null;
  let disposed = false;
  let unlisten = () => {};

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    unlisten();
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    scene.traverse(object => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      if (mesh instanceof THREE.InstancedMesh) mesh.dispose();
      if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => materials.add(material));
    });
    materials.forEach(material => {
      Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); });
      material.dispose();
    });
    geometries.forEach(geometry => geometry.dispose());
    textures.forEach(texture => texture.dispose());
    environment?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    cssRenderer?.domElement.remove();
    cssScene.clear();
    scene.clear();
    host.style.removeProperty("opacity");
  };

  try {
    const gl = renderer.getContext();
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    const software = !!debug && /swiftshader|llvmpipe|software/i.test(String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)));
    lite = lite || software;
    renderer.setClearColor(0x020205, 0);
    let pixelCap = software ? 0.7 : lite ? 1 : 1.35;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelCap));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.dataset.worldCanvas = "";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    cssRenderer = new CSS3DRenderer();
    cssRenderer.domElement.className = "world-dom-layer";
    cssRenderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(cssRenderer.domElement);
    scene.fog = new THREE.FogExp2("#03070f", 0.029);
    const camera = new THREE.PerspectiveCamera(mobile ? 48 : 43, 1, 0.1, 100);
    if (!lite) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environmentRoom = new RoomEnvironment();
      try {
        environment = pmrem.fromScene(environmentRoom, 0.04, 0.1, 25);
        scene.environment = environment.texture;
        scene.environmentIntensity = 0.75;
      } finally {
        environmentRoom.dispose();
        pmrem.dispose();
      }
    }
    scene.add(new THREE.HemisphereLight("#b7d9f0", "#111522", 2.3));
    const key = new THREE.DirectionalLight("#bddfea", 3);
    key.position.set(2, 8, 10);
    scene.add(key);

    const groups: THREE.Group[] = [];
    const addEnvironment = (index: number) => {
      const group = new THREE.Group();
      group.position.set(index * 24, 0, index * -16);
      scene.add(group);
      groups.push(group);
      return group;
    };

    // 00 & 01 / Owned by the single persistent brain renderer in LoadingScreen.
    addEnvironment(0);

    // 02 / Structured 3D Signal Corridor connecting Playground to Capabilities Core.
    const corridor = addEnvironment(1);
    const fieldRecords = [];
    for (let column = 0; column < 8; column++) {
      for (let row = 0; row < 4; row++) {
        fieldRecords.push({ x: column * 2.8, y: (row - 1.5) * 0.65 + 0.75, z: -column * 1.87, lane: -1 });
      }
    }
    const outputField = createPointField(fieldRecords, 3.2);
    outputField.material.uniforms.uOpacity.value = 0.56;
    corridor.add(outputField);

    const corridorTubeMat = new THREE.MeshBasicMaterial({
      color: "#76d3e8",
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const corridorGateMat = new THREE.LineBasicMaterial({
      color: "#8ce7fa",
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const corridorCurves: THREE.CatmullRomCurve3[] = [];
    const corridorPulses: THREE.Mesh[] = [];
    const corridorPulseGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const corridorPulseMat = new THREE.MeshBasicMaterial({
      color: "#c8f7ff",
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (const row of [-0.95, -0.45, 0, 0.45, 0.95]) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, row + 0.7, 0),
        new THREE.Vector3(11, row * 0.65 + 1.0, -7.4),
        new THREE.Vector3(22.5, 1.4 + row * 0.25, -15.2),
      ]);
      corridorCurves.push(curve);
      corridor.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.012, 6, false), corridorTubeMat));
      const pulse = new THREE.Mesh(corridorPulseGeo, corridorPulseMat);
      corridor.add(pulse);
      corridorPulses.push(pulse);
    }
    [2, 4, 6].forEach(col => {
      const gate = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.CylinderGeometry(1.35, 1.35, 0.06, 6)),
        corridorGateMat
      );
      gate.rotation.x = Math.PI / 2;
      gate.rotation.z = 0.58;
      gate.position.set(col * 2.8, 0.95, -col * 1.87);
      corridor.add(gate);
    });

    const outputSignal = createPointField([{ x: 0, y: 0, z: 0, lane: -1 }], 5.4);
    scene.add(outputSignal);

    // 03 / THE LIVING INTELLIGENCE ENGINE: Dimensional 3D Code Panels, Core, 6 Pathways & Access Stations.
    const capabilities = addEnvironment(2);
    const engine = createCapabilityEngine(capabilities);
    const capViewport = document.querySelector<HTMLElement>("[data-capability-viewport]");
    const capSystem = document.querySelector<HTMLElement>("[data-capability-system]");
    const accessViewport = document.querySelector<HTMLElement>("[data-access-architecture]");
    const engineCenter = new THREE.Vector3(48, 1.4, -32);
    const projected = new THREE.Vector3();

    // 04 / Architectural Developer Room + real CSS3D projected ProgressiveEditor.
    const builder = addEnvironment(3);
    editor.dataset.editorLayout = mobile ? "mobile" : "desktop";
    const room = createDeveloperRoom(builder, mobile ? 640 : 1080);
    const screen = new CSS3DObject(editor);
    screen.position.copy(builder.position).add(room.screenPosition);
    screen.scale.setScalar(room.screenScale);
    cssScene.add(screen);

    // 05 / Roadmap (4 Sculptural Milestone Stations) & Continuation Outro.
    const roadmap = addEnvironment(4);
    const roadNodes: THREE.MeshStandardMaterial[] = [];
    const roadMeshes: THREE.Object3D[] = [];
    const roadQuiet: Array<{ material: THREE.Material & { opacity: number }; opacity: number }> = [];
    const roadGlows: THREE.SpriteMaterial[] = [];
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 64;
    const glowContext = glowCanvas.getContext("2d");
    if (!glowContext) throw new Error("No timeline glow context");
    const gradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "#d2f8ffcf");
    gradient.addColorStop(0.22, "#74d8f266");
    gradient.addColorStop(1, "#67cdea00");
    glowContext.fillStyle = gradient;
    glowContext.fillRect(0, 0, 64, 64);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    glowTexture.colorSpace = THREE.SRGBColorSpace;

    const path = [
      new THREE.Vector3(-6, 0.2, 1),
      new THREE.Vector3(-2, 0.8, -1),
      new THREE.Vector3(2, 0.4, -3),
      new THREE.Vector3(6, 1, -5),
    ];
    const roadCurve = new THREE.CatmullRomCurve3(path);
    const pathMaterial = new THREE.MeshBasicMaterial({
      color: "#7ddaf0",
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    roadmap.add(new THREE.Mesh(new THREE.TubeGeometry(roadCurve, 48, 0.038, 8, false), pathMaterial));
    roadQuiet.push({ material: pathMaterial, opacity: pathMaterial.opacity });

    [-0.18, 0.18].forEach(offsetY => {
      const railPts = path.map(p => p.clone().add(new THREE.Vector3(0, offsetY + 0.35, 0)));
      const railMat = new THREE.LineBasicMaterial({
        color: "#8ce7fa",
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      roadmap.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(railPts).getPoints(48)),
          railMat
        )
      );
      roadQuiet.push({ material: railMat, opacity: railMat.opacity });
    });

    const roadPulseMat = new THREE.MeshBasicMaterial({
      color: "#d4f9ff",
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    roadQuiet.push({ material: roadPulseMat, opacity: roadPulseMat.opacity });
    const roadPulses: THREE.Mesh[] = [];
    const roadPulseGeo = new THREE.SphereGeometry(0.068, 10, 10);
    for (let pIdx = 0; pIdx < 4; pIdx++) {
      const pMesh = new THREE.Mesh(roadPulseGeo, roadPulseMat);
      roadmap.add(pMesh);
      roadPulses.push(pMesh);
    }

    path.forEach((point, i) => {
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: "#172d40",
        emissive: i < 2 ? "#1e5b73" : "#2b3760",
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.82,
        transparent: true,
        opacity: 0.95,
      });
      roadQuiet.push({ material: baseMaterial, opacity: 0.95 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.92, 0.22, 6), baseMaterial);
      base.position.copy(point);
      roadmap.add(base);

      const baseEdgeMat = new THREE.LineBasicMaterial({
        color: i < 2 ? "#8ce8fa" : "#a8b4ec",
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      roadQuiet.push({ material: baseEdgeMat, opacity: 0.62 });
      const baseEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.77, 0.93, 0.23, 6)),
        baseEdgeMat
      );
      baseEdges.position.copy(point);
      roadmap.add(baseEdges);

      const material = new THREE.MeshStandardMaterial({
        color: i < 2 ? CYAN : LAVENDER,
        emissive: i < 2 ? CYAN : LAVENDER,
        emissiveIntensity: 0.45,
        roughness: 0.24,
        metalness: 0.68,
        fog: false,
        toneMapped: false,
        transparent: true,
      });
      roadNodes.push(material);

      const stationGroup = new THREE.Group();
      stationGroup.position.copy(point).add(new THREE.Vector3(0, 0.72, 0));
      roadmap.add(stationGroup);
      roadMeshes.push(stationGroup);

      const coreGeo =
        i === 0
          ? new THREE.OctahedronGeometry(0.4, 0)
          : i === 1
          ? new THREE.IcosahedronGeometry(0.42, 0)
          : i === 2
          ? new THREE.OctahedronGeometry(0.38, 1)
          : new THREE.IcosahedronGeometry(0.46, 1);
      const node = new THREE.Mesh(coreGeo, material);
      stationGroup.add(node);

      const cageMat = new THREE.LineBasicMaterial({
        color: i < 2 ? "#b4f3ff" : "#c2ccfa",
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      roadQuiet.push({ material: cageMat, opacity: 0.75 });
      stationGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), cageMat));

      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: i < 2 ? CYAN : LAVENDER,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      roadQuiet.push({ material: orbitMaterial, opacity: orbitMaterial.opacity });

      if (i === 1) {
        for (let r = 0; r < 2; r++) {
          const gimbal = new THREE.Mesh(new THREE.TorusGeometry(0.62 + r * 0.14, 0.014, 8, 56), orbitMaterial);
          gimbal.rotation.set(0.9 + r * 0.5, r * 0.7, 0.3);
          stationGroup.add(gimbal);
        }
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.5, 8), orbitMaterial);
        pillar.position.copy(point).add(new THREE.Vector3(0, 1.35, 0));
        roadmap.add(pillar);
      } else if (i === 2) {
        const teamRing = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.013, 8, 56), orbitMaterial);
        teamRing.rotation.x = 1.25;
        stationGroup.add(teamRing);
        for (let sat = 0; sat < 3; sat++) {
          const ang = (sat / 3) * Math.PI * 2;
          const satMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), material);
          satMesh.position.set(Math.cos(ang) * 0.68, Math.sin(ang) * 0.18, Math.sin(ang) * 0.68);
          stationGroup.add(satMesh);
        }
      } else if (i === 3) {
        for (let r = 0; r < 3; r++) {
          const hRing = new THREE.Mesh(new THREE.TorusGeometry(0.68 + r * 0.12, 0.013, 8, 60), orbitMaterial);
          hRing.rotation.set(r * 0.55, r * 0.8, 0.25);
          stationGroup.add(hRing);
        }
      } else {
        const fRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.015, 8, 52), orbitMaterial);
        fRing.rotation.x = Math.PI / 2;
        stationGroup.add(fRing);
      }

      const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: i < 2 ? CYAN : LAVENDER,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      });
      roadGlows.push(glowMaterial);
      const glow = new THREE.Sprite(glowMaterial);
      glow.position.copy(stationGroup.position);
      glow.scale.set(3.4, 3.4, 1);
      roadmap.add(glow);

      const pedestalOrbit = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.016, 6, 56), orbitMaterial);
      pedestalOrbit.rotation.x = Math.PI / 2;
      pedestalOrbit.position.copy(point).add(new THREE.Vector3(0, 0.14, 0));
      roadmap.add(pedestalOrbit);
    });

    const closingOrigin = path[3].clone().add(new THREE.Vector3(0, 0.72, 0));
    const closingSignal = createPointField([{ x: 0, y: 0, z: 0, lane: -1 }], 4.8);
    closingSignal.position.copy(closingOrigin);
    roadmap.add(closingSignal);
    const closingAnchor = document.querySelector<HTMLElement>("[data-outro-anchor]");
    const desiredClosing = new THREE.Vector3();

    let width = 0;
    let height = 0;
    let focus = -1;
    let roadmapFocus = -1;
    let lastTime = 0;
    let slowFrames = 0;
    const onCapability = (event: Event) => { focus = (event as CustomEvent<number>).detail; };
    const onRoadmap = (event: Event) => { roadmapFocus = (event as CustomEvent<number>).detail; };
    const onLost = (event: Event) => { event.preventDefault(); if (!disposed) onFailure(); };
    window.addEventListener("budai:capability-focus", onCapability);
    window.addEventListener("budai:roadmap-focus", onRoadmap);
    renderer.domElement.addEventListener("webglcontextlost", onLost);
    unlisten = () => {
      window.removeEventListener("budai:capability-focus", onCapability);
      window.removeEventListener("budai:roadmap-focus", onRoadmap);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
    };

    return {
      update(frame: JourneyFrame) {
        if (disposed || document.hidden) return;
        if (frame.width !== width || frame.height !== height) {
          width = frame.width;
          height = frame.height;
          mobile = width < 768;
          camera.fov = mobile ? 48 : 43;
          editor.dataset.editorLayout = mobile ? "mobile" : "desktop";
          screen.scale.setScalar(6.5 / (mobile ? 640 : 1080));
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelCap, mobile ? 1 : 1.35));
          renderer.setSize(width, height);
          cssRenderer?.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          scene.traverse(object => {
            const material = (object as THREE.Points).material;
            if (material instanceof THREE.ShaderMaterial && material.uniforms.uPixelRatio) {
              material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
            }
          });
        }
        const close = smooth(frame.closing ?? 0);
        const opacity = worldOpacityAt(frame) * (1 - 0.35 * close);
        host.style.opacity = String(opacity);
        if (opacity <= 0.001) {
          editor.style.opacity = "0";
          cssRenderer!.domElement.style.visibility = "hidden";
          lastTime = frame.time;
          return;
        }
        const chapter = worldChapterAt(frame);
        const pose = cameraAt(chapter, frame.sections.about ?? 0, mobile, frame.closing ?? 0);
        camera.clearViewOffset();
        camera.position.fromArray(pose.position);
        camera.lookAt(new THREE.Vector3(...pose.target));
        camera.updateMatrixWorld();
        const engineRect = capViewport?.getBoundingClientRect();
        const accessRect = accessViewport?.getBoundingClientRect();
        const morph = accessRect ? smooth(clamp((frame.height * 0.95 - accessRect.top) / (frame.height * 0.6))) : 0;
        const assemblyProgress = accessRect ? clamp((frame.height * 0.85 - accessRect.top) / Math.max(1, accessRect.height + frame.height * 0.35)) : 0;
        const targetRect = morph > 0.05 ? accessRect : engineRect;
        const capWeight = smooth(clamp((1 - Math.abs(frame.chapter - 3) - 0.25) / 0.75));
        const inWindow = !!targetRect && targetRect.bottom > -50 && targetRect.top < frame.height + 100;
        engine.root.visible = inWindow;
        const capProgress = Number(capSystem?.dataset.progress ?? 0);
        const activeModule = focus >= 0 ? focus : Math.min(5, Math.floor(capProgress * 6));
        engine.update(capProgress, activeModule, morph, frame.time, assemblyProgress);

        corridorPulses.forEach((pulse, idx) => {
          const u = (frame.time * 0.32 + idx * 0.19) % 1;
          corridorCurves[idx].getPointAt(u, pulse.position);
        });

        const output = smooth((chapter - 2.05) / 0.85);
        outputSignal.position.set(lerp(24, 48, output), lerp(0.8, 1.4, output), lerp(-16, -32, output));
        outputSignal.visible = chapter > 2.02 && chapter < 2.9;
        if (targetRect && inWindow && capWeight > 0.001) {
          const units = worldUnitsPerPixel(camera.position.distanceTo(engineCenter), camera.fov, frame.height);
          const scale = units * Math.min((targetRect.height * 0.88) / lerp(4.0, 3.0, morph), (targetRect.width * 0.94) / lerp(4.2, 8.1, morph));
          engine.root.scale.setScalar(scale);
          engine.root.rotation.y = lerp((capProgress - 0.5) * -0.18, (assemblyProgress - 0.5) * 0.16, morph);
          engine.root.rotation.x = lerp((capProgress - 0.5) * 0.08, (0.5 - assemblyProgress) * 0.06, morph);
          projected.copy(engineCenter).project(camera);
          const offset = domViewOffset(projected, targetRect, frame.width, frame.height);
          camera.setViewOffset(frame.width, frame.height, offset.x * capWeight, offset.y * capWeight, frame.width, frame.height);
        }
        renderer.domElement.dataset.capabilityArchitecture = "information-field";
        renderer.domElement.dataset.capabilityModules = "6";
        renderer.domElement.dataset.capabilityPaths = "0";
        renderer.domElement.dataset.informationRecords = "6";
        renderer.domElement.dataset.capabilityFocus = String(activeModule);
        renderer.domElement.dataset.accessMorph = morph.toFixed(3);
        renderer.domElement.dataset.chamberProgress = capProgress.toFixed(3);
        renderer.domElement.dataset.assemblyProgress = assemblyProgress.toFixed(3);
        renderer.domElement.dataset.realityProgress = (frame.sections.about ?? 0).toFixed(3);
        key.position.copy(camera.position).add(new THREE.Vector3(-3, 6, 3));
        key.target.position.fromArray(pose.target);
        key.target.updateMatrixWorld();
        groups.forEach((group, i) => {
          group.visible = i === 1 ? chapter > 2.03 && chapter < 2.85 : Math.abs(chapter - (i === 0 ? 0 : i + 1)) < 1.15;
        });
        if (close > 0.001) groups.forEach((group, i) => { if (i !== 4) group.visible = false; });
        roadQuiet.forEach(({ material, opacity: baseOpacity }) => {
          material.opacity = baseOpacity * (1 - 0.95 * close);
        });
        roadNodes.forEach((material, i) => { material.opacity = 1 - (i === 3 ? 0.8 : 0.98) * close; });
        roadMeshes.forEach((mesh, i) => {
          mesh.scale.setScalar(i === 3 ? lerp(1, 0.07, close) : lerp(1, 0.94, close));
          mesh.rotation.y = frame.time * (0.24 + i * 0.05);
        });
        roadPulses.forEach((pulse, pIdx) => {
          const u = (frame.time * 0.22 + pIdx * 0.25) % 1;
          roadCurve.getPointAt(u, pulse.position);
          pulse.position.y += 0.35;
        });
        const anchor = closingAnchor?.getBoundingClientRect();
        if (anchor) {
          desiredClosing.set(((anchor.left + anchor.width / 2) / width) * 2 - 1, 1 - ((anchor.top + anchor.height / 2) / height) * 2, 0.94).unproject(camera);
          roadmap.worldToLocal(desiredClosing);
          closingSignal.position.copy(closingOrigin).lerp(desiredClosing, close);
        }
        closingSignal.material.uniforms.uOpacity.value = close * 0.9;
        renderer.domElement.dataset.outroProgress = (frame.closing ?? 0).toFixed(4);
        renderer.domElement.dataset.outroState = close > 0.999 ? "settled" : close > 0 ? "converging" : "roadmap";
        const activeRoadNode = roadmapFocus >= 0 ? roadmapFocus : Math.min(3, Math.floor((frame.sections.roadmap ?? 0) * 4));
        roadNodes.forEach((material, i) => { material.emissiveIntensity = i === activeRoadNode ? 1.55 : 0.52; });
        roadGlows.forEach((material, i) => { material.opacity = (i === activeRoadNode ? 0.82 : 0.36) * (1 - close); });

        room.update(frame.sections.about ?? 0, frame.time);
        room.holo.core.rotation.y = frame.time * 0.7;
        room.holo.cage.rotation.y = -frame.time * 0.42;
        room.holo.orbit.rotation.z = frame.time * 0.55;

        const builderWeight = smooth(1 - Math.abs(chapter - 4));
        screen.visible = builderWeight > 0.02;
        editor.style.opacity = String(builderWeight);
        cssRenderer!.domElement.style.visibility = screen.visible ? "visible" : "hidden";
        renderer.render(scene, camera);
        cssRenderer?.render(cssScene, camera);
        renderer.domElement.dataset.camera = pose.position.map(v => v.toFixed(2)).join(",");
        renderer.domElement.dataset.chapter = frame.chapter.toFixed(3);
        renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls);
        renderer.domElement.dataset.quality = lite || mobile ? "lite" : "full";
        if (lastTime && frame.time - lastTime > 0.055 && !frame.reduced) slowFrames++;
        else slowFrames = Math.max(0, slowFrames - 1);
        lastTime = frame.time;
        if (slowFrames > 35 && renderer.getPixelRatio() > 0.85) {
          pixelCap = 0.85;
          renderer.setPixelRatio(pixelCap);
          width = 0;
          slowFrames = 0;
        }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
