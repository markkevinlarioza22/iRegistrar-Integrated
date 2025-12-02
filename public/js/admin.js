// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});

// REGISTER STUDENT
document.getElementById('btnAddStudent').addEventListener('click', () => {
    window.location.href = '/register.html';
});

// VIEW REQUESTS
document.getElementById('btnViewRequests').addEventListener('click', () => {
    window.location.href = '/admin-requests.html';
});

// ANALYTICS
document.getElementById('btnAnalytics').addEventListener('click', () => {
    window.location.href = '/admin-analytics.html';
});
