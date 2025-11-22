document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token'); // JWT token
  const requestsContainer = document.getElementById('requestsContainer');

  if (!token) {
    alert('Please log in first.');
    window.location.href = '/login.html';
    return;
  }

  try {
    const res = await fetch('/api/requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch user requests');

    const requests = await res.json();

    if (requests.length === 0) {
      requestsContainer.innerHTML = '<p>No requests found.</p>';
      return;
    }

    // Render requests as cards
    requestsContainer.innerHTML = requests.map(req => `
      <div class="request-card">
        <h3>${req.documentType || req.docType}</h3>
        <p><strong>Details:</strong> ${req.purpose || req.details}</p>
        <p><strong>Status:</strong> <span class="status ${req.status.toLowerCase()}">${req.status}</span></p>
        <p><strong>Requested On:</strong> ${new Date(req.createdAt).toLocaleString()}</p>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error fetching requests:', error);
    requestsContainer.innerHTML = '<p>Failed to fetch user data or requests.</p>';
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    });
  }
});
