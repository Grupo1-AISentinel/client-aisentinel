// Offsets por slot para alinear prendas al cuerpo base del humanoide.
// Se aplican DESPUES del bone remapping, como tweak fino por categoria.
export const SLOT_TRANSFORMS = {
  body: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
  upper: { position: [0, 0.02, 0], rotation: [0, 0, 0], scale: 1.05 },
  lower: { position: [0, -0.05, 0], rotation: [0, 0, 0], scale: 1 },
  outerwear: { position: [0, 0.02, 0], rotation: [0, 0, 0], scale: 1.08 },
  accessory: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
};

/**
 * Normaliza un nombre de hueso para hacer matching tolerante.
 * Reglas (en orden de prioridad):
 *  1. Match exacto
 *  2. Sin prefijo "DEF-"
 *  3. ".L" -> "L", ".R" -> "R" (normalizar sufijo L/R)
 *  4. ".L" -> "_L", ".R" -> "_R" (separador alternativo)
 *  5. Sin numeros de Blender (.001, .002)
 *  6. Match parcial (case-insensitive contains)
 */
const normalizeBoneName = (name) => {
  if (!name) return '';
  return name
    .replace(/^DEF-/, '')
    .replace(/\.L$/i, 'L')
    .replace(/\.R$/i, 'R')
    .replace(/\.L$/, '_L')
    .replace(/\.R$/, '_R')
    .replace(/\.\d{3}$/, '')
    .toLowerCase();
};

/**
 * Busca un hueso en `targetBones` que matchee con `sourceName` usando
 * matching tolerante. Retorna el indice en targetBones o undefined.
 */
const findMatchingBone = (sourceName, targetByName, targetNamesNormalized) => {
  if (!sourceName) return undefined;
  if (targetByName.has(sourceName)) return targetByName.get(sourceName);

  const normalized = normalizeBoneName(sourceName);
  if (targetByName.has(normalized)) return targetByName.get(normalized);

  // Buscar en el mapa de normalizados
  if (targetNamesNormalized.has(normalized)) {
    return targetNamesNormalized.get(normalized);
  }

  // Fallback: match parcial case-insensitive
  const sourceLower = sourceName.toLowerCase();
  for (const [origName, idx] of targetByName) {
    if (origName && origName.toLowerCase().includes(sourceLower)) return idx;
  }
  return undefined;
};

/**
 * Construye las tablas de lookup para un skeleton destino. Cacheado.
 */
const buildTargetIndex = (targetSkeleton) => {
  if (!targetSkeleton) return { byName: new Map(), normalized: new Map() };
  const byName = new Map();
  const normalized = new Map();
  targetSkeleton.bones?.forEach((b, idx) => {
    if (!b?.name) return;
    byName.set(b.name, idx);
    const norm = normalizeBoneName(b.name);
    if (!normalized.has(norm)) normalized.set(norm, idx);
  });
  return { byName, normalized };
};

/**
 * Remapea los skin indices de la malla para apuntar a los huesos del
 * skeleton destino. Usa matching tolerante para que rigs con ligeras
 * variaciones de naming (DEF-, .L vs L, .001) sigan funcionando.
 *
 * @returns { mapped, total, mismatches }
 *   - mapped: cantidad de bones que se remapearon
 *   - total: total de bones source
 *   - mismatches: lista de nombres que no encontraron match (para debug)
 */
export const remapSkinIndices = (mesh, sourceSkeleton, targetSkeleton) => {
  if (!sourceSkeleton || !targetSkeleton) {
    return { mapped: 0, total: 0, mismatches: ['missing-skeleton'] };
  }
  if (sourceSkeleton === targetSkeleton) {
    return {
      mapped: sourceSkeleton.bones?.length || 0,
      total: sourceSkeleton.bones?.length || 0,
      mismatches: [],
    };
  }
  const sourceBones = sourceSkeleton.bones || [];
  const targetBones = targetSkeleton.bones || [];
  if (sourceBones.length === 0 || targetBones.length === 0) {
    return { mapped: 0, total: 0, mismatches: ['empty-skeleton'] };
  }

  const targetIndex = buildTargetIndex(targetSkeleton);
  const remap = new Int32Array(sourceBones.length);
  const mismatches = [];
  let mapped = 0;
  for (let i = 0; i < sourceBones.length; i += 1) {
    const idx = findMatchingBone(sourceBones[i].name, targetIndex.byName, targetIndex.normalized);
    if (idx !== undefined) {
      remap[i] = idx;
      mapped += 1;
    } else {
      remap[i] = 0; // fallback al root bone
      mismatches.push(sourceBones[i].name);
    }
  }
  if (mapped === 0) {
    return { mapped: 0, total: sourceBones.length, mismatches };
  }

  const indexAttr = mesh.geometry?.attributes?.skinIndex;
  if (indexAttr) {
    for (let i = 0; i < indexAttr.count; i += 1) {
      for (let j = 0; j < 4; j += 1) {
        const oldIdx = indexAttr.getComponent(i, j);
        indexAttr.setComponent(i, j, remap[oldIdx] || 0);
      }
    }
    indexAttr.needsUpdate = true;
  }
  return { mapped, total: sourceBones.length, mismatches };
};

/**
 * bindGarmentToSkeleton retorna el resultado del bind:
 *   { success: boolean, mode: 'full' | 'partial' | 'failed', mismatches: [] }
 */
export const bindGarmentToSkeleton = (mesh, targetSkeleton) => {
  if (!mesh?.isSkinnedMesh || !targetSkeleton) {
    return { success: false, mode: 'failed', mismatches: ['not-skinned-or-no-skeleton'] };
  }
  try {
    mesh.updateMatrixWorld(true);
    const sourceSkeleton = mesh.skeleton;
    const result = remapSkinIndices(mesh, sourceSkeleton, targetSkeleton);
    mesh.skeleton = targetSkeleton;
    mesh.bind(targetSkeleton);

    if (result.mapped === 0) {
      return { success: false, mode: 'failed', mismatches: result.mismatches };
    }
    if (result.mapped < result.total) {
      return { success: true, mode: 'partial', mismatches: result.mismatches };
    }
    return { success: true, mode: 'full', mismatches: [] };
  } catch (err) {
    console.warn(`[UniformViewer] No se pudo bindear ${mesh?.name || 'mesh'}: ${err.message}`);
    return { success: false, mode: 'failed', mismatches: [err.message] };
  }
};
