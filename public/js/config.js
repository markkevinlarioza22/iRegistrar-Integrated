// Automatically switch between local and deployed backend
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://iregistrar-integrated.onrender.com";

// Ensure the API URL always has a single slash
// public/js/config.js
// API base URL for Render deployment
const API_BASE_URL = "https://iregistrar-integrated.onrender.com/api";

