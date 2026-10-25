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

    const metal = new THREE.MeshStandardMaterial({ color: "#28394d", roughness: 0.26, metalness: 0.83 });
    const signal = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.65 });
    const secondary = new THREE.MeshBasicMaterial({ color: LAVENDER, transparent: true, opacity: 0.35 });
    const groups: THREE.Group[] = [];
    const addEnvironment = (index: number) => {
      const group = new THREE.Group();
      group.position.set(index * 24, 0, index * -16);
      scene.add(group);
      groups.push(group);
      return group;
    };
    const tube = (points: THREE.Vector3[], material: THREE.Material, radius = 0.012) =>
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, radius, 4, false), material);

    // 00 & 01 / Owned by the single persistent brain renderer in LoadingScreen.
    addEnvironment(0);

    // 02 / Structured signal corridor connecting Playground to Capabilities Core.
    const corridor = addEnvironment(1);
    const fieldRecords = [];
    for (let column = 0; column < 8; column++) {
      for (let row = 0; row < 3; row++) {
        fieldRecords.push({ x: column * 2.8, y: (row - 1) * 0.65 + 0.6, z: -column * 1.87, lane: -1 });
      }
    }
    const outputField = createPointField(fieldRecords, 3.0);
    outputField.material.uniforms.uOpacity.value = 0.52;
    corridor.add(outputField);
    const corridorLineMat = new THREE.LineBasicMaterial({
      color: "#76d3e8",
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (const row of [-0.65, 0, 0.65]) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, row + 0.6, 0),
        new THREE.Vector3(10, row * 0.7 + 0.9, -7),
        new THREE.Vector3(22, 1.4, -15),
      ]);
      corridor.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)), corridorLineMat));
    }
    const outputSignal = createPointField([{ x: 0, y: 0, z: 0, lane: -1 }], 5.4);
    scene.add(outputSignal);

    // 03 / Cohesive Capability Intelligence Core, 6 Pathways & Access Architecture.
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

    // 05 / The Next Signal: Signal Relay Core, Concentric Horizon Waves & Converging Pathways.
    const waitlist = addEnvironment(4);
    const waitlistPoints = [
      { x: 0, y: 1, z: -7, lane: -1 },
      ...Array.from({ length: 36 }, (_, i) => {
        const ring = (i % 3) + 1;
        const angle = (i / 12) * Math.PI * 2;
        const r = ring * 1.15;
        return {
          x: Math.cos(angle) * r * 1.25,
          y: 1 + Math.sin(angle) * r * 0.42,
          z: -7 + Math.sin(angle * 2) * 0.65,
          lane: -1,
        };
      }),
    ];
    const beacon = createPointField(waitlistPoints, 4.6);
    waitlist.add(beacon);

    const relayGroup = new THREE.Group();
    relayGroup.position.set(0, 1, -7);
    waitlist.add(relayGroup);

    const relayCoreMat = new THREE.MeshStandardMaterial({
      color: "#112c3e",
      emissive: "#26748e",
      emissiveIntensity: 0.85,
      metalness: 0.8,
      roughness: 0.22,
      transparent: true,
      opacity: 0.88,
    });
    const relayCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 1), relayCoreMat);
    relayGroup.add(relayCrystal);

    const relayWireMat = new THREE.LineBasicMaterial({
      color: "#92ebfa",
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const relayWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.51, 1)),
      relayWireMat
    );
    relayGroup.add(relayWire);

    const relayRings: THREE.Mesh[] = [];
    const relayRingMats: THREE.MeshBasicMaterial[] = [];
    [1.15, 2.0, 3.0].forEach((radius, idx) => {
      const rMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? "#8ce6f8" : idx === 1 ? "#74cfe5" : "#9aa8e4",
        transparent: true,
        opacity: 0.56 - idx * 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      relayRingMats.push(rMat);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.009, 10, 72), rMat);
      ring.rotation.x = 1.16 - idx * 0.14;
      ring.rotation.y = (idx - 1) * 0.22;
      relayRings.push(ring);
      relayGroup.add(ring);
    });

    const relayPathMat = new THREE.LineBasicMaterial({
      color: "#76d4e8",
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    relayGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -2.1, 0),
          new THREE.Vector3(0, 2.2, 0),
        ]),
        relayPathMat
      )
    );
    [-2.5, -1.05, 1.05, 2.5].forEach(x => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, -1.25, 6.2),
        new THREE.Vector3(x * 0.45, -0.35, 2.2),
        new THREE.Vector3(0, 0, 0),
      ]);
      relayGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)), relayPathMat));
    });

    // 06 / Roadmap & Continuation Outro.
    const roadmap = addEnvironment(5);
    const roadNodes: THREE.MeshStandardMaterial[] = [];
    const roadMeshes: THREE.Mesh[] = [];
    const roadQuiet: Array<{ material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial; opacity: number }> = [];
    const roadGlows: THREE.SpriteMaterial[] = [];
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 64;
    const glowContext = glowCanvas.getContext("2d");
    if (!glowContext) throw new Error("No timeline glow context");
    const gradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "#bbf1ffb3");
    gradient.addColorStop(0.15, "#67cdea4d");
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
    const pathMaterial = secondary.clone();
    roadmap.add(tube(path, pathMaterial, 0.035));
    roadQuiet.push({ material: pathMaterial, opacity: pathMaterial.opacity });
    path.forEach((point, i) => {
      const baseMaterial = metal.clone();
      baseMaterial.transparent = true;
      roadQuiet.push({ material: baseMaterial, opacity: 1 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.2, 32), baseMaterial);
      base.position.copy(point);
      roadmap.add(base);
      const material = new THREE.MeshStandardMaterial({
        color: i < 2 ? CYAN : LAVENDER,
        emissive: i < 2 ? CYAN : LAVENDER,
        emissiveIntensity: 0.1,
        roughness: 0.3,
        metalness: 0.6,
        fog: false,
        toneMapped: false,
        transparent: true,
      });
      roadNodes.push(material);
      const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), material);
      node.position.copy(point).add(new THREE.Vector3(0, 0.7, 0));
      roadmap.add(node);
      roadMeshes.push(node);
      const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: i < 2 ? CYAN : LAVENDER,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      });
      roadGlows.push(glowMaterial);
      const glow = new THREE.Sprite(glowMaterial);
      glow.position.copy(node.position);
      glow.scale.set(3, 3, 1);
      roadmap.add(glow);
      const orbitMaterial = signal.clone();
      roadQuiet.push({ material: orbitMaterial, opacity: orbitMaterial.opacity });
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.015, 4, 48), orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      orbit.position.copy(point).add(new THREE.Vector3(0, 0.14, 0));
      roadmap.add(orbit);
      if (i === 1) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.3, 5), orbitMaterial);
        pillar.position.copy(point).add(new THREE.Vector3(0, 1.3, 0));
        roadmap.add(pillar);
      }
    });

    const closingOrigin = path[3].clone().add(new THREE.Vector3(0, 0.7, 0));
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
        const targetRect = morph > 0.05 ? accessRect : engineRect;
        const capWeight = smooth(clamp((1 - Math.abs(frame.chapter - 3) - 0.25) / 0.75));
        const inWindow = !!targetRect && targetRect.bottom > -50 && targetRect.top < frame.height + 100;
        engine.root.visible = inWindow;
        const capProgress = Number(capSystem?.dataset.progress ?? 0);
        const activeModule = focus >= 0 ? focus : Math.min(5, Math.floor(capProgress * 6));
        engine.update(capProgress, activeModule, morph, frame.time);
        const output = smooth((chapter - 2.05) / 0.85);
        outputSignal.position.set(lerp(24, 48, output), lerp(0.8, 1.4, output), lerp(-16, -32, output));
        outputSignal.visible = chapter > 2.02 && chapter < 2.9;
        if (targetRect && inWindow && capWeight > 0.001) {
          const units = worldUnitsPerPixel(camera.position.distanceTo(engineCenter), camera.fov, frame.height);
          const scale = units * Math.min((targetRect.height * 0.84) / lerp(4.8, 3.6, morph), (targetRect.width * 0.9) / lerp(3.7, 9.7, morph));
          engine.root.scale.setScalar(scale);
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
        key.position.copy(camera.position).add(new THREE.Vector3(-3, 6, 3));
        key.target.position.fromArray(pose.target);
        key.target.updateMatrixWorld();
        groups.forEach((group, i) => {
          group.visible = i === 1 ? chapter > 2.03 && chapter < 2.85 : Math.abs(chapter - (i === 0 ? 0 : i + 1)) < 1.15;
        });
        if (close > 0.001) groups.forEach((group, i) => { if (i !== 5) group.visible = false; });
        roadQuiet.forEach(({ material, opacity }) => { material.opacity = opacity * (1 - 0.95 * close); });
        roadNodes.forEach((material, i) => { material.opacity = 1 - (i === 3 ? 0.8 : 0.98) * close; });
        roadMeshes.forEach((mesh, i) => mesh.scale.setScalar(i === 3 ? lerp(1, 0.07, close) : lerp(1, 0.94, close)));
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
        roadNodes.forEach((material, i) => { material.emissiveIntensity = i === activeRoadNode ? 1.4 : 0.3; });
        roadGlows.forEach((material, i) => { material.opacity = (i === activeRoadNode ? 0.7 : 0.22) * (1 - close); });

        // Animate Next Signal Relay Core and Horizon Rings
        const waitlistFade = 0.88 - 0.28 * smooth(frame.sections.waitlist ?? 0);
        beacon.material.uniforms.uOpacity.value = waitlistFade;
        relayCoreMat.opacity = waitlistFade;
        relayWireMat.opacity = waitlistFade * 0.88;
        relayPathMat.opacity = waitlistFade * 0.38;
        relayCrystal.rotation.y = frame.time * 0.35;
        relayCrystal.rotation.x = frame.time * 0.2;
        relayWire.rotation.y = -frame.time * 0.26;
        relayRings.forEach((ring, idx) => {
          ring.rotation.z = frame.time * (0.28 - idx * 0.06) * (idx % 2 === 0 ? 1 : -1);
          relayRingMats[idx].opacity = waitlistFade * (0.58 - idx * 0.12);
        });

        room.lamps[0].intensity = 32 + Math.sin(frame.time * 0.6) * 2;
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
