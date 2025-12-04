// Logout functionality
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
});

// Navigation helpers
document.getElementById("btnAddStudent").onclick = () =>
    window.location.href = "admin-register.html";

document.getElementById("goRegister").onclick = () =>
    window.location.href = "admin-register.html";

document.getElementById("btnViewRequests").onclick = () =>
    window.location.href = "admin-request.html";

document.getElementById("goRequests").onclick = () =>
    window.location.href = "admin-request.html";

document.getElementById("btnAnalytics").onclick = () =>
    window.location.href = "admin-analytics.html";

document.getElementById("goAnalytics").onclick = () =>
    window.location.href = "admin-analytics.html";

// Admin dashboard initialization

(function(){
  // Protect this route - admins only
  if (!protectRoute('admin')) return;

  const welcomeMsg = document.getElementById('welcomeMsg');
  const recentTable = document.getElementById('recentTable');

  // Set user info
  if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${session.user.name || 'Admin'}!`;

  async function loadRecentRequests() {
    if (!recentTable) return;

    try {
      const response = await fetch(`${API_BASE}/requests/recent`, {
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
    const tbody = recentTable.querySelector('tbody');
    if (!tbody) return;

    if (!requests || requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No requests yet</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map(r => `
      <tr>
        <td data-label="Student">${escapeHtml(r.studentName || 'N/A')}</td>
        <td data-label="Document">${escapeHtml(r.documentType)}</td>
        <td data-label="Status"><span class="badge badge-${(r.status || 'pending').toLowerCase()}">${escapeHtml(r.status)}</span></td>
        <td data-label="Date">${new Date(r.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  function showPlaceholder(msg) {
    const tbody = recentTable.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">${escapeHtml(msg)}</td></tr>`;
    }
  }

  loadRecentRequests();
})();

// Realtime admin dashboard: polls metrics and pending requests, allows admin actions and sends notifications.
(function(){
  const API_BASE = window.__API_BASE || '';
  const ENDS = window.__API_ENDPOINTS || {};
  const EMAILJS_CFG = window.__EMAILJS || null;
  const POLL_MS = 8_000;

  function url(p){ return p && p.startsWith('http') ? p : (API_BASE + p); }
  function el(id){ return document.getElementById(id); }

  async function fetchJson(u, opts){ try{ const r = await fetch(url(u), opts); if(!r.ok) throw r; return await r.json(); }catch(e){ console.warn('fetch failed', u, e); return null; } }

  // --- Notifications ---
  // Email via EmailJS (client) if configured, else POST to server notify endpoint if set, else fallback to mailto
  async function sendEmailNotification(templateName, payload){
    // EmailJS client
    if(EMAILJS_CFG && EMAILJS_CFG.userID && EMAILJS_CFG.serviceID && EMAILJS_CFG.templates && EMAILJS_CFG.templates[templateName]){
      try{
        if(window.emailjs && !emailjs._inited){ emailjs.init(EMAILJS_CFG.userID); emailjs._inited = true; }
        const tplParams = Object.assign({}, payload);
        await emailjs.send(EMAILJS_CFG.serviceID, EMAILJS_CFG.templates[templateName], tplParams);
        return { ok:true, method:'emailjs' };
      }catch(err){ console.warn('emailjs send failed', err); }
    }

    // server notify endpoint
    if(ENDS.notify){
      try{
        const res = await fetch(url(ENDS.notify), { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ type:'email', template:templateName, payload }) });
        if(res.ok) return { ok:true, method:'server' };
      }catch(e){ console.warn('server notify failed', e); }
    }

    // fallback: open mail client (not automated)
    const to = payload?.StudentEmail || payload?.email || '';
    const subject = encodeURIComponent(payload?.Subject || `iRegistrar notification`);
    const body = encodeURIComponent(payload?.Body || JSON.stringify(payload, null, 2));
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
    return { ok:false, method:'mailto' };
  }

  // SMS via Textbelt free/demo key (limited). For production use a paid provider.
  async function sendSms(phone, message){
    if(!phone) return { ok:false, reason:'no-phone' };
    try{
      const res = await fetch('https://textbelt.com/text', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ phone, message, key: 'textbelt' })
      });
      const json = await res.json();
      return json;
    }catch(e){ console.warn('sms failed', e); return { ok:false }; }
  }

  // --- UI render helpers ---
  function renderMetrics(stats){
    if(el('countStudents')) el('countStudents').textContent = stats.totalStudents ?? '--';
    if(el('countRequests')) el('countRequests').textContent = stats.totalRequests ?? '--';
    if(el('countPending')) el('countPending').textContent = stats.pending ?? '--';
    if(el('metricProcessed')) el('metricProcessed').textContent = stats.processed ?? '--';
    if(el('metricActive')) el('metricActive').textContent = stats.activeUsers ?? '--';
    if(el('countRate')) el('countRate').textContent = (typeof stats.completionRate === 'number') ? `${Math.round(stats.completionRate)}%` : '--';
  }

  function renderPendingList(items){
    const container = el('pendingList');
    if(!container) return;
    container.innerHTML = '';
    if(!items || !items.length){ container.innerHTML = '<div class="muted">No pending requests</div>'; return; }
    items.forEach(req=>{
      const row = document.createElement('div');
      row.className = 'pending-row card';
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.padding = '10px';
      row.style.marginBottom = '8px';
      row.innerHTML = `
        <div style="flex:1">
          <div style="font-weight:700">${escapeHtml(req.studentName || req.requester || 'Unknown')}</div>
          <div style="color:var(--muted);font-size:13px">${escapeHtml(req.documentType||req.doc||'Document')} · ${escapeHtml(req.purpose||'—')}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:6px">Submitted: ${new Date(req.submittedAt || req.createdAt || Date.now()).toLocaleString()}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn btn-ghost" data-action="view" data-id="${req.id}">View</button>
          <button class="btn btn-success" data-action="approve" data-id="${req.id}">Approve</button>
          <button class="btn btn-danger" data-action="reject" data-id="${req.id}">Reject</button>
          <button class="btn" data-action="complete" data-id="${req.id}">Complete</button>
        </div>
      `;
      container.appendChild(row);
    });
    // attach handlers
    container.querySelectorAll('button[data-action]').forEach(btn=>{
      btn.addEventListener('click', onPendingAction);
    });
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

  // --- Actions ---
  async function onPendingAction(e){
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if(!id) return;
    if(action === 'view'){ openRequestModal(id); return; }

    let reason = '';
    if(action === 'reject'){
      reason = prompt('Rejection reason (optional):') || '';
    }

    // call backend action endpoint
    const endpoint = (ENDS.requestAction || '/api/requests/{id}/action').replace('{id}', id);
    try{
      const res = await fetch(url(endpoint), {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ action, reason })
      });
      if(!res.ok) { alert('Action failed'); return; }
      const result = await res.json();
      // send notifications
      const payload = {
        StudentName: result.studentName || result.requester,
        StudentEmail: result.studentEmail || result.email,
        StudentPhone: result.studentPhone || result.phone,
        DocumentType: result.documentType || result.doc,
        Purpose: result.purpose || result.reason || '',
        DateUpdated: new Date().toISOString(),
        RejectionReason: reason || ''
      };
      // pick template
      let tpl = 'submitted';
      if(action === 'approve') tpl = 'approved';
      if(action === 'reject') tpl = 'rejected';
      if(action === 'complete') tpl = 'completed';

      // send email (async, don't block)
      sendEmailNotification(tpl, Object.assign({}, payload, { Subject: `iRegistrar: ${tpl}` }))
        .then(r => console.log('email notify', r));

      // send sms (short templates)
      const smsTpls = {
        submitted: `ASCOT iRegistrar: Your request for ${payload.DocumentType} has been submitted. Status: Pending.`,
        approved: `ASCOT iRegistrar: Your ${payload.DocumentType} request is APPROVED. You may now claim it at the Registrar's Office.`,
        rejected: `ASCOT iRegistrar: Your ${payload.DocumentType} request was REJECTED. Reason: ${payload.RejectionReason || 'See email.'}`,
        completed: `ASCOT iRegistrar: Your ${payload.DocumentType} is READY for claiming. Please bring your ID.`
      };
      if(payload.StudentPhone) sendSms(payload.StudentPhone, smsTpls[tpl]).then(r=>console.log('sms sent', r));
      // refresh UI after action
      await refreshNow();
    }catch(err){ console.error('action failed', err); alert('Action failed'); }
  }

  // simple modal/viewer (implement your own)
  function openRequestModal(id){
    // fetch request details and open a modal (left as placeholder)
    fetchJson((ENDS.requestDetails || `/api/requests/${id}`)).then(d=>{
      alert('Request details:\\n' + JSON.stringify(d, null, 2));
    });
  }

  // --- Polling / Refresh ---
  async function loadMetricsAndPending(){
    // try combined analytics first
    const out = { totalStudents:null, totalRequests:null, pending:null, processed:null, activeUsers:null, completionRate:null };
    if(ENDS.analytics){
      const doc = await fetchJson(ENDS.analytics);
      if(doc){
        out.totalStudents = doc.totalStudents ?? doc.students ?? doc.total_students ?? out.totalStudents;
        out.totalRequests = doc.totalRequests ?? doc.requests ?? out.totalRequests;
        out.pending = doc.pending ?? doc.pendingRequests ?? out.pending;
        out.processed = doc.processed ?? doc.processedRequests ?? out.processed;
        out.activeUsers = doc.activeUsers ?? doc.active_users ?? out.activeUsers;
        out.completionRate = doc.completionRate ?? doc.completion_rate ?? doc.completion ?? out.completionRate;
        // timeseries, etc. are handled by analytics chart code if present
      }
    }

    // if some missing, compute from requests endpoints
    if(ENDS.requestsList){
      const pending = await fetchJson(ENDS.requestsList); // expects array
      if(Array.isArray(pending)){
        out.pending = pending.length;
        renderPendingList(pending);
      }
    }

    // try total requests fallback
    if(!out.totalRequests && ENDS.requestsAll){
      const all = await fetchJson(ENDS.requestsAll);
      out.totalRequests = Array.isArray(all) ? all.length : all?.total ?? out.totalRequests;
    }

    // simple processed count estimation
    if(!out.processed && ENDS.requestsAll){
      const all = await fetchJson(ENDS.requestsAll);
      if(Array.isArray(all)) out.processed = all.filter(r=>r.status === 'completed' || r.status === 'processed').length;
    }

    // render
    renderMetrics(out);
  }

  async function refreshNow(){ await loadMetricsAndPending(); }

  // start polling
  function start(){
    refreshNow();
    setInterval(refreshNow, POLL_MS);
  }

  // init
  document.addEventListener('DOMContentLoaded', start);
})();

