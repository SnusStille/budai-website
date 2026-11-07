"use client";

import { useEffect, useRef, useState } from "react";

/** Decorative, self-contained WebGL sculpture. Static CSS art remains if WebGL
 * is unavailable or the visitor prefers reduced motion. No persistent render loop
 * runs when the sculpture is offscreen or the tab is hidden. */
export default function LabsSculpture() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let teardown: (() => void) | undefined;
    const start = async () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (media.matches || connection?.saveData || disposed || teardown) return;
      let THREE: typeof import("three");
      try { THREE = await import("three"); } catch { return; }
      if (disposed || media.matches || teardown) return;
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 9);
      const group = new THREE.Group();
      scene.add(group);
      const coreGeometry = new THREE.IcosahedronGeometry(1.12, 1);
      const coreMaterial = new THREE.MeshPhysicalMaterial({ color: 0x294f63, metalness: 0.62, roughness: 0.27, transparent: true, opacity: 0.48, side: THREE.DoubleSide });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      group.add(core);
      const edgesBase = new THREE.IcosahedronGeometry(1.13, 1);
      const edgesGeometry = new THREE.EdgesGeometry(edgesBase);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x8deaff, transparent: true, opacity: 0.57 });
      group.add(new THREE.LineSegments(edgesGeometry, edgesMaterial));
      const shellGeometry = new THREE.IcosahedronGeometry(1.65, 0);
      const shellEdges = new THREE.EdgesGeometry(shellGeometry);
      const shellMaterial = new THREE.LineBasicMaterial({ color: 0x75cae4, transparent: true, opacity: 0.27 });
      const shell = new THREE.LineSegments(shellEdges, shellMaterial);
      group.add(shell);
      const rings: import("three").LineLoop[] = [];
      const ringMaterials: import("three").LineBasicMaterial[] = [];
      const ringGeometries: import("three").BufferGeometry[] = [];
      for (let j = 0; j < 3; j++) {
        const points = Array.from({ length: 140 }, (_, i) => {
          const a = (i / 140) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * (2.1 + j * 0.16), Math.sin(a) * (2.1 + j * 0.16), 0);
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: j === 1 ? 0x9f9de4 : 0x71cbe4, transparent: true, opacity: 0.25 });
        const ring = new THREE.LineLoop(geometry, material);
        ring.rotation.set(0.85 + j * 0.52, 0.28 + j * 0.8, j * 0.42);
        group.add(ring); rings.push(ring); ringMaterials.push(material); ringGeometries.push(geometry);
      }
      // A small constellation gives the core depth, echoing the BudAI neural field.
      const positions: number[] = [];
      const colors: number[] = [];
      const points: import("three").Vector3[] = [];
      const cyan = new THREE.Color(0x78eaff), purple = new THREE.Color(0x8c80ff);
      for (let i = 0; i < 560; i++) {
        const y = 1 - (i / 559) * 2;
        const theta = i * 2.399963;
        const radius = 2.05 + 0.36 * (0.5 + 0.5 * Math.sin(i * 9.7));
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const point = new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius);
        points.push(point); positions.push(point.x, point.y, point.z);
        const color = cyan.clone().lerp(purple, (Math.sin(i * 12.7) + 1) * .5);
        colors.push(color.r, color.g, color.b);
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      particleGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      const particleMaterial = new THREE.PointsMaterial({ size: .035, vertexColors: true, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      group.add(particles);
      const connections: number[] = [];
      for (let i = 0; i < points.length; i += 3) {
        const target = points[(i + 34) % points.length];
        connections.push(points[i].x, points[i].y, points[i].z, target.x, target.y, target.z);
      }
      const linksGeometry = new THREE.BufferGeometry();
      linksGeometry.setAttribute("position", new THREE.Float32BufferAttribute(connections, 3));
      const linksMaterial = new THREE.LineBasicMaterial({ color: 0x55c8ed, transparent: true, opacity: .09, depthWrite: false });
      group.add(new THREE.LineSegments(linksGeometry, linksMaterial));
      const satelliteGeometry = new THREE.OctahedronGeometry(.085, 0);
      const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0xb7f5ff });
      const satellites = [0, 1, 2].map((i) => {
        const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
        satellite.position.set(Math.cos(i * 2.1) * 2.38, Math.sin(i * 2.1) * 1.3, Math.sin(i * 2.1) * 2);
        group.add(satellite); return satellite;
      });
      scene.add(new THREE.AmbientLight(0xa2dcff, 1.2));
      const light = new THREE.PointLight(0x86eaff, 30, 20); light.position.set(3, 3, 5); scene.add(light);
      const violet = new THREE.PointLight(0x837be8, 20, 20); violet.position.set(-4, -1, 2); scene.add(violet);
      let frame = 0; let visible = true;
      let pointerX = 0, pointerY = 0, tiltX = 0, tiltY = 0, scrollDepth = 0;
      const onPointer = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        const rect = el.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2;
        pointerY = ((event.clientY - rect.top) / rect.height - .5) * 2;
      };
      const onPointerLeave = () => { pointerX = 0; pointerY = 0; };
      const onScroll = () => { scrollDepth = Math.max(0, Math.min(1, window.scrollY / Math.max(window.innerHeight, 1))); };
      el.addEventListener("pointermove", onPointer);
      el.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      const draw = () => {
        if (disposed || !visible || document.hidden) return;
        tiltX += (pointerY * .12 - tiltX) * .035;
        tiltY += (pointerX * .16 - tiltY) * .035;
        group.rotation.y += 0.0015; group.rotation.x = 0.14 + Math.sin(performance.now() * 0.00025) * 0.08 + tiltX;
        group.rotation.z = tiltY; group.position.y = scrollDepth * .22;
        core.rotation.y -= 0.001; shell.rotation.z += 0.0005; particles.rotation.y += .0003; satellites.forEach((satellite) => { satellite.rotation.y += .005; });
        renderer.render(scene, camera); frame = requestAnimationFrame(draw);
      };
      const resize = () => { const { width, height } = el.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.position.z = width < 450 ? 10.5 : 9; camera.updateProjectionMatrix(); };
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; cancelAnimationFrame(frame); if (visible && !document.hidden) draw(); });
      const onVisibility = () => { cancelAnimationFrame(frame); if (!document.hidden && visible) draw(); };
      const onLost = (event: Event) => { event.preventDefault(); setReady(false); cancelAnimationFrame(frame); };
      renderer.domElement.addEventListener("webglcontextlost", onLost);
      window.addEventListener("resize", resize); document.addEventListener("visibilitychange", onVisibility);
      observer.observe(el); resize(); draw(); setReady(true);
      teardown = () => {
        cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVisibility);
        el.removeEventListener("pointermove", onPointer); el.removeEventListener("pointerleave", onPointerLeave); window.removeEventListener("scroll", onScroll);
        renderer.domElement.removeEventListener("webglcontextlost", onLost); renderer.domElement.remove();
        coreGeometry.dispose(); coreMaterial.dispose(); edgesBase.dispose(); edgesGeometry.dispose(); edgesMaterial.dispose(); shellGeometry.dispose(); shellEdges.dispose(); shellMaterial.dispose();
        ringMaterials.forEach(m => m.dispose()); ringGeometries.forEach(g => g.dispose());
        particleGeometry.dispose(); particleMaterial.dispose(); linksGeometry.dispose(); linksMaterial.dispose(); satelliteGeometry.dispose(); satelliteMaterial.dispose(); renderer.dispose();
        setReady(false); teardown = undefined;
      };
    };
    const change = () => { if (media.matches) teardown?.(); else void start(); };
    media.addEventListener("change", change); void start();
    return () => { disposed = true; media.removeEventListener("change", change); teardown?.(); };
  }, []);

  return <div ref={host} className={`lab-art ${ready ? "is-rendered" : ""}`} aria-hidden="true">
    <div className="lab-art-glow" /><div className="lab-art-fallback"><i /><i /><i /><span /></div>
    <div className="lab-art-cross lab-art-cross-a">+</div><div className="lab-art-cross lab-art-cross-b">+</div>
    <span className="lab-art-coordinate lab-art-coordinate-a">GENERATIVE / FORM</span><span className="lab-art-coordinate lab-art-coordinate-b">OBJECT 001 / LABS</span>
  </div>;
}
