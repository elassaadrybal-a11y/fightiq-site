"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/iphone.glb";
const SCREEN_MATERIAL = "FTRPXsQynaenYUI";
// Turn the model if it loads facing away or sideways (radians, e.g. Math.PI)
const MODEL_ROTATION: [number, number, number] = [0, Math.PI, 0];
const PHONE_HEIGHT = 0.78; // share of the screen height the phone fills
const SCREEN_RADIUS = 0.14; // display corner rounding, as a share of its width
const SCREEN_INSET = 0; // shrink the screenshot inward if it covers the bezel (e.g. 0.01)
const IMAGE_ASPECT = 1242 / 2688; // width / height of the screenshots

export type Pose = { ry: number; rx: number; rz: number };
type PoseRef = { current: Pose };

const DEG = Math.PI / 180;

function roundedScreen(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 16);
  // Map the image across the whole shape (0 to 1 in both directions)
  const pos = g.getAttribute("position");
  const uv = g.getAttribute("uv");
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  }
  uv.needsUpdate = true;
  return g;
}

function Phone({ poseRef, screens, activeScreen }: { poseRef: PoseRef; screens: string[]; activeScreen: string }) {
  const { scene } = useGLTF(MODEL_URL);
  const textures = useTexture(screens);
  const viewport = useThree((s) => s.viewport);
  const group = useRef<THREE.Group>(null);
  const shown = useRef(Math.max(0, screens.indexOf(activeScreen)));
  const fade = useRef(1);

  const { model, screenMat } = useMemo(() => {
    const s = scene.clone(true);
    s.rotation.set(...MODEL_ROTATION);
    const inner = new THREE.Group();
    inner.add(s);
    inner.updateMatrixWorld(true);

    // Find the model's display and measure where it sits
    const black = new THREE.MeshBasicMaterial({ color: "#000000" });
    const screenBox = new THREE.Box3();
    let found = 0;
    s.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      if (mats.some((mt) => mt.name === SCREEN_MATERIAL)) {
        screenBox.union(new THREE.Box3().setFromObject(m));
        m.material = black;
        found += 1;
      }
    });

    const phoneBox = new THREE.Box3().setFromObject(inner);
    const phoneSize = phoneBox.getSize(new THREE.Vector3());
    const box = found > 0 ? screenBox : phoneBox;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const w = size.x * (1 - SCREEN_INSET * 2);
    const h = size.y * (1 - SCREEN_INSET * 2 * (size.x / size.y));
    console.info("[PhoneCanvas] screen meshes:", found, "screen size:", size.x.toFixed(3), size.y.toFixed(3));

    // Scale each screenshot to fill the display without stretching, aligned to the top
    const planeAspect = w / h;
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      if (planeAspect > IMAGE_ASPECT) {
        const r = IMAGE_ASPECT / planeAspect;
        t.repeat.set(1, r);
        t.offset.set(0, 1 - r);
      } else {
        const r = planeAspect / IMAGE_ASPECT;
        t.repeat.set(r, 1);
        t.offset.set((1 - r) / 2, 0);
      }
      t.needsUpdate = true;
    });

    const mat = new THREE.MeshBasicMaterial({ map: textures[shown.current] ?? textures[0], toneMapped: false });
    const screen = new THREE.Mesh(roundedScreen(w, h, w * SCREEN_RADIUS), mat);
    screen.position.set(center.x, center.y, box.max.z + phoneSize.y * 0.0004);
    inner.add(screen);

    // Centre the phone and scale it to a height of 1
    inner.position.sub(phoneBox.getCenter(new THREE.Vector3()));
    const wrapper = new THREE.Group();
    wrapper.add(inner);
    wrapper.scale.setScalar(1 / phoneSize.y);
    return { model: wrapper, screenMat: mat };
  }, [scene, textures]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = poseRef.current;
    g.rotation.order = "YXZ";
    g.rotation.set(-p.rx * DEG, p.ry * DEG, -p.rz * DEG);
    g.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.012 * viewport.height;

    // Dim the display, swap the screenshot, light it back up
    const target = Math.max(0, screens.indexOf(activeScreen));
    if (target !== shown.current) {
      fade.current -= delta * 6;
      if (fade.current <= 0) {
        fade.current = 0;
        shown.current = target;
        screenMat.map = textures[target];
        screenMat.needsUpdate = true;
      }
    } else {
      fade.current = Math.min(1, fade.current + delta * 6);
    }
    screenMat.color.setScalar(0.12 + 0.88 * fade.current);
  });

  return (
    <group ref={group} scale={viewport.height * PHONE_HEIGHT}>
      <primitive object={model} />
    </group>
  );
}

export default function PhoneCanvas({
  poseRef,
  screens,
  activeScreen,
}: {
  poseRef: PoseRef;
  screens: string[];
  activeScreen: string;
}) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 3, 4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#a855f7" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[4, 8, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Phone poseRef={poseRef} screens={screens} activeScreen={activeScreen} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
