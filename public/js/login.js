const API_URL = API_BASE_URL;

document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
   });


        if (!res.ok) {
            const text = await res.text(); // fallback for HTML response
            console.error("Login failed response:", text);
            alert("Login failed. Check credentials or server.");
            return;
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);

        window.location.href = data.user.role === "admin" ? "/admin.html" : "/dashboard-docs.html";
    } catch (err) {
        console.error("Network error:", err);
        alert("Network error. Check your connection or backend server.");
    }
});

// Fixed: Login handler

(function(){
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('error');

  if (!emailInput || !passwordInput) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        showError(data.message || 'Invalid credentials');
        return;
      }

      const data = await response.json();
      
      if (!data.user || !data.token) {
        showError('Invalid response from server');
        return;
      }

      session.setSession(data.user, data.token);

      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = '/admin.html';
      } else if (data.user.role === 'student') {
        window.location.href = '/dashboard-docs.html';
      } else {
        window.location.href = '/index.html';
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed. Please check your connection and try again.');
    }
  });

  function showError(msg) {
    if (errorDiv) {
      errorDiv.textContent = msg;
      errorDiv.classList.add('active');
    }
  }
})();
