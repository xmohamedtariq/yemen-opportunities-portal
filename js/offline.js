'use strict';

(() => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (window.location.protocol === 'file:') {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        './service-worker.js',
        { scope: './' }
      );

      window.__YOP_SERVICE_WORKER__ = registration;
    } catch (error) {
      window.__YOP_SERVICE_WORKER__ = null;
    }
  });
})();
