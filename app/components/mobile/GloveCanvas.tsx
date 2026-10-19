"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Text, useGLTF } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/glove.glb";
// If the model loads sideways or facing away, adjust these (radians, e.g. Math.PI / 2)
const MODEL_ROTATION: [number, number, number] = [0, 0, 0];

const FONT_URL = "/fonts/inter-latin-600-normal.woff";
const FONT_SIZE = 0.14;
const TEXT_RADIUS = 1.25; // distance of the text from the glove centre
const LINE_TOP = 0.28;
const LINE_GAP = 0.21;
const STAGGER = 0.06; // seconds between letters
const CHAR_DUR = 1.0; // seconds per letter animation
const FADE_OUT_SPEED = 1.4; // higher = text leaves faster
const FACING = 0.85; // how directly a phrase must face you before it appears
const SMOOTHING = 3.5; // lower = glove follows scroll more lazily

const PURPLE = "#a855f7";
const MAGENTA = "#d946ef";

type NumRef = { current: number };
type Glyph = { ch: string; angle: number; y: number; order: number };
type PhraseLayout = { base: number; glyphs: Glyph[]; duration: number };
type TroikaText = THREE.Mesh & { fillOpacity: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ProceduralGlove() {
  const leather = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0c0a12",
        roughness: 0.38,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.25,
        sheen: 0.6,
        sheenColor: new THREE.Color(PURPLE),
      }),
    []
  );
  return (
    <group position={[0, -0.1, 0]}>
      <mesh material={leather} position={[0, 0.45, 0]} scale={[1, 1.12, 0.92]}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <mesh material={leather} position={[0, 1.0, 0.28]} scale={[0.94, 0.58, 0.78]}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <mesh material={leather} position={[0.78, 0.3, 0.42]} rotation={[0.5, 0, -0.55]}>
        <capsuleGeometry args={[0.27, 0.62, 12, 32]} />
      </mesh>
      <mesh material={leather} position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.74, 0.68, 1.15, 64]} />
      </mesh>
    </group>
  );
}

function ModelGlove({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const s = scene.clone(true);
    s.rotation.set(...MODEL_ROTATION);
    s.updateMatrixWorld(true);
    s.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const src = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
      mesh.material = new THREE.MeshPhysicalMaterial({
        color: "#0c0a12",
        roughness: 0.38,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.25,
        sheen: 0.6,
        sheenColor: new THREE.Color(PURPLE),
        normalMap: src?.normalMap ?? null,
        roughnessMap: src?.roughnessMap ?? null,
        aoMap: src?.aoMap ?? null,
      });
    });
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    s.position.sub(center);
    const wrapper = new THREE.Group();
    wrapper.add(s);
    wrapper.scale.setScalar(2.8 / Math.max(size.x, size.y, size.z));
    return wrapper;
  }, [scene]);
  return <primitive object={model} />;
}

function useAdvances(phrases: string[][]) {
  const [adv, setAdv] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    let cancelled = false;
    const chars = Array.from(new Set(Array.from(phrases.flat().join(""))));
    const face = new FontFace("FiqGloveText", `url(${FONT_URL})`, { weight: "600" });
    face
      .load()
      .then((loaded) => {
        if (cancelled) return;
        document.fonts.add(loaded);
        const ctx = document.createElement("canvas").getContext("2d");
        if (!ctx) return;
        ctx.font = "600 100px FiqGloveText";
        const map: Record<string, number> = {};
        for (const c of chars) map[c] = ctx.measureText(c).width / 100;
        setAdv(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [phrases]);
  return adv;
}

function layoutPhrases(phrases: string[][], adv: Record<string, number>): PhraseLayout[] {
  return phrases.map((lines, pi) => {
    const base = (pi * Math.PI) / 2;
    const glyphs: Glyph[] = [];
    let order = 0;
    lines.forEach((line, li) => {
      const chars = Array.from(line);
      const widths = chars.map((c) => (adv[c] ?? 0.55) * FONT_SIZE);
      const total = widths.reduce((a, b) => a + b, 0);
      let x = -total / 2;
      chars.forEach((ch, ci) => {
        const w = widths[ci];
        if (ch !== " ") {
          glyphs.push({ ch, angle: base + (x + w / 2) / TEXT_RADIUS, y: LINE_TOP - li * LINE_GAP, order });
          order += 1;
        }
        x += w;
      });
    });
    return { base, glyphs, duration: Math.max(0, order - 1) * STAGGER + CHAR_DUR };
  });
}

function GloveRig({ progress, offset, phrases }: { progress: NumRef; offset: NumRef; phrases: string[][] }) {
  const group = useRef<THREE.Group>(null);
  const glyphRefs = useRef<(TroikaText | null)[][]>([]);
  const phase = useRef<number[]>([]);
  const viewport = useThree((s) => s.viewport);
  const scale = viewport.width * 0.37;
  const adv = useAdvances(phrases);
  const layout = useMemo(() => (adv ? layoutPhrases(phrases, adv) : null), [adv, phrases]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-delta * SMOOTHING);
    const p = progress.current;

    // One full turn while the glove is on screen; each phrase gets a quarter
    const q = clamp((p - 0.24) / 0.52, 0, 1);
    const targetRotY = -(q - 0.125) * Math.PI * 2;
    g.rotation.y += (targetRotY - g.rotation.y) * k;
    g.rotation.x = 0.08 + Math.sin(t * 0.7) * 0.03;

    // Position comes from the page scroll, plus a gentle float
    const targetY = offset.current * viewport.height + Math.sin(t * 1.2) * 0.04 * scale;
    g.position.y += (targetY - g.position.y) * (1 - Math.exp(-delta * 12));

    if (!layout) return;
    layout.forEach((ph, pi) => {
      const on = Math.cos(g.rotation.y + ph.base) > FACING;
      const next = clamp((phase.current[pi] ?? 0) + delta * (on ? 1 : -FADE_OUT_SPEED), 0, ph.duration);
      phase.current[pi] = next;
      const row = glyphRefs.current[pi];
      if (!row) return;
      ph.glyphs.forEach((gl, gi) => {
        const m = row[gi];
        if (!m) return;
        const raw = clamp((next - gl.order * STAGGER) / CHAR_DUR, 0, 1);
        const e = 1 - Math.pow(1 - raw, 3);
        m.visible = e > 0.001;
        m.fillOpacity = e;
        m.position.y = gl.y + (1 - e) * 0.25;
        m.rotation.z = (1 - e) * (gl.order % 2 ? 0.45 : -0.45);
        m.scale.setScalar(0.6 + 0.4 * e);
      });
    });
  });

  return (
    <group ref={group} scale={scale}>
      <Boundary fallback={<ProceduralGlove />}>
        <Suspense fallback={null}>
          <ModelGlove url={MODEL_URL} />
        </Suspense>
      </Boundary>
      <Boundary fallback={null}>
        <Suspense fallback={null}>
          {layout?.map((ph, pi) =>
            ph.glyphs.map((gl, gi) => (
              <group key={`${pi}-${gi}`} rotation={[0, gl.angle, 0]}>
                <Text
                  ref={(m) => {
                    if (!glyphRefs.current[pi]) glyphRefs.current[pi] = [];
                    glyphRefs.current[pi][gi] = m as unknown as TroikaText | null;
                  }}
                  font={FONT_URL}
                  fontSize={FONT_SIZE}
                  position={[0, gl.y, TEXT_RADIUS]}
                  anchorX="center"
                  anchorY="middle"
                  color="#ffffff"
                  fillOpacity={0}
                  visible={false}
                >
                  {gl.ch}
                </Text>
              </group>
            ))
          )}
        </Suspense>
      </Boundary>
    </group>
  );
}

export default function GloveCanvas({
  progress,
  offset,
  active,
  phrases,
}: {
  progress: NumRef;
  offset: NumRef;
  active: boolean;
  phrases: string[][];
}) {
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
      <GloveRig progress={progress} offset={offset} phrases={phrases} />
    </Canvas>
  );
}
