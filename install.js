(() => {
  const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  let installEvent;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = installed ? 'Buscar actualización' : 'Instalar app';
  button.setAttribute('aria-label', 'Instalar Caja y combustibles como aplicación');
  Object.assign(button.style, {
    position: 'fixed', right: '18px', bottom: '18px', zIndex: '9999',
    border: '1px solid #65d99b', borderRadius: '999px', padding: '12px 18px',
    background: '#163524', color: '#fff', font: '700 14px system-ui, sans-serif',
    boxShadow: '0 8px 28px rgba(0,0,0,.42)', cursor: 'pointer'
  });

  button.addEventListener('click', async () => {
    if (installed) {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        await registration.update();
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setTimeout(() => window.location.reload(), 1200);
        } else {
          alert('La app ya está actualizada.');
        }
      }
      return;
    }
    if (installEvent) {
      installEvent.prompt();
      await installEvent.userChoice;
      installEvent = null;
      button.remove();
      return;
    }
    alert('Abrí el menú del navegador y elegí “Instalar aplicación” o “Agregar a la pantalla de inicio”. Luego se abrirá sin la barra de dirección.');
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installEvent = event;
  });

  const mount = () => {
    if (!button.isConnected) document.body.append(button);
  };
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });

  const showUpdate = registration => {
    if (!registration.waiting) return;
    button.textContent = 'Actualizar app';
    button.onclick = async () => {
      const waiting = registration.waiting;
      if (!waiting) return;
      waiting.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => window.location.reload(), 1200);
    };
    mount();
  };
  navigator.serviceWorker?.getRegistration().then(registration => {
    if (!registration) return;
    showUpdate(registration);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(registration);
      });
    });
    registration.update();
  });
  navigator.serviceWorker?.addEventListener('controllerchange', () => window.location.reload());
})();

