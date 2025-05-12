// Configuration
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFM68YzNelkIdUYiiyZIE2aGruvKwKTfCcgMS9HpX-7ZqWmuiNMpmge8TCboT5YYYO/exec';

// Helper Functions
function showError(message, elementId = 'errorMessage') {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  console.error(message);
}

function clearError(elementId = 'errorMessage') {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}

function clearLocalStorageExceptSystem() {
  const systemKeys = {};
  // Save system-related keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('sync_') || key.startsWith('auth_')) {
      systemKeys[key] = localStorage.getItem(key);
    }
  }
  
  // Clear all localStorage
  localStorage.clear();
  
  // Restore system keys
  Object.keys(systemKeys).forEach(key => {
    localStorage.setItem(key, systemKeys[key]);
  });
}

// ========================
// SIGN UP FORM HANDLER
// ========================
if (document.getElementById('signupForm')) {
  document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearError();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    // Validation
    if (!username || !email || !password) {
      return showError('All fields are required');
    }
    
    if (password.length < 6) {
      return showError('Password must be at least 6 characters');
    }
    
    if (confirmPassword && password !== confirmPassword) {
      return showError('Passwords do not match');
    }
    
    try {
      // Show loading state
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';
      
      // Clear any existing localStorage (except system keys)
      clearLocalStorageExceptSystem();
      
      // Send signup request
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          request: 'signup',
          username: username,
          email: email,
          password: password
        })
      });
      
      if (!response.ok) throw new Error('Network error');
      
      const data = await response.json();
      
      if (data.success) {
        // Store user data and redirect
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'index.html'; // Redirect after signup
      } else {
        showError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      showError('Failed to create account. Please try again later.');
      console.error('Signup error:', error);
    } finally {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
      }
    }
  });
}

// ========================
// SIGN IN FORM HANDLER
// ========================
if (document.getElementById('signinForm')) {
  document.getElementById('signinForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearError();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
      return showError('Username and password are required');
    }
    
    try {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
      
      // Clear existing localStorage before restoring server data
      clearLocalStorageExceptSystem();
      
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          request: 'signin',
          username: username,
          password: password
        })
      });
      
      if (!response.ok) throw new Error('Network error');
      
      const data = await response.json();
      
      if (data.success) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Restore user's saved data from Google Sheets
        if (data.localStorageData) {
          try {
            const userData = JSON.parse(data.localStorageData);
            Object.keys(userData).forEach(key => {
              localStorage.setItem(key, userData[key]);
            });
          } catch (e) {
            console.error('Error restoring data:', e);
          }
        }
        
        window.location.href = 'index.html';
      } else {
        showError(data.message || 'Invalid username or password');
      }
    } catch (error) {
      showError('Login failed. Please try again later.');
      console.error('Login error:', error);
    } finally {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    }
  });
}
