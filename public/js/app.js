// Fixed: Student dashboard

(function(){
  if (!protectRoute('student')) return;

  const welcomeMsg = document.getElementById('welcomeMsg');
  const table = document.getElementById('myRequestsTable');

  if (!table) return;

  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome, ${session.user.name || 'Student'}!`;
  }

  async function loadRequests() {
    try {
      const response = await fetch(`${API_BASE}/requests`, {
        headers: session.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to load requests');
      }

      const requests = await response.json();
      populateTable(requests);
    } catch (error) {
      console.error('Load requests error:', error);
      showPlaceholder('Failed to load requests');
    }
  }

  function populateTable(requests) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    if (!requests || requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No requests yet</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map(r => `
      <tr>
        <td data-label="Document">${escapeHtml(r.documentType)}</td>
        <td data-label="Purpose">${escapeHtml(r.purpose)}</td>
        <td data-label="Status"><span class="badge badge-${(r.status || 'pending').toLowerCase()}">${escapeHtml(r.status)}</span></td>
        <td data-label="Date">${new Date(r.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  function showPlaceholder(msg) {
    const tbody = table.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">${escapeHtml(msg)}</td></tr>`;
    }
  }

  loadRequests();
})();
