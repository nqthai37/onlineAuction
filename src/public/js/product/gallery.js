// ==================== GALLERY & LIGHTBOX ====================
// Dependencies: window.PRODUCT_CONFIG.galleryImages

let currentImageIndex = 0;

function galleryNext() {
  const thumbnails = document.querySelectorAll('.gallery-thumb');
  if (thumbnails.length > 0) {
    const nextIndex = (currentImageIndex + 1) % thumbnails.length;
    thumbnails[nextIndex].click();
  }
}

function galleryPrev() {
  const thumbnails = document.querySelectorAll('.gallery-thumb');
  if (thumbnails.length > 0) {
    const prevIndex = (currentImageIndex - 1 + thumbnails.length) % thumbnails.length;
    thumbnails[prevIndex].click();
  }
}

function changeMainImage(element, index) {
  const imgSrc = element.querySelector('img').src;
  document.getElementById('mainImage').src = imgSrc;
  currentImageIndex = index;

  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.classList.remove('active');
  });
  element.classList.add('active');
}

function openLightbox(index) {
  const galleryImages = window.PRODUCT_CONFIG.galleryImages;
  currentImageIndex = index;
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');

  lightboxImage.src = galleryImages[index];
  document.getElementById('currentImageNum').textContent = index + 1;
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function nextImage() {
  const galleryImages = window.PRODUCT_CONFIG.galleryImages;
  currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
  document.getElementById('lightboxImage').src = galleryImages[currentImageIndex];
  document.getElementById('currentImageNum').textContent = currentImageIndex + 1;
}

function prevImage() {
  const galleryImages = window.PRODUCT_CONFIG.galleryImages;
  currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
  document.getElementById('lightboxImage').src = galleryImages[currentImageIndex];
  document.getElementById('currentImageNum').textContent = currentImageIndex + 1;
}

// Keyboard navigation
document.addEventListener('keydown', function (event) {
  const lightbox = document.getElementById('lightbox');
  if (lightbox.style.display === 'flex') {
    if (event.key === 'ArrowLeft') prevImage();
    if (event.key === 'ArrowRight') nextImage();
    if (event.key === 'Escape') closeLightbox();
  }
});

// Click on main image to open lightbox
window.addEventListener('load', function () {
  const mainImage = document.getElementById('mainImage');
  if (mainImage) {
    mainImage.addEventListener('click', function () {
      openLightbox(currentImageIndex);
    });
  }
});

// Toggle Description Section
function toggleDescription() {
  const descContent = document.getElementById('descriptionContent');
  const descToggle = document.getElementById('descriptionToggle');
  const isHidden = descContent.style.display === 'none';

  descContent.style.display = isHidden ? 'block' : 'none';
  descToggle.innerHTML = isHidden
    ? '<i class="bi bi-chevron-up"></i>'
    : '<i class="bi bi-chevron-down"></i>';
}

// Toggle Details Section
function toggleDetails() {
  const detailsContent = document.getElementById('detailsContent');
  const detailsToggle = document.getElementById('detailsToggle');
  const isHidden = detailsContent.style.display === 'none';

  detailsContent.style.display = isHidden ? 'block' : 'none';
  detailsToggle.innerHTML = isHidden
    ? '<i class="bi bi-chevron-up"></i>'
    : '<i class="bi bi-chevron-down"></i>';
}
