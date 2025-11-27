// public/js/request-doc.js
// ================================
// Student document request page script
// ================================

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const API_URL = API_BASE_URL;

// Redirect to login if not logged in
if (!token) {
  window.location.href = "/login.html";
}

// Helper to include auth header
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

// Load student's own requests
async function loadMyRequests() {
  const tbody = document.querySelector("#myRequestsTable tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

  try {
    const res = await authFetch(`${API_URL}/requests/my`);
    const data = await res.json();

    tbody.innerHTML = "";

    if (!res.ok || !data.length) {
      tbody.innerHTML = `<tr><td colspan="4">${data.message || "No requests found."}</td></tr>`;
      return;
    }

    data.forEach(req => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${req.documentType}</td>
        <td>${req.purpose}</td>
        <td><strong class="status ${req.status}">${req.status}</strong></td>
        <td>${new Date(req.createdAt).toLocaleDateString()}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading requests:", err);
    tbody.innerHTML = `<tr><td colspan="4">Server error loading requests.</td></tr>`;
  }
}

// Submit new document request
document.getElementById("requestForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const documentType = (document.getElementById("documentType")?.value || "").trim();
  const purpose = (document.getElementById("purpose")?.value || "").trim();

  if (!documentType || !purpose) {
    alert("Please complete all fields.");
    return;
  }

  try {
    const res = await authFetch(`${API_URL}/requests`, {
      method: "POST",
      body: JSON.stringify({ documentType, purpose })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to submit request.");
      return;
    }

    alert("Request submitted successfully!");
    document.getElementById("requestForm").reset();
    await loadMyRequests(); // refresh table

  } catch (err) {
    console.error("Error submitting request:", err);
    alert("Server error. Please try again.");
  }
});

// Initial load
document.addEventListener("DOMContentLoaded", loadMyRequests);
