// public/js/register.js
// ================================
// Registration page script
// ================================
const API_URL = API_BASE_URL;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.getElementById("name")?.value || "").trim();
    const email = (document.getElementById("email")?.value || "").trim();
    const password = (document.getElementById("password")?.value || "").trim();

    if (!name || !email || !password) {
      alert("All fields are required.");
      return;
    }
    if (!isValidEmail(email)) {
      alert("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      alert("Password should be at least 6 characters.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! You can now log in.");
        window.location.href = "/login.html";
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Server error during registration.");
    }
  });
});
