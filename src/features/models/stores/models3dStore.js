import { create } from 'zustand';
import { models3dService } from '../services/models3dService.js';
import toast from 'react-hot-toast';

// Garments fallback embebidos en el bundle del cliente.
// Apuntan a los GLBs reales generados desde Blender con armature
// Rigify HUMANOID-compatible (mismo esqueleto, bind real).
const FALLBACK_GARMENTS = [
  {
    id: 'body',
    name: 'cuerpo-base',
    displayName: 'Cuerpo base',
    slot: 'body',
    path: '/three/humanoid.glb',
    era: null,
    source: 'fallback',
    isActive: true,
  },
  {
    id: 'pantalon',
    name: 'pantalon',
    displayName: 'Pantalon',
    slot: 'lower',
    path: '/three/pantalon.glb',
    era: null,
    source: 'fallback',
    isActive: true,
  },
  {
    id: 'jacket_1',
    name: 'chumpa-v1',
    displayName: 'Chumpa edicion 2010',
    slot: 'outerwear',
    path: '/three/jacket_1.glb',
    era: '2010',
    source: 'fallback',
    isActive: true,
  },
  {
    id: 'jacket_2',
    name: 'chumpa-v2',
    displayName: 'Chumpa edicion 2020',
    slot: 'outerwear',
    path: '/three/jacket_2.glb',
    era: '2020',
    source: 'fallback',
    isActive: true,
  },
];

const SLOT_LABELS = {
  body: 'Cuerpo',
  upper: 'Torso',
  lower: 'Piernas',
  outerwear: 'Outerwear',
  accessory: 'Accesorios',
};

const SLOT_ORDER = ['body', 'upper', 'lower', 'outerwear', 'accessory'];

const normalizeGarment = (raw) => ({
  id: raw._id || raw.id || raw.name,
  name: raw.name,
  displayName: raw.displayName || raw.display_name || raw.name,
  slot: raw.slot,
  path: raw.filePath || raw.file_path || raw.path,
  era: raw.era || null,
  fileSize: raw.fileSize || raw.file_size || 0,
  isActive: raw.isActive !== undefined ? raw.isActive : raw.is_active !== false,
  uploadedAt: raw.uploadedAt || raw.uploaded_at || null,
  source: 'backend',
});

// Computa la lista de prendas disponibles a partir de la fuente actual.
const computeAvailable = (state) => {
  const fromBackend = (state.garments || []).filter((g) => g.isActive).map(normalizeGarment);
  if (fromBackend.length > 0) return fromBackend;
  return FALLBACK_GARMENTS;
};

// Computa el body garment actual.
const computeBody = (available) => available.find((g) => g.slot === 'body') || available[0] || null;

// Computa la lista de prendas activas para el scene 3D.
const computeSceneGarments = (state) => {
  const available = computeAvailable(state);
  const body = computeBody(available);
  const items = [];
  if (body) items.push({ ...body, role: 'body' });
  for (const slot of SLOT_ORDER) {
    if (slot === 'body') continue;
    const id = state.activeGarments[slot];
    if (!id) continue;
    const garment = available.find((g) => g.id === id || g._id === id);
    if (garment) items.push({ ...garment, role: slot });
  }
  return items;
};

// Recalcula y devuelve un parche de estado con los derivados.
const withDerived = (patch) => (state) => {
  const next = typeof patch === 'function' ? patch(state) : patch;
  const merged = { ...state, ...next };
  const sceneGarments = computeSceneGarments(merged);
  return { ...next, sceneGarments };
};

const useModels3DStore = create((set, get) => ({
  garments: [],
  activeGarments: {},
  sceneGarments: [], // Array computado, fuente de verdad para selectores.
  bodyGarment: null, // Computado, para el body slot.
  loading: false,
  error: null,
  uploading: false,
  lastFetch: 0,

  getAvailableGarments: () => computeAvailable(get()),

  getBodyGarment: () => computeBody(computeAvailable(get())),

  getActiveSceneGarments: () => get().sceneGarments,

  getGarmentsBySlot: () => {
    const available = computeAvailable(get());
    const grouped = {};
    for (const slot of SLOT_ORDER) grouped[slot] = [];
    for (const g of available) {
      if (grouped[g.slot]) grouped[g.slot].push(g);
    }
    return grouped;
  },

  setActiveGarment: (slot, garmentId) =>
    set(
      withDerived((state) => ({
        activeGarments: { ...state.activeGarments, [slot]: garmentId || null },
      }))
    ),

  toggleGarmentInSlot: (slot, garmentId) =>
    set(
      withDerived((state) => {
        const current = state.activeGarments[slot];
        return {
          activeGarments: {
            ...state.activeGarments,
            [slot]: current === garmentId ? null : garmentId,
          },
        };
      })
    ),

  clearSlot: (slot) =>
    set(
      withDerived((state) => {
        const next = { ...state.activeGarments };
        delete next[slot];
        return { activeGarments: next };
      })
    ),

  clearAll: () =>
    set(
      withDerived({
        activeGarments: {},
      })
    ),

  fetchGarments: async (force = false) => {
    const now = Date.now();
    if (!force && now - get().lastFetch < 30000) {
      return get().garments;
    }
    set({ loading: true, error: null });
    try {
      const result = await models3dService.list({ limit: 100 });
      const garments = result.data || [];
      set(
        withDerived({
          garments,
          loading: false,
          lastFetch: now,
        })
      );
      return garments;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  uploadGarment: async (formData) => {
    set({ uploading: true });
    try {
      const newGarment = await models3dService.create(formData);
      set(
        withDerived((state) => ({
          garments: [newGarment, ...state.garments],
          lastFetch: 0,
          uploading: false,
        }))
      );
      toast.success('Modelo 3D subido');
      return newGarment;
    } catch (err) {
      set({ uploading: false });
      toast.error(err.message || 'Error al subir el modelo');
      throw err;
    }
  },

  toggleGarmentActive: async (garment) => {
    const id = garment._id || garment.id;
    try {
      const updated = garment.isActive
        ? await models3dService.deactivate(id)
        : await models3dService.activate(id);
      set(
        withDerived((state) => ({
          garments: state.garments.map((g) => (g._id === id || g.id === id ? updated : g)),
        }))
      );
      return updated;
    } catch (err) {
      toast.error(err.message || 'Error al cambiar estado');
      throw err;
    }
  },

  removeGarment: async (id) => {
    try {
      await models3dService.remove(id);
      set(
        withDerived((state) => ({
          garments: state.garments.filter((g) => g._id !== id && g.id !== id),
          activeGarments: Object.fromEntries(
            Object.entries(state.activeGarments).filter(([, gid]) => gid !== id)
          ),
        }))
      );
      toast.success('Modelo eliminado');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
      throw err;
    }
  },
}));

export { FALLBACK_GARMENTS, SLOT_LABELS, SLOT_ORDER };
export default useModels3DStore;
