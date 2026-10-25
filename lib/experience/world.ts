import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createCapabilityEngine } from "./capability-engine";
import { domViewOffset, worldUnitsPerPixel } from "./projection";
import { createDeveloperRoom } from "./developer-room";
import { cameraAt, clamp, lerp, smooth, type JourneyFrame } from "./timeline";

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
  // Installed BEFORE model construction: a failed partial initialization must
  // release exactly the same GPU/DOM resources as an established world.
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    unlisten();
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      if (mesh instanceof THREE.InstancedMesh) mesh.dispose();
      if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => materials.add(material));
    });
    materials.forEach(material => { Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); }); material.dispose(); });
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
    let pixelCap = software ? .7 : lite ? 1 : 1.35;
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
    scene.fog = new THREE.FogExp2("#03070f", .029);
    const camera = new THREE.PerspectiveCamera(mobile ? 48 : 43, 1, .1, 100);
    if (!lite) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environmentRoom = new RoomEnvironment();
      try {
        environment = pmrem.fromScene(environmentRoom, .04, .1, 25);
        scene.environment = environment.texture;
        scene.environmentIntensity = .75;
      } finally {
        environmentRoom.dispose();
        pmrem.dispose();
      }
    }
    scene.add(new THREE.HemisphereLight("#b7d9f0", "#111522", 2.3));
    const key = new THREE.DirectionalLight("#bddfea", 3); key.position.set(2, 8, 10); scene.add(key);

    const metal = new THREE.MeshStandardMaterial({ color: "#28394d", roughness: .26, metalness: .83 });
    const signal = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: .65 });
    const secondary = new THREE.MeshBasicMaterial({ color: LAVENDER, transparent: true, opacity: .35 });
    const groups: THREE.Group[] = [];
    const addEnvironment = (index: number) => {
      const group = new THREE.Group(); group.position.set(index * 24, 0, index * -16); scene.add(group); groups.push(group); return group;
    };
    const tube = (points: THREE.Vector3[], material: THREE.Material, radius = .012) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, radius, 4, false), material);

    // 00 / A spatial aperture, not another brain. The recovered brain lives above it.
    const core = addEnvironment(0);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(3 + i * .7, .012, 4, 80), i % 2 ? secondary : signal); ring.position.set(2, 1.2, -i * 1.5); ring.rotation.y = .35; core.add(ring);
    }

    // 01 / Neural rails open into an architectural corridor behind the real product.
    const corridor = addEnvironment(1);
    for (let i = 0; i < (lite ? 7 : 12); i++) {
      const portal = new THREE.Group(); portal.position.z = -i * 2.8;
      for (const x of [-6, 6]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(.04, 8, .05), signal); beam.position.set(x, 2, 0); portal.add(beam);
      }
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(12, .025, .05), secondary); lintel.position.y = 6; portal.add(lintel);
      corridor.add(portal);
    }

    // 02 / Six functional cartridges assemble into a single physical engine.
    const capabilities = addEnvironment(2);
    const engine = createCapabilityEngine(capabilities);
    const capViewport = document.querySelector<HTMLElement>("[data-capability-viewport]");
    const capSystem = document.querySelector<HTMLElement>("[data-capability-system]");
    const accessViewport = document.querySelector<HTMLElement>("[data-access-architecture]");
    const engineCenter = new THREE.Vector3(48, 1.4, -32);
    const projected = new THREE.Vector3();

    // 03 / Genuine modelled developer workspace + readable DOM central display.
    const builder = addEnvironment(3);
    editor.dataset.editorLayout = mobile ? "mobile" : "desktop";
    const room = createDeveloperRoom(builder, mobile ? 640 : 1080);
    const screen = new CSS3DObject(editor);
    screen.position.copy(builder.position).add(room.screenPosition);
    screen.scale.setScalar(room.screenScale);
    cssScene.add(screen);

    // 04 / The next signal: leave the workspace for a distant, quiet beacon.
    const waitlist = addEnvironment(4);
    const stone = new THREE.MeshStandardMaterial({ color: "#101d28", roughness: .55, metalness: .5 });
    for (let i = 0; i < 5; i++) {
      for (const side of [-1, 1]) {
        const height = .7 + i * .8;
        const wall = new THREE.Mesh(new THREE.BoxGeometry(2, height, 3.5), stone);
        wall.position.set(side * (6.4 + i * .18), height / 2 - 2.1, -i * 4); waitlist.add(wall);
      }
    }
    const signalBase = new THREE.Mesh(new THREE.BoxGeometry(3, .2, 3), metal); signalBase.position.set(0, -2, -15); waitlist.add(signalBase);
    const beaconBody = new THREE.Mesh(new THREE.BoxGeometry(.3, 7, .35), metal); beaconBody.position.set(0, 1.5, -15); waitlist.add(beaconBody);
    const beaconMaterial = new THREE.MeshStandardMaterial({ color: "#e2d4b7", emissive: "#e9cf9b", emissiveIntensity: 1.2, roughness: .3 });
    const beacon = new THREE.Mesh(new THREE.BoxGeometry(.065, 6.4, .02), beaconMaterial); beacon.position.set(0, 1.5, -14.81); waitlist.add(beacon);
    const beaconLight = new THREE.PointLight("#edce9b", 16, 22, 2); beaconLight.position.set(0, 1, -13); waitlist.add(beaconLight);
    const horizon = new THREE.Mesh(new THREE.BoxGeometry(27, .018, .03), secondary); horizon.position.set(0, -2, -7); waitlist.add(horizon);

    // 05 / A real spatial timeline. Nodes correspond ONLY to the four existing stages.
    const roadmap = addEnvironment(5);
    const roadNodes: THREE.MeshStandardMaterial[] = [];
    const roadGlows: THREE.SpriteMaterial[] = [];
    const glowCanvas = document.createElement("canvas"); glowCanvas.width = glowCanvas.height = 64;
    const glowContext = glowCanvas.getContext("2d");
    if (!glowContext) throw new Error("No timeline glow context");
    const gradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "#bbf1ffb3"); gradient.addColorStop(.15, "#67cdea4d"); gradient.addColorStop(1, "#67cdea00");
    glowContext.fillStyle = gradient; glowContext.fillRect(0, 0, 64, 64);
    const glowTexture = new THREE.CanvasTexture(glowCanvas); glowTexture.colorSpace = THREE.SRGBColorSpace;
    const path = [new THREE.Vector3(-6, .2, 1), new THREE.Vector3(-2, .8, -1), new THREE.Vector3(2, .4, -3), new THREE.Vector3(6, 1, -5)];
    roadmap.add(tube(path, secondary, .035));
    path.forEach((point, i) => {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(.7, .85, .2, 32), metal); base.position.copy(point); roadmap.add(base);
      const material = new THREE.MeshStandardMaterial({ color: i < 2 ? CYAN : LAVENDER, emissive: i < 2 ? CYAN : LAVENDER, emissiveIntensity: .1, roughness: .3, metalness: .6, fog: false, toneMapped: false }); roadNodes.push(material);
      const node = new THREE.Mesh(new THREE.OctahedronGeometry(.35, 0), material); node.position.copy(point).add(new THREE.Vector3(0, .7, 0)); roadmap.add(node);
      const glowMaterial = new THREE.SpriteMaterial({ map: glowTexture, color: i < 2 ? CYAN : LAVENDER, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }); roadGlows.push(glowMaterial);
      const glow = new THREE.Sprite(glowMaterial); glow.position.copy(node.position); glow.scale.set(3, 3, 1); roadmap.add(glow);
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(.7, .015, 4, 48), signal); orbit.rotation.x = Math.PI / 2; orbit.position.copy(point).add(new THREE.Vector3(0, .14, 0)); roadmap.add(orbit);
      if (i === 1) { const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 2.3, 5), signal); beacon.position.copy(point).add(new THREE.Vector3(0, 1.3, 0)); roadmap.add(beacon); }
    });

    // One connecting structure for the whole world, not five copies of a particle field.
    for (const side of [-1, 1]) {
      const points = groups.map((group, i) => group.position.clone().add(new THREE.Vector3(side * (6 + Math.sin(i) * 1.5), -1.5, 0)));
      scene.add(tube(points, new THREE.MeshBasicMaterial({ color: "#83a3bf", transparent: true, opacity: .1 }), .01));
    }
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array((lite ? 45 : 100) * 3);
    let seed = 82;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
    for (let i = 0; i < dustPositions.length; i += 3) { dustPositions[i] = random() * 144 - 8; dustPositions[i + 1] = random() * 11 - 3; dustPositions[i + 2] = -dustPositions[i] * .67 + (random() - .5) * 16; }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    scene.add(new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: "#a7d1df", size: .025, transparent: true, opacity: .4, depthWrite: false })));

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
          width = frame.width; height = frame.height;
          mobile = width < 768;
          camera.fov = mobile ? 48 : 43;
          editor.dataset.editorLayout = mobile ? "mobile" : "desktop";
          screen.scale.setScalar(6.5 / (mobile ? 640 : 1080));
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelCap, mobile ? 1 : 1.35));
          renderer.setSize(width, height); cssRenderer?.setSize(width, height);
          camera.aspect = width / height; camera.updateProjectionMatrix();
        }
        const chapter = frame.chapter >= 4 && frame.chapter < 5 ? Math.max(frame.chapter, 4 + smooth(frame.departure ?? 0)) : frame.chapter;
        const pose = cameraAt(chapter, frame.sections.about ?? 0, mobile);
        camera.clearViewOffset();
        camera.position.fromArray(pose.position); camera.lookAt(new THREE.Vector3(...pose.target));
        camera.updateMatrixWorld();
        const engineRect = capViewport?.getBoundingClientRect();
        const accessRect = accessViewport?.getBoundingClientRect();
        const morph = accessRect ? smooth(clamp((frame.height * .95 - accessRect.top) / (frame.height * .6))) : 0;
        const targetRect = morph > .05 ? accessRect : engineRect;
        const capWeight = smooth(clamp((1 - Math.abs(frame.chapter - 3) - .25) / .75));
        const inWindow = !!targetRect && targetRect.bottom > -50 && targetRect.top < frame.height + 100;
        engine.root.visible = inWindow;
        const capProgress = Number(capSystem?.dataset.progress ?? 0);
        const activeModule = focus >= 0 ? focus : Math.min(5, Math.floor(capProgress * 6));
        engine.update(capProgress, activeModule, morph);
        if (targetRect && inWindow && capWeight > .001) {
          const units = worldUnitsPerPixel(camera.position.distanceTo(engineCenter), camera.fov, frame.height);
          const scale = units * Math.min(targetRect.height * .84 / lerp(6.5, 3.6, morph), targetRect.width * .9 / lerp(4.5, 10.1, morph));
          engine.root.scale.setScalar(scale);
          projected.copy(engineCenter).project(camera);
          const offset = domViewOffset(projected, targetRect, frame.width, frame.height);
          camera.setViewOffset(frame.width, frame.height, offset.x * capWeight, offset.y * capWeight, frame.width, frame.height);
        }
        renderer.domElement.dataset.capabilityArchitecture = "laminar";
        renderer.domElement.dataset.capabilityModules = "6";
        renderer.domElement.dataset.capabilityFocus = String(activeModule);
        renderer.domElement.dataset.accessMorph = morph.toFixed(3);
        key.position.copy(camera.position).add(new THREE.Vector3(-3, 6, 3)); key.target.position.fromArray(pose.target); key.target.updateMatrixWorld();
        groups.forEach((group, i) => { group.visible = i === 1 ? chapter > .4 && chapter < 3.1 : Math.abs(chapter - (i === 0 ? 0 : i + 1)) < 1.15; });
        const activeRoadNode = roadmapFocus >= 0 ? roadmapFocus : Math.min(3, Math.floor((frame.sections.roadmap ?? 0) * 4));
        roadNodes.forEach((material, i) => { material.emissiveIntensity = i === activeRoadNode ? 1.4 : .3; });
        roadGlows.forEach((material, i) => { material.opacity = i === activeRoadNode ? .7 : .22; });
        beaconMaterial.emissiveIntensity = 1.05 - .3 * smooth(frame.sections.waitlist ?? 0);
        beaconLight.intensity = 16 - 7 * smooth(frame.sections.waitlist ?? 0);
        room.lamps[0].intensity = 32 + Math.sin(frame.time * .6) * 2;
        const builderWeight = smooth(1 - Math.abs(chapter - 4));
        screen.visible = builderWeight > .02;
        editor.style.opacity = String(builderWeight);
        cssRenderer!.domElement.style.visibility = screen.visible ? "visible" : "hidden";
        host.style.opacity = String(frame.chapter < 2 ? .25 * smooth((frame.sections.signal ?? 0) * 1.2) : frame.chapter > 4.6 ? .65 : .95);
        renderer.render(scene, camera);
        cssRenderer?.render(cssScene, camera);
        renderer.domElement.dataset.camera = pose.position.map((v) => v.toFixed(2)).join(",");
        renderer.domElement.dataset.chapter = frame.chapter.toFixed(3);
        renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls);
        renderer.domElement.dataset.quality = lite || mobile ? "lite" : "full";
        // Sustained low FPS steps resolution down, once. No scene/asset reload.
        if (lastTime && frame.time - lastTime > .055 && !frame.reduced) slowFrames++;
        else slowFrames = Math.max(0, slowFrames - 1);
        lastTime = frame.time;
        if (slowFrames > 35 && renderer.getPixelRatio() > .85) { pixelCap = .85; renderer.setPixelRatio(pixelCap); width = 0; slowFrames = 0; }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
