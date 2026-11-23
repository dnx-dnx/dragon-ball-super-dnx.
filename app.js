let allEpisodes = [];

const list = document.getElementById('episodes');
const search = document.getElementById('search');

fetch('capitulos.json')
  .then(response => {
    if (!response.ok) throw new Error('No se pudo cargar el catálogo');
    return response.json();
  })
  .then(data => {
    allEpisodes = Array.isArray(data.capitulos) ? data.capitulos : [];
    render(allEpisodes);
  })
  .catch(() => {
    list.innerHTML = '<p class="empty">No se pudo cargar el catálogo. Comprueba que capitulos.json esté publicado en la raíz del repositorio.</p>';
    document.getElementById('count').textContent = '0 capítulos';
    document.getElementById('empty').hidden = true;
  });

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

function render(items) {
  list.innerHTML = '';

  document.getElementById('count').textContent =
    items.length + (items.length === 1 ? ' capítulo' : ' capítulos');

  document.getElementById('empty').hidden = items.length !== 0;

  items.forEach(ep => {
    const link = document.createElement('a');
    link.className = 'episode-card';
    link.href = 'ver.html?id=' + encodeURIComponent(ep.id);

    link.innerHTML =
      '<span class="episode-number"></span>' +
      '<span class="episode-details"><strong></strong><small></small></span>' +
      '<span class="episode-arrow">↗</span>';

    link.querySelector('.episode-number').textContent =
      String(ep.numero ?? ep.id).padStart(3, '0');

    link.querySelector('strong').textContent = ep.titulo ?? '';
    link.querySelector('small').textContent = 'Abrir reproductor';

    list.appendChild(link);
  });
}

search.addEventListener('input', () => {
  const query = search.value.trim();

  if (!query) {
    render(allEpisodes);
    return;
  }

  // Las búsquedas numéricas comparan el número exacto del capítulo.
  // "10" no coincide con "100 millones" en el título del capítulo 001.
  if (/^\d+$/.test(query)) {
    const episodeNumber = Number(query);
    render(allEpisodes.filter(ep => Number(ep.numero) === episodeNumber));
    return;
  }

  // Las búsquedas de texto ignoran mayúsculas y tildes.
  const normalizedQuery = normalizeText(query);
  render(allEpisodes.filter(ep =>
    normalizeText(ep.titulo).includes(normalizedQuery)
  ));
});
