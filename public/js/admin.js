// public/js/admin.js
// ================================
// Admin dashboard client script
// ================================
const API_URL = API_BASE_URL;
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.href = "/login.html";

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

// Load all requests
async function loadRequests() {
  const table = document.querySelector("#requestsTable tbody");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  const endpoint = role === "admin" ? "/requests" : "/requests/my";

  try {
    const res = await authFetch(API_URL + endpoint);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to fetch");

    if (!data.length) {
      table.innerHTML = `<tr><td colspan="7">No requests found.</td></tr>`;
      return;
    }

    table.innerHTML = "";
    data.forEach(req => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="req-name">${req.user?.name || "—"}</td>
        <td>${req.user?.email || "—"}</td>
        <td>${req.documentType}</td>
        <td>${req.purpose}</td>
        <td><span class="status ${req.status}">${req.status}</span></td>
        <td>${new Date(req.createdAt).toLocaleString()}</td>
        <td class="admin-actions"></td>
      `;
      const actionCell = tr.querySelector(".admin-actions");
      if (role === "admin") {
        actionCell.innerHTML = `
          <button onclick="updateStatus('${req._id}', 'Approved')">Approve</button>
          <button onclick="updateStatus('${req._id}', 'Processing')">Process</button>
          <button onclick="updateStatus('${req._id}', 'Released')">Release</button>
          <button onclick="updateStatus('${req._id}', 'Rejected')" style="color:red;">Reject</button>
        `;
      } else actionCell.textContent = "—";

      table.appendChild(tr);
    });

    if (role !== "admin") {
      document.querySelectorAll(".req-name").forEach(td => td.style.display = "none");
      const th = document.querySelector("#requestsTable thead tr th:nth-child(1)");
      if (th) th.style.display = "none";
    }
  } catch (err) {
    table.innerHTML = `<tr><td colspan="7">Error loading requests.</td></tr>`;
    console.error("loadRequests:", err);
  }
}

// Update request status (admin only)
async function updateStatus(id, status) {
  if (!id || !status) return;
  if (!confirm(`Change status to ${status}?`)) return;

  try {
    const res = await authFetch(`${API_URL}/requests/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update status");

    alert("Status updated");
    await loadRequests();
  } catch (err) {
    console.error("updateStatus:", err);
    alert(err.message || "Error updating status");
  }
}

// Load users (admin only)
async function loadUsers() {
  if (role !== "admin") return;
  const table = document.querySelector("#usersTable tbody");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

  try {
    const res = await authFetch(API_URL + "/users");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch users");

    table.innerHTML = data.length
      ? data.map(user => `
          <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${new Date(user.createdAt).toLocaleString()}</td>
            <td>${new Date(user.updatedAt).toLocaleString()}</td>
          </tr>`).join('')
      : `<tr><td colspan="5">No users found.</td></tr>`;
  } catch (err) {
    table.innerHTML = `<tr><td colspan="5">Error loading users.</td></tr>`;
    console.error("loadUsers:", err);
  }
}

// Load analytics (admin only)
async function loadAnalytics() {
  if (role !== "admin") return;
  try {
    const res = await authFetch(API_URL + "/analytics");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch analytics");

    loadAnalyticsCharts(data.userStats, data.requestStats);
    loadRecentRequests(data.recentRequests || []);
  } catch (err) {
    console.error("loadAnalytics:", err);
  }
}

function loadRecentRequests(list) {
  const table = document.querySelector("#recentRequestsTable tbody");
  if (!table) return;
  if (!list.length) {
    table.innerHTML = `<tr><td colspan="5">No recent requests.</td></tr>`;
    return;
  }

  table.innerHTML = "";
  list.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.user?.name || "—"}</td>
      <td>${r.user?.email || "—"}</td>
      <td>${r.documentType}</td>
      <td>${r.status}</td>
      <td>${new Date(r.createdAt).toLocaleString()}</td>
    `;
    table.appendChild(tr);
  });
}

function loadAnalyticsCharts(userStats = { students: 0, admins: 0 }, requestStats = {}) {
  try {
    const userCtx = document.getElementById("userChart");
    const reqCtx = document.getElementById("requestChart");

    if (userCtx) {
      new Chart(userCtx, {
        type: "doughnut",
        data: {
          labels: ["Students", "Admins"],
          datasets: [{ data: [userStats.students || 0, userStats.admins || 0] }]
        }
      });
    }

    if (reqCtx) {
      const labels = ["Pending", "Approved", "Processing", "Released", "Rejected"];
      const data = labels.map(l => requestStats[l] || 0);
      new Chart(reqCtx, {
        type: "bar",
        data: { labels, datasets: [{ label: "Requests", data }] },
        options: { scales: { y: { beginAtZero: true } } }
      });
    }
  } catch (err) {
    console.error("loadAnalyticsCharts:", err);
  }
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login.html";
});

// Initial load
loadRequests();
loadUsers();
loadAnalytics();
