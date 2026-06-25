/* ========================================================================
   admin.js — admin dashboard (products CRUD, orders, stats)
   ======================================================================== */

const ADMIN_CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Accessories', 'Sports'];
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

let cachedProducts = [];
let cachedOrders = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('adminRoot')) return;
  buildNavbar('admin');

  if (!Auth.isLoggedIn()) {
    showToast('Please log in', 'info');
    setTimeout(() => (window.location.href = 'login.html'), 600);
    return;
  }
  if (!Auth.isAdmin()) {
    document.getElementById('adminRoot').innerHTML = `
      <div class="empty-state">
        <div class="emoji">🔒</div>
        <h3>Admin access only</h3>
        <p>You don't have permission to view this page.</p>
        <a href="index.html" class="btn" style="margin-top:16px">Back home</a>
      </div>`;
    return;
  }

  setupTabs();
  setupModal();
  loadStats();
  loadAdminProducts();
  loadAdminOrders();
});

/* ------------------------------- Tabs ----------------------------------- */
function setupTabs() {
  const btns = document.querySelectorAll('.admin-nav-btn');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document
        .querySelectorAll('.admin-panel')
        .forEach((p) => p.classList.remove('active'));
      document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

/* ------------------------------- Stats ---------------------------------- */
async function loadStats() {
  try {
    const [productsData, orders] = await Promise.all([
      api.get('/products?limit=1000'),
      api.get('/orders', true),
    ]);
    const totalProducts = productsData.total;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

    document.getElementById('statRevenue').textContent = formatPrice(totalRevenue);
    document.getElementById('statOrders').textContent = totalOrders;
    document.getElementById('statProducts').textContent = totalProducts;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* --------------------------- Products table ----------------------------- */
async function loadAdminProducts() {
  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = '<tr><td colspan="6" class="muted">Loading...</td></tr>';
  try {
    const data = await api.get('/products?limit=1000');
    cachedProducts = data.products;
    if (!cachedProducts.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="muted">No products yet.</td></tr>';
      return;
    }
    tbody.innerHTML = cachedProducts
      .map((p) => {
        const img = productImage(p.image);
        const thumb = img
          ? `<img class="table-thumb" src="${img}" alt="">`
          : `<div class="table-thumb" style="display:flex;align-items:center;justify-content:center">${
              CATEGORY_EMOJI[p.category] || '📦'
            }</div>`;
        return `
        <tr>
          <td>${thumb}</td>
          <td>${escapeHTML(p.name)}</td>
          <td>${escapeHTML(p.category)}</td>
          <td>${formatPrice(p.price)}</td>
          <td>${p.stock}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-sm btn-outline" data-edit="${p._id}">Edit</button>
              <button class="btn btn-sm btn-danger" data-del="${p._id}">Delete</button>
            </div>
          </td>
        </tr>`;
      })
      .join('');

    tbody.querySelectorAll('[data-edit]').forEach((b) =>
      b.addEventListener('click', () => openProductModal(b.dataset.edit))
    );
    tbody.querySelectorAll('[data-del]').forEach((b) =>
      b.addEventListener('click', () => deleteProduct(b.dataset.del))
    );
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">${escapeHTML(err.message)}</td></tr>`;
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await api.del(`/products/${id}`, true);
    showToast('Product deleted', 'success');
    loadAdminProducts();
    loadStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ------------------------------ Modal ----------------------------------- */
function setupModal() {
  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  const catSelect = document.getElementById('p_category');
  catSelect.innerHTML = ADMIN_CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');

  document.getElementById('productForm').addEventListener('submit', saveProduct);
}

function openProductModal(id) {
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('p_id').value = '';
  const title = document.getElementById('modalTitle');

  if (id) {
    const p = cachedProducts.find((x) => x._id === id);
    if (!p) return;
    title.textContent = 'Edit Product';
    document.getElementById('p_id').value = p._id;
    document.getElementById('p_name').value = p.name;
    document.getElementById('p_description').value = p.description;
    document.getElementById('p_price').value = p.price;
    document.getElementById('p_category').value = p.category;
    document.getElementById('p_stock').value = p.stock;
  } else {
    title.textContent = 'Add Product';
  }

  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('p_id').value;
  const fd = new FormData();
  fd.append('name', document.getElementById('p_name').value.trim());
  fd.append('description', document.getElementById('p_description').value.trim());
  fd.append('price', document.getElementById('p_price').value);
  fd.append('category', document.getElementById('p_category').value);
  fd.append('stock', document.getElementById('p_stock').value);
  const imgInput = document.getElementById('p_image');
  if (imgInput.files[0]) fd.append('image', imgInput.files[0]);

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    if (id) {
      await api.putForm(`/products/${id}`, fd);
      showToast('Product updated', 'success');
    } else {
      await api.postForm('/products', fd);
      showToast('Product created', 'success');
    }
    closeModal();
    loadAdminProducts();
    loadStats();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Product';
  }
}

/* ---------------------------- Orders table ------------------------------ */
async function loadAdminOrders() {
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = '<tr><td colspan="6" class="muted">Loading...</td></tr>';
  try {
    cachedOrders = await api.get('/orders', true);
    if (!cachedOrders.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="muted">No orders yet.</td></tr>';
      return;
    }
    tbody.innerHTML = cachedOrders
      .map(
        (o) => `
        <tr>
          <td>#${o._id.slice(-8).toUpperCase()}</td>
          <td>${o.user ? escapeHTML(o.user.name) : 'N/A'}<br><span class="muted" style="font-size:12px">${
          o.user ? escapeHTML(o.user.email) : ''
        }</span></td>
          <td>
            <div>${o.items.length} item(s)</div>
            <div class="order-items-detail">${o.items.map(i => `${escapeHTML(i.name)} × ${i.quantity}`).join('<br>')}</div>
          </td>
          <td>${formatPrice(o.totalAmount)}</td>
          <td>${formatDate(o.createdAt)}</td>
          <td>
            <select class="status-select" data-order="${o._id}">
              ${ORDER_STATUSES.map(
                (s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </td>
        </tr>`
      )
      .join('');

    tbody.querySelectorAll('.status-select').forEach((sel) =>
      sel.addEventListener('change', () => updateOrderStatus(sel.dataset.order, sel.value))
    );
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">${escapeHTML(err.message)}</td></tr>`;
  }
}

async function updateOrderStatus(id, status) {
  try {
    await api.put(`/orders/${id}/status`, { status }, true);
    showToast(`Order marked ${status}`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
    loadAdminOrders();
  }
}
