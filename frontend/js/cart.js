/* ========================================================================
   cart.js — shopping cart page
   ======================================================================== */

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE = 300;

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('cartRoot')) return;
  buildNavbar('cart');
  if (!requireAuth()) return;
  loadCart();
});

async function loadCart() {
  const root = document.getElementById('cartRoot');
  root.innerHTML = '<p class="muted">Loading your cart...</p>';

  try {
    const cart = await api.get('/cart', true);
    renderCart(cart);
  } catch (err) {
    root.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div><h3>${escapeHTML(
      err.message
    )}</h3></div>`;
  }
}

function renderCart(cart) {
  const root = document.getElementById('cartRoot');
  const items = (cart.items || []).filter((i) => i.product);

  if (items.length === 0) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <a href="index.html" class="btn" style="margin-top:18px">Start Shopping</a>
      </div>`;
    return;
  }

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  root.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">
        ${items.map(cartItemHTML).join('')}
        <button class="btn btn-ghost btn-sm" id="clearCart" style="align-self:flex-start">Clear cart</button>
      </div>
      <aside class="order-summary">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${
          shipping === 0 ? '<span class="text-success">FREE</span>' : formatPrice(shipping)
        }</span></div>
        ${
          shipping > 0
            ? `<div class="summary-row" style="font-size:13px"><span></span><span>Free over ${formatPrice(
                SHIPPING_THRESHOLD
              )}</span></div>`
            : ''
        }
        <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
        <a href="checkout.html" class="btn btn-block btn-lg" style="margin-top:10px">Proceed to Checkout</a>
      </aside>
    </div>`;

  // Bind controls
  root.querySelectorAll('[data-minus]').forEach((b) =>
    b.addEventListener('click', () => changeQty(b.dataset.minus, getQty(b.dataset.minus) - 1))
  );
  root.querySelectorAll('[data-plus]').forEach((b) =>
    b.addEventListener('click', () => changeQty(b.dataset.plus, getQty(b.dataset.plus) + 1))
  );
  root.querySelectorAll('[data-remove]').forEach((b) =>
    b.addEventListener('click', () => removeItem(b.dataset.remove))
  );
  document.getElementById('clearCart').addEventListener('click', clearCart);
}

function getQty(productId) {
  const el = document.querySelector(`[data-qty="${productId}"]`);
  return el ? parseInt(el.value, 10) : 1;
}

function cartItemHTML(item) {
  const p = item.product;
  const img = productImage(p.image);
  const fallback = (typeof getPKProductImage === 'function') ? getPKProductImage(p) : '';
  const displayImg = img || fallback;
  const emoji = CATEGORY_EMOJI[p.category] || '📦';
  const thumb = displayImg
    ? `<img src="${displayImg}" alt="${escapeHTML(p.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.outerHTML='${emoji}'">`
    : emoji;
  return `
    <div class="cart-item">
      <div class="thumb">${thumb}</div>
      <div class="info">
        <h4>${escapeHTML(p.name)}</h4>
        <div class="meta">${escapeHTML(p.category)} · ${formatPrice(p.price)} each</div>
        <div class="qty-selector" style="margin-top:10px">
          <button data-minus="${p._id}" type="button">−</button>
          <input data-qty="${p._id}" value="${item.quantity}" readonly
            style="width:48px;height:38px;border:none;background:var(--surface-2);color:var(--text);text-align:center" />
          <button data-plus="${p._id}" type="button">+</button>
        </div>
      </div>
      <div class="right">
        <span class="line-price">${formatPrice(p.price * item.quantity)}</span>
        <button class="remove-btn" data-remove="${p._id}">✕ Remove</button>
      </div>
    </div>`;
}

async function changeQty(productId, quantity) {
  try {
    await api.put('/cart/update', { productId, quantity }, true);
    await loadCart();
    updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function removeItem(productId) {
  try {
    await api.del(`/cart/remove/${productId}`, true);
    showToast('Item removed', 'info');
    await loadCart();
    updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function clearCart() {
  try {
    await api.del('/cart/clear', true);
    showToast('Cart cleared', 'info');
    await loadCart();
    updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  }
}