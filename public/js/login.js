// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // ✅ Save token
        localStorage.setItem('token', data.token);

        alert('Login successful!');

        // ✅ Redirect to dashboard page
        window.location.href = '/dashboard-docs.html';
      } else {
        alert(data.message || 'Invalid login credentials.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error during login.');
    }
  });
});
