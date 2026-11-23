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
    link.setAttribute('aria-label', 'Abrir capítulo ' + String(ep.numero ?? ep.id).padStart(3, '0') + ': ' + (ep.titulo ?? ''));

    const imageWrap = document.createElement('span');
    imageWrap.className = 'episode-thumb-wrap';
    const image = document.createElement('img');
    image.className = 'episode-thumb';
    image.src = ep.thumbnail || '';
    image.alt = 'Escena del capítulo ' + String(ep.numero ?? ep.id).padStart(3, '0');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.onerror = () => { imageWrap.classList.add('thumbnail-missing'); image.remove(); };
    imageWrap.appendChild(image);

    const number = document.createElement('span');
    number.className = 'episode-number';
    number.textContent = String(ep.numero ?? ep.id).padStart(3, '0');

    const details = document.createElement('span');
    details.className = 'episode-details';
    const title = document.createElement('strong');
    title.textContent = ep.titulo ?? '';
    const subtitle = document.createElement('small');
    subtitle.textContent = 'Abrir reproductor';
    details.append(title, subtitle);

    const arrow = document.createElement('span');
    arrow.className = 'episode-arrow';
    arrow.textContent = '↗';
    link.append(imageWrap, number, details, arrow);
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
