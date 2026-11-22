import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function disposeModel(model) {
  const geometries = new Set();
  const materials = new Set();
  model.traverse((child) => {
    if (child.geometry) geometries.add(child.geometry);
    if (child.material) for (const material of Array.isArray(child.material) ? child.material : [child.material]) materials.add(material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

export default function EmblemCanvas({ active, rotating, onReady, onError }) {
  const host = useRef(null);
  const runtime = useRef(null);
  const callbacks = useRef({ onReady, onError });
  useEffect(() => { callbacks.current = { onReady, onError }; }, [onReady, onError]);
  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let lastPaint = 0;
    let model;
    let renderer;
    const state = { active: false, rotating: false };
    let pointer;
    let lastInteraction = 0;
    let restingYaw = -0.15;
    let idlePhase = 0;
    const element = host.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
    camera.position.set(2.8, 2.35, 4.8);
    camera.lookAt(0, 0.75, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x84969a, 2));
    const key = new THREE.DirectionalLight(0xfff3db, 2.5);
    key.position.set(2, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9dded5, 1.5);
    rim.position.set(-4, 2, -2);
    scene.add(rim);
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      element.appendChild(renderer.domElement);
    } catch {
      callbacks.current.onError();
      return;
    }
    function schedule() {
      if (!disposed && !frame && state.active && !document.hidden && model) frame = requestAnimationFrame(draw);
    }
    function draw(now) {
      frame = 0;
      if (disposed || !state.active || document.hidden || !model) return;
      if (state.rotating && now - lastPaint < 1000 / 30) { schedule(); return; }
      const delta = Math.min(now - lastPaint, 60) / 1000;
      if (state.rotating && !pointer && now - lastInteraction > 2000) {
        idlePhase += delta * 0.35;
        model.rotation.y = restingYaw + Math.sin(idlePhase) * 0.28;
      }
      renderer.render(scene, camera);
      lastPaint = now;
      if (state.rotating) schedule();
    }
    function update(settings) {
      Object.assign(state, settings);
      if (!state.active || document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else schedule();
    }
    function resize() {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      // Keep the artwork near the copy rather than centering it in a wide column.
      const artworkWidth = Math.min(width, height * 1.1);
      camera.aspect = artworkWidth / height;
      renderer.setViewport(0, 0, artworkWidth, height);
      camera.updateProjectionMatrix();
      schedule();
    }
    function pointerDown(event) {
      if (event.button !== 0 || !model) return;
      pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
      element.setPointerCapture(event.pointerId);
      element.focus({ preventScroll: true });
      lastInteraction = performance.now();
      restingYaw = model.rotation.y;
      idlePhase = 0;
    }
    function pointerMove(event) {
      if (!pointer || event.pointerId !== pointer.id || !model) return;
      model.rotation.y += (event.clientX - pointer.x) * 0.009;
      model.rotation.x = THREE.MathUtils.clamp(model.rotation.x + (event.clientY - pointer.y) * 0.004, -0.3, 0.3);
      pointer = { ...pointer, x: event.clientX, y: event.clientY };
      lastInteraction = performance.now();
      restingYaw = model.rotation.y;
      idlePhase = 0;
      schedule();
    }
    function pointerUp() {
      pointer = null;
      lastInteraction = performance.now();
      if (model) restingYaw = model.rotation.y;
      idlePhase = 0;
    }
    function keyDown(event) {
      if (!model || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      lastInteraction = performance.now();
      restingYaw = model.rotation.y;
      idlePhase = 0;
      if (event.key === 'ArrowLeft') model.rotation.y -= 0.15;
      if (event.key === 'ArrowRight') model.rotation.y += 0.15;
      if (event.key === 'ArrowUp') model.rotation.x = Math.max(-0.3, model.rotation.x - 0.08);
      if (event.key === 'ArrowDown') model.rotation.x = Math.min(0.3, model.rotation.x + 0.08);
      restingYaw = model.rotation.y;
      schedule();
    }
    const visibility = () => update({});
    const contextLost = (event) => { event.preventDefault(); callbacks.current.onError(); };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    for (const [event, handler] of [['pointerdown', pointerDown], ['pointermove', pointerMove], ['pointerup', pointerUp], ['pointercancel', pointerUp], ['lostpointercapture', pointerUp], ['keydown', keyDown]]) element.addEventListener(event, handler);
    document.addEventListener('visibilitychange', visibility);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    runtime.current = { update };
    new GLTFLoader().loadAsync('/models/gk-learning-emblem.glb').then((gltf) => {
      if (disposed) { disposeModel(gltf.scene); return; }
      model = gltf.scene;
      model.rotation.y = -0.15;
      scene.add(model);
      resize();
      schedule();
      callbacks.current.onReady();
    }).catch(() => { if (!disposed) callbacks.current.onError(); });
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      runtime.current = null;
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      for (const [event, handler] of [['pointerdown', pointerDown], ['pointermove', pointerMove], ['pointerup', pointerUp], ['pointercancel', pointerUp], ['lostpointercapture', pointerUp], ['keydown', keyDown]]) element.removeEventListener(event, handler);
      if (model) disposeModel(model);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  useEffect(() => { runtime.current?.update({ active, rotating }); }, [active, rotating]);
  return <div className="gk-emblem-canvas" ref={host} role="group" tabIndex={0} aria-label="Mô hình 3D cuốn sách và mũ tốt nghiệp GK" aria-describedby="gk-emblem-instructions" />;
}
