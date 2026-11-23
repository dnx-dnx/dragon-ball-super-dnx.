(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const title = document.getElementById('episode-title');
  const number = document.getElementById('episode-number');
  const frame = document.getElementById('mega-player');
  const placeholder = document.getElementById('player-placeholder');
  const note = document.getElementById('player-note');

  function showError(message, detail = '') {
    title.textContent = message;
    placeholder.hidden = false;
    placeholder.innerHTML = '<div class="empty-player"></div>';
    placeholder.querySelector('.empty-player').textContent =
      detail || 'Vuelve al catálogo y selecciona un capítulo disponible.';
    frame.hidden = true;
    frame.removeAttribute('src');
  }

  fetch('capitulos.json')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar capitulos.json');
      return response.json();
    })
    .then(data => {
      const episodes = Array.isArray(data.capitulos) ? data.capitulos : [];
      const ep = episodes.find(item => String(item.id) === String(id));

      if (!ep) {
        showError('Capítulo no encontrado');
        number.textContent = 'El identificador no existe en el catálogo.';
        return;
      }

      title.textContent = ep.titulo;
      number.textContent = 'CAPÍTULO ' + String(ep.numero).padStart(3, '0');
      document.title = number.textContent + ' | ' + ep.titulo + ' | Dragon Ball Super Latino by DNX';

      if (!ep.embedUrl) {
        showError('Reproductor no configurado', 'Este capítulo todavía no tiene un enlace de reproducción.');
        return;
      }

      try {
        const url = new URL(ep.embedUrl);
        const host = url.hostname.toLowerCase();
        let providerNote = '';

        if ((host === 'mega.nz' || host === 'www.mega.nz') &&
            url.pathname.startsWith('/embed/')) {
          providerNote = 'Reproductor de MEGA. Si solicita una acción, sigue las indicaciones del proveedor.';
        } else if ((host === 'drive.google.com' || host === 'www.drive.google.com') &&
                   /^\/file\/d\/[A-Za-z0-9_-]+\/preview\/?$/.test(url.pathname)) {
          providerNote = 'Reproductor de Google Drive. El archivo debe tener permiso de acceso para quienes tengan el enlace.';
        } else {
          throw new Error('El enlace no corresponde a un formato de inserción admitido de MEGA o Google Drive.');
        }

        frame.src = url.href;
        frame.hidden = false;
        placeholder.hidden = true;
        note.textContent = providerNote;
      } catch (error) {
        showError('Enlace de reproducción no válido', error.message);
        note.textContent = '';
      }
    })
    .catch(() => {
      showError('No se pudo cargar el capítulo', 'Comprueba que capitulos.json esté publicado en la raíz del repositorio.');
    });
})();
