"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// Set to "/models/glove.glb" once you have a model in public/models
const MODEL_URL: string | null = null;

const PURPLE = "#a855f7";
const MAGENTA = "#d946ef";

type Progress = { current: number };

function useGloveMaterials() {
  return useMemo(
    () => ({
      leather: new THREE.MeshPhysicalMaterial({
        color: "#0c0a12",
        roughness: 0.38,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.25,
        sheen: 0.6,
        sheenColor: new THREE.Color(PURPLE),
      }),
      glow: new THREE.MeshStandardMaterial({
        color: PURPLE,
        emissive: new THREE.Color(PURPLE),
        emissiveIntensity: 2.2,
        roughness: 0.3,
      }),
      trim: new THREE.MeshPhysicalMaterial({ color: "#1a1324", roughness: 0.5, clearcoat: 0.6 }),
    }),
    []
  );
}

function ProceduralGlove() {
  const m = useGloveMaterials();
  return (
    <group position={[0, -0.1, 0]}>
      {/* Fist */}
      <mesh material={m.leather} position={[0, 0.45, 0]} scale={[1, 1.12, 0.92]}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      {/* Curled fingers */}
      <mesh material={m.leather} position={[0, 1.0, 0.28]} scale={[0.94, 0.58, 0.78]}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      {/* Thumb */}
      <mesh material={m.leather} position={[0.78, 0.3, 0.42]} rotation={[0.5, 0, -0.55]}>
        <capsuleGeometry args={[0.27, 0.62, 12, 32]} />
      </mesh>
      {/* Cuff */}
      <mesh material={m.leather} position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.74, 0.68, 1.15, 64]} />
      </mesh>
      {/* Glowing bands */}
      <mesh material={m.glow} position={[0, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.76, 0.045, 16, 96]} />
      </mesh>
      <mesh material={m.glow} position={[0, -1.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.69, 0.05, 16, 96]} />
      </mesh>
      {/* Strap */}
      <mesh material={m.trim} position={[0, -0.8, 0.66]}>
        <boxGeometry args={[0.9, 0.42, 0.12]} />
      </mesh>
      <mesh material={m.glow} position={[0, -0.8, 0.73]}>
        <boxGeometry args={[0.55, 0.05, 0.02]} />
      </mesh>
    </group>
  );
}

function ModelGlove({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const m = useGloveMaterials();
  const model = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    s.position.sub(center);
    s.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.material = m.leather;
    });
    const wrapper = new THREE.Group();
    wrapper.add(s);
    wrapper.scale.setScalar(2.8 / Math.max(size.x, size.y, size.z));
    return wrapper;
  }, [scene, m]);
  return <primitive object={model} />;
}

function GloveRig({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);
  const scale = viewport.width * 0.37;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-delta * 6);

    const targetRotY = -0.6 + p * Math.PI * 2;
    const targetRotX = 0.18 + Math.sin(p * Math.PI * 2) * 0.22;
    g.rotation.y += (targetRotY - g.rotation.y) * k;
    g.rotation.x += (targetRotX - g.rotation.x) * k;
    g.rotation.z = Math.sin(t * 0.8) * 0.04;

    // Drift down slightly slower than the page, plus a gentle float
    const targetY = (0.5 - p) * viewport.height * 0.18 + Math.sin(t * 1.2) * 0.04 * scale;
    g.position.y += (targetY - g.position.y) * k;
  });

  return (
    <group ref={group} scale={scale}>
      {MODEL_URL ? <ModelGlove url={MODEL_URL} /> : <ProceduralGlove />}
    </group>
  );
}

export default function GloveCanvas({ progress, active }: { progress: Progress; active: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 8], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-3, 1, -2]} intensity={40} color={PURPLE} distance={12} />
      <pointLight position={[3, -2, -1]} intensity={30} color={MAGENTA} distance={12} />
      <pointLight position={[0, 0, 4]} intensity={6} color="#c4b5fd" distance={10} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 4, 4]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={4} color={PURPLE} position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={3} color={MAGENTA} position={[4, -1, 1]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <GloveRig progress={progress} />
      </Suspense>
    </Canvas>
  );
}
