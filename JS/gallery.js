const cloudName = "dcn07mkj4"; // Your Cloudinary Cloud Name

// Function to generate Cloudinary URL dynamically
function generateImageUrl(imageId) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${imageId}.png`;
}

// Function to check if an image exists
function checkImageExists(imageId) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = generateImageUrl(imageId);
  });
}

// Function to open image in a gallery popup with swipe support
function openGallery(imageSrc) {
  const galleryOverlay = document.createElement("div");
  galleryOverlay.id = "gallery-overlay";
  galleryOverlay.innerHTML = `
    <div class="gallery-content">
      <img id="gallery-image" src="${imageSrc}" />
      <button id="prev-image">&#10094;</button>
      <button id="next-image">&#10095;</button>
      <button id="close-gallery">&times;</button>
    </div>
  `;
  document.body.appendChild(galleryOverlay);
  
  const images = Array.from(document.querySelectorAll(".image-wrapper img"));
  let currentIndex = images.findIndex(img => img.src === imageSrc);
  
  function updateImage(index) {
    if (index >= 0 && index < images.length) {
      document.getElementById("gallery-image").src = images[index].src;
      currentIndex = index;
    }
  }

  document.getElementById("prev-image").addEventListener("click", () => updateImage(currentIndex - 1));
  document.getElementById("next-image").addEventListener("click", () => updateImage(currentIndex + 1));
  document.getElementById("close-gallery").addEventListener("click", () => galleryOverlay.remove());
}

// Function to load images dynamically
async function loadImages() {
  const gallery = document.getElementById("gallery-container");
  gallery.innerHTML = ""; // Clear previous images

  let highestId = 0;
  let successfullyLoadedImages = 0;
  let imageElements = "";
  let hiddenImages = "";

  for (let i = 1; i <= 99; i++) {
    const imageId = `ID${String(i).padStart(6, "0")}`; // Format as ID000001, ID000002, etc.

    const exists = await checkImageExists(imageId);
    if (!exists) {
      console.log(`Image ${imageId} not found. Stopping search.`);
      break; // Stop searching for more images
    }

    const imageHTML = `
        <img src="${generateImageUrl(imageId)}" alt="Image ${imageId}" onclick="openGallery('${generateImageUrl(imageId)}')" />
    `;

    if (successfullyLoadedImages < 6) {
      imageElements += imageHTML;
    } else {
      hiddenImages += imageHTML;
    }

    successfullyLoadedImages++;
    highestId = i; // Update highestId correctly
    console.log(`Successfully loaded ${imageId}`);
  }

  gallery.innerHTML = `
    <div class="row clearfix">
    </div>
  `;

  console.log(`Successfully loaded ${successfullyLoadedImages} images.`);
  console.log("Highest ID found:", highestId);
  window.nextImageId = `ID${String(highestId + 1).padStart(6, "0")}`;
  console.log("Next available ID for upload:", window.nextImageId);

  document.getElementById("show-more").addEventListener("click", function () {
    document.getElementById("hidden-gallery").style.display = "block";
    this.style.display = "none";
    document.getElementById("show-less").style.display = "block";
  });

  document.getElementById("show-less").addEventListener("click", function () {
    document.getElementById("hidden-gallery").style.display = "none";
    this.style.display = "none";
    document.getElementById("show-more").style.display = "block";
  });
}

// Function to upload an image
function uploadImage() {
  const fileInput = document.getElementById("imageUpload");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an image to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default");
  const imageId = window.nextImageId || "ID000001";
  formData.append("public_id", imageId);

  fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.secure_url) {
        console.log("Image uploaded successfully", data.secure_url);
        loadImages(); // Reload images after upload
      } else {
        alert("Error uploading image.");
      }
    })
    .catch((error) => {
      console.error("Error uploading image", error);
      alert("Error uploading image.");
    });
}

// Load images when the page loads
window.onload = loadImages;
