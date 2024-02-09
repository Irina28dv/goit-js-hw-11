import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import 'izitoast/dist/css/iziToast.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_URL = 'https://pixabay.com/api/';

const alertError = {
  message:
    'Sorry, there are no images matching your search query. Please try again!',
  color: '#EF4040',
  position: 'topRight',
  icon: 'icon-octagon',
  iconText: '',
  timeout: 5000,
  titleColor: '#fff',
  messageColor: '#fff',
  iconColor: '#fff',
};
const paramsOptions = {
  key: '41411708-a2ea7fc9ae3454ee0834f0813',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 9,
};

const findPhotoForm = document.querySelector('.form');
const galleryList = document.querySelector('ul.gallery');
const loader = document.querySelector('.loader');
const showMoreButton = document.querySelector('#show-more');

let loadedPage = 1,
  searchQuery = '';

const lightbox = new SimpleLightbox('.gallery a', {
  sourceAttr: 'data-source',
  captionsData: 'alt',
  captionDelay: 250,
});

const fetchPhoto = (value, page) => {
  const searchParams = new URLSearchParams({
    ...paramsOptions,
    q: value,
    page,
  });
  return fetch(`${API_URL}?${searchParams}`).then(response => {
    if (!response.ok) throw new Error(response.status);
    return response.json();
  });
};

const addPhotos = photos => {
  galleryList.insertAdjacentHTML(
    'beforeend',
    photos
      .map(photo => {
        return `<li class="gallery-item">
                  <a class="gallery-link" href="${photo.largeImageURL}" data-source="${photo.largeImageURL}">
                    <img class="gallery-image" src="${photo.webformatURL}"  alt="${photo.tags}"/>
                  </a>
                </li>`;
      })
      .join('')
  );
  lightbox.refresh();
};

const handleSearchSubmit = event => {
  event.preventDefault();
  const searchText = event.target.elements.search.value.trim();
  event.target.elements.search.value = '';

  showMoreButton.classList.add('hidden');
  loader.classList.remove('hidden');
  galleryList.innerHTML = '';
  loadedPage = 1;

  fetchPhoto(searchText, loadedPage)
    .then(response => {
      const photos = response.hits;
      if (photos.length) {
        addPhotos(photos);
        showMoreButton.classList.remove('hidden');
        loadedPage++;
        searchQuery = searchText;
      } else {
        iziToast.show(alertError);
      }
    })
    .catch(error => iziToast.show({ ...alertError, message: error }))
    .finally(() => loader.classList.add('hidden'));
};

const handleSearchMore = () => {
  loader.classList.remove('hidden');
  showMoreButton.classList.add('hidden');

  fetchPhoto(searchQuery, loadedPage)
    .then(photos => {
      addPhotos(photos.hits);
      loadedPage++;
    })
    .catch(() => iziToast.show(alertError))
    .finally(() => {
      loader.classList.add('hidden');
      showMoreButton.classList.remove('hidden');
    });
};

findPhotoForm.addEventListener('submit', handleSearchSubmit);
showMoreButton.addEventListener('click', handleSearchMore);