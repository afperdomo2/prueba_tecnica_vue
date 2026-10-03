// Se ejecuta antes de cada archivo de test.

// Quasar (plugin Screen) lee `window.screen.orientation`, que happy-dom no provee.
if (!window.screen.orientation) {
  Object.defineProperty(window.screen, 'orientation', {
    value: {
      type: 'landscape-primary',
      angle: 0,
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    configurable: true,
  });
}

export {};
