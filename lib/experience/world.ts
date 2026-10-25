import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
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
    const dark = new THREE.MeshStandardMaterial({ color: "#111f2d", roughness: .4, metalness: .7 });
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

    // 02 / Six machined capability modules wired to one shared core.
    const capabilities = addEnvironment(2);
    const capabilityMaterials: THREE.MeshStandardMaterial[] = [];
    const nodePositions = [[-4.5, 3.2, 0], [0, 4.5, -1], [4.5, 3.2, 0], [-4.5, -.1, .5], [0, -1.2, -.5], [4.5, -.1, .5]];
    const capabilityCore = new THREE.Mesh(new THREE.OctahedronGeometry(.8, 1), metal); capabilityCore.position.set(0, 1.5, 0); capabilities.add(capabilityCore);
    nodePositions.forEach(([x, y, z], i) => {
      const material = new THREE.MeshStandardMaterial({ color: "#244154", emissive: i % 2 ? LAVENDER : CYAN, emissiveIntensity: .08, metalness: .75, roughness: .22 }); capabilityMaterials.push(material);
      const node = new THREE.Group(); node.position.set(x, y, z); node.rotation.y = (i % 3 - 1) * -.17;
      node.add(new THREE.Mesh(new RoundedBoxGeometry(1.65, 1.05, .5, 2, .06), material));
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .72), dark); glass.position.z = .26; node.add(glass);
      for (let j = 0; j < 4; j++) {
        const pin = new THREE.Mesh(new THREE.BoxGeometry(.035, .1 + j * .04, .01), j % 2 ? secondary : signal); pin.position.set(-.45 + j * .3, 0, .27); node.add(pin);
      }
      capabilities.add(node);
      capabilities.add(tube([new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(x * .45, 1.5, -.5), new THREE.Vector3(x, y, z)], i % 2 ? secondary : signal));
    });

    // 03 / Genuine modelled developer workspace + readable DOM central display.
    const builder = addEnvironment(3);
    editor.dataset.editorLayout = mobile ? "mobile" : "desktop";
    const room = createDeveloperRoom(builder, mobile ? 640 : 1080);
    const screen = new CSS3DObject(editor);
    screen.position.copy(builder.position).add(room.screenPosition);
    screen.scale.setScalar(room.screenScale);
    cssScene.add(screen);

    // 04 / A quiet threshold. Four nested, volumetric frames draw the eye to the form.
    const waitlist = addEnvironment(4);
    const portalMaterials: THREE.MeshBasicMaterial[] = [];
    for (let i = 0; i < 5; i++) {
      const group = new THREE.Group(); group.position.set(0, 1, -i * 2.6);
      const material = new THREE.MeshBasicMaterial({ color: i % 2 ? LAVENDER : CYAN, transparent: true, opacity: .3 - i * .04 }); portalMaterials.push(material);
      for (const x of [-5.5, 5.5]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(.035, 10, .04), material); bar.position.x = x; group.add(bar); }
      for (const y of [-5, 5]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(11, .035, .04), material); bar.position.y = y; group.add(bar); }
      waitlist.add(group);
    }
    const horizon = new THREE.Mesh(new THREE.PlaneGeometry(24, .012), signal); horizon.position.set(0, -2, -8); waitlist.add(horizon);

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
        const pose = cameraAt(frame.chapter, frame.sections.about ?? 0, mobile);
        camera.position.fromArray(pose.position); camera.lookAt(new THREE.Vector3(...pose.target));
        key.position.copy(camera.position).add(new THREE.Vector3(-3, 6, 3)); key.target.position.fromArray(pose.target); key.target.updateMatrixWorld();
        groups.forEach((group, i) => { group.visible = Math.abs(frame.chapter - i) < 1.15; });
        capabilityMaterials.forEach((material, i) => { material.emissiveIntensity = i === focus ? .7 : .1 + .045 * Math.sin(frame.time + i); });
        const activeRoadNode = roadmapFocus >= 0 ? roadmapFocus : Math.min(3, Math.floor((frame.sections.roadmap ?? 0) * 4));
        roadNodes.forEach((material, i) => { material.emissiveIntensity = i === activeRoadNode ? 1.4 : .3; });
        roadGlows.forEach((material, i) => { material.opacity = i === activeRoadNode ? .7 : .22; });
        portalMaterials.forEach((material, i) => { material.opacity = (.28 - i * .04) * (.85 + .15 * Math.sin(frame.time * .5 - i * .3)); });
        room.lamps[0].intensity = 32 + Math.sin(frame.time * .6) * 2;
        const builderWeight = smooth(1 - Math.abs(frame.chapter - 3));
        screen.visible = builderWeight > .02;
        editor.style.opacity = String(builderWeight);
        cssRenderer!.domElement.style.visibility = screen.visible ? "visible" : "hidden";
        host.style.opacity = String(frame.chapter < 1.5 ? lerp(.06, .2, clamp(frame.chapter)) : frame.chapter > 3.6 ? .65 : .95);
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
