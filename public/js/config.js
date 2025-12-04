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

// Dynamically set API base URL depending on environment
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://iregistrar-integrated.onrender.com/api";
