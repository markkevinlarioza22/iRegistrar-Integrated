// public/js/app.js
(async () => {
  const token = localStorage.getItem('token');

  // If no token, redirect to login
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // Elements
  const welcomeMsg = document.getElementById('welcomeMsg');
  const roleInfo = document.getElementById('roleInfo');
  const requestTableBody = document.querySelector('#requestTable tbody');
  const logoutBtn = document.getElementById('logoutBtn');

  // Basic user info retrieval (optional). If you have /api/users/me, use it.
  async function fetchMe() {
    try {
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${data.name || data.userId || 'User'}!`;
      if (roleInfo) roleInfo.textContent = `Role: ${data.role || 'student'}`;
    } catch (err) {
      console.error('Error fetching user info', err);
    }
  }

  // Load student's requests (same as request-doc list)
  async function loadRequests() {
    try {
      const res = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        requestTableBody.innerHTML = '<tr><td colspan="4">Failed to load requests.</td></tr>';
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        requestTableBody.innerHTML = '<tr><td colspan="4">No requests found.</td></tr>';
        return;
      }

      requestTableBody.innerHTML = '';
      data.forEach(r => {
        const tr = document.createElement('tr');
        const statusClass = (r.status || 'Pending').replace(/\s+/g, '');
        tr.innerHTML = `
          <td>${r.documentType || '—'}</td>
          <td>${r.purpose || '—'}</td>
          <td class="status ${statusClass}">${r.status || 'Pending'}</td>
          <td>${new Date(r.createdAt).toLocaleString()}</td>
        `;
        requestTableBody.appendChild(tr);
      });

    } catch (err) {
      console.error('Error loading requests:', err);
      requestTableBody.innerHTML = '<tr><td colspan="4">Error loading requests.</td></tr>';
    }
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    });
  }

  // Initialize
  await fetchMe();
  await loadRequests();
})();
