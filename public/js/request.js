// public/js/request.js
// ================================
// Submit new document request
// ================================
const API_URL = API_BASE_URL;

document.getElementById("requestForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const documentType = document.getElementById("documentType").value.trim();
  const purpose = document.getElementById("purpose").value.trim();
  const token = localStorage.getItem("token");

  if (!documentType || !purpose) {
    alert("Please complete all fields.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ documentType, purpose }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Request submitted successfully!");
      document.getElementById("requestForm").reset();
      loadMyRequests();
    } else {
      alert(data.message || "Failed to submit request.");
    }
  } catch (err) {
    console.error("Error submitting request:", err);
    alert("Server error. Please try again.");
  }
});

// Load student's requests
async function loadMyRequests() {
  const token = localStorage.getItem("token");
  const tbody = document.querySelector("#myRequestsTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/requests/my`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    tbody.innerHTML = "";

    if (!res.ok || !data.length) {
      tbody.innerHTML = `<tr><td colspan='4'>${data.message || "No requests found."}</td></tr>`;
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
    tbody.innerHTML = "<tr><td colspan='4'>Server error loading requests.</td></tr>";
  }
}

document.addEventListener("DOMContentLoaded", loadMyRequests);
