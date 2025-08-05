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
  const img = document.getElementById("lightbox-img");
  const wrapper = document.getElementById("lightbox-img-wrapper");

  // Measure current size
  const prevWidth = wrapper.offsetWidth;
  const prevHeight = wrapper.offsetHeight;

  img.onload = function() {
    // Calculate new size
    let newWidth = img.naturalWidth;
    let newHeight = img.naturalHeight;
    const maxW = window.innerWidth * 0.5;
    const maxH = window.innerHeight * 0.6;
    // Scale down if needed
    const widthRatio = newWidth / maxW;
    const heightRatio = newHeight / maxH;
    if (widthRatio > 1 || heightRatio > 1) {
      const scale = Math.max(widthRatio, heightRatio);
      newWidth = newWidth / scale;
      newHeight = newHeight / scale;
    }
    // Set wrapper to previous size
    wrapper.style.width = prevWidth + "px";
    wrapper.style.height = prevHeight + "px";
    // Force reflow
    void wrapper.offsetWidth;
    // Animate to new size
    wrapper.style.width = newWidth + "px";
    wrapper.style.height = newHeight + "px";
  };

  // Set new image src (triggers onload)
  img.src = photo.src;

  // Fill exif-info fields
  document.getElementById("exif-camera").textContent = photo.camera || '';
  document.getElementById("exif-lens").textContent = photo.lens || '';
  document.getElementById("exif-focal").textContent = photo.focal || '';
  document.getElementById("exif-aperture").textContent = photo.aperture || '';
  document.getElementById("exif-shutter").textContent = photo.shutter || '';
  document.getElementById("exif-iso").textContent = photo.iso || '';
  // Render thumbnails
  renderLightboxThumbs();
  // Scroll selected thumbnail into view
  setTimeout(() => {
    const thumbs = document.getElementById("lightbox-thumbs");
    if (thumbs) {
      const selected = thumbs.querySelector('.selected');
      if (selected) {
        selected.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, 0);
  document.getElementById("lightbox").classList.remove("hidden");
  updateLightboxControls();
  // Always re-attach close button event
  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) closeBtn.onclick = closeLightbox;
}

function renderLightboxThumbs() {
  const thumbs = document.getElementById("lightbox-thumbs");
  if (!thumbs) return;
  thumbs.innerHTML = "";
  currentPhotos.forEach((photo, idx) => {
    const img = document.createElement("img");
    img.src = photo.src;
    img.className = "lightbox-thumb" + (idx === currentPhotoIdx ? " selected" : "");
    img.onclick = () => {
      if (idx !== currentPhotoIdx) {
        animatePhotoFade(() => openLightbox(idx));
      }
    };
    thumbs.appendChild(img);
  });
  // Scroll selected into view
  const selected = thumbs.querySelector('.selected');
  if (selected) {
    selected.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

function updateLightboxControls() {
  document.getElementById("prev-btn").disabled = currentPhotoIdx === 0;
  document.getElementById("next-btn").disabled = currentPhotoIdx === currentPhotos.length - 1;
}

function animatePhotoFade(callback) {
  const img = document.getElementById('lightbox-img');
  if (!img) return callback();
  img.classList.add('fading');
  setTimeout(() => {
    callback();
    img.classList.remove('fading');
  }, 500); // match CSS transition duration
}

// Update prev/next handlers to animate

document.getElementById("prev-btn").onclick = () => {
  if (currentPhotoIdx > 0) {
    animatePhotoFade(() => openLightbox(currentPhotoIdx - 1));
  }
};
document.getElementById("next-btn").onclick = () => {
  if (currentPhotoIdx < currentPhotos.length - 1) {
    animatePhotoFade(() => openLightbox(currentPhotoIdx + 1));
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