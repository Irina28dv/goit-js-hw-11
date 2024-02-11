import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const galleryContainer = document.querySelector('.gallery');
const searchForm = document.querySelector('.search-form');
const loaderContainer = document.querySelector('.loader');
const GALLERY_LINK = 'gallery-link';

let loadedPage = 1;

const showMoreButton = document.getElementById('load-more');

showMoreButton.addEventListener('click', function () {
  loaderContainer.style.display = 'block';

  fetchImages(searchForm.elements.query.value, loadedPage)
    .then(function ({ hits }) {
      if (Array.isArray(hits) && hits.length > 0) {
        const galleryHTML = hits.map(createGallery).join('');
        galleryContainer.innerHTML += galleryHTML;
        loadedPage++;
      } else {
        toastError('No more images to load.');
        showMoreButton.style.display = 'none';
      }
    })
    .catch(function (error) {
      toastError(`Error fetching images: ${error}`);
    })
    .finally(function () {
      loaderContainer.style.display = 'none';
    });
});

searchForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const queryInput = event.target.elements.query.value;

  if (queryInput === '') {
    return;
  }

  galleryContainer.innerHTML = '';
  loaderContainer.style.display = 'block';

  fetchImages(queryInput)
    .then(function ({ hits, total }) {
      if (Array.isArray(hits) && hits.length > 0) {
        const galleryHTML = hits.map(createGallery).join('');
        galleryContainer.innerHTML = galleryHTML;

        toastSuccess(`Was found: ${total} images`);

        const lightbox = new SimpleLightbox(`.${GALLERY_LINK}`);
        lightbox.refresh();
        showMoreButton.style.display = 'block';
      } else {
        toastError(
          'Sorry, there are no images matching your search query. Please try again!'
        );
        showMoreButton.style.display = 'none';
      }
    })
    .catch(function (error) {
      toastError(`Error fetching images: ${error}`);
    })
    .finally(function () {
      searchForm.reset();
      loaderContainer.style.display = 'none';
    });
});

const toastOptions = {
  titleColor: '#FFFFFF',
  messageColor: '#FFFFFF',
  messageSize: '16px',
  position: 'topRight',
  displayMode: 'replace',
  closeOnEscape: true,
  pauseOnHover: false,
  maxWidth: 432,
  messageSize: '16px',
  messageLineHeight: '24px',
};

function toastError(message) {
  iziToast.show({
    message,
    backgroundColor: '#EF4040',
    progressBarColor: '#FFE0AC',
    icon: 'icon-close',
    ...toastOptions,
  });
}

function toastSuccess(message) {
  iziToast.show({
    message,
    backgroundColor: '#59A10D',
    progressBarColor: '#B5EA7C',
    icon: 'icon-chek',
    ...toastOptions,
  });
}

const BASE_URL = 'https://pixabay.com/api/';

function fetchImages(q, page) {
  const searchParams = new URLSearchParams({
    key: '42317586-b983a1ee46e38e925d954d84d',
    q,
    image_type: 'photo',
    orientation: 'horizontal',
    safeSearch: true,
    per_page: 6,
    page,
  });

  const PARAMS = `?${searchParams}`;
  const url = BASE_URL + PARAMS;

  return fetch(url)
    .then(response => response.json())
    .catch(error => {
      toastError(`Error fetching images: ${error}`);
      throw error;
    });
}

function createGallery({
  largeImageURL,
  tags,
  webformatURL,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
  <a href="${largeImageURL}" class="${GALLERY_LINK}">
     <figure>
      <img src="${webformatURL}" alt="${tags}" class="gallery-image">
      <figcaption class="gallery__figcaption">
        <div class="image-item">Likes <span class="image-elem">${likes}</span></div>
        <div class="image-item">Views <span class="image-elem">${views}</span></div>
        <div class="image-item">Comments <span class="image-elem">${comments}</span></div>
        <div class="image-item">Downloads <span class="image-elem">${downloads}</span></div>
      </figcaption>
     </figure>
  </a>
`;
}
