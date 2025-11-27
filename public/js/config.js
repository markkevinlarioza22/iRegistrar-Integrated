// public/js/config.js
// Automatically switch between local and deployed backend
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://iregistrar-integrated.onrender.com/api";
