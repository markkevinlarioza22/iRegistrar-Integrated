// public/js/app.js
// ================================
// Student Dashboard Script
// ================================

// Ensure config loaded
const API_URL = API_BASE_URL;

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Redirect if not logged in
if (!token) window.location.href = "/login.html";

// Fetch wrapper
function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
}

// Load student info
function loadStudentInfo() {
  const name = localStorage.getItem("name") || "Student";
  document.getElementById("welcomeMsg").textContent = `Welcome, ${name}!`;
  document.getElementById("roleInfo").textContent = `Role: ${role}`;
}

// Load student requests
async function loadStudentRequests() {
  const tbody = document.querySelector("#requestTable tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

  try {
    const res = await authFetch(`${API_URL}/requests/my`);
    const data = await res.json();

    if (!res.ok) {
      tbody.innerHTML = `<tr><td colspan="4">${data.message || "Error"}</td></tr>`;
      return;
    }

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="4">No requests yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    data.forEach(req => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${req.documentType}</td>
        <td>${req.purpose}</td>
        <td><span class="status ${req.status}">${req.status}</span></td>
        <td>${new Date(req.createdAt).toLocaleDateString()}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading student requests", err);
    tbody.innerHTML = `<tr><td colspan="4">Server error.</td></tr>`;
  }
}

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/login.html";
});

document.addEventListener("DOMContentLoaded", () => {
  loadStudentInfo();
  loadStudentRequests();
});
