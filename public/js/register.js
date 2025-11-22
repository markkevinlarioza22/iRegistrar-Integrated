document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Registration successful! You can now log in.');
        window.location.href = '/login.html';
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error during registration.');
    }
  });
});
