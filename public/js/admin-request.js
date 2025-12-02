const token = localStorage.getItem("token");

// Fetch all requests
async function loadRequests() {
    const response = await fetch('/api/requests/all', {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();
    const tbody = document.getElementById("requestsBody");
    tbody.innerHTML = "";

    data.forEach(req => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${req.studentName}</td>
            <td>${req.documentType}</td>
            <td>${new Date(req.createdAt).toLocaleDateString()}</td>
            <td>${req.status}</td>
            <td>
                <button class="action approve" onclick="updateStatus('${req._id}', 'Approved')">Approve</button>
                <button class="action deny" onclick="updateStatus('${req._id}', 'Denied')">Deny</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Update request status
async function updateStatus(id, status) {
    await fetch(`/api/requests/status/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    loadRequests();
}

loadRequests();
