const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const button = document.getElementById('getImagesButton');
const spaceFact = document.getElementById('spaceFact');

const modal = document.getElementById('imageModal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Replace DEMO_KEY with your personal NASA API key before final submission.
const apiKey = 'DEMO_KEY';

const spaceFacts = [
  'A day on Venus is longer than a year on Venus.',
  'The Sun contains more than 99% of the mass in our solar system.',
  'One million Earths could fit inside the Sun.',
  'Neutron stars can spin hundreds of times every second.',
  'The footprints left by astronauts on the Moon may last for millions of years.',
  'Jupiter has the shortest day of any planet in our solar system.',
  'Light from the Sun takes about eight minutes to reach Earth.',
  'There are more stars in the universe than grains of sand on Earth.'
];

setupDateInputs(startInput, endInput);
displayRandomFact();
button.addEventListener('click', getSpaceImages);

modal.addEventListener('click', (event) => {
  if (event.target.hasAttribute('data-close-modal')) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) {
    closeModal();
  }
});

function displayRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  spaceFact.textContent = spaceFacts[randomIndex];
}

async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    showMessage('Please choose a valid start and end date.');
    return;
  }

  if (startDate > endDate) {
    showMessage('The start date must be before the end date.');
    return;
  }

  setLoadingState(true);
  showMessage('🔄 Loading space photos…');

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Unable to load space images right now. Please try again.');
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      showMessage('No APOD entries were found for that date range.');
      return;
    }

    displayGallery(data);
  } catch (error) {
    console.error(error);
    showMessage(error.message);
  } finally {
    setLoadingState(false);
  }
}

function displayGallery(items) {
  gallery.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'gallery-item';
    card.tabIndex = 0;

    const mediaMarkup = item.media_type === 'video'
      ? `
        <div class="video-preview">
          <span class="video-icon">▶</span>
          <p>NASA video entry</p>
        </div>
      `
      : `
        <img
          src="${item.url}"
          alt="${escapeHtml(item.title)}"
          loading="lazy"
        />
      `;

    card.innerHTML = `
      <div class="gallery-media">${mediaMarkup}</div>
      <div class="gallery-info">
        <h2>${escapeHtml(item.title)}</h2>
        <p class="image-date">${formatDate(item.date)}</p>
        <p class="view-details">Click to view details</p>
      </div>
    `;

    card.addEventListener('click', () => openModal(item));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(item);
      }
    });

    gallery.appendChild(card);
  });
}

function openModal(item) {
  modalTitle.textContent = item.title;
  modalDate.textContent = formatDate(item.date);
  modalExplanation.textContent = item.explanation;
  modalMedia.innerHTML = '';

  if (item.media_type === 'video') {
    const videoLink = document.createElement('a');
    videoLink.href = item.url;
    videoLink.target = '_blank';
    videoLink.rel = 'noopener noreferrer';
    videoLink.className = 'video-link';
    videoLink.textContent = 'Watch this NASA video in a new tab';
    modalMedia.appendChild(videoLink);
  } else {
    const image = document.createElement('img');
    image.src = item.hdurl || item.url;
    image.alt = item.title;
    modalMedia.appendChild(image);
  }

  modal.hidden = false;
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close').focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

function setLoadingState(isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Loading…' : 'Get Space Images';
}

function showMessage(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
