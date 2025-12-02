// public/js/request-doc.js
(async () => {
  const token = localStorage.getItem('token');

  // If not logged in, redirect to login
  if (!token) {
    alert('Please login first.');
    window.location.href = '/login.html';
    return;
  }

  const form = document.getElementById('requestForm');
  const tableBody = document.querySelector('#myRequestsTable tbody');

  // Helper to show simple messages (could be upgraded to UI alerts)
  function showMessage(msg) {
    alert(msg);
  }

  // Load student's own requests and render table
  async function loadMyRequests() {
    try {
      const res = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        tableBody.innerHTML = '<tr><td colspan="4">Failed to load requests.</td></tr>';
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No requests found.</td></tr>';
        return;
      }

      tableBody.innerHTML = '';
      data.forEach(r => {
        const tr = document.createElement('tr');

        // Map status to class names used by your CSS in dashboard-docs.html
        const statusClass = (r.status || 'Pending').replace(/\s+/g, '');

        tr.innerHTML = `
          <td>${r.documentType || '—'}</td>
          <td>${r.purpose || '—'}</td>
          <td class="status ${statusClass}">${r.status || 'Pending'}</td>
          <td>${new Date(r.createdAt).toLocaleString()}</td>
        `;
        tableBody.appendChild(tr);
      });

    } catch (err) {
      console.error('Error loading student requests:', err);
      tableBody.innerHTML = '<tr><td colspan="4">Error loading requests.</td></tr>';
    }
  }

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const documentType = document.getElementById('documentType').value;
    const purpose = document.getElementById('purpose').value.trim();

    if (!documentType) {
      showMessage('Please select a document type.');
      return;
    }
    if (!purpose) {
      showMessage('Please enter a purpose for the request.');
      return;
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ documentType, purpose })
      });

      if (!res.ok) {
        const body = await res.json().catch(()=>({message:'Request failed'}));
        showMessage('Failed to submit request: ' + (body.message || res.statusText));
        return;
      }

      const created = await res.json();
      showMessage('Request submitted successfully.');
      form.reset();
      await loadMyRequests();

    } catch (err) {
      console.error('Submit error:', err);
      showMessage('An error occurred while submitting the request.');
    }
  });

  // Initial load
  await loadMyRequests();

  // Logout button on this page if exists
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    });
  }
})();
