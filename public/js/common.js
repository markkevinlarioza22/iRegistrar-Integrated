// lightweight common utilities used by pages
(function(window){
  function safeLogout(){
    try{ if(typeof logout === 'function'){ logout(); return; } }catch(e){}
    window.location.href = 'login.html';
  }

  // attach to all logout triggers
  function attachLogoutButtons(){
    document.querySelectorAll('[data-logout]').forEach(btn=>{
      btn.addEventListener('click', function(e){
        e.preventDefault();
        safeLogout();
      });
    });
  }

  // expose simple loader adapter for requests lists (page scripts can override window.loadRequests)
  function safeLoadRequests(filters){
    if (typeof window.loadRequests === 'function') return window.loadRequests(filters);
    console && console.log && console.log('loadRequests not implemented', filters);
  }

  // init on DOM ready
  document.addEventListener('DOMContentLoaded', ()=> {
    attachLogoutButtons();
  });

  window.__common = { safeLogout, attachLogoutButtons, safeLoadRequests };
})(window);