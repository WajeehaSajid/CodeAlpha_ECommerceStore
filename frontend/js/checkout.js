/* ========================================================================
   checkout.js — checkout page (shipping form + place order)
   ======================================================================== */

const CO_SHIPPING_THRESHOLD = 5000;
const CO_SHIPPING_FEE = 300;

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('checkoutRoot')) return;
  buildNavbar('cart');
  if (!requireAuth()) return;
  loadCheckout();
});

async function loadCheckout() {
  const root = document.getElementById('checkoutRoot');
  try {
    const cart = await api.get('/cart', true);
    const items = (cart.items || []).filter((i) => i.product);
    if (items.length === 0) {
      root.innerHTML = `
        <div class="empty-state">
          <div class="emoji">🛒</div>
          <h3>Your cart is empty</h3>
          <a href="index.html" class="btn" style="margin-top:16px">Start Shopping</a>
        </div>`;
      return;
    }
    renderCheckout(items);
  } catch (err) {
    root.innerHTML = `<div class="empty-state"><h3>${escapeHTML(err.message)}</h3></div>`;
  }
}

function renderCheckout(items) {
  const root = document.getElementById('checkoutRoot');
  const user = Auth.getUser();
  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const shipping = subtotal >= CO_SHIPPING_THRESHOLD ? 0 : CO_SHIPPING_FEE;
  const total = subtotal + shipping;

  root.innerHTML = `
    <div class="checkout-layout">
      <form class="checkout-form" id="shippingForm">
        <h3 style="margin-bottom:18px">Shipping Address</h3>
        <div id="formError" class="form-error hidden"></div>
        <div class="form-group">
          <label>Full Name</label>
          <input class="form-control" id="name" value="${escapeHTML(user ? user.name : '')}" required />
        </div>
        <div class="form-group">
          <label>Street Address</label>
          <input class="form-control" id="street" placeholder="123 Main St" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>City</label>
            <input class="form-control" id="city" required />
          </div>
          <div class="form-group">
            <label>ZIP / Postal Code</label>
            <input class="form-control" id="zip" required />
          </div>
        </div>
        <div class="form-group">
          <label>Country</label>
          <input class="form-control" id="country" required />
        </div>
        <button type="submit" class="btn btn-block btn-lg" style="margin-top:10px">Place Order</button>
      </form>

      <aside class="checkout-summary">
        <h3 style="margin-bottom:18px">Order Summary</h3>
        ${items
          .map(
            (i) => `
          <div class="summary-row">
            <span>${escapeHTML(i.product.name)} × ${i.quantity}</span>
            <span>${formatPrice(i.product.price * i.quantity)}</span>
          </div>`
          )
          .join('')}
        <div class="summary-row" style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px">
          <span>Subtotal</span><span>${formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>${shipping === 0 ? '<span class="text-success">FREE</span>' : formatPrice(shipping)}</span>
        </div>
        <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
      </aside>
    </div>`;

  document.getElementById('shippingForm').addEventListener('submit', placeOrder);
}

async function placeOrder(e) {
  e.preventDefault();
  const shippingAddress = {
    name: document.getElementById('name').value.trim(),
    street: document.getElementById('street').value.trim(),
    city: document.getElementById('city').value.trim(),
    country: document.getElementById('country').value.trim(),
    zip: document.getElementById('zip').value.trim(),
  };

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Placing order...';

  try {
    const order = await api.post('/orders', { shippingAddress }, true);
    updateCartBadge();
    renderSuccess(order);
  } catch (err) {
    const box = document.getElementById('formError');
    box.textContent = err.message;
    box.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
}

function renderSuccess(order) {
  const root = document.getElementById('checkoutRoot');
  root.innerHTML = `
    <div class="success-screen">
      <div class="check">✓</div>
      <h1>Order Placed!</h1>
      <p class="muted">Thank you for your purchase. Your order total was
        <strong class="amber">${formatPrice(order.totalAmount)}</strong>.</p>
      <p class="muted" style="margin-top:6px">Order ID: <strong>${order._id}</strong></p>
      <div style="margin-top:26px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="orders.html" class="btn">View My Orders</a>
        <a href="index.html" class="btn btn-outline">Continue Shopping</a>
      </div>
    </div>`;
  showToast('Order placed successfully!', 'success');
}
