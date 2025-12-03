const token = localStorage.getItem("token");
if (!token) {
    alert("Unauthorized access.");
    window.location.href = "/login.html";
}

async function loadRequests() {
    try {
        const res = await fetch(`${API_BASE_URL}/requests/all`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to load admin requests:", text);
            document.getElementById("requestsBody").innerHTML = '<tr><td colspan="6">Failed to load requests.</td></tr>';
            return;
        }

        const data = await res.json();
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
    } catch (err) {
        console.error("Error loading requests:", err);
    }
}

async function updateStatus(id, status) {
    try {
        const res = await fetch(`${API_BASE_URL}/requests/status/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Failed to update status:", text);
            return;
        }

        await res.json();
        loadRequests(); // refresh after update
        alert("Status updated successfully!");
    } catch (err) {
        console.error("Error updating status:", err);
    }
}

// Initial load
loadRequests();
