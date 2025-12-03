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
        const token = localStorage.getItem("token"); // Keep admin token

        if (!name || !email || !password) return alert("All fields are required.");
        if (!isValidEmail(email)) return alert("Please enter a valid email.");
        if (password.length < 6) return alert("Password should be at least 6 characters.");

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Include admin token
                },
                body: JSON.stringify({ name, email, password, role: "student" }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Registration failed:", text);
                return alert("Registration failed. Check server or credentials.");
            }

            await res.json();
            alert("Student registered successfully!");
            window.location.href = "/admin.html"; // Redirect to admin dashboard
        } catch (err) {
            console.error("Network error during registration:", err);
            alert("Network error. Check your connection or backend server.");
        }
    });
});
