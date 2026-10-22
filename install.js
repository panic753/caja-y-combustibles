(() => {
  const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (installed) return;

  let installEvent;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Instalar app';
  button.setAttribute('aria-label', 'Instalar Caja y combustibles como aplicación');
  Object.assign(button.style, {
    position: 'fixed', right: '18px', bottom: '18px', zIndex: '9999',
    border: '1px solid #65d99b', borderRadius: '999px', padding: '12px 18px',
    background: '#163524', color: '#fff', font: '700 14px system-ui, sans-serif',
    boxShadow: '0 8px 28px rgba(0,0,0,.42)', cursor: 'pointer'
  });

  button.addEventListener('click', async () => {
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
})();

