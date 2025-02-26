const cloudName = "dcn07mkj4"; // Your Cloudinary Cloud Name

function generateImageUrl(imageId) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${imageId}.png`;
}

async function checkImageExists(imageId) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = generateImageUrl(imageId);
  });
}

let currentGalleryIndex = 0;
let galleryImages = [];

function openGallery(imageSrc, images, index) {
  galleryImages = images;
  currentGalleryIndex = index;

  const galleryOverlay = document.createElement("div");
  galleryOverlay.id = "gallery-overlay";
  galleryOverlay.innerHTML = `
    <div class="gallery-content">
      <button id="prev-image">&#10094;</button>
      <img id="gallery-image" src="${imageSrc}" />
      <button id="next-image">&#10095;</button>
      <button id="close-gallery">&times;</button>
    </div>
  `;
  document.body.appendChild(galleryOverlay);

  function updateImage(index) {
    if (index >= 0 && index < galleryImages.length) {
      const imgElement = document.getElementById("gallery-image");
      imgElement.style.opacity = "0";
      setTimeout(() => {
        imgElement.src = galleryImages[index];
        imgElement.style.opacity = "1";
      }, 200);
      currentGalleryIndex = index;
    }
  }

  document.getElementById("prev-image").addEventListener("click", () => updateImage(currentGalleryIndex - 1));
  document.getElementById("next-image").addEventListener("click", () => updateImage(currentGalleryIndex + 1));
  document.getElementById("close-gallery").addEventListener("click", () => galleryOverlay.remove());
}

async function loadImages() {
  const galleryMain = document.getElementById("gallery-main");
  const hiddenGallery = document.getElementById("hidden-gallery");
  galleryMain.innerHTML = "";
  hiddenGallery.innerHTML = "";

  let successfullyLoadedImages = 0;
  let imagesArray = [];

  for (let i = 1; i <= 99; i++) {
    const imageId = `ID${String(i).padStart(6, "0")}`;
    const exists = await checkImageExists(imageId);
    if (!exists) break;

    const imageUrl = generateImageUrl(imageId);
    imagesArray.push(imageUrl);
    const imageElement = `<img class="gallery-image" src="${imageUrl}" alt="Image ${imageId}" onclick="openGallery('${imageUrl}', ${JSON.stringify(imagesArray)}, ${i - 1})" />`;

    if (successfullyLoadedImages < 6) {
      galleryMain.innerHTML += imageElement;
    } else {
      hiddenGallery.innerHTML += imageElement;
    }

    successfullyLoadedImages++;
  }

  document.getElementById("show-more").addEventListener("click", function () {
    hiddenGallery.style.display = "block";
    this.style.display = "none";
    document.getElementById("show-less").style.display = "block";
  });

  document.getElementById("show-less").addEventListener("click", function () {
    hiddenGallery.style.display = "none";
    this.style.display = "none";
    document.getElementById("show-more").style.display = "block";
  });
}

document.addEventListener("DOMContentLoaded", loadImages);

document.head.insertAdjacentHTML("beforeend", `
  <style>
    #gallery-main, #hidden-gallery {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }
    .gallery-image {
      width: 150px;
      height: 150px;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    .gallery-image:hover {
      transform: scale(1.1);
    }
    #gallery-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .gallery-content {
      position: relative;
      display: flex;
      align-items: center;
    }
    #gallery-image {
      max-width: 80vw;
      max-height: 80vh;
      transition: opacity 0.3s ease-in-out;
    }
    #prev-image, #next-image, #close-gallery {
      position: absolute;
      background: rgba(255, 255, 255, 0.5);
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 10px;
    }
    #prev-image { left: 10px; top: 50%; transform: translateY(-50%); }
    #next-image { right: 10px; top: 50%; transform: translateY(-50%); }
    #close-gallery { top: 10px; right: 10px; }
  </style>
`);
