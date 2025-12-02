const token = localStorage.getItem("token");

// Fetch all document requests for admin
async function loadRequests() {
    try {
        const response = await fetch(`${API_BASE_URL}/requests/all`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        const tbody = document.getElementById("requestsBody");
        tbody.innerHTML = "";

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">No requests found.</td></tr>`;
            return;
        }

        data.forEach(req => {
            const statusClass = req.status.replace(/\s+/g, "");
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${req.studentName || "Unknown"}</td>
                <td>${req.documentType}</td>
                <td>${req.purpose || "—"}</td>
                <td>${new Date(req.createdAt).toLocaleDateString()}</td>
                <td><span class="status ${statusClass}">${req.status}</span></td>
                <td class="actions">
                    <button class="approve-btn" onclick="updateStatus('${req._id}', 'Approved')">Approve</button>
                    <button class="processing-btn" onclick="updateStatus('${req._id}', 'Processing')">Processing</button>
                    <button class="reject-btn" onclick="updateStatus('${req._id}', 'Rejected')">Reject</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading requests:", error);
    }
}

// Update request status
async function updateStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/requests/status/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        console.log("Status updated:", result);
        loadRequests(); // Refresh table after update
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

// Initial load
loadRequests();
