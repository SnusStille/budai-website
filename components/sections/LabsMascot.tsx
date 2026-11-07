"use client";

import { useEffect, useRef, useState } from "react";

/** A small decorative robot. Reduced motion, save-data and WebGL failure use CSS art. */
export default function LabsMascot() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
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
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
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
      const joint = new THREE.MeshStandardMaterial({ color: 0x183c51, metalness: .55, roughness: .3 });
      const addBall = (parent: import("three").Object3D, material: import("three").Material, scale: [number, number, number], position: [number, number, number]) => {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
        ball.scale.set(...scale); ball.position.set(...position); parent.add(ball); return ball;
      };
      // Rounded head, glass face, bright eyes and an antenna.
      addBall(robot, shell, [1.08, .82, .72], [0, .7, 0]);
      addBall(robot, dark, [.88, .53, .16], [0, .7, .62]);
      const eyes = [
        addBall(robot, glow, [.11, .13, .06], [-.33, .77, .77]),
        addBall(robot, glow, [.11, .13, .06], [.33, .77, .77]),
      ];
      const smileCurve = new THREE.EllipseCurve(0, 0, .19, .12, Math.PI * 1.1, Math.PI * 1.9, false, 0);
      const smileGeometry = new THREE.BufferGeometry().setFromPoints(smileCurve.getPoints(24).map(p => new THREE.Vector3(p.x, p.y, .79)));
      const smile = new THREE.Line(smileGeometry, new THREE.LineBasicMaterial({ color: 0x8ceeff })); smile.position.y = .53; robot.add(smile);
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .4, 12), joint); antenna.position.set(0, 1.63, 0); robot.add(antenna);
      addBall(robot, glow, [.09, .09, .09], [0, 1.86, 0]);
      addBall(robot, joint, [.16, .22, .2], [-1.05, .7, 0]); addBall(robot, joint, [.16, .22, .2], [1.05, .7, 0]);
      // Small body, arms and feet: a friendly little work-in-progress companion.
      addBall(robot, shell, [.68, .72, .48], [0, -.48, 0]);
      addBall(robot, dark, [.37, .25, .08], [0, -.42, .45]);
      addBall(robot, glow, [.085, .085, .035], [0, -.42, .52]);
      const leftArm = addBall(robot, shell, [.22, .52, .22], [-.78, -.46, 0]); leftArm.rotation.z = -.48;
      const rightArm = addBall(robot, shell, [.22, .52, .22], [.78, -.46, 0]); rightArm.rotation.z = .48;
      addBall(robot, joint, [.23, .23, .23], [-.97, -.83, .05]); addBall(robot, joint, [.23, .23, .23], [.97, -.83, .05]);
      addBall(robot, shell, [.28, .18, .34], [-.36, -1.25, .08]); addBall(robot, shell, [.28, .18, .34], [.36, -1.25, .08]);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, .012, 8, 120), new THREE.MeshBasicMaterial({ color: 0x70d9eb, transparent: true, opacity: .35 }));
      ring.rotation.x = Math.PI / 2.6; ring.position.y = -1.4; scene.add(ring);
      const sparks = new THREE.Group(); scene.add(sparks);
      for (let i = 0; i < 18; i++) {
        const angle = i * 2.39996, radius = 1.55 + (i % 4) * .2;
        const spark = new THREE.Mesh(new THREE.OctahedronGeometry(i % 5 === 0 ? .045 : .02), glow);
        spark.position.set(Math.cos(angle) * radius, Math.sin(angle) * 1.65, Math.sin(angle * 1.6) * .5); sparks.add(spark);
      }
      scene.add(new THREE.AmbientLight(0xbcecff, 1.6));
      const light = new THREE.PointLight(0x8cf2ff, 45, 25); light.position.set(3, 4, 5); scene.add(light);
      const violet = new THREE.PointLight(0x8674ff, 32, 20); violet.position.set(-4, 1, 1); scene.add(violet);
      let frame = 0, visible = false, pointerX = 0, pointerY = 0;
      const pointer = (event: PointerEvent) => { if (event.pointerType === "touch") return; const rect = el.getBoundingClientRect(); pointerX = (event.clientX - rect.left) / rect.width - .5; pointerY = (event.clientY - rect.top) / rect.height - .5; };
      const leave = () => { pointerX = 0; pointerY = 0; };
      const draw = () => {
        if (disposed || !visible || document.hidden) return;
        const t = performance.now() * .001;
        robot.position.y = Math.sin(t * 1.15) * .08; robot.rotation.y += (pointerX * .35 - robot.rotation.y) * .025;
        robot.rotation.x += (-pointerY * .2 - robot.rotation.x) * .025;
        robot.rotation.z = Math.sin(t * .65) * .025;
        leftArm.rotation.z = -.48 + Math.sin(t * .8) * .045;
        rightArm.rotation.z = .48 - Math.sin(t * .8) * .045;
        const blinkPhase = (t + 2.4) % 7;
        const blink = blinkPhase < .18 ? 1 - Math.sin(Math.PI * blinkPhase / .18) * .88 : 1;
        eyes.forEach(eye => { eye.scale.y = .13 * blink; });
        ring.rotation.z = t * .08; sparks.rotation.y = t * .08;
        renderer.render(scene, camera); frame = requestAnimationFrame(draw);
      };
      const resize = () => { const { width, height } = el.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.position.z = width < 400 ? 9.5 : 8.6; camera.updateProjectionMatrix(); };
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
  }, []);

  return <div ref={host} className={`labs-bot ${ready ? "is-rendered" : ""}`} aria-hidden="true"><div className="labs-bot-halo" /><div className="labs-bot-fallback"><i className="labs-bot-antenna" /><div className="labs-bot-head"><div className="labs-bot-face"><i /><i /><span /></div></div><div className="labs-bot-body"><i /></div><i className="labs-bot-orbit" /></div></div>;
}
