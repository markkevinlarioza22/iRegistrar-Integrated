// public/js/login.js
// ================================
// Login page script
// ================================
const API_URL = API_BASE_URL;

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = (document.getElementById("email")?.value || "").trim();
  const password = (document.getElementById("password")?.value || "").trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Store token and role
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    // Redirect based on role
    if (data.user.role === "admin") {
      window.location.href = "/admin.html";
    } else {
      window.location.href = "/dashboard-docs.html";
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Server error. Please try again later.");
  }
});
