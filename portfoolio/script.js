// --- Configuration ---

const equipment = [
  "Canon EOS R5",
  "RF 24-70mm f/2.8L",
  "Sigma Art 35mm f/1.4",
  "DJI Mavic Air 2",
  "Manfrotto Tripod"
];

const bio = `Kamil. Leśny Nerd. Black Kestrel Photography`;

// --- Cached DOM Elements ---
let cachedElements = {};

function getElement(id) {
  if (!cachedElements[id]) {
    cachedElements[id] = document.getElementById(id);
  }
  return cachedElements[id];
}

// --- Performance Optimized Event Handlers ---
let mousemoveTimeout;
function debouncedMousemove(e) {
  clearTimeout(mousemoveTimeout);
  mousemoveTimeout = setTimeout(() => {
    const bg = getElement('dynamic-bg');
    if (bg) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      bg.style.transform = `scale(1.15) translate(${x * 18}px, ${y * 18}px)`;
    }
  }, 16); // ~60fps
}

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  renderAlbums();
  renderPhotographer();
  setRandomBackground();
  animateBackgroundPan();

  // Optimized event listeners
  const bg = getElement('dynamic-bg');
  if (bg) {
    document.addEventListener('mousemove', debouncedMousemove, { passive: true });
    document.addEventListener('mouseleave', () => {
      bg.style.transform = 'scale(1.15) translate(0,0)';
    });
  }

  // Keyboard controls
  document.addEventListener("keydown", handleLightboxKey);

  // Click outside to close
  const lightbox = getElement("lightbox");
  if (lightbox) {
    lightbox.onclick = function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    };
  }
});

// --- Optimized Album Rendering ---
function renderAlbums() {
  const grid = getElement("albums-grid");
  if (!grid) return;

  var albums = fetch('./assets/albums/manifest.json')
  .then(response => response.json())
  .then(data => {
    const fragment = document.createDocumentFragment();
    data.forEach((album, idx) => {
      const div = document.createElement("div");
      div.className = "album-thumb";
      div.innerHTML = `
        <img src="assets/albums/${album.path}/${album.cover}" alt="${album.name}" loading="lazy">
        <div class="album-title">${album.name}</div>
      `;
      div.addEventListener("click", () => openAlbum(idx));
      fragment.appendChild(div);
    });
    grid.innerHTML = "";
    grid.appendChild(fragment);
  });

  
}

function renderPhotographer() {
  const eqList = getElement("equipment-list");
  if (!eqList) return;
  
  const fragment = document.createDocumentFragment();
  equipment.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    fragment.appendChild(li);
  });
  eqList.innerHTML = "";
  eqList.appendChild(fragment);
  
  const bioText = getElement("bio-text");
  if (bioText) bioText.textContent = bio;
}

// --- Album Lightbox Logic ---
let currentAlbumIdx = null;
let currentPhotoIdx = null;
let currentPhotos = [];
let preloadedImages = new Set();

function openAlbum(albumIdx) {
  var data = fetch('./assets/albums/manifest.json')
  .then(response => response.json())
  .then(albums => {
    currentAlbumIdx = albumIdx;
    const album = albums[albumIdx];
    fetchAlbumPhotos(album.path).then(photos => {
      currentPhotos = photos;
      preloadImages(photos);
      openLightbox(0);
    });
  });
}

function preloadImages(photos) {
  photos.forEach(photo => {
    if (!preloadedImages.has(photo.src)) {
      const img = new Image();
      img.src = photo.src;
      preloadedImages.add(photo.src);
    }
  });
}

function fetchAlbumPhotos(folder) {
  return fetch(`assets/albums/${folder}/manifest.json`)
    .then(r => r.json())
    .then(list =>
      list.map(photo => ({
        src: photo.file.startsWith('http') ? photo.file : `assets/albums/${folder}/${photo.file}`,
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

function openLightbox(photoIdx) {
  currentPhotoIdx = photoIdx;
  const photo = currentPhotos[photoIdx];
  const img = getElement("lightbox-img");
  const wrapper = getElement("lightbox-img-wrapper");
  const lightbox = getElement("lightbox");

  if (!img || !wrapper || !lightbox) return;

  // Measure current size
  const prevWidth = wrapper.offsetWidth;
  const prevHeight = wrapper.offsetHeight;

  img.onload = function() {
    // Calculate new size
    let newWidth = img.naturalWidth;
    let newHeight = img.naturalHeight;
    const maxW = window.innerWidth * 0.5;
    const maxH = window.innerHeight * 0.6;
    
    const widthRatio = newWidth / maxW;
    const heightRatio = newHeight / maxH;
    if (widthRatio > 1 || heightRatio > 1) {
      const scale = Math.max(widthRatio, heightRatio);
      newWidth = newWidth / scale;
      newHeight = newHeight / scale;
    }
    
    // Animate size change
    wrapper.style.width = prevWidth + "px";
    wrapper.style.height = prevHeight + "px";
    void wrapper.offsetWidth; // Force reflow
    wrapper.style.width = newWidth + "px";
    wrapper.style.height = newHeight + "px";
  };

  img.src = photo.src;

  // Update EXIF fields efficiently
  const exifFields = ['camera', 'lens', 'focal', 'aperture', 'shutter', 'iso'];
  exifFields.forEach(field => {
    const element = getElement(`exif-${field}`);
    if (element) element.textContent = photo[field] || '';
  });

  renderLightboxThumbs();
  
  // Scroll selected thumbnail into view
  requestAnimationFrame(() => {
    const thumbs = getElement("lightbox-thumbs");
    if (thumbs) {
      const selected = thumbs.querySelector('.selected');
      if (selected) {
        selected.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  });

  lightbox.classList.remove("hidden");
  updateLightboxControls();
  
  // Re-attach close button
  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) closeBtn.onclick = closeLightbox;
}

function renderLightboxThumbs() {
  const thumbs = getElement("lightbox-thumbs");
  if (!thumbs) return;
  
  const fragment = document.createDocumentFragment();
  currentPhotos.forEach((photo, idx) => {
    const img = document.createElement("img");
    img.src = photo.src;
    img.className = "lightbox-thumb" + (idx === currentPhotoIdx ? " selected" : "");
    img.onclick = () => {
      if (idx !== currentPhotoIdx) {
        animatePhotoFade(() => openLightbox(idx));
      }
    };
    fragment.appendChild(img);
  });
  
  thumbs.innerHTML = "";
  thumbs.appendChild(fragment);
  
  // Scroll selected into view
  const selected = thumbs.querySelector('.selected');
  if (selected) {
    selected.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

function updateLightboxControls() {
  const prevBtn = getElement("prev-btn");
  const nextBtn = getElement("next-btn");
  
  if (prevBtn) prevBtn.disabled = currentPhotoIdx === 0;
  if (nextBtn) nextBtn.disabled = currentPhotoIdx === currentPhotos.length - 1;
}

function animatePhotoFade(callback) {
  const img = getElement('lightbox-img');
  if (!img) return callback();
  
  img.classList.add('fading');
  setTimeout(() => {
    callback();
    img.classList.remove('fading');
  }, 500);
}

// Event handlers
getElement("prev-btn").onclick = () => {
  if (currentPhotoIdx > 0) {
    animatePhotoFade(() => openLightbox(currentPhotoIdx - 1));
  }
};

getElement("next-btn").onclick = () => {
  if (currentPhotoIdx < currentPhotos.length - 1) {
    animatePhotoFade(() => openLightbox(currentPhotoIdx + 1));
  }
};

function closeLightbox() {
  const lightbox = getElement("lightbox");
  if (lightbox) lightbox.classList.add("hidden");
}

function handleLightboxKey(e) {
  const lightbox = getElement("lightbox");
  if (!lightbox || lightbox.classList.contains("hidden")) return;
  
  if (e.key === "ArrowLeft") {
    if (currentPhotoIdx > 0) animatePhotoFade(() => openLightbox(currentPhotoIdx - 1));
  } else if (e.key === "ArrowRight") {
    if (currentPhotoIdx < currentPhotos.length - 1) animatePhotoFade(() => openLightbox(currentPhotoIdx + 1));
  } else if (e.key === "Escape") {
    closeLightbox();
  }
}

// --- Optimized Background Functions ---
function setRandomBackground() {
  const albumManifests = [
    'assets/albums/album1/manifest.json',
    'assets/albums/album2/manifest.json'
  ];
  
  Promise.all(albumManifests.map(manifest => 
    fetch(manifest).then(r => r.json())
  )).then(results => {
    const allPhotos = results.flatMap((list, idx) => 
      list.map(photo => `assets/albums/${albumManifests[idx].split('/')[2]}/${photo.file}`)
    );
    
    if (allPhotos.length > 0) {
      const randomSrc = allPhotos[Math.floor(Math.random() * allPhotos.length)];
      const bg = getElement('dynamic-bg');
      if (bg) {
        bg.style.backgroundImage = `url('${randomSrc}')`;
      }
    }
  });
}

function animateBackgroundPan() {
  const bg = getElement('dynamic-bg');
  if (!bg) return;
  
  bg.style.transform = 'scale(1.15) translateX(0)';
  setTimeout(() => {
    bg.style.transition = 'transform 60s linear';
    bg.style.transform = 'scale(1.15) translateX(-12vw)';
  }, 300);
}

// --- Page Transition Animation ---
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = 0;
  requestAnimationFrame(() => {
    document.body.style.transition = "opacity 0.7s";
    document.body.style.opacity = 1;
  });
});