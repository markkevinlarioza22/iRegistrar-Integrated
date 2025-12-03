const API_URL = API_BASE_URL;

document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Unauthorized access.");
        window.location.href = "/login.html";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/analytics/requests`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to load analytics:", text);
            alert("Failed to load analytics.");
            return;
        }

        const data = await res.json();

        document.getElementById("countStudents").textContent = data.totalStudents || 0;
        document.getElementById("countRequests").textContent = data.totalRequests || 0;
        document.getElementById("countPending").textContent = data.pendingRequests || 0;

    } catch (err) {
        console.error("Analytics load error:", err);
        alert("Failed to load analytics.");
    }
});
