/**
 * NASA APOD Fetch Demo
 * Fetches Astronomy Picture of the Day from NASA API and updates the UI
 * + Clean image loading indicator (no CORS issues)
 */

// DOM elements
const dateParagraph = document.getElementById("apiline4fetch");
const explanationParagraph = document.getElementById("apiline5fetch");
const statusParagraph = document.getElementById("apiline6fetch");
const nasaImage = document.getElementById("imgfromnasafetch");
const loadingIndicator = document.getElementById("imageLoadingIndicator");
const loadingText = document.getElementById("imageLoadingText");

// NASA API configuration
const NASA_API_KEY =
  typeof process !== "undefined" && process.env && process.env.NASA_API_KEY
    ? process.env.NASA_API_KEY
    : "DEMO_KEY";
const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

function fetchNASAImage() {
  console.log("🚀 Starting NASA APOD fetch...");

  // Show loading state immediately
  nasaImage.src = "images/loading.jpg";
  dateParagraph.textContent = "Loading...";
  explanationParagraph.textContent =
    "Fetching beautiful space image from NASA...";
  statusParagraph.textContent = "Please wait...";

  // Quick fallback if network is very slow
  const errorTimeout = setTimeout(() => {
    explanationParagraph.textContent =
      "Sorry, something went wrong while fetching from NASA.";
    statusParagraph.textContent = "❌ Failed to load image. Please try again.";
  }, 8000);

  fetch(NASA_APOD_URL)
    .then((response) => {
      clearTimeout(errorTimeout);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      clearTimeout(errorTimeout);
      console.log("✅ NASA APOD data received:", data);

      dateParagraph.textContent = data.date || "No date available";
      explanationParagraph.textContent =
        data.explanation || "No explanation available";
      statusParagraph.textContent =
        "✅ API from NASA loaded successfully. Thank you!";

      const imageUrl = data.hdurl || data.url;
      if (imageUrl) {
        showImageWithLoadingIndicator(imageUrl);
      } else {
        nasaImage.src = "images/image1.jpg";
        if (loadingIndicator) loadingIndicator.style.display = "none";
      }
    })
    .catch((error) => {
      clearTimeout(errorTimeout);
      console.error("❌ Fetch error:", error);
      nasaImage.src = "images/loading.jpg";
      dateParagraph.textContent = "Loading...";
      explanationParagraph.textContent =
        "Sorry, something went wrong while fetching from NASA.";
      statusParagraph.textContent =
        "❌ Failed to load image. Please try again.";
      if (loadingIndicator) loadingIndicator.style.display = "none";
    });
}

/**
 * Displays the NASA image with a nice loading indicator
 */
function showImageWithLoadingIndicator(imageUrl) {
  if (loadingIndicator) loadingIndicator.style.display = "block";
  if (loadingText) loadingText.textContent = "Loading high-resolution image...";

  // Use native <img> loading (no CORS issues)
  nasaImage.onload = () => {
    if (loadingIndicator) loadingIndicator.style.display = "none";
    console.log("✅ Image fully loaded");
  };

  nasaImage.onerror = () => {
    if (loadingIndicator) loadingIndicator.style.display = "none";
    nasaImage.src = "images/image1.jpg";
    console.error("Image failed to load");
  };

  nasaImage.src = imageUrl;
}

// Make function available for HTML onclick
window.LetsCallAPIFetch = fetchNASAImage;
