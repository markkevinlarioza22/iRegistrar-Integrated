document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});

document.getElementById('registerStudentBtn').addEventListener('click', () => {
    window.location.href = '/register.html';
});

document.getElementById('viewRequestsBtn').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    console.log(data); // replace with dynamic render later
});
