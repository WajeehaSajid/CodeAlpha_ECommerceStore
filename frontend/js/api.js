/* ========================================================================
   api.js — shared helpers: fetch wrapper, auth/token, toasts, navbar,
   cart badge, star rendering. Included on every page.
   ======================================================================== */

const API_BASE = '/api';

/* -------------------------- Token / user storage -------------------------- */
const Auth = {
  getToken: () => localStorage.getItem('token'),
  setToken: (t) => localStorage.setItem('token', t),
  clearToken: () => localStorage.removeItem('token'),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },
  setUser: (u) => localStorage.setItem('user', JSON.stringify(u)),
  clearUser: () => localStorage.removeItem('user'),
  isLoggedIn: () => !!localStorage.getItem('token'),
  isAdmin: () => {
    const u = Auth.getUser();
    return u && u.role === 'admin';
  },
  logout: () => {
    Auth.clearToken();
    Auth.clearUser();
  },
};

/* ------------------------------- Fetch core ------------------------------- */
async function apiRequest(endpoint, { method = 'GET', body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (auth && Auth.getToken()) {
    headers['Authorization'] = `Bearer ${Auth.getToken()}`;
  }

  const options = { method, headers };

  if (body !== undefined) {
    if (isForm) {
      options.body = body; // FormData; let browser set content-type
    } else {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.message) || res.statusText || 'Request failed';
    if (res.status === 401 && auth) {
      Auth.logout();
    }
    throw new Error(message);
  }

  return data;
}

const api = {
  get: (e, auth = false) => apiRequest(e, { method: 'GET', auth }),
  post: (e, body, auth = false) => apiRequest(e, { method: 'POST', body, auth }),
  put: (e, body, auth = false) => apiRequest(e, { method: 'PUT', body, auth }),
  del: (e, auth = false) => apiRequest(e, { method: 'DELETE', auth }),
  postForm: (e, formData, auth = true) =>
    apiRequest(e, { method: 'POST', body: formData, auth, isForm: true }),
  putForm: (e, formData, auth = true) =>
    apiRequest(e, { method: 'PUT', body: formData, auth, isForm: true }),
};

/* ------------------------------ Image helper ------------------------------ */
function productImage(filename) {
  if (!filename) return '';
  // Cloudinary URL already complete hota hai
  if (filename.startsWith('http')) return filename;
  return `/uploads/${filename}`;
}

const CATEGORY_EMOJI = {
  Electronics: '🎧',
  Clothing: '👕',
  Books: '📚',
  Accessories: '👜',
  Sports: '🏅',
};

function productThumbHTML(product, cls = 'product-thumb') {
  const img = productImage(product.image);
  const fallbackUrl = (typeof getPKProductImage === 'function') ? getPKProductImage(product) : '';
  const displayImg = img || fallbackUrl;
  const emoji = CATEGORY_EMOJI[product.category] || '📦';

  if (displayImg) {
    // Build thumb with JS-safe onerror using createElement — avoids quote-escaping bugs
    const id = 'thumb-' + (product._id || Math.random().toString(36).slice(2));
    return `<div class="${cls}" id="${id}">
      <img src="${displayImg}" alt="${escapeHTML(product.name)}" loading="lazy"
        onload="this.style.opacity=1"
        onerror="(function(el){var s=document.createElement('span');s.className='placeholder-emoji';s.textContent='${emoji}';el.parentNode.replaceChild(s,el);})(this)">
    </div>`;
  }
  return `<div class="${cls}"><span class="placeholder-emoji">${emoji}</span></div>`;
}

/* ------------------------------ Star rating ------------------------------ */
function renderStars(rating, count) {
  // If count is explicitly provided and is 0, show "No reviews yet" label
  if (count !== undefined && count === 0) {
    return '<span class="no-reviews">No reviews yet</span>';
  }
  const r = Math.round(rating || 0);
  let html = '<span class="stars">';
  for (let i = 1; i <= 5; i++) {
    html += i <= r ? '★' : '<span class="empty">★</span>';
  }
  html += '</span>';
  if (count !== undefined) {
    html += `<span class="rating-count">(${count})</span>`;
  }
  return html;
}

/* -------------------------------- Escaping -------------------------------- */
function escapeHTML(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatPrice(n) {
  return `Rs. ${Number(n || 0).toLocaleString('en-PK', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* ------------------------------- Toasts ---------------------------------- */
function ensureToastContainer() {
  let c = document.querySelector('.toast-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function showToast(message, type = 'info') {
  const container = ensureToastContainer();
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escapeHTML(
    message
  )}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3200);
}

/* ------------------------------- Navbar ---------------------------------- */
function buildNavbar(active = '') {
  const loggedIn = Auth.isLoggedIn();
  const user = Auth.getUser();
  const isAdmin = Auth.isAdmin();

  const link = (href, label, key) =>
    `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`;

  const linkBlank = (href, label, key) =>
    `<a href="${href}" class="${active === key ? 'active' : ''}" target="_blank">${label}</a>`;

  const navLinks = `
    ${link('index.html', 'Home', 'home')}
    ${link('products.html', 'Products', 'products')}
    ${linkBlank('cart.html', 'Cart', 'cart')}
    ${loggedIn ? link('orders.html', 'My Orders', 'orders') : ''}
    ${isAdmin ? link('admin.html', 'Admin', 'admin') : ''}
  `;

  const authArea = loggedIn
    ? `<span class="user-greeting desktop-only">Hi, <strong>${escapeHTML(
        user ? user.name.split(' ')[0] : 'there'
      )}</strong></span>
       <button class="btn btn-outline btn-sm" id="logoutBtn">Logout</button>`
    : `<a href="login.html" class="btn btn-outline btn-sm">Login</a>
       <a href="register.html" class="btn btn-sm">Register</a>`;

  const navbar = `
    <nav class="navbar" id="navbar">
      <div class="container nav-inner">
        <a href="index.html" class="logo">Nova<span>Shop</span></a>
        <ul class="nav-links">${navLinks}</ul>
        <div class="nav-actions">
          <a href="cart.html" class="cart-link" title="Cart" target="_blank">
            🛒<span class="cart-badge" id="cartBadge">0</span>
          </a>
          ${authArea}
          <button class="menu-toggle" id="menuToggle" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
    <div class="mobile-menu" id="mobileMenu">
      <button class="close-menu" id="closeMenu" aria-label="Close">&times;</button>
      ${navLinks}
      ${loggedIn ? '' : '<a href="login.html">Login</a><a href="register.html">Register</a>'}
      ${loggedIn ? '<a href="#" id="logoutBtnMobile">Logout</a>' : ''}
    </div>
  `;

  const mount = document.getElementById('navbar-mount');
  if (mount) mount.innerHTML = navbar;

  // Logout handlers
  const doLogout = (e) => {
    e.preventDefault();
    Auth.logout();
    showToast('Logged out', 'info');
    setTimeout(() => (window.location.href = 'index.html'), 400);
  };
  const lb = document.getElementById('logoutBtn');
  const lbm = document.getElementById('logoutBtnMobile');
  if (lb) lb.addEventListener('click', doLogout);
  if (lbm) lbm.addEventListener('click', doLogout);

  // Scroll background
  const nav = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Mobile menu
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');
  if (menuToggle) menuToggle.addEventListener('click', () => mobileMenu.classList.add('open'));
  if (closeMenu) closeMenu.addEventListener('click', () => mobileMenu.classList.remove('open'));
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => mobileMenu.classList.remove('open'))
    );
  }

  updateCartBadge();
}

/* ----------------------------- Cart badge -------------------------------- */
async function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  if (!Auth.isLoggedIn()) {
    badge.classList.remove('show');
    return;
  }
  try {
    const cart = await api.get('/cart', true);
    const count = (cart.items || []).reduce((acc, i) => acc + i.quantity, 0);
    badge.textContent = count;
    if (count > 0) {
      badge.classList.add('show', 'bump');
      setTimeout(() => badge.classList.remove('bump'), 400);
    } else {
      badge.classList.remove('show');
    }
  } catch {
    badge.classList.remove('show');
  }
}

/* ------------------------- Require auth helper --------------------------- */
function requireAuth(redirectTo = 'login.html') {
  if (!Auth.isLoggedIn()) {
    showToast('Please log in to continue', 'info');
    setTimeout(() => (window.location.href = redirectTo), 600);
    return false;
  }
  return true;
}

/* ------------------------- Add to cart (shared) -------------------------- */
async function addToCart(productId, quantity = 1) {
  if (!Auth.isLoggedIn()) {
    showToast('Please log in to add items to your cart', 'info');
    setTimeout(() => (window.location.href = 'login.html'), 800);
    return;
  }
  try {
    await api.post('/cart/add', { productId, quantity }, true);
    showToast('Added to cart', 'success');
    updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ------------------------------- Debounce -------------------------------- */
function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}