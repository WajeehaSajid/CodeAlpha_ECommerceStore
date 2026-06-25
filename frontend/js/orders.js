/* ========================================================================
   orders.js — "My Orders" page
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('ordersRoot')) return;
  buildNavbar('orders');
  if (!requireAuth()) return;
  loadOrders();
});

async function loadOrders() {
  const root = document.getElementById('ordersRoot');
  root.innerHTML = '<p class="muted">Loading your orders...</p>';

  try {
    const orders = await api.get('/orders/myorders', true);
    if (!orders.length) {
      root.innerHTML = `
        <div class="empty-state">
          <div class="emoji">📦</div>
          <h3>No orders yet</h3>
          <p>When you place an order it will show up here.</p>
          <a href="index.html" class="btn" style="margin-top:18px">Start Shopping</a>
        </div>`;
      return;
    }

    root.innerHTML = `<div class="orders-list">${orders.map(orderCardHTML).join('')}</div>`;

    root.querySelectorAll('.order-card-head').forEach((head) => {
      head.addEventListener('click', () => head.parentElement.classList.toggle('open'));
    });
  } catch (err) {
    root.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div><h3>${escapeHTML(
      err.message
    )}</h3></div>`;
  }
}

function orderCardHTML(o) {
  return `
    <div class="order-card">
      <div class="order-card-head">
        <div>
          <div class="order-id">Order #${o._id.slice(-8).toUpperCase()}</div>
          <div class="muted" style="font-size:13px">${formatDate(o.createdAt)} · ${
    o.items.length
  } item(s)</div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <span class="amber" style="font-family:var(--font-head);font-weight:700">${formatPrice(
            o.totalAmount
          )}</span>
          <span class="status-badge status-${o.status}">${o.status}</span>
          <span class="muted">▾</span>
        </div>
      </div>
      <div class="order-card-body">
        ${o.items
          .map(
            (i) => `
          <div class="order-line">
            <span>${escapeHTML(i.name)} × ${i.quantity}</span>
            <span>${formatPrice(i.priceAtPurchase * i.quantity)}</span>
          </div>`
          )
          .join('')}
        <div class="order-line" style="margin-top:10px">
          <span class="muted">Ship to</span>
          <span class="muted">${escapeHTML(o.shippingAddress.street)}, ${escapeHTML(
    o.shippingAddress.city
  )}, ${escapeHTML(o.shippingAddress.country)} ${escapeHTML(o.shippingAddress.zip)}</span>
        </div>
      </div>
    </div>`;
}
