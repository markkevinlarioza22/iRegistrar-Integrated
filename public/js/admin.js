// Logout functionality
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
});

// Navigation helpers
document.getElementById("btnAddStudent").onclick = () =>
    window.location.href = "admin-register.html";

document.getElementById("goRegister").onclick = () =>
    window.location.href = "admin-register.html";

document.getElementById("btnViewRequests").onclick = () =>
    window.location.href = "admin-request.html";

document.getElementById("goRequests").onclick = () =>
    window.location.href = "admin-request.html";

document.getElementById("btnAnalytics").onclick = () =>
    window.location.href = "admin-analytics.html";

document.getElementById("goAnalytics").onclick = () =>
    window.location.href = "admin-analytics.html";

