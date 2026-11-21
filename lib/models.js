// Procedural 3D models shared by the deck renders and the prototype app.
import * as THREE from 'three';
import { RoundedBoxGeometry } from './RoundedBoxGeometry.js';
import { RoomEnvironment } from './RoomEnvironment.js';

export const COLORS = { navy: 0x0b1b33, navy2: 0x16305a, teal: 0x12b5a6, amber: 0xf5a524, white: 0xf3f6fa, red: 0xe5484d, green: 0x22c55e, steel: 0x8a94a6 };

const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.25, ...o });
const cyl = (r, h, m, seg = 48) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
const rbox = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m);

export function setupStage(canvas, { alpha = true, w, h } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w || canvas.clientWidth, h || canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6;
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  scene.add(key, new THREE.HemisphereLight(0xdff7ff, 0x0b1b33, 0.6));
  const rim = new THREE.DirectionalLight(0x12b5a6, 1.2); rim.position.set(-6, 4, -5); scene.add(rim);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 64), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  return { renderer, scene, ground };
}

function shadowAll(o) { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; }

// 6-axis style arm. Returns joints so callers can animate: j0 (base yaw), j1 shoulder, j2 elbow, j3 wrist, grip(0..1).
export function makeRobotArm() {
  const navy = mat(COLORS.navy), arm = mat(COLORS.amber), teal = mat(COLORS.teal, { metalness: 0.3 }), steel = mat(COLORS.steel, { metalness: 0.8, roughness: 0.25 });
  const root = new THREE.Group();
  const base = cyl(1.0, 0.35, navy); base.position.y = 0.175; root.add(base);
  const ring = cyl(1.02, 0.06, teal); ring.position.y = 0.3; root.add(ring);
  const j0 = new THREE.Group(); j0.position.y = 0.35; root.add(j0);
  const turret = cyl(0.72, 0.5, arm); turret.position.y = 0.25; j0.add(turret);
  const sh = rbox(0.9, 0.8, 1.0, 0.18, arm); sh.position.y = 0.85; j0.add(sh);
  const j1 = new THREE.Group(); j1.position.y = 0.95; j0.add(j1);
  const jc1 = cyl(0.42, 1.12, navy); jc1.rotation.x = Math.PI / 2; j1.add(jc1);
  const cap1 = cyl(0.3, 1.18, teal); cap1.rotation.x = Math.PI / 2; j1.add(cap1);
  const lower = rbox(0.5, 2.3, 0.62, 0.2, arm); lower.position.y = 1.15; j1.add(lower);
  const j2 = new THREE.Group(); j2.position.y = 2.3; j1.add(j2);
  const jc2 = cyl(0.36, 0.86, navy); jc2.rotation.x = Math.PI / 2; j2.add(jc2);
  const cap2 = cyl(0.24, 0.92, teal); cap2.rotation.x = Math.PI / 2; j2.add(cap2);
  const upper = rbox(1.9, 0.42, 0.5, 0.18, arm); upper.position.x = 0.95; j2.add(upper);
  const motor = cyl(0.26, 0.5, navy); motor.rotation.z = Math.PI / 2; motor.position.x = -0.35; j2.add(motor);
  const j3 = new THREE.Group(); j3.position.x = 1.9; j2.add(j3);
  const jc3 = cyl(0.24, 0.6, navy); jc3.rotation.x = Math.PI / 2; j3.add(jc3);
  const wrist = cyl(0.17, 0.5, steel); wrist.position.y = -0.3; j3.add(wrist);
  const flange = cyl(0.26, 0.08, teal); flange.position.y = -0.58; j3.add(flange);
  const palm = rbox(0.62, 0.14, 0.26, 0.05, navy); palm.position.y = -0.68; j3.add(palm);
  const fingers = [-1, 1].map(s => { const f = rbox(0.08, 0.36, 0.2, 0.03, steel); f.position.set(s * 0.22, -0.9, 0); j3.add(f); return f; });
  const setGrip = g => fingers.forEach((f, i) => f.position.x = (i ? 1 : -1) * (0.08 + 0.16 * (1 - g)));
  return { group: shadowAll(root), j0, j1, j2, j3, setGrip };
}

// Tabletop PLC trainer panel used in AutoSkill's hands-on lab.
export function makePLCTrainer() {
  const g = new THREE.Group();
  const navy = mat(COLORS.navy), panelM = mat(COLORS.navy2), white = mat(COLORS.white, { clearcoat: 0.2 }), teal = mat(COLORS.teal);
  const stand = rbox(4.2, 0.35, 2.0, 0.12, navy); stand.position.y = 0.175; g.add(stand);
  const panel = new THREE.Group(); panel.position.set(0, 0.35, -0.6); panel.rotation.x = -0.32; g.add(panel);
  const board = rbox(4.0, 2.8, 0.22, 0.1, panelM); board.position.y = 1.4; panel.add(board);
  const rail = rbox(3.4, 0.08, 0.06, 0.02, mat(COLORS.steel, { metalness: 0.9 })); rail.position.set(0, 2.15, 0.14); panel.add(rail);
  [-1.45, -0.95, -0.45, 0.05, 0.55, 1.05, 1.5].forEach((x, i) => {
    const w = i === 0 ? 0.5 : 0.42;
    const mod = rbox(w, 0.75, 0.3, 0.04, i === 0 ? teal : white); mod.position.set(x, 2.15, 0.25); panel.add(mod);
    for (let k = 0; k < 4; k++) { const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshStandardMaterial({ color: COLORS.green, emissive: k % 2 || i % 3 ? COLORS.green : 0x000000, emissiveIntensity: 2 })); led.position.set(x - 0.1 + (k % 2) * 0.2, 2.35 - Math.floor(k / 2) * 0.12, 0.41); panel.add(led); }
  });
  const hmi = rbox(1.4, 0.9, 0.12, 0.05, navy); hmi.position.set(-1.1, 1.05, 0.15); panel.add(hmi);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 0.72), new THREE.MeshStandardMaterial({ color: 0x0e6b66, emissive: COLORS.teal, emissiveIntensity: 0.9 })); screen.position.set(-1.1, 1.05, 0.22); panel.add(screen);
  for (let k = 0; k < 4; k++) { const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.15 + k * 0.1), new THREE.MeshBasicMaterial({ color: k === 3 ? COLORS.amber : 0xffffff })); bar.position.set(-1.4 + k * 0.22, 0.85 + (0.15 + k * 0.1) / 2, 0.225); panel.add(bar); }
  [[0.2, COLORS.green], [0.65, COLORS.red], [1.1, COLORS.amber]].forEach(([x, c]) => {
    const bz = cyl(0.17, 0.08, navy); bz.rotation.x = Math.PI / 2; bz.position.set(x, 1.05, 0.15); panel.add(bz);
    const b = cyl(0.13, 0.12, mat(c)); b.rotation.x = Math.PI / 2; b.position.set(x, 1.05, 0.22); panel.add(b);
  });
  const ey = rbox(0.5, 0.5, 0.1, 0.04, mat(0xffd21f)); ey.position.set(1.55, 0.95, 0.15); panel.add(ey);
  const es = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(COLORS.red)); es.rotation.x = Math.PI / 2; es.position.set(1.55, 0.95, 0.25); panel.add(es);
  for (let k = 0; k < 8; k++) { const t = cyl(0.045, 0.1, mat(k % 2 ? COLORS.red : 0x111111)); t.rotation.x = Math.PI / 2; t.position.set(-1.6 + k * 0.45, 0.25, 0.15); panel.add(t); }
  return shadowAll(g);
}

function gearShape(teeth = 10, rOut = 1.5, rIn = 1.25, hole = 0.55) {
  const s = new THREE.Shape(), n = teeth * 4;
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, r = (i % 4 < 2) ? rOut : rIn; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const h = new THREE.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h); return s;
}

// Brand mark: graduation cap resting on a gear ("Play · Code · Grow").
export function makeCapGear() {
  const g = new THREE.Group();
  const gear = new THREE.Mesh(new THREE.ExtrudeGeometry(gearShape(), { depth: 0.45, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3 }), mat(COLORS.teal, { metalness: 0.4 }));
  gear.rotation.x = -Math.PI / 2; gear.position.y = 0.05; g.add(gear);
  const hub = cyl(0.5, 0.6, mat(COLORS.amber)); hub.position.y = 0.3; g.add(hub);
  const cap = new THREE.Group(); cap.position.y = 1.0; cap.rotation.y = 0.5; g.add(cap);
  const skull = cyl(0.75, 0.55, mat(COLORS.navy), 48); skull.geometry = new THREE.CylinderGeometry(0.8, 0.7, 0.55, 48); skull.material = mat(COLORS.navy); cap.add(skull);
  const board = rbox(2.4, 0.1, 2.4, 0.04, mat(COLORS.navy)); board.position.y = 0.32; board.rotation.y = Math.PI / 4; cap.add(board);
  const btn = cyl(0.1, 0.08, mat(COLORS.amber)); btn.position.y = 0.4; cap.add(btn);
  const cord = rbox(1.2, 0.04, 0.06, 0.015, mat(COLORS.amber)); cord.position.set(0.6, 0.39, 0); cap.add(cord);
  const tassel = cyl(0.06, 0.6, mat(COLORS.amber)); tassel.position.set(1.18, 0.05, 0); cap.add(tassel);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 16), mat(COLORS.amber)); tip.position.set(1.18, -0.3, 0); cap.add(tip);
  return shadowAll(g);
}

// Stacked market tiers (TAM / SAM / SOM).
export function makeMarketStack() {
  const g = new THREE.Group();
  [[2.6, 0.5, COLORS.navy2], [1.75, 0.5, COLORS.teal], [0.9, 0.5, COLORS.amber]].forEach(([r, h, c], i) => {
    const d = cyl(r, h, mat(c, { metalness: 0.2 }), 72); d.position.y = h / 2 + i * (h + 0.06); g.add(d);
  });
  return shadowAll(g);
}

// Career staircase with a flag on top (milestones / career growth).
export function makeStairs() {
  const g = new THREE.Group();
  const cols = [COLORS.navy2, COLORS.navy2, COLORS.teal, COLORS.teal, COLORS.amber];
  cols.forEach((c, i) => { const s = rbox(1.0, 0.5 + i * 0.5, 1.6, 0.08, mat(c)); s.position.set(-2 + i * 1.02, (0.5 + i * 0.5) / 2, 0); g.add(s); });
  const pole = cyl(0.04, 1.4, mat(COLORS.white, { metalness: 0.6 })); pole.position.set(2.1, 2.5 + 0.7, 0); g.add(pole);
  const flag = rbox(0.7, 0.42, 0.04, 0.02, mat(COLORS.amber)); flag.position.set(2.45, 3.65, 0); g.add(flag);
  return shadowAll(g);
}
