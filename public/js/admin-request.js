// Fixed: Admin request management

(function(){
  if (!protectRoute('admin')) return;

  const requestTable = document.getElementById('requestTable');
  if (!requestTable) return;

  async function loadRequests() {
    try {
      const response = await fetch(`${API_BASE}/requests/all`, {
        headers: session.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to load requests');
      }

      const requests = await response.json();
      populateTable(requests);
    } catch (error) {
      console.error('Load error:', error);
      showPlaceholder('Failed to load requests');
    }
  }

  function populateTable(requests) {
    const tbody = requestTable.querySelector('tbody');
    if (!tbody) return;

    if (!requests || requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No requests</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map(req => `
      <tr>
        <td data-label="Student">${escapeHtml(req.studentName || 'N/A')}</td>
        <td data-label="Document">${escapeHtml(req.documentType)}</td>
        <td data-label="Status"><span class="badge badge-${(req.status || 'pending').toLowerCase()}">${escapeHtml(req.status)}</span></td>
        <td data-label="Date">${new Date(req.createdAt).toLocaleDateString()}</td>
        <td data-label="Actions">
          ${req.status === 'pending' ? `
            <button class="btn btn-success btn-sm" onclick="approveRequest('${req.id}')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="denyRequest('${req.id}')">Deny</button>
          ` : `<span class="text-muted">-</span>`}
        </td>
      </tr>
    `).join('');
  }

  window.approveRequest = async function(requestId) {
    try {
      const response = await fetch(`${API_BASE}/requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: session.getAuthHeader()
      });
      if (response.ok) {
        loadRequests();
      } else {
        alert('Failed to approve request');
      }
    } catch (error) {
      console.error(error);
      alert('Error approving request');
    }
  };

  window.denyRequest = async function(requestId) {
    try {
      const response = await fetch(`${API_BASE}/requests/${requestId}/deny`, {
        method: 'PATCH',
        headers: session.getAuthHeader()
      });
      if (response.ok) {
        loadRequests();
      } else {
        alert('Failed to deny request');
      }
    } catch (error) {
      console.error(error);
      alert('Error denying request');
    }
  };

  function showPlaceholder(msg) {
    const tbody = requestTable.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">${escapeHtml(msg)}</td></tr>`;
    }
  }

  loadRequests();
})();
// Fixed: Global configuration and session management

const API_BASE = '/api';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class SessionManager {
  constructor() {
    this.user = null;
    this.token = null;
    this.timeoutId = null;
    this.initSession();
  }

  initSession() {
    const stored = sessionStorage.getItem('user_session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (this.isSessionValid(session)) {
          this.user = session.user;
          this.token = session.token;
          this.resetTimeout();
        } else {
          this.clearSession();
        }
      } catch (e) {
        console.error('Session parse error:', e);
        this.clearSession();
      }
    }
  }

  isSessionValid(session) {
    return session && session.user && session.token && session.expiresAt > Date.now();
  }

  setSession(user, token) {
    this.user = user;
    this.token = token;
    const expiresAt = Date.now() + SESSION_TIMEOUT;
    const session = {
      user,
      token,
      expiresAt
    };
    sessionStorage.setItem('user_session', JSON.stringify(session));
    this.resetTimeout();
  }

  resetTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => this.logout(), SESSION_TIMEOUT);
  }

  getAuthHeader() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  isAuthenticated() {
    return !!(this.token && this.user);
  }

  isAdmin() {
    return !!(this.user && this.user.role === 'admin');
  }

  isStudent() {
    return !!(this.user && this.user.role === 'student');
  }

  logout() {
    this.clearSession();
    window.location.href = '/login.html';
  }

  clearSession() {
    this.user = null;
    this.token = null;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    sessionStorage.removeItem('user_session');
  }
}

const session = new SessionManager();

// Route protection utility
function protectRoute(requiredRole = null) {
  if (!session.isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  
  if (requiredRole) {
    const hasRole = Array.isArray(requiredRole) 
      ? requiredRole.includes(session.user.role)
      : session.user.role === requiredRole;
    
    if (!hasRole) {
      window.location.href = session.isAdmin() ? '/admin.html' : '/dashboard-docs.html';
      return false;
    }
  }
  return true;
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    session.logout();
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}