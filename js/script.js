// Find the date picker inputs and gallery elements on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const button = document.querySelector('button');

// NASA API key for the Astronomy Picture of the Day endpoint
const apiKey = 'DEMO_KEY';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Listen for the button click and request new space images
button.addEventListener('click', getSpaceImages);

function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    gallery.innerHTML = '<div class="placeholder"><p>Please choose a valid date range.</p></div>';
    return;
  }

  button.textContent = 'Loading...';
  button.disabled = true;
  gallery.innerHTML = '<div class="placeholder"><p>Loading amazing space photos...</p></div>';

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to load space images right now.');
      }

      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) {
        gallery.innerHTML = '<div class="placeholder"><p>No images were found for that date range.</p></div>';
        return;
      }

      gallery.innerHTML = '';

      data.forEach((photo) => {
        if (photo.media_type !== 'image') {
          return;
        }

        const card = document.createElement('article');
        card.className = 'gallery-item';

        card.innerHTML = `
          <img src="${photo.url}" alt="${photo.title}" />
          <h2>${photo.title}</h2>
          <p>${photo.explanation}</p>
        `;

        gallery.appendChild(card);
      });
    })
    .catch((error) => {
      gallery.innerHTML = `<div class="placeholder"><p>${error.message}</p></div>`;
      console.error(error);
    })
    .finally(() => {
      button.textContent = 'Get Space Images';
      button.disabled = false;
    });
}
