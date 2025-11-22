// ===============================
// AUTH CHECK & USER INFO LOADING
// ===============================
async function loadUserInfo() {
  const token = localStorage.getItem("token");
  const welcomeMsg = document.getElementById("welcomeMsg");
  const roleInfo = document.getElementById("roleInfo");

  if (!token) return;

  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${data.name}!`;
      if (roleInfo) roleInfo.textContent = `Role: ${data.role}`;
    } else {
      console.warn("Failed to load user info");
    }

  } catch (error) {
    console.error("Auth load error:", error);
  }
}

loadUserInfo();


// ===============================
// LOGOUT HANDLER
// ===============================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}


// ===============================
// STUDENT DASHBOARD: LOAD REQUESTS
// ===============================
async function loadStudentRequests() {
  const tableBody = document.querySelector("#requestTable tbody");
  if (!tableBody) return; // Only run on pages that have the table

  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/api/requests", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    tableBody.innerHTML = "";

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4">No requests found.</td></tr>`;
      return;
    }

    data.forEach(req => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${req.documentType}</td>
        <td>${req.purpose}</td>
        <td><span class="status ${req.status}">${req.status}</span></td>
        <td>${new Date(req.createdAt).toLocaleDateString()}</td>
      `;

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading student requests:", err);
    tableBody.innerHTML = `<tr><td colspan="4">Error loading data.</td></tr>`;
  }
}

loadStudentReques
