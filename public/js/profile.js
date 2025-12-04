// Simple profile loader/editor (localStorage); adds student id mask and program list
(function(){
  const STORAGE_KEY = 'iregistrar_profile_v4';
  const PWD_KEY = 'iregistrar_profile_pwd_v1';
  const PROGRAMS = [
    "BS Information Technology",
    "BS Computer Science",
    "BS Information Systems",
    "BS Business Administration",
    "BS Accountancy",
    "BS Tourism Management",
    "BS Hospitality Management",
    "BS Education - Secondary",
    "BS Education - Elementary",
    "BS Agriculture",
    "Associate in Hotel & Restaurant Management",
    "Diploma in Office Administration",
    "Other"
  ];

  function defaultProfile(){
    return {
      // name changed per request
      firstName: 'Mark Kevin',
      middleName: 'S.',
      lastName: 'Dela Cruz',
      studentId: '00-00-0000',
      program: 'BS Information Technology',
      email: 'juan.delacruz@ascot.edu.ph',
      phone: '+63 9XX XXX XXXX',
      dob: '2002-01-15',
      yearLevel: '3rd',
      gpa: '3.75',
      enrollmentStatus: 'Active',
      emergencyName: 'Maria Dela Cruz',
      emergencyPhone: '+63 9XX XXX XXXX',
      emergencyRelation: 'Mother',
      totalRequests: 8,
      photo: null // base64 dataURL
    };
  }

  function loadProfile(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultProfile();
    }catch(e){ return defaultProfile(); }
  }

  function saveProfile(p){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }

  function savePassword(raw){
    // demo-only: store base64; replace with secure hashing in production
    if(!raw) { localStorage.removeItem(PWD_KEY); return; }
    localStorage.setItem(PWD_KEY, btoa(raw));
  }

  function verifyPassword(raw){
    const stored = localStorage.getItem(PWD_KEY);
    if(!stored) return true; // no password set yet
    return stored === btoa(raw);
  }

  function fullName(p){
    return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
  }

  function initialsFrom(p){
    const first = (p.firstName || '').trim().charAt(0) || '';
    const last = (p.lastName || '').trim().charAt(0) || '';
    return (first + last).toUpperCase() || 'ST';
  }

  function render(p){
    const set = (id, value)=> { const el = document.getElementById(id); if(el) el.textContent = value ?? ''; };
    set('fullName', fullName(p));
    set('studentId', 'ID: ' + p.studentId);
    set('program', p.program);
    set('email', p.email);
    set('phone', p.phone);
    set('dob', p.dob);
    set('yearLevel', p.yearLevel);
    set('gpa', p.gpa);
    set('enrollmentStatus', p.enrollmentStatus);
    set('emergencyName', p.emergencyName);
    set('emergencyPhone', p.emergencyPhone);
    set('emergencyRelation', p.emergencyRelation);
    set('totalRequests', p.totalRequests);

    const sidebarInitials = document.getElementById('sidebarInitials');
    const avatarLarge = document.getElementById('avatarLarge');

    if(p.photo){
      // render image in avatar elements
      if(avatarLarge) avatarLarge.innerHTML = `<img src="${p.photo}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`;
      if(sidebarInitials) sidebarInitials.innerHTML = `<img src="${p.photo}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`;
      const preview = document.getElementById('photoPreview');
      if(preview) preview.innerHTML = `<img src="${p.photo}" alt="photo preview" style="width:100%;height:100%;object-fit:cover">`;
    } else {
      if(avatarLarge) { avatarLarge.textContent = initialsFrom(p); avatarLarge.innerHTML = avatarLarge.textContent; }
      if(sidebarInitials) { sidebarInitials.textContent = initialsFrom(p); sidebarInitials.innerHTML = sidebarInitials.textContent; }
      const preview = document.getElementById('photoPreview');
      if(preview) preview.innerHTML = initialsFrom(p);
    }
  }

  function populateProgramSelect(){
    // keep the old select population for fallback, but populate custom list
    const sel = document.getElementById('f_program');
    if(sel) sel.value = sel.value || PROGRAMS[0];

    const list = document.getElementById('f_program_list');
    const display = document.getElementById('f_program_display');
    if(!list || !display) return;

    list.innerHTML = '';
    PROGRAMS.forEach((pr, idx) => {
      const item = document.createElement('div');
      item.setAttribute('role','option');
      item.dataset.value = pr;
      item.tabIndex = 0;
      item.className = 'program-item';
      item.style.padding = '8px 12px';
      item.style.cursor = 'pointer';
      item.style.borderBottom = idx < PROGRAMS.length-1 ? '1px solid var(--border)' : 'none';
      item.textContent = pr;
      item.addEventListener('click', function(){
        selectProgram(pr);
        closeProgramList();
      });
      item.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectProgram(pr); closeProgramList(); }
        if(e.key === 'ArrowDown') { e.preventDefault(); focusNext(item); }
        if(e.key === 'ArrowUp') { e.preventDefault(); focusPrev(item); }
      });
      list.appendChild(item);
    });

    function selectProgram(value){
      const hidden = document.getElementById('f_program');
      if(hidden) hidden.value = value;
      display.textContent = value;
      // also update any visible program label
    }

    function focusNext(el){
      const next = el.nextElementSibling;
      if(next) next.focus();
    }
    function focusPrev(el){
      const prev = el.previousElementSibling;
      if(prev) prev.focus();
    }

    // toggle handlers
    const toggle = document.getElementById('f_program_toggle');
    const widget = document.getElementById('f_program_widget');
    if(toggle && widget){
      toggle.addEventListener('click', function(e){
        const expanded = widget.getAttribute('data-open') === '1';
        if(expanded) closeProgramList(); else openProgramList();
      });

      // close on outside click
      document.addEventListener('click', function(ev){
        if(!widget.contains(ev.target)) closeProgramList();
      });

      // keyboard: open with ArrowDown or Enter
      toggle.addEventListener('keydown', function(e){
        if(e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProgramList(); const first = list.querySelector('.program-item'); if(first) first.focus(); }
      });
    }

    function openProgramList(){
      widget.setAttribute('data-open','1');
      toggle.setAttribute('aria-expanded','true');
      list.classList.remove('hide');
      list.style.display = 'block';
      widget.setAttribute('aria-expanded','true');
    }
    function closeProgramList(){
      widget.setAttribute('data-open','0');
      toggle.setAttribute('aria-expanded','false');
      list.classList.add('hide');
      list.style.display = 'none';
      widget.setAttribute('aria-expanded','false');
    }

    // initialize display from hidden value if present
    const hiddenVal = document.getElementById('f_program').value;
    if(hiddenVal) display.textContent = hiddenVal;
    else display.textContent = PROGRAMS[0];
  }

  // in openEdit ensure the widget shows current program
  function openEdit(p){
    populateProgramSelect();

    document.getElementById('f_firstName').value = p.firstName || '';
    document.getElementById('f_middleName').value = p.middleName || '';
    document.getElementById('f_lastName').value = p.lastName || '';
    document.getElementById('f_studentId').value = p.studentId || '';
    document.getElementById('f_email').value = p.email || '';
    document.getElementById('f_phone').value = p.phone || '';
    document.getElementById('f_dob').value = p.dob || '';
    document.getElementById('f_program').value = p.program || PROGRAMS[0];
    document.getElementById('f_yearLevel').value = p.yearLevel || '';
    document.getElementById('f_gpa').value = p.gpa || '';
    document.getElementById('f_emergencyName').value = p.emergencyName || '';
    document.getElementById('f_emergencyRelation').value = p.emergencyRelation || '';
    document.getElementById('f_emergencyPhone').value = p.emergencyPhone || '';

    const modal = document.getElementById('editModal');
    modal.classList.remove('hide');
    modal.style.display = 'grid';

    // attach sid formatter (existing)...
    const sid = document.getElementById('f_studentId');
    if(sid && !sid._bound){
      sid._bound = true;
      sid.addEventListener('input', (e)=>{
        const pos = e.target.selectionStart;
        const before = e.target.value;
        e.target.value = formatStudentIdInput(e.target.value);
        if(e.target.value.length > before.length) e.target.selectionStart = e.target.selectionEnd = pos + (e.target.value.length - before.length);
      });
    }

    // attach name input restrictions
    restrictNameInputs();
  }

  function closeEdit(){
    const modal = document.getElementById('editModal');
    modal.classList.add('hide');
    modal.style.display = 'none';
  }

  function openSettings(){
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('hide');
    modal.style.display = 'grid';
    // show current photo preview
    const profile = loadProfile();
    const preview = document.getElementById('photoPreview');
    if(profile.photo && preview) preview.innerHTML = `<img src="${profile.photo}" alt="photo preview" style="width:100%;height:100%;object-fit:cover">`;
    else if(preview) preview.textContent = initialsFrom(profile);
  }

  function closeSettings(){
    const modal = document.getElementById('settingsModal');
    modal.classList.add('hide');
    modal.style.display = 'none';
  }

  function handlePhotoFile(file, cb){
    if(!file) return cb(new Error('No file'));
    const reader = new FileReader();
    reader.onload = function(e){
      cb(null, e.target.result);
    };
    reader.onerror = function(){ cb(new Error('Failed to read file')); };
    reader.readAsDataURL(file);
  }

  document.addEventListener('DOMContentLoaded', function(){
    let profile = loadProfile();
    render(profile);
    populateProgramSelect();

    document.getElementById('editQuickBtn')?.addEventListener('click', ()=> openEdit(profile));
    document.getElementById('sidebarInitials')?.addEventListener('click', ()=> openEdit(profile));
    document.getElementById('cancelEdit')?.addEventListener('click', ()=> closeEdit());

    // Settings open/close
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    if(openSettingsBtn) openSettingsBtn.addEventListener('click', ()=> openSettings());
    if(closeSettingsBtn) closeSettingsBtn.addEventListener('click', ()=> closeSettings());

    // Password show/hide toggles
    document.querySelectorAll('.pwd-toggle').forEach(btn=>{
      btn.addEventListener('click', function(){
        const id = this.dataset.target;
        const inp = document.getElementById(id);
        if(!inp) return;
        if(inp.type === 'password'){
          inp.type = 'text';
          this.textContent = '🙈';
          this.setAttribute('aria-pressed','true');
        } else {
          inp.type = 'password';
          this.textContent = '👁️';
          this.setAttribute('aria-pressed','false');
        }
        // keep focus in input
        inp.focus();
      });
    });

    // Upload photo flow
    const photoInput = document.getElementById('photoInput');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    if(uploadPhotoBtn && photoInput) uploadPhotoBtn.addEventListener('click', ()=> photoInput.click());
    photoInput?.addEventListener('change', function(e){
      const f = e.target.files[0];
      if(!f) return;
      handlePhotoFile(f, function(err, dataUrl){
        if(err){ alert('Unable to read image'); return; }
        profile.photo = dataUrl;
        saveProfile(profile);
        render(profile);
        const preview = document.getElementById('photoPreview');
        if(preview) preview.innerHTML = `<img src="${dataUrl}" alt="photo preview" style="width:100%;height:100%;object-fit:cover">`;
      });
    });

    document.getElementById('removePhotoBtn')?.addEventListener('click', function(){
      if(!confirm('Remove profile photo?')) return;
      profile.photo = null;
      saveProfile(profile);
      render(profile);
      const preview = document.getElementById('photoPreview');
      if(preview) preview.textContent = initialsFrom(profile);
    });

    // Download profile data (moved to settings)
    document.getElementById('downloadDataBtn')?.addEventListener('click', function(){
      const blob = new Blob([JSON.stringify(profile, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(profile.firstName||'profile')}_profile.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    // Password change — ensure handler exists and prevents default
    const pwdForm = document.getElementById('pwdForm');
    const pwdMsg = document.getElementById('pwdMsg');
    if(pwdForm){
      pwdForm.addEventListener('submit', function(e){
        e.preventDefault();
        if(pwdMsg){ pwdMsg.style.color = ''; pwdMsg.textContent = ''; }

        const cur = document.getElementById('currentPwd')?.value || '';
        const nw = document.getElementById('newPwd')?.value || '';
        const cf = document.getElementById('confirmPwd')?.value || '';

        if(nw.length < 6){ if(pwdMsg){ pwdMsg.textContent = 'New password must be at least 6 characters'; } return; }
        if(nw !== cf){ if(pwdMsg){ pwdMsg.textContent = 'New password and confirmation do not match'; } return; }
        if(!verifyPassword(cur)){ if(pwdMsg){ pwdMsg.textContent = 'Current password is incorrect'; } return; }

        savePassword(nw);
        if(pwdMsg){ pwdMsg.style.color = 'green'; pwdMsg.textContent = 'Password updated'; }
        document.getElementById('currentPwd').value = '';
        document.getElementById('newPwd').value = '';
        document.getElementById('confirmPwd').value = '';

        // close settings after short delay to show message
        setTimeout(()=>{ if(pwdMsg){ pwdMsg.textContent = ''; pwdMsg.style.color = ''; } closeSettings(); }, 900);
      });
    }

    // profile edit save
    document.getElementById('profileForm')?.addEventListener('submit', function(e){
      e.preventDefault();

      const sidVal = document.getElementById('f_studentId').value.trim();
      if(!/^\d{2}-\d{2}-\d{4}$/.test(sidVal)){
        alert('Student ID must use format 00-00-0000');
        return;
      }

      // validate name fields contain only letters, spaces, ñ/Ñ
      const fn = document.getElementById('f_firstName').value.trim();
      const mn = document.getElementById('f_middleName').value.trim();
      const ln = document.getElementById('f_lastName').value.trim();
      if(/[^A-Za-zñÑ\s]/.test(fn + mn + ln)){
        alert('Name fields may contain letters and spaces only (ñ / Ñ allowed).');
        return;
      }

      profile.firstName = fn || profile.firstName;
      profile.middleName = mn || profile.middleName;
      profile.lastName = ln || profile.lastName;
      profile.studentId = sidVal || profile.studentId;
      profile.email = document.getElementById('f_email').value.trim() || profile.email;
      profile.phone = document.getElementById('f_phone').value.trim() || profile.phone;
      profile.dob = document.getElementById('f_dob').value || profile.dob;
      profile.program = document.getElementById('f_program').value || profile.program;
      profile.yearLevel = document.getElementById('f_yearLevel').value || profile.yearLevel;
      profile.gpa = document.getElementById('f_gpa').value || profile.gpa;
      profile.emergencyName = document.getElementById('f_emergencyName').value.trim() || profile.emergencyName;
      profile.emergencyRelation = document.getElementById('f_emergencyRelation').value.trim() || profile.emergencyRelation;
      profile.emergencyPhone = document.getElementById('f_emergencyPhone').value.trim() || profile.emergencyPhone;

      saveProfile(profile);
      render(profile);
      closeEdit();
      alert('Profile saved');
    });

    document.getElementById('downloadRecordsBtn')?.addEventListener('click', function(){
      alert('Download moved to Settings.');
      openSettings();
    });

    document.getElementById('changePasswordBtn')?.addEventListener('click', function(){
      openSettings();
      setTimeout(()=>{ document.getElementById('currentPwd')?.focus(); }, 200);
    });
  });
})();