/**
 * modelCache.js
 *
 * Cache LRU simple para promesas de carga de modelos GLB.
 * Evita recargar el mismo GLB si el usuario cambia de slot varias veces.
 * Capacidad: 4 modelos simultáneos en memoria (el visualizador solo usa
 * body + 1-2 prendas activas, asi que 4 cubre cualquier combinacion).
 */

const MAX_SIZE = 4;

class LRU {
  constructor(max = MAX_SIZE) {
    this.max = max;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    // Refresh LRU order
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  has(key) {
    return this.map.has(key);
  }

  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.max) {
      // Evict oldest (first inserted)
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
    this.map.set(key, value);
  }

  delete(key) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }

  get size() {
    return this.map.size;
  }
}

// Cache singleton
const cache = new LRU();

/**
 * loadModel(path) -> Promise<scene>
 * Usa useGLTF internamente; devuelve la misma promesa si ya esta en cache.
 * En caso de error, devuelve el fallback path.
 */
export const modelCache = {
  load(path) {
    if (cache.has(path)) return cache.get(path);
    // No importamos useGLTF aqui (es un hook). El consumidor debe pasarnos
    // una promesa o un scene ya resuelto. Esta API es para promesas crudas.
    throw new Error('modelCache.load requiere una promesa. Usa cachedLoadGLTF en su lugar.');
  },
  has(path) {
    return cache.has(path);
  },
  set(key, scenePromise) {
    cache.set(key, scenePromise);
  },
  clear() {
    cache.clear();
  },
  get size() {
    return cache.size;
  },
};

export { LRU, cache };
