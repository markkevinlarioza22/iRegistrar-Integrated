// Fixed: Document request form

(function(){
  if (!protectRoute('student')) return;

  const form = document.getElementById('requestForm');
  if (!form) return;

  const docSelect = document.getElementById('documentType');
  const purposeInput = document.getElementById('purpose');
  const docErr = document.getElementById('docTypeError');
  const purposeErr = document.getElementById('purposeError');

  if (!docSelect || !purposeInput) return;

  function clearErrors() {
    if (docErr) docErr.classList.remove('active');
    if (purposeErr) purposeErr.classList.remove('active');
  }

  window.resetForm = function() {
    form.reset();
    clearErrors();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    let valid = true;

    if (!docSelect.value) {
      if (docErr) {
        docErr.textContent = 'Please choose a document';
        docErr.classList.add('active');
      }
      valid = false;
    }

    if (!purposeInput.value.trim()) {
      if (purposeErr) {
        purposeErr.textContent = 'Please enter the purpose';
        purposeErr.classList.add('active');
      }
      valid = false;
    }

    if (!valid) return;

    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...session.getAuthHeader()
        },
        body: JSON.stringify({
          documentType: docSelect.value,
          purpose: purposeInput.value.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit request');
      }

      alert('Request submitted successfully!');
      form.reset();
      clearErrors();
      setTimeout(() => {
        window.location.href = '/dashboard-docs.html';
      }, 500);
    } catch (error) {
      console.error('Request error:', error);
      alert('Error: ' + error.message);
    }
  });
})();
