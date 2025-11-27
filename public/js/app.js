// public/js/app.js
// ================================
// Common app script for student dashboard
// ================================
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const API_URL = API_BASE_URL;

// Redirect to login if no token
if (!token) window.location.href = "/login.html";

// Load user info for welcome message
async function loadUserInfo() {
  const welcomeMsg = document.getElementById("welcomeMsg");
  const roleInfo = document.getElementById("roleInfo");

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok) {
      if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${data.name}!`;
      if (roleInfo) roleInfo.textContent = `Role: ${data.role}`;
    } else {
      console.warn("Failed to load user info");
    }
  } catch (err) {
    console.error("Auth load error:", err);
  }
}

loadUserInfo();

// Logout button handler
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login.html";
});

// Load student requests (student dashboard)
async function loadStudentRequests() {
  const tableBody = document.querySelector("#requestTable tbody");
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

  try {
    const res = await fetch(`${API_URL}/requests/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    tableBody.innerHTML = "";

    if (!res.ok) {
      tableBody.innerHTML = `<tr><td colspan="4">${data.message || "Failed to load requests."}</td></tr>`;
      return;
    }

    if (!data.length) {
      tableBody.innerHTML = `<tr><td colspan="4">No requests found.</td></tr>`;
      return;
    }

    data.forEach(req => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${req.documentType}</td>
        <td>${req.purpose}</td>
        <td><span class="status ${req.status}">${req.status}</span></td>
        <td>${new Date(req.createdAt).toLocaleDateString()}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading student requests:", err);
    tableBody.innerHTML = `<tr><td colspan="4">Server error loading requests.</td></tr>`;
  }
}

loadStudentRequests();
