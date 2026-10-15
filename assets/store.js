/* Aurelle Studio — localStorage data layer.
   Public API: Store.get, list, create, update, remove, set, reset, subscribe. */

(function () {
  "use strict";

  const PREFIX = "aurelle.v1.";
  const EVENT_NAME = "aurelle:store-change";

  const clone = (value) => {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? clone(fallback) : JSON.parse(raw);
    } catch (error) {
      console.warn(`Aurelle: unable to read "${key}".`, error);
      return clone(fallback);
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, {
        detail: { key, value: clone(value) }
      }));
      return clone(value);
    } catch (error) {
      console.error("Aurelle: could not persist data.", error);
      throw new Error("Could not save changes. Your browser storage may be full.");
    }
  }

  function ensureSeeded() {
    if (!window.AurelleSeed) {
      throw new Error("AurelleSeed is missing. Load assets/data.js before assets/store.js.");
    }

    const version = localStorage.getItem(PREFIX + "seed-version");
    if (version !== "1") {
      Object.entries(window.AurelleSeed).forEach(([key, value]) => {
        if (localStorage.getItem(PREFIX + key) === null) {
          localStorage.setItem(PREFIX + key, JSON.stringify(value));
        }
      });
      localStorage.setItem(PREFIX + "seed-version", "1");
    }
  }

  function get(key, fallback = null) {
    ensureSeeded();
    return read(key, fallback);
  }

  function set(key, value) {
    ensureSeeded();
    return write(key, value);
  }

  function list(key, predicate) {
    const value = get(key, []);
    const items = Array.isArray(value) ? value : [];
    return typeof predicate === "function" ? items.filter(predicate) : items;
  }

  function makeId(collection) {
    const prefix = {
      products: "P",
      customers: "CUS",
      staff: "STF",
      orders: "ORD",
      expenses: "EXP",
      stockMovements: "MOV",
      coupons: "CPN",
      reviews: "REV",
      activity: "ACT",
      categories: "CAT",
      collections: "COL",
      notifications: "NTF"
    }[collection] || "ITEM";

    const items = list(collection);
    const max = items.reduce((highest, item) => {
      const match = String(item.id || "").match(/(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);

    return `${prefix}-${String(max + 1).padStart(3, "0")}`;
  }

  function create(collection, record) {
    const items = list(collection);
    const newRecord = {
      ...clone(record),
      id: record && record.id ? record.id : makeId(collection),
      createdAt: record && record.createdAt ? record.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (items.some((item) => item.id === newRecord.id)) {
      throw new Error(`A record with ID "${newRecord.id}" already exists.`);
    }

    items.unshift(newRecord);
    set(collection, items);
    return clone(newRecord);
  }

  function update(collection, id, patch) {
    const items = list(collection);
    const index = items.findIndex((item) => item.id === id);

    if (index < 0) {
      throw new Error(`Record "${id}" was not found in ${collection}.`);
    }

    const next = {
      ...items[index],
      ...clone(patch),
      id: items[index].id,
      updatedAt: new Date().toISOString()
    };

    items[index] = next;
    set(collection, items);
    return clone(next);
  }

  function remove(collection, id) {
    const items = list(collection);
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return null;

    const removed = items.splice(index, 1)[0];
    set(collection, items);
    return clone(removed);
  }

  function reset() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));

    ensureSeeded();

    // Preserve the active demo identity only if it is still present in the
    // freshly seeded staff list. The caller can clear the session separately.
    window.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: { key: "*", value: null }
    }));

    return true;
  }

  function subscribe(callback) {
    if (typeof callback !== "function") return () => {};

    const listener = (event) => callback(event.detail || {});
    window.addEventListener(EVENT_NAME, listener);

    return () => window.removeEventListener(EVENT_NAME, listener);
  }

  window.Store = {
    get,
    set,
    list,
    create,
    update,
    remove,
    reset,
    subscribe,
    makeId,
    prefix: PREFIX
  };

  ensureSeeded();
})();