// ========================
//  Load Requests
// ========================
async function loadRequests() {
  const token = localStorage.getItem('token');

  const res = await fetch('/api/requests/all', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const tbody = document.querySelector('#requestsTable tbody');
  tbody.innerHTML = "";

  if (!res.ok) {
    tbody.innerHTML = `<tr><td colspan="6">Access denied. Admin/Registrar only.</td></tr>`;
    return;
  }

  const data = await res.json();

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No requests found</td></tr>`;
    return;
  }

  data.forEach(req => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${req.user?.name || "Unknown"}</td>
      <td>${req.documentType}</td>
      <td>${req.purpose}</td>
      <td><strong>${req.status}</strong></td>
      <td>${new Date(req.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="btn-approve" onclick="updateStatus('${req._id}', 'Approved')">Approve</button>
        <button class="btn-release" onclick="updateStatus('${req._id}', 'Released')">Release</button>
        <button class="btn-reject" onclick="updateStatus('${req._id}', 'Rejected')">Reject</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// ========================
//  Update Status
// ========================
async function updateStatus(id, status) {
  const token = localStorage.getItem('token');

  const res = await fetch(`/api/requests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (res.ok) {
    alert(`Status updated: ${status}`);
    loadRequests();
  } else {
    alert("Failed to update status");
  }
}

// ========================
//  Logout
// ========================
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});

// Start loading
loadRequests();
