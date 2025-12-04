const API_URL = API_BASE_URL;

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

(function(){
  const form = document.getElementById('registerForm');
  if (!form) return;

  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Include admin token
          },
          body: JSON.stringify({ name, email, password, role: "student" }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Registration failed:", text);
          return alert("Registration failed. Check server or credentials.");
        }

        await res.json();
        alert("Student registered successfully!");
        window.location.href = "/admin.html"; // Redirect to admin dashboard
      } catch (err) {
        console.error("Network error during registration:", err);
        alert("Network error. Check your connection or backend server.");
      }
    }
  });

  function validate() {
    clearErrors();
    let isValid = true;

    // Name validation
    if (!fields.firstName.el.value.trim()) {
      setFieldError('firstName', 'First name is required');
      isValid = false;
    }
    if (!fields.lastName.el.value.trim()) {
      setFieldError('lastName', 'Last name is required');
      isValid = false;
    }

    // Sex validation
    if (!fields.sex.el.value.trim()) {
      setFieldError('sex', 'Sex is required');
      isValid = false;
    }

    // Age validation
    const ageVal = fields.age.el.value.trim();
    if (!ageVal || !/^\d+$/.test(ageVal)) {
      setFieldError('age', 'Please enter a valid age');
      isValid = false;
    }

    // Student ID validation
    // Required format: "YY-01-0000" where YY = currentYear - 2000 (two digits)
    const studentIdVal = fields.studentId.el.value.trim();
    const yearPrefix = String(new Date().getFullYear() - 2000).padStart(2, '0');
    const studentIdRegex = new RegExp(`^${yearPrefix}-\\d{2}-\\d{4}$`); // e.g. 24-01-0001

    if (!studentIdVal) {
      setFieldError('studentId', 'Student ID is required');
      isValid = false;
    } else if (!studentIdRegex.test(studentIdVal)) {
      setFieldError('studentId', `Student ID must follow "${yearPrefix}-01-0000" format (year prefix must be ${yearPrefix})`);
      isValid = false;
    }

    // Email validation
    if (!fields.email.el.value.trim()) {
      setFieldError('email', 'Email is required');
      isValid = false;
    } else if (!isValidEmail(fields.email.el.value.trim())) {
      setFieldError('email', 'Please enter a valid email');
      isValid = false;
    }

    // Password validation
    if (!fields.password.el.value.trim()) {
      setFieldError('password', 'Password is required');
      isValid = false;
    } else if (fields.password.el.value.trim().length < 6) {
      setFieldError('password', 'Password should be at least 6 characters');
      isValid = false;
    }

    // Confirm password validation
    if (!fields.confirmPassword.el.value.trim()) {
      setFieldError('confirmPassword', 'Please confirm your password');
      isValid = false;
    } else if (fields.password.el.value.trim() !== fields.confirmPassword.el.value.trim()) {
      setFieldError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }

    return isValid;
  }

  function clearErrors() {
    for (const field in fields) {
      fields[field].error.textContent = "";
    }
  }

  function setFieldError(field, message) {
    fields[field].error.textContent = message;
  }
})();
