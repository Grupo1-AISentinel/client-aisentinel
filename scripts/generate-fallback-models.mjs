/**
 * generate-fallback-models.mjs
 *
 * Genera 3 .glb fallback minimalistas (caja con armature HUMANOID-compatible)
 * para los slots upper / lower / outerwear. Se construyen en runtime usando
 * @gltf-transform para evitar dependencias binarias externas.
 *
 * Si el GLB real (jacket_1.glb, jacket_2.glb, pantalon.glb) falla al cargar
 * o al bind con el humanoide, el cliente tiene un fallback garantizado que
 * SI se renderea, manteniendo la página funcional aunque sea con formas
 * primitivas coloreadas.
 *
 * Convencion de huesos (mismo set que el humanoide base para que el bind funcione):
 *   - upper:       DEF-spine, DEF-spine.001, DEF-shoulder.L, DEF-shoulder.R,
 *                  DEF-upper_arm.L, DEF-upper_arm.R
 *   - lower:       DEF-pelvis, DEF-pelvis.L, DEF-pelvis.R, DEF-thigh.L, DEF-thigh.R
 *   - outerwear:   mas huesos de torso + arms para que cubra el jacket
 *
 * Uso:        node scripts/generate-fallback-models.mjs
 * Salida:     public/three/fallback/{slot}_fallback.glb
 */

import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'public', 'three', 'fallback');
mkdirSync(OUT_DIR, { recursive: true });

const COLORS = {
  upper: [0.94, 0.78, 0.27, 1.0],       // amber-400
  lower: [0.27, 0.4, 0.55, 1.0],        // navy/denim
  outerwear: [0.18, 0.22, 0.32, 1.0],  // dark navy
};

const buildBoxGeometry = () => {
  const positions = new Float32Array([
    0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
    0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
  ]);
  const normals = new Float32Array([
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
  ]);
  return { positions, indices, normals };
};

const buildGlb = async (boneNames, color) => {
  const doc = new Document();
  doc.createBuffer();

  const scene = doc.createScene('Scene');
  const rootNode = doc.createNode('Root');

  const { positions, indices, normals } = buildBoxGeometry();

  const posAcc = doc.createAccessor('positions').setType('VEC3').setArray(positions);
  const normAcc = doc.createAccessor('normals').setType('VEC3').setArray(normals);
  const idxAcc = doc.createAccessor('indices').setType('SCALAR').setArray(indices);

  const numVerts = positions.length / 3;
  const joints = new Uint16Array(numVerts * 4);
  const weights = new Float32Array(numVerts * 4);
  for (let v = 0; v < numVerts; v += 1) {
    const a = v % boneNames.length;
    const b = (v + 1) % boneNames.length;
    joints[v * 4] = a;
    joints[v * 4 + 1] = b;
    joints[v * 4 + 2] = 0;
    joints[v * 4 + 3] = 0;
    weights[v * 4] = 0.7;
    weights[v * 4 + 1] = 0.3;
    weights[v * 4 + 2] = 0;
    weights[v * 4 + 3] = 0;
  }
  const jointAcc = doc.createAccessor('joints').setType('VEC4').setArray(joints);
  const weightAcc = doc.createAccessor('weights').setType('VEC4').setArray(weights);

  const mat = doc.createMaterial('Mat').setBaseColorFactor(color);

  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', posAcc)
    .setAttribute('NORMAL', normAcc)
    .setIndices(idxAcc)
    .setAttribute('JOINTS_0', jointAcc)
    .setAttribute('WEIGHTS_0', weightAcc)
    .setMaterial(mat);

  const identityMat4 = new Float32Array(16);
  identityMat4[0] = 1; identityMat4[5] = 1; identityMat4[10] = 1; identityMat4[15] = 1;
  const allInverse = new Float32Array(16 * boneNames.length);
  for (let i = 0; i < boneNames.length; i += 1) allInverse.set(identityMat4, i * 16);
  const ibmAcc = doc.createAccessor('ibm').setType('MAT4').setArray(allInverse);

  const skin = doc.createSkin('skin').setInverseBindMatrices(ibmAcc);
  const boneNodes = boneNames.map((name) =>
    doc.createNode(name).setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1])
  );
  boneNodes.forEach((n) => skin.addJoint(n));

  const mesh = doc.createMesh('Mesh');
  mesh.addPrimitive(prim);
  const meshNode = doc.createNode('MeshNode').setMesh(mesh).setSkin(skin);

  boneNodes.forEach((b) => rootNode.addChild(b));
  rootNode.addChild(meshNode);
  scene.addChild(rootNode);

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  return io.writeBinary(doc);
};

const PRESETS = {
  upper: ['DEF-spine', 'DEF-spine.001', 'DEF-shoulder.L', 'DEF-shoulder.R', 'DEF-upper_arm.L', 'DEF-upper_arm.R'],
  lower: ['DEF-pelvis', 'DEF-pelvis.L', 'DEF-pelvis.R', 'DEF-thigh.L', 'DEF-thigh.R'],
  outerwear: [
    'DEF-spine', 'DEF-spine.001', 'DEF-shine.002',
    'DEF-shoulder.L', 'DEF-shoulder.R',
    'DEF-upper_arm.L', 'DEF-upper_arm.R',
    'DEF-forearm.L', 'DEF-forearm.R',
    'DEF-pelvis', 'DEF-pelvis.L', 'DEF-pelvis.R',
  ],
};

const main = async () => {
  console.log('Generando modelos 3D fallback...');
  for (const [slot, bones] of Object.entries(PRESETS)) {
    const outFile = resolve(OUT_DIR, `${slot}_fallback.glb`);
    if (existsSync(outFile)) {
      console.log(`  - ${slot}_fallback.glb ya existe, omitiendo`);
      continue;
    }
    const color = COLORS[slot] || [0.5, 0.5, 0.5, 1];
    const glb = await buildGlb(bones, color);
    writeFileSync(outFile, glb);
    console.log(`  ✓ ${slot}_fallback.glb (${bones.length} bones, ${glb.length} bytes)`);
  }
  console.log('Listo. Archivos en:', OUT_DIR);
};

main().catch((err) => {
  console.error('Error generando fallbacks:', err);
  process.exit(1);
});
