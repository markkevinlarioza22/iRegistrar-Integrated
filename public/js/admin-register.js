// Fixed: Admin student registration

(function(){
  if (!protectRoute('admin')) return;

  const form = document.getElementById('registerForm');
  if (!form) return;

  const successMessage = document.getElementById('successMessage');

  const fields = {
    firstName: { el: document.getElementById('firstName'), error: document.getElementById('firstNameError') },
    lastName: { el: document.getElementById('lastName'), error: document.getElementById('lastNameError') },
    middleName: { el: document.getElementById('middleName'), error: null },
    suffix: { el: document.getElementById('suffix'), error: null }, // optional
    sex: { el: document.getElementById('sex'), error: document.getElementById('sexError') },
    age: { el: document.getElementById('age'), error: document.getElementById('ageError') },
    studentId: { el: document.getElementById('studentId'), error: document.getElementById('studentIdError') },
    email: { el: document.getElementById('email'), error: document.getElementById('emailError') },
    password: { el: document.getElementById('password'), error: document.getElementById('passwordError') },
    confirmPassword: { el: document.getElementById('confirmPassword'), error: document.getElementById('confirmPasswordError') }
  };

  // Check all required elements exist
  for (const [key, field] of Object.entries(fields)) {
    if (!field.el) {
      console.error(`Missing element: ${key}`);
      return;
    }
  }

  function clearErrors() {
    Object.values(fields).forEach(field => {
      if (field.error) {
        field.error.textContent = '';
        field.error.classList.remove('active');
      }
    });
    if (successMessage) {
      successMessage.classList.remove('active');
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePassword(password) {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  }

  function setError(fieldName, message) {
    if (fields[fieldName] && fields[fieldName].error) {
      fields[fieldName].error.textContent = message;
      fields[fieldName].error.classList.add('active');
    }
  }

  function validate() {
    clearErrors();
    let isValid = true;

    // First Name
    if (!fields.firstName.el.value.trim()) {
      setError('firstName', 'First name is required');
      isValid = false;
    }

    // Last Name
    if (!fields.lastName.el.value.trim()) {
      setError('lastName', 'Last name is required');
      isValid = false;
    }

    // Sex
    if (!fields.sex.el.value) {
      setError('sex', 'Please select sex');
      isValid = false;
    }

    // Age
    const age = parseInt(fields.age.el.value);
    if (!fields.age.el.value || isNaN(age) || age < 16 || age > 60) {
      setError('age', 'Age must be between 16 and 60');
      isValid = false;
    }

    // Student ID validation (admin same rule)
    const studentIdVal = fields.studentId.el.value.trim();
    const yearPrefix = String(new Date().getFullYear() - 2000).padStart(2, '0');
    const studentIdRegex = new RegExp(`^${yearPrefix}-\\d{2}-\\d{4}$`);

    if (!studentIdVal) {
      setError('studentId', 'Student ID is required');
      isValid = false;
    } else if (!studentIdRegex.test(studentIdVal)) {
      setError('studentId', `Student ID must follow "${yearPrefix}-01-0000" format (year prefix must be ${yearPrefix})`);
      isValid = false;
    }

    // Email
    const email = fields.email.el.value.trim();
    if (!email) {
      setError('email', 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setError('email', 'Please enter a valid email address');
      isValid = false;
    }

    // Password
    const password = fields.password.el.value;
    if (!password) {
      setError('password', 'Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      setError('password', 'Password must be at least 8 characters with uppercase, lowercase, and numbers');
      isValid = false;
    }

    // Confirm Password
    if (!fields.confirmPassword.el.value) {
      setError('confirmPassword', 'Please confirm password');
      isValid = false;
    } else if (password !== fields.confirmPassword.el.value) {
      setError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }

    return isValid;
  }

  window.resetForm = function() {
    form.reset();
    clearErrors();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) {
      console.log('Validation failed');
      return;
    }

    try {
      const firstName = fields.firstName.el.value.trim();
      const middleName = fields.middleName.el.value.trim();
      const lastName = fields.lastName.el.value.trim();
      const suffix = fields.suffix.el.value || null;

      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

      const payload = {
        name: fullName,
        firstName: firstName,
        middleName: middleName || null,
        lastName: lastName,
        suffix: suffix,
        sex: fields.sex.el.value,
        age: parseInt(fields.age.el.value),
        studentId: fields.studentId.el.value.trim(),
        email: fields.email.el.value.trim(),
        password: fields.password.el.value,
        role: 'student'
      };

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...session.getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      if (successMessage) {
        successMessage.classList.add('active');
      }
      form.reset();
      clearErrors();

      setTimeout(() => {
        window.location.href = '/admin.html';
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Error: ${error.message}`);
    }
  });
})();
