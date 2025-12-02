// Logout functionality
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
});

// Navigation helpers
document.getElementById("btnAddStudent")?.addEventListener("click", () => {
    window.location.href = "/register.html";
});
document.getElementById("btnViewRequests")?.addEventListener("click", () => {
    window.location.href = "/admin-requests.html";
});
document.getElementById("btnAnalytics")?.addEventListener("click", () => {
    window.location.href = "/admin-analytics.html";
});
