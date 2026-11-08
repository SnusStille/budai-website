"use client";

import { useEffect, useRef, useState } from "react";

export type MascotGesture = { id: number; kind: "hello" | "wink" };

/** The same Builder Bot in Labs and on the homepage; no WebGL on reduced motion or save-data. */
export default function LabsMascot({ companion = false, gesture = null, staticOnly = false }: { companion?: boolean; gesture?: MascotGesture | null; staticOnly?: boolean } = {}) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // Updating an expression must not tear down and recreate the WebGL scene.
  const gestureRef = useRef<{ kind: MascotGesture["kind"]; started: number } | null>(null);
  const previousGesture = useRef(gesture?.id);
  useEffect(() => {
    if (gesture && gesture.id !== previousGesture.current) {
      previousGesture.current = gesture.id;
      gestureRef.current = { kind: gesture.kind, started: performance.now() };
    }
  }, [gesture]);

  useEffect(() => {
    const el = host.current;
    if (!el || staticOnly) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let teardown: (() => void) | undefined;
    const start = async () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (motion.matches || connection?.saveData || disposed || teardown) return;
      let THREE: typeof import("three");
      try { THREE = await import("three"); } catch { return; }
      if (disposed || motion.matches || teardown) return;
      let renderer: import("three").WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); } catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, companion ? 1.25 : 1.5));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
      camera.position.set(0, .2, 8.6);
      const robot = new THREE.Group();
      scene.add(robot);
      const shell = new THREE.MeshPhysicalMaterial({ color: 0xb9e4ee, metalness: .38, roughness: .28, clearcoat: .9, clearcoatRoughness: .2 });
      const dark = new THREE.MeshPhysicalMaterial({ color: 0x061827, metalness: .3, roughness: .24, clearcoat: 1 });
      const glow = new THREE.MeshBasicMaterial({ color: 0x80f2ff });
      const highlight = new THREE.MeshBasicMaterial({ color: 0xe8ffff });
      const joint = new THREE.MeshStandardMaterial({ color: 0x183c51, metalness: .55, roughness: .3 });
      // Share geometry between all the scaled spheres rather than allocating one per part.
      const sphere = new THREE.SphereGeometry(1, companion ? 24 : 32, companion ? 16 : 24);
      const addBall = (parent: import("three").Object3D, material: import("three").Material, scale: [number, number, number], position: [number, number, number]) => {
        const ball = new THREE.Mesh(sphere, material);
        ball.scale.set(...scale); ball.position.set(...position); parent.add(ball); return ball;
      };
      // One shared robot for Labs and the companion. The head pivots as a unit.
      const head = new THREE.Group(); head.position.y = .7; robot.add(head);
      addBall(head, shell, [1.08, .82, .72], [0, 0, 0]);
      addBall(head, dark, [.88, .53, .16], [0, 0, .62]);
      const eyes = [-.33, .33].map(x => {
        const eye = new THREE.Group(); eye.position.set(x, .07, .77); head.add(eye);
        addBall(eye, glow, [.11, .13, .06], [0, 0, 0]);
        addBall(eye, highlight, [.025, .03, .012], [-.025, .035, .058]);
        return eye;
      });
      // A quiet visor reflection gives the existing face depth without changing its silhouette.
      const visorCurve = new THREE.EllipseCurve(0, 0, .64, .34, Math.PI * .25, Math.PI * .72, false, 0);
      const visorGeometry = new THREE.BufferGeometry().setFromPoints(visorCurve.getPoints(20).map(p => new THREE.Vector3(p.x, p.y, .77)));
      head.add(new THREE.Line(visorGeometry, new THREE.LineBasicMaterial({ color: 0xa0e9ee, transparent: true, opacity: .32 })));
      const smileCurve = new THREE.EllipseCurve(0, 0, .19, .12, Math.PI * 1.1, Math.PI * 1.9, false, 0);
      const smileGeometry = new THREE.BufferGeometry().setFromPoints(smileCurve.getPoints(24).map(p => new THREE.Vector3(p.x, p.y, .79)));
      const smile = new THREE.Line(smileGeometry, new THREE.LineBasicMaterial({ color: 0x8ceeff })); smile.position.y = -.17; head.add(smile);
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .4, 12), joint); antenna.position.set(0, .93, 0); head.add(antenna);
      addBall(head, glow, [.09, .09, .09], [0, 1.16, 0]);
      addBall(head, joint, [.16, .22, .2], [-1.05, 0, 0]); addBall(head, joint, [.16, .22, .2], [1.05, 0, 0]);
      // Small body, arms and feet: a friendly little work-in-progress companion.
      addBall(robot, shell, [.68, .72, .48], [0, -.48, 0]);
      addBall(robot, dark, [.37, .25, .08], [0, -.42, .45]);
      const core = addBall(robot, glow, [.085, .085, .035], [0, -.42, .52]);
      const coreRim = new THREE.Mesh(new THREE.TorusGeometry(.145, .012, 8, 32), new THREE.MeshBasicMaterial({ color: 0x9ce8e8, transparent: true, opacity: .65 }));
      coreRim.position.set(0, -.42, .53); robot.add(coreRim);
      const leftArm = addBall(robot, shell, [.22, .52, .22], [-.78, -.46, 0]); leftArm.rotation.z = -.48;
      const rightArm = new THREE.Group(); rightArm.position.set(.69, -.12, 0); rightArm.rotation.z = .48; robot.add(rightArm);
      addBall(rightArm, shell, [.22, .52, .22], [.08, -.34, 0]);
      addBall(rightArm, joint, [.23, .23, .23], [.08, -.76, .05]);
      addBall(robot, joint, [.23, .23, .23], [-.97, -.83, .05]);
      addBall(robot, shell, [.28, .18, .34], [-.36, -1.25, .08]); addBall(robot, shell, [.28, .18, .34], [.36, -1.25, .08]);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, .012, 8, 120), new THREE.MeshBasicMaterial({ color: 0x70d9eb, transparent: true, opacity: .35 }));
      ring.rotation.x = Math.PI / 2.6; ring.position.y = -1.4; scene.add(ring);
      addBall(ring, glow, [.035, .035, .035], [1.75, 0, 0]);
      const sparks = new THREE.Group(); scene.add(sparks);
      const smallSpark = new THREE.OctahedronGeometry(.02);
      const bigSpark = new THREE.OctahedronGeometry(.045);
      for (let i = 0; i < 18; i++) {
        const angle = i * 2.39996, radius = 1.55 + (i % 4) * .2;
        const spark = new THREE.Mesh(i % 5 === 0 ? bigSpark : smallSpark, glow);
        spark.position.set(Math.cos(angle) * radius, Math.sin(angle) * 1.65, Math.sin(angle * 1.6) * .5); sparks.add(spark);
      }
      scene.add(new THREE.AmbientLight(0xbcecff, 1.6));
      const light = new THREE.PointLight(0x8cf2ff, 45, 25); light.position.set(3, 4, 5); scene.add(light);
      const rimLight = new THREE.PointLight(0x69c9d4, 32, 20); rimLight.position.set(-4, 1, 1); scene.add(rimLight);
      let frame = 0, visible = false, pointerX = 0, pointerY = 0, lastDraw = 0;
      const pointer = (event: PointerEvent) => { if (event.pointerType === "touch") return; const rect = el.getBoundingClientRect(); pointerX = (event.clientX - rect.left) / rect.width - .5; pointerY = (event.clientY - rect.top) / rect.height - .5; };
      const leave = () => { pointerX = 0; pointerY = 0; };
      const draw = () => {
        if (disposed || !visible || document.hidden) return;
        const now = performance.now();
        if (companion && now - lastDraw < 40) { frame = requestAnimationFrame(draw); return; }
        lastDraw = now;
        const t = now * .001;
        robot.position.y = Math.sin(t * 1.15) * .08; robot.rotation.y += (pointerX * .35 - robot.rotation.y) * .025;
        robot.rotation.x += (-pointerY * .2 - robot.rotation.x) * .025;
        robot.rotation.z = Math.sin(t * .65) * .025;
        leftArm.rotation.z = -.48 + Math.sin(t * .8) * .045;
        // In the companion, gestures are scheduled by the UI only while visible.
        // Labs keeps its own occasional wave; the geometry is shared unchanged.
        const elapsed = gestureRef.current ? (now - gestureRef.current.started) / 1000 : -1;
        const hello = companion && gestureRef.current?.kind === "hello";
        const waveTime = companion ? (hello ? elapsed : -1) : (t + 3) % 23;
        const waveEnvelope = waveTime >= 0 && waveTime < 2.4 ? Math.sin(Math.PI * waveTime / 2.4) : 0;
        rightArm.rotation.z = .48 + waveEnvelope * (1.65 + Math.sin(waveTime * 7) * .22);
        const winkTime = companion && gestureRef.current?.kind === "wink" ? elapsed : -1;
        const winkTilt = winkTime >= 0 && winkTime < 1.2 ? Math.sin(Math.PI * winkTime / 1.2) : 0;
        head.rotation.z = Math.sin(t * .48) * .045 - waveEnvelope * .08 + winkTilt * .09;
        head.rotation.y = Math.sin(t * .37) * .07;
        const blinkPhase = (t + 2.4) % 7;
        const blink = blinkPhase < .18 ? 1 - Math.sin(Math.PI * blinkPhase / .18) * .88 : 1;
        const winkStart = hello ? .8 : .35;
        const winkPhase = elapsed - winkStart;
        const wink = companion && winkPhase >= 0 && winkPhase < .38 ? 1 - Math.sin(Math.PI * winkPhase / .38) * .92 : 1;
        // The face tracks gently within its visor; the core breathes rather than flashes.
        eyes[0].position.x = -.33 + pointerX * .035; eyes[1].position.x = .33 + pointerX * .035;
        const corePulse = 1 + Math.sin(t * 1.5) * .08;
        core.scale.set(.085 * corePulse, .085 * corePulse, .035);
        eyes[0].scale.y = blink;
        eyes[1].scale.y = blink * wink;
        ring.rotation.z = t * .08; sparks.rotation.y = t * .08;
        renderer.render(scene, camera); frame = requestAnimationFrame(draw);
      };
      const resize = () => { const { width, height } = el.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.position.z = companion ? 7.4 : width < 400 ? 9.5 : 8.6; camera.updateProjectionMatrix(); };
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; cancelAnimationFrame(frame); if (visible && !document.hidden) draw(); });
      const onVisibility = () => { cancelAnimationFrame(frame); if (visible && !document.hidden) draw(); };
      const onLost = (event: Event) => { event.preventDefault(); teardown?.(); };
      window.addEventListener("resize", resize); document.addEventListener("visibilitychange", onVisibility);
      el.addEventListener("pointermove", pointer); el.addEventListener("pointerleave", leave);
      renderer.domElement.addEventListener("webglcontextlost", onLost);
      teardown = () => {
        cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVisibility);
        el.removeEventListener("pointermove", pointer); el.removeEventListener("pointerleave", leave); renderer.domElement.removeEventListener("webglcontextlost", onLost);
        const geometries = new Set<import("three").BufferGeometry>(), materials = new Set<import("three").Material>();
        scene.traverse(object => { const mesh = object as import("three").Mesh; if (mesh.geometry) geometries.add(mesh.geometry); if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => materials.add(m)); });
        geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove();
        setReady(false); teardown = undefined;
      };
      observer.observe(el); resize(); setReady(true);
    };
    const onMotion = () => { if (motion.matches) teardown?.(); else void start(); };
    motion.addEventListener("change", onMotion); void start();
    return () => { disposed = true; motion.removeEventListener("change", onMotion); teardown?.(); };
  }, [companion, staticOnly]);

  return <div ref={host} className={`labs-bot ${ready ? "is-rendered" : ""}`} data-emote={gesture?.kind} data-emote-phase={gesture ? gesture.id % 2 : undefined} aria-hidden="true"><div className="labs-bot-halo" /><div className="labs-bot-fallback"><i className="labs-bot-antenna" /><div className="labs-bot-head"><div className="labs-bot-face"><i /><i /><span /></div></div><i className="labs-bot-arm left" /><i className="labs-bot-arm right" /><div className="labs-bot-body"><i /></div><i className="labs-bot-foot left" /><i className="labs-bot-foot right" /><i className="labs-bot-orbit" /></div></div>;
}
