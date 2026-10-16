/**
 * Yemen Opportunities Portal - Favorites Store
 *
 * Stores stable opportunity IDs only.
 * No personal information or complete opportunity objects are persisted.
 */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'yemen-opportunities:favorites:v1';
  const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  function isValidId(value) {
    return typeof value === 'string' && ID_PATTERN.test(value);
  }

  function getStorage() {
    try {
      return global && global.localStorage
        ? global.localStorage
        : null;
    } catch (_error) {
      return null;
    }
  }

  function normalizeIds(value) {
    if (!Array.isArray(value)) return [];

    return Array.from(
      new Set(value.filter(isValidId))
    );
  }

  function readIds() {
    const storage = getStorage();
    if (!storage) return [];

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      const normalized = normalizeIds(parsed);

      // Repair valid JSON that contains duplicates or invalid values.
      if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
        storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }

      return normalized;
    } catch (_error) {
      // Recover safely from malformed or inaccessible stored data.
      try {
        storage.setItem(STORAGE_KEY, '[]');
      } catch (_ignored) {
        // Storage may be unavailable; continue with in-memory empty result.
      }

      return [];
    }
  }

  function writeIds(ids) {
    const normalized = normalizeIds(ids);
    const storage = getStorage();

    if (!storage) return false;

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function has(id) {
    if (!isValidId(id)) return false;
    return readIds().includes(id);
  }

  function add(id) {
    if (!isValidId(id)) return false;

    const ids = readIds();

    if (ids.includes(id)) {
      return true;
    }

    ids.push(id);
    const saved = writeIds(ids);

    if (saved) emitChange(ids);

    return saved;
  }

  function remove(id) {
    if (!isValidId(id)) return false;

    const ids = readIds();
    const updated = ids.filter(savedId => savedId !== id);

    if (updated.length === ids.length) {
      return true;
    }

    const saved = writeIds(updated);

    if (saved) emitChange(updated);

    return saved;
  }

  function toggle(id) {
    if (!isValidId(id)) {
      return {
        saved: false,
        favorite: false
      };
    }

    const favorite = has(id);
    const saved = favorite ? remove(id) : add(id);

    return {
      saved,
      favorite: saved ? !favorite : favorite
    };
  }

  function emitChange(ids) {
    if (
      !global ||
      typeof global.dispatchEvent !== 'function' ||
      typeof global.CustomEvent !== 'function'
    ) {
      return;
    }

    global.dispatchEvent(
      new global.CustomEvent('favorites:changed', {
        detail: {
          ids: [...ids]
        }
      })
    );
  }

  const api = Object.freeze({
    STORAGE_KEY,
    getIds: readIds,
    has,
    add,
    remove,
    toggle
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (global) {
    global.FavoritesStore = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
