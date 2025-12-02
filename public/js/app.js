(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const welcomeMsg = document.getElementById('welcomeMsg');
    const roleInfo = document.getElementById('roleInfo');
    const requestTableBody = document.querySelector('#requestTable tbody');
    const logoutBtn = document.getElementById('logoutBtn');

    // Fetch logged-in user info
    async function fetchMe() {
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Failed to fetch user info:", text);
                return;
            }

            const data = await res.json();
            if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${data.name || 'User'}!`;
            if (roleInfo) roleInfo.textContent = `Role: ${data.role || 'student'}`;
        } catch (err) {
            console.error('Error fetching user info:', err);
        }
    }

    // Load student requests
    async function loadRequests() {
        try {
            const res = await fetch(`${API_BASE_URL}/requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Failed to load requests:", text);
                requestTableBody.innerHTML = '<tr><td colspan="4">Failed to load requests.</td></tr>';
                return;
            }

            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) {
                requestTableBody.innerHTML = '<tr><td colspan="4">No requests found.</td></tr>';
                return;
            }

            requestTableBody.innerHTML = '';
            data.forEach(r => {
                const statusClass = (r.status || 'Pending').replace(/\s+/g, '');
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${r.documentType || '—'}</td>
                    <td>${r.purpose || '—'}</td>
                    <td class="status ${statusClass}">${r.status || 'Pending'}</td>
                    <td>${new Date(r.createdAt).toLocaleString()}</td>
                `;
                requestTableBody.appendChild(tr);
            });
        } catch (err) {
            console.error('Error loading requests:', err);
            requestTableBody.innerHTML = '<tr><td colspan="4">Error loading requests.</td></tr>';
        }
    }

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    await fetchMe();
    await loadRequests();
})();
