// Full analytics + charts renderer. Expects Chart global (Chart.js loaded before this).
// Configure by setting window.__ANALYTICS_ENDPOINT (string) OR window.__API_ENDPOINTS (object) before this script.
(async function(){
  const TIMEOUT = 8000;
  const el = id => document.getElementById(id);
  const API_SINGLE = window.__ANALYTICS_ENDPOINT || null;
  const API_SEPARATE = window.__API_ENDPOINTS || null;

  const DEFAULTS = {
    totalStudents: 892,
    totalRequests: 1204,
    pending: 127,
    processed: 1077,
    completionRate: 89,
    avgProcessingMinutes: 36,
    activeUsers: 342,
    // demo timeseries (last 14 days)
    requestsByDay: Array.from({length:14}, (_,i)=>{
      const d = new Date(); d.setDate(d.getDate()-13+i);
      return { date: d.toISOString().slice(0,10), total: Math.max(5, Math.round(40 + Math.sin(i/3)*15 + Math.random()*10)) };
    }),
    statusCounts: { pending:127, processed:1077, cancelled:0 },
    programCounts: { "BS Information Technology":320, "BS Computer Science":210, "BS Information Systems":165, "BS Business Administration":120, "Other":80 }
  };

  function timeoutFetch(url, opts={}, ms=TIMEOUT){
    const c = new AbortController();
    const t = setTimeout(()=> c.abort(), ms);
    return fetch(url, {...opts, signal: c.signal}).finally(()=> clearTimeout(t));
  }

  async function fetchJson(url){
    try{
      const r = await timeoutFetch(url);
      if(!r.ok) throw new Error('HTTP '+r.status);
      return await r.json();
    }catch(e){
      console.warn('fetch failed', url, e);
      return null;
    }
  }

  function toNumber(v){ if(v===null||v===undefined) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }

  async function loadData(){
    // Try single endpoint first
    if(API_SINGLE){
      const doc = await fetchJson(API_SINGLE);
      if(doc) return normalizeFromCombined(doc);
    }

    // Try separate endpoints if provided
    if(API_SEPARATE){
      const out = {};
      if(API_SEPARATE.studentsCount){
        const s = await fetchJson(API_SEPARATE.studentsCount);
        out.totalStudents = s?.total ?? s?.count ?? s?.students ?? null;
      }
      if(API_SEPARATE.requestsSummary){
        const r = await fetchJson(API_SEPARATE.requestsSummary);
        out.totalRequests = r?.total ?? r?.requests ?? r?.count ?? null;
        out.pending = r?.pending ?? null;
        out.processed = r?.processed ?? null;
        out.completionRate = r?.completionRate ?? null;
      }
      // try time series and breakdown endpoints if present
      if(API_SEPARATE.requestsTimeseries){
        const ts = await fetchJson(API_SEPARATE.requestsTimeseries);
        out.requestsByDay = ts?.data ?? ts ?? null;
      }
      if(API_SEPARATE.requestsStatus){
        const st = await fetchJson(API_SEPARATE.requestsStatus);
        out.statusCounts = st ?? null;
      }
      if(API_SEPARATE.programCounts){
        const pc = await fetchJson(API_SEPARATE.programCounts);
        out.programCounts = pc ?? null;
      }
      // if any useful key present return
      if(Object.values(out).some(v=>v!=null)) return normalize(out);
    }

    // fallback to defaults
    return normalize(DEFAULTS);
  }

  function normalizeFromCombined(doc){
    // map common keys from a combined analytics response to our shape
    const out = {};
    out.totalStudents = doc.totalStudents ?? doc.students_total ?? doc.students ?? doc.total_students ?? doc.stats?.students;
    out.totalRequests = doc.totalRequests ?? doc.requests_total ?? doc.total_requests ?? doc.requests ?? doc.stats?.requests;
    out.pending = doc.pending ?? doc.pendingRequests ?? doc.stats?.pending;
    out.processed = doc.processed ?? doc.processedRequests ?? doc.stats?.processed;
    out.completionRate = doc.completionRate ?? doc.completion_rate ?? doc.stats?.completionRate ?? doc.stats?.completion_rate;
    out.avgProcessingMinutes = doc.avgProcessingMinutes ?? doc.avg_processing_minutes ?? doc.stats?.avgProcessingMinutes;
    out.activeUsers = doc.activeUsers ?? doc.active_users ?? doc.stats?.activeUsers;
    out.requestsByDay = doc.requestsByDay ?? doc.timeseries ?? doc.requests_timeseries ?? doc.stats?.requestsByDay;
    out.statusCounts = doc.statusCounts ?? doc.requestStatus ?? doc.stats?.statusCounts;
    out.programCounts = doc.programCounts ?? doc.topPrograms ?? doc.stats?.programCounts;
    return normalize(out);
  }

  function normalize(obj){
    const out = {};
    out.totalStudents = toNumber(obj.totalStudents) ?? DEFAULTS.totalStudents;
    out.totalRequests = toNumber(obj.totalRequests) ?? DEFAULTS.totalRequests;
    out.pending = toNumber(obj.pending) ?? DEFAULTS.pending;
    out.processed = toNumber(obj.processed) ?? DEFAULTS.processed;
    out.completionRate = toNumber(obj.completionRate) ?? DEFAULTS.completionRate;
    out.avgProcessingMinutes = toNumber(obj.avgProcessingMinutes) ?? DEFAULTS.avgProcessingMinutes;
    out.activeUsers = toNumber(obj.activeUsers) ?? DEFAULTS.activeUsers;

    // timeseries: expect array [{date: 'YYYY-MM-DD', total: N}] or {labels:[],data:[]}
    if(Array.isArray(obj.requestsByDay) && obj.requestsByDay.length){
      out.requestsByDay = obj.requestsByDay.map(it=>{
        if(typeof it === 'object') return { date: it.date || it.day || it.label, total: toNumber(it.total ?? it.count ?? it.value) ?? 0 };
        return null;
      }).filter(Boolean);
    } else if(obj.requestsByDay && obj.requestsByDay.labels && obj.requestsByDay.data){
      out.requestsByDay = obj.requestsByDay.labels.map((lab,i)=>({date:lab,total:toNumber(obj.requestsByDay.data[i])||0}));
    } else {
      out.requestsByDay = DEFAULTS.requestsByDay;
    }

    // statusCounts: {pending:.., processed:.., cancelled:..}
    if(obj.statusCounts && typeof obj.statusCounts === 'object'){
      out.statusCounts = {
        pending: toNumber(obj.statusCounts.pending) ?? toNumber(obj.statusCounts.waiting) ?? DEFAULTS.statusCounts.pending,
        processed: toNumber(obj.statusCounts.processed) ?? toNumber(obj.statusCounts.completed) ?? DEFAULTS.statusCounts.processed,
        cancelled: toNumber(obj.statusCounts.cancelled) ?? toNumber(obj.statusCounts.rejected) ?? DEFAULTS.statusCounts.cancelled
      };
    } else out.statusCounts = DEFAULTS.statusCounts;

    // programCounts: object map name->count
    if(obj.programCounts && typeof obj.programCounts === 'object'){
      out.programCounts = Object.fromEntries(Object.entries(obj.programCounts).slice(0,8));
    } else out.programCounts = DEFAULTS.programCounts;

    return out;
  }

  // Chart instances
  let chartRequests = null, chartStatus = null, chartPrograms = null;

  function renderMetrics(stats){
    if(el('countStudents')) el('countStudents').textContent = stats.totalStudents;
    if(el('countRequests')) el('countRequests').textContent = stats.totalRequests;
    if(el('countPending')) el('countPending').textContent = stats.pending;
    if(el('countRate')) el('countRate').textContent = `${Math.round(stats.completionRate)}%`;
  }

  function createOrUpdateCharts(stats){
    // Requests over time (line)
    const ctxR = el('chartRequestsOverTime')?.getContext('2d');
    if(ctxR){
      const labels = stats.requestsByDay.map(r=>r.date);
      const data = stats.requestsByDay.map(r=>r.total);
      const cfg = {
        type: 'line',
        data: { labels, datasets: [{ label: 'Requests', data, borderColor: '#2b8cff', backgroundColor: 'rgba(43,140,255,0.12)', fill:true, tension:0.3 }] },
        options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} , scales:{ x:{grid:{display:false}}, y:{beginAtZero:true} } }
      };
      if(chartRequests) { chartRequests.data.labels = labels; chartRequests.data.datasets[0].data = data; chartRequests.update(); }
      else chartRequests = new Chart(ctxR, cfg);
    }

    // Status doughnut
    const ctxS = el('chartStatus')?.getContext('2d');
    if(ctxS){
      const labels = Object.keys(stats.statusCounts);
      const data = Object.values(stats.statusCounts);
      const cfg = { type:'doughnut', data:{ labels, datasets:[{ data, backgroundColor:['#f59e0b','#ef4444','#10b981'] }] }, options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}} } };
      if(chartStatus){ chartStatus.data.labels = labels; chartStatus.data.datasets[0].data = data; chartStatus.update(); }
      else chartStatus = new Chart(ctxS, cfg);
    }

    // Programs bar
    const ctxP = el('chartPrograms')?.getContext('2d');
    if(ctxP){
      const labels = Object.keys(stats.programCounts);
      const data = Object.values(stats.programCounts);
      const cfg = { type:'bar', data:{ labels, datasets:[{ label:'Requests', data, backgroundColor:'#7c3aed' }] }, options:{indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} , scales:{ x:{beginAtZero:true} } } };
      if(chartPrograms){ chartPrograms.data.labels = labels; chartPrograms.data.datasets[0].data = data; chartPrograms.update(); }
      else chartPrograms = new Chart(ctxP, cfg);
    }
  }

  async function refresh(){
    const raw = await loadData();
    renderMetrics(raw);
    createOrUpdateCharts(raw);
  }

  // initial placeholder render
  renderMetrics(DEFAULTS);
  createOrUpdateCharts(DEFAULTS);

  await refresh();
  setInterval(refresh, 60000);
})();
