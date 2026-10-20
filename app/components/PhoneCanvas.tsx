"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/iphone.glb";
const SCREEN_MATERIAL = "FTRPXsQynaenYUI";
// Turn the model if it loads facing away or sideways (radians, e.g. Math.PI)
const MODEL_ROTATION: [number, number, number] = [0, Math.PI, 0];
// Set to true if the screenshot shows upside down or mirrored
const SCREEN_FLIP_Y = false;
const SCREEN_FLIP_X = false;
const PHONE_HEIGHT = 0.78; // share of the screen height the phone fills

export type Pose = { ry: number; rx: number; rz: number };
type PoseRef = { current: Pose };

const DEG = Math.PI / 180;

function Phone({ poseRef, screens, activeScreen }: { poseRef: PoseRef; screens: string[]; activeScreen: string }) {
  const { scene } = useGLTF(MODEL_URL);
  const textures = useTexture(screens);
  const viewport = useThree((s) => s.viewport);
  const group = useRef<THREE.Group>(null);
  const shown = useRef(Math.max(0, screens.indexOf(activeScreen)));
  const fade = useRef(1);

  const { model, screenMat, uvBox, channel } = useMemo(() => {
    const s = scene.clone(true);
    s.rotation.set(...MODEL_ROTATION);
    s.updateMatrixWorld(true);

    // Find the display, and which texture coordinates its image used
    const found: THREE.Mesh[] = [];
    let uvChannel = 0;
    s.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const hit = mats.find((mt) => mt.name === SCREEN_MATERIAL) as THREE.MeshStandardMaterial | undefined;
      if (hit) {
        found.push(m);
        const tex = hit.emissiveMap ?? hit.map;
        if (tex) uvChannel = tex.channel;
      }
    });

    const box = { uMin: 0, uMax: 1, vMin: 0, vMax: 1 };
    const mat = new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide });
    const attrName = uvChannel === 0 ? "uv" : `uv${uvChannel}`;

    if (found.length > 0) {
      box.uMin = Infinity;
      box.vMin = Infinity;
      box.uMax = -Infinity;
      box.vMax = -Infinity;
      found.forEach((m) => {
        const uv = m.geometry.getAttribute(attrName) ?? m.geometry.getAttribute("uv");
        if (uv) {
          for (let i = 0; i < uv.count; i++) {
            box.uMin = Math.min(box.uMin, uv.getX(i));
            box.uMax = Math.max(box.uMax, uv.getX(i));
            box.vMin = Math.min(box.vMin, uv.getY(i));
            box.vMax = Math.max(box.vMax, uv.getY(i));
          }
        }
        m.material = mat;
      });
      if (!(box.uMax > box.uMin) || !(box.vMax > box.vMin)) {
        box.uMin = 0;
        box.uMax = 1;
        box.vMin = 0;
        box.vMax = 1;
      }
    }

    console.info("[PhoneCanvas] screen meshes:", found.length, "uv set:", attrName, "uv box:", box);

    const size = new THREE.Box3().setFromObject(s).getSize(new THREE.Vector3());
    const center = new THREE.Box3().setFromObject(s).getCenter(new THREE.Vector3());
    s.position.sub(center);
    const wrapper = new THREE.Group();
    wrapper.add(s);
    wrapper.scale.setScalar(1 / size.y);
    return { model: wrapper, screenMat: mat, uvBox: box, channel: uvChannel };
  }, [scene]);

  // Fit each screenshot exactly onto the display area
  useEffect(() => {
    const ru = 1 / (uvBox.uMax - uvBox.uMin);
    const rv = 1 / (uvBox.vMax - uvBox.vMin);
    textures.forEach((t) => {
      t.flipY = false;
      t.channel = channel;
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.anisotropy = 8;
      t.repeat.set(SCREEN_FLIP_X ? -ru : ru, SCREEN_FLIP_Y ? -rv : rv);
      t.offset.set(SCREEN_FLIP_X ? uvBox.uMax * ru : -uvBox.uMin * ru, SCREEN_FLIP_Y ? uvBox.vMax * rv : -uvBox.vMin * rv);
      t.needsUpdate = true;
    });
    screenMat.map = textures[shown.current] ?? textures[0];
    screenMat.needsUpdate = true;
  }, [textures, uvBox, screenMat, channel]);

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
