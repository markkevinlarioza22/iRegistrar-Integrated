const API_URL = API_BASE_URL;

document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch(`${API_URL}/users/login`, {
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
