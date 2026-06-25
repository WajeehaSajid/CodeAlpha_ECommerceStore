/* ========================================================================
   auth.js — login & register page logic
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  buildNavbar('');

  // Already logged in? bounce to home
  if (Auth.isLoggedIn() && (document.getElementById('loginForm') || document.getElementById('registerForm'))) {
    window.location.href = 'index.html';
    return;
  }

  setupPasswordToggles();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
});

function setupPasswordToggles() {
  document.querySelectorAll('.toggle-pass').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
      }
    });
  });
}

function showError(msg) {
  const box = document.getElementById('formError');
  if (box) {
    box.textContent = msg;
    box.classList.remove('hidden');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const data = await api.post('/auth/login', { email, password });
    Auth.setToken(data.token);
    Auth.setUser(data.user);
    showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
    setTimeout(() => {
      window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html';
    }, 700);
  } catch (err) {
    showError(err.message);
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const roleEl = document.querySelector('input[name="role"]:checked');
  const role = roleEl ? roleEl.value : 'user';

  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    const data = await api.post('/auth/register', { name, email, password, role });
    Auth.setToken(data.token);
    Auth.setUser(data.user);
    showToast('Account created!', 'success');
    setTimeout(() => {
      window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html';
    }, 700);
  } catch (err) {
    showError(err.message);
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}
