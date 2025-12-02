// Dynamically set API base URL depending on environment
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://iregistrar-integrated.onrender.com/api";
