document.getElementById("adminRegisterForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ name, email, password, role: "student" })
        });

        const data = await response.json();

        if (!response.ok) {
            alert("Error: " + (data.message || "Registration failed"));
            return;
        }

        alert("Student Registered Successfully!");
        window.location.href = "/admin.html";

    } catch (error) {
        console.error("Registration error:", error);
        alert("Network error. Please try again.");
    }
});
