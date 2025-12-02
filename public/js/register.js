const API_URL = API_BASE_URL;

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = (document.getElementById("name")?.value || "").trim();
        const email = (document.getElementById("email")?.value || "").trim();
        const password = (document.getElementById("password")?.value || "").trim();

        if (!name || !email || !password) return alert("All fields are required.");
        if (!isValidEmail(email)) return alert("Please enter a valid email.");
        if (password.length < 6) return alert("Password should be at least 6 characters.");

        try {
            const res = await fetch(`${API_URL}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const text = await res.text(); // fallback for HTML
                console.error("Registration failed:", text);
                alert("Registration failed. Check server or credentials.");
                return;
            }

            const data = await res.json();
            alert("Registration successful! You can now log in.");
            window.location.href = "/login.html";
        } catch (err) {
            console.error("Network error during registration:", err);
            alert("Network error. Check your connection or backend server.");
        }
    });
});
