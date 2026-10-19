"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Text, useGLTF } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/glove.glb";
// If the model loads sideways or facing away, adjust these (radians, e.g. Math.PI / 2)
const MODEL_ROTATION: [number, number, number] = [0, 0, 0];

const GLOVE_SIZE = 0.55; // share of the screen width the glove fills
const GLOVE_COLOR = "#24104a"; // dark purple

const FONT_URL = "/fonts/inter-latin-600-normal.woff";
const FONT_SIZE = 0.095;
const TEXT_RADIUS = 1.2; // distance of the text from the glove centre
const LINE_GAP = 0.145;
const LINE_INDENT = 0.05; // second line shifts slightly right
// First-line height of each phrase on the glove (glove is about 2.8 tall, centred on 0)
const PHRASE_HEIGHTS = [0.55, 0.0, 0.4, -0.25];

const STAGGER = 0.05; // seconds between letters
const CHAR_DUR = 0.7; // seconds for each letter to settle
const RISE = 0.22; // how high a letter starts before dropping into place
const WRITE_AT = 0.7; // phrase starts writing when it faces you this directly
const RESET_AT = -0.5; // phrase resets once it is this far round the back

// Must match OUTRO_START in GloveFeatures.tsx
const OUTRO_START = 0.86; // share of the section used for the full turn
const SMOOTHING = 3.5; // lower = glove follows scroll more lazily

const PURPLE = "#a855f7";
const MAGENTA = "#d946ef";

type NumRef = { current: number };
type Glyph = { ch: string; angle: number; y: number; order: number; indent: number };
type PhraseLayout = { base: number; glyphs: Glyph[]; duration: number };
type TroikaText = THREE.Mesh & { fillOpacity: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const RIM_COLOR = "#c084fc"; // glow around the glove's edges
const RIM_STRENGTH = 1.4; // higher = stronger edge glow

function makeMatte() {
  const m = new THREE.MeshPhysicalMaterial({
    color: GLOVE_COLOR,
    roughness: 0.32,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    sheen: 0.8,
    sheenColor: new THREE.Color(PURPLE),
    emissive: new THREE.Color("#5b21b6"),
    emissiveIntensity: 0.25,
    side: THREE.DoubleSide,
  });
  // Keep the scan's own normals (its triangles don't all face the same way),
  // and add a glow that is strongest at the glove's outline.
  m.onBeforeCompile = (shader) => {
    shader.uniforms.rimColor = { value: new THREE.Color(RIM_COLOR) };
    shader.uniforms.rimStrength = { value: RIM_STRENGTH };
    shader.fragmentShader =
      "uniform vec3 rimColor;\nuniform float rimStrength;\n" +
      shader.fragmentShader
        .replace(
          "#include <normal_fragment_begin>",
          THREE.ShaderChunk.normal_fragment_begin.split("normal *= faceDirection;").join("")
        )
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\nfloat fiqRim = pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 2.5);\ntotalEmissiveRadiance += rimColor * fiqRim * rimStrength;"
        );
  };
  return m;
}

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
  const matte = useMemo(makeMatte, []);
  return (
    <group position={[0, -0.1, 0]}>
      <mesh material={matte} position={[0, 0.45, 0]} scale={[1, 1.12, 0.92]}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <mesh material={matte} position={[0, 1.0, 0.28]} scale={[0.94, 0.58, 0.78]}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <mesh material={matte} position={[0.78, 0.3, 0.42]} rotation={[0.5, 0, -0.55]}>
        <capsuleGeometry args={[0.27, 0.62, 12, 32]} />
      </mesh>
      <mesh material={matte} position={[0, -0.75, 0]}>
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
    const matte = makeMatte();
    s.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.material = matte;
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
    const base = (pi * Math.PI * 2) / phrases.length;
    const top = PHRASE_HEIGHTS[pi % PHRASE_HEIGHTS.length];
    const glyphs: Glyph[] = [];
    let order = 0;
    lines.forEach((line, li) => {
      const chars = Array.from(line);
      const widths = chars.map((c) => (adv[c] ?? 0.55) * FONT_SIZE);
      const total = widths.reduce((a, b) => a + b, 0);
      const indent = li > 0 ? LINE_INDENT : 0;
      let x = -total / 2 + indent;
      chars.forEach((ch, ci) => {
        const w = widths[ci];
        if (ch !== " ") {
          glyphs.push({ ch, angle: base + (x + w / 2) / TEXT_RADIUS, y: top - li * LINE_GAP, order, indent });
          order += 1;
        }
        x += w;
      });
    });
    return { base, glyphs, duration: Math.max(0, order - 1) * STAGGER + CHAR_DUR };
  });
}

function GloveRig({ progress, phrases }: { progress: NumRef; phrases: string[][] }) {
  const group = useRef<THREE.Group>(null);
  const glyphRefs = useRef<(TroikaText | null)[][]>([]);
  const phase = useRef<number[]>([]);
  const viewport = useThree((s) => s.viewport);
  const scale = Math.min(viewport.width * GLOVE_SIZE, viewport.height * 0.3);
  const adv = useAdvances(phrases);
  const layout = useMemo(() => (adv ? layoutPhrases(phrases, adv) : null), [adv, phrases]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-delta * SMOOTHING);
    const p = progress.current;

    // One smooth full turn, then the outro
    const q = clamp(p / OUTRO_START, 0, 1);
    const outro = smoothstep(OUTRO_START, 1, p);
    g.rotation.y += (-q * Math.PI * 2 - g.rotation.y) * k;
    g.rotation.x = 0.06 + Math.sin(t * 0.7) * 0.02;
    g.scale.setScalar(scale * (1 - 0.28 * outro));
    g.position.y = Math.sin(t * 1.2) * 0.03 * scale - outro * viewport.height * 0.04;

    if (!layout) return;
    const canWrite = p > 0.01; // wait until the glove has settled in the middle
    layout.forEach((ph, pi) => {
      const facing = Math.cos(g.rotation.y + ph.base);
      let next = phase.current[pi] ?? 0;
      if (canWrite && facing > WRITE_AT) next += delta;
      else if (facing < RESET_AT) next -= delta * 3;
      next = clamp(next, 0, ph.duration);
      phase.current[pi] = next;

      const row = glyphRefs.current[pi];
      if (!row) return;
      ph.glyphs.forEach((gl, gi) => {
        const m = row[gi];
        if (!m) return;
        const raw = clamp((next - gl.order * STAGGER) / CHAR_DUR, 0, 1);
        const e = 1 - Math.pow(1 - raw, 3);
        // Letters going round the side get hidden, like print on fabric
        const side = smoothstep(-0.05, 0.3, Math.cos(g.rotation.y + gl.angle));
        const alpha = e * side * (1 - outro);
        m.visible = alpha > 0.002;
        m.fillOpacity = alpha;
        m.position.x = (1 - e) * 0.05;
        m.position.y = gl.y + (1 - e) * RISE;
        m.scale.setScalar(0.35 + 0.65 * e);
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
  active,
  phrases,
}: {
  progress: NumRef;
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
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <pointLight position={[-3, 1, -2]} intensity={50} color={PURPLE} distance={12} />
      <pointLight position={[3, -2, -1]} intensity={40} color={MAGENTA} distance={12} />
      <pointLight position={[0, 0, 4]} intensity={8} color="#c4b5fd" distance={10} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 4, 4]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={3} color={PURPLE} position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={2} color={MAGENTA} position={[4, -1, 1]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
      </Environment>
      <GloveRig progress={progress} phrases={phrases} />
    </Canvas>
  );
}
