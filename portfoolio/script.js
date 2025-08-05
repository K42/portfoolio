// --- Configuration ---
const albums = [
  {
    title: "Urban Shadows",
    folder: "album1",
    cover: "01.jpg"
  },
  {
    title: "Silent Forest",
    folder: "album2",
    cover: "01.jpg"
  }
  // Add more albums as needed
];

const equipment = [
  "Canon EOS R5",
  "RF 24-70mm f/2.8L",
  "Sigma Art 35mm f/1.4",
  "DJI Mavic Air 2",
  "Manfrotto Tripod"
];

const bio = `Jane Doe is a fine art photographer whose work explores the interplay of light and shadow in urban and natural landscapes. Her moody, evocative images have been featured in international exhibitions and publications.`;

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  renderAlbums();
  renderPhotographer();
});

// --- Render Albums Grid ---
function renderAlbums() {
  const grid = document.getElementById("albums-grid");
  grid.innerHTML = "";
  albums.forEach((album, idx) => {
    const div = document.createElement("div");
    div.className = "album-thumb";
    div.innerHTML = `
      <img src="assets/albums/${album.folder}/${album.cover}" alt="${album.title}">
      <div class="album-title">${album.title}</div>
    `;
    div.addEventListener("click", () => openAlbum(idx));
    grid.appendChild(div);
  });
}

// --- Render Photographer Section ---
function renderPhotographer() {
  // Equipment
  const eqList = document.getElementById("equipment-list");
  eqList.innerHTML = "";
  equipment.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    eqList.appendChild(li);
  });
  // Bio
  document.getElementById("bio-text").textContent = bio;
}

// --- Album Lightbox Logic ---
let currentAlbumIdx = null;
let currentPhotoIdx = null;
let currentPhotos = [];

function openAlbum(albumIdx) {
  currentAlbumIdx = albumIdx;
  const album = albums[albumIdx];
  // Dynamically load all jpgs in the album folder
  fetchAlbumPhotos(album.folder).then(photos => {
    currentPhotos = photos;
    openLightbox(0);
  });
}

// Update fetchAlbumPhotos to support new EXIF fields from manifest
function fetchAlbumPhotos(folder) {
  // Load manifest.json for the album
  return fetch(`assets/albums/${folder}/manifest.json`)
    .then(r => r.json())
    .then(list =>
      list.map(photo => ({
        src: `assets/albums/${folder}/${photo.file}`,
        desc: `assets/albums/${folder}/${photo.file.replace(/\.jpg$/i, '.txt')}`,
        title: photo.title || photo.file.replace(/\.jpg$/i, ''),
        camera: photo.camera || '',
        lens: photo.lens || '',
        focal: photo.focal || '',
        aperture: photo.aperture || '',
        shutter: photo.shutter || '',
        iso: photo.iso || ''
      }))
    );
}

// Update openLightbox to fill exif-info fields
function openLightbox(photoIdx) {
  currentPhotoIdx = photoIdx;
  const photo = currentPhotos[photoIdx];
  const lightbox = document.getElementById("lightbox");
  document.getElementById("lightbox-img").src = photo.src;
  // No filename or title in caption
  // Load description
 // fetch(photo.desc)
  // Fill exif-info fields
  document.getElementById("exif-camera").textContent = photo.camera || '';
  document.getElementById("exif-lens").textContent = photo.lens || '';
  document.getElementById("exif-focal").textContent = photo.focal || '';
  document.getElementById("exif-aperture").textContent = photo.aperture || '';
  document.getElementById("exif-shutter").textContent = photo.shutter || '';
  document.getElementById("exif-iso").textContent = photo.iso || '';
  lightbox.classList.remove("hidden");
  updateLightboxControls();
}

function updateLightboxControls() {
  document.getElementById("prev-btn").disabled = currentPhotoIdx === 0;
  document.getElementById("next-btn").disabled = currentPhotoIdx === currentPhotos.length - 1;
}

function animateLightboxContent(callback) {
  const content = document.querySelector('.lightbox-content');
  content.classList.add('fading');
  setTimeout(() => {
    callback();
    content.classList.remove('fading');
    content.classList.add('animating');
    setTimeout(() => {
      content.classList.remove('animating');
    }, 800); // match CSS animation duration
  }, 800); // match CSS animation duration
}

// Update prev/next handlers to animate

document.getElementById("prev-btn").onclick = () => {
  if (currentPhotoIdx > 0) {
    animateLightboxContent(() => openLightbox(currentPhotoIdx - 1));
  }
};
document.getElementById("next-btn").onclick = () => {
  if (currentPhotoIdx < currentPhotos.length - 1) {
    animateLightboxContent(() => openLightbox(currentPhotoIdx + 1));
  }
};
document.getElementById("back-btn").onclick = closeLightbox;
document.querySelector(".close-btn").onclick = closeLightbox;

function closeLightbox() {
  document.getElementById("lightbox").classList.add("hidden");
}

// --- EXIF Extraction (Browser limitations) ---
function extractEXIF(imgUrl) {
  // Browsers can't natively extract EXIF without a library.
  // For demo, we'll just return null.
  // If you want, you can implement a minimal EXIF parser in JS, but it's complex.
  return Promise.resolve(null);
}

function formatEXIF(exif) {
  // exif: {key: value, ...}
  return Object.entries(exif).map(([k, v]) => `<div><b>${k}:</b> ${v}</div>`).join("");
}

// --- Page Transition Animation ---
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = 0;
  setTimeout(() => {
    document.body.style.transition = "opacity 0.7s";
    document.body.style.opacity = 1;
  }, 100);
});