// public/js/request.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('requestForm');
  const logoutBtn = document.getElementById('logoutBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const documentType = document.getElementById('docType').value;
    const purpose = document.getElementById('details').value;
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please log in again.');
      window.location.href = '/login.html';
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

      const data = await res.json();

      if (res.ok) {
        alert('✅ Request submitted successfully!');
        form.reset();
      } else {
        alert(data.message || '⚠️ Failed to submit request.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('❌ Server error while creating request.');
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  });
});
