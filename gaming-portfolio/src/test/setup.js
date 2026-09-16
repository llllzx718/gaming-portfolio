import '@testing-library/jest-dom';

// jsdom does not implement requestAnimationFrame; framer-motion falls back to a
// noop scheduler without it, so AnimatePresence exit animations never complete.
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
}
if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}
