/* ========================================================================
   products.js — products listing page + product detail page
   ======================================================================== */

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Accessories', 'Sports'];

const state = {
  category: 'All',
  search: '',
  sort: 'newest',
  page: 1,
  limit: 8,
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productGrid')) {
    // Read ?category= from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get('category');
    if (urlCat && CATEGORIES.includes(urlCat)) {
      state.category = urlCat;
    }
    initProductsPage();
  }
  if (document.getElementById('productDetail')) {
    initDetailPage();
  }
});

/* ============================== PRODUCTS PAGE ============================== */
function initProductsPage() {
  buildNavbar('products');
  renderCategoryPills();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce((e) => {
        state.search = e.target.value.trim();
        state.page = 1;
        loadProducts();
      }, 300)
    );
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.page = 1;
      loadProducts();
    });
  }

  loadProducts();
}

function renderCategoryPills() {
  const wrap = document.getElementById('categoryPills');
  if (!wrap) return;
  wrap.innerHTML = CATEGORIES.map(
    (c) =>
      `<button class="pill ${c === state.category ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  wrap.querySelectorAll('.pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      state.category = pill.dataset.cat;
      state.page = 1;
      wrap.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      loadProducts();
    });
  });
}

function showSkeletons() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = Array.from({ length: state.limit })
    .map(
      () => `
      <div class="skeleton-card">
        <div class="skeleton skeleton-thumb"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>`
    )
    .join('');
}

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  showSkeletons();

  const params = new URLSearchParams({
    category: state.category,
    search: state.search,
    sort: state.sort,
    page: state.page,
    limit: state.limit,
  });

  try {
    const data = await api.get(`/products?${params.toString()}`);
    if (!data || !data.products) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">⚠️</div><h3>Failed to load products</h3><p>Could not reach the server.</p></div>`;
      return;
    }
    if (!data.products.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="emoji">🔍</div>
          <h3>No products found</h3>
          <p>Try a different category or search term.</p>
        </div>`;
      renderPagination(1, 1);
      return;
    }

    grid.innerHTML = data.products.map(productCardHTML).join('');
    grid.querySelectorAll('[data-add]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(btn.dataset.add, 1);
      });
    });
    grid.querySelectorAll('[data-link]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-add]')) return;
        window.open(`product.html?id=${card.dataset.link}`, '_blank');
      });
    });

    renderPagination(data.page, data.pages);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">⚠️</div><h3>Failed to load products</h3><p>${escapeHTML(
      err.message
    )}</p></div>`;
  }
}

function productCardHTML(p) {
  // FIX: productImage() Cloudinary URL ko correctly handle karta hai
  const imgSrc = productImage(p.image);
  const emoji = CATEGORY_EMOJI[p.category] || '📦';
  const imgInner = imgSrc
    ? `<img src="${imgSrc}" alt="${escapeHTML(p.name)}" loading="lazy"
        onerror="(function(el){var s=document.createElement('span');s.className='placeholder-emoji';s.textContent='${emoji}';el.parentNode.replaceChild(s,el);})(this)">`
    : `<span class="placeholder-emoji">${emoji}</span>`;

  return `
    <div class="product-card" data-link="${p._id}">
      <div class="product-thumb">
        ${imgInner}
        <span class="category-badge">${escapeHTML(p.category)}</span>
      </div>
      <div class="product-body">
        <h3 class="product-title">${escapeHTML(p.name)}</h3>
        <p class="product-desc">${escapeHTML(p.description)}</p>
        ${renderStars(p.avgRating, p.ratings ? p.ratings.length : 0)}
        <div class="product-foot">
          <span class="price">${formatPrice(p.price)}</span>
          <button class="btn btn-sm" data-add="${p._id}">Add to Cart</button>
        </div>
      </div>
    </div>`;
}

function renderPagination(page, pages) {
  const wrap = document.getElementById('pagination');
  if (!wrap) return;
  if (pages <= 1) {
    wrap.innerHTML = '';
    return;
  }
  let html = `<button ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">‹</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button ${page >= pages ? 'disabled' : ''} data-page="${page + 1}">›</button>`;
  wrap.innerHTML = html;

  wrap.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.page, 10);
      if (p >= 1 && p <= pages) {
        state.page = p;
        loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/* ============================ DETAIL PAGE ============================= */
let detailQty = 1;

async function initDetailPage() {
  buildNavbar('products');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('productDetail');

  if (!id) {
    container.innerHTML = '<div class="empty-state"><h3>Product not found</h3></div>';
    return;
  }

  try {
    const p = await api.get(`/products/${id}`);
    renderDetail(p);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div><h3>${escapeHTML(
      err.message
    )}</h3><a href="products.html" class="btn" style="margin-top:16px">Back to shop</a></div>`;
  }
}

function renderDetail(p) {
  const container = document.getElementById('productDetail');
  const inStock = p.stock > 0;
  detailQty = 1;

  // FIX: productImage() use karo — Cloudinary URL directly return hoga
  const imgSrc = productImage(p.image);
  const emoji = (typeof CATEGORY_EMOJI !== 'undefined' ? CATEGORY_EMOJI[p.category] : null) || '📦';
  const imgInner = imgSrc
    ? `<img src="${imgSrc}" alt="${escapeHTML(p.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : `<span class="placeholder-emoji">${emoji}</span>`;

  container.innerHTML = `
    <div class="product-detail">
      <div class="detail-image">
        ${imgInner}
        ${imgSrc ? `<span class="placeholder-emoji" style="display:none;font-size:72px;align-items:center;justify-content:center">${emoji}</span>` : ''}
      </div>
      <div class="detail-info">
        <span class="category-badge" style="position:static;display:inline-block">${escapeHTML(p.category)}</span>
        <h1>${escapeHTML(p.name)}</h1>
        <div class="detail-meta">
          ${renderStars(p.avgRating, p.ratings ? p.ratings.length : 0)}
          <span class="stock-badge ${inStock ? 'in' : 'out'}">${
    inStock ? `● In Stock (${p.stock})` : '● Out of Stock'
  }</span>
        </div>
        <div class="detail-price">${formatPrice(p.price)}</div>
        <p class="detail-desc">${escapeHTML(p.description)}</p>
        <div class="detail-actions">
          <div class="qty-selector">
            <button id="qtyMinus" type="button">−</button>
            <input id="qtyInput" type="number" value="1" min="1" max="${p.stock}" />
            <button id="qtyPlus" type="button">+</button>
          </div>
          <button class="btn btn-lg" id="detailAdd" ${inStock ? '' : 'disabled'}>
            ${inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
    <section class="reviews">
      <h2>Reviews (${p.ratings ? p.ratings.length : 0})</h2>
      ${Auth.isLoggedIn() ? `
      <div class="review-form" id="reviewFormWrap">
        <h3>Leave a Review</h3>
        <div class="star-picker" id="starPicker">
          <button type="button" data-star="1">★</button>
          <button type="button" data-star="2">★</button>
          <button type="button" data-star="3">★</button>
          <button type="button" data-star="4">★</button>
          <button type="button" data-star="5">★</button>
        </div>
        <textarea class="form-control" id="reviewText" placeholder="Share your experience with this product..." style="margin-bottom:12px;min-height:80px"></textarea>
        <button class="btn" id="submitReviewBtn">Submit Review</button>
      </div>` : '<p class="muted" style="margin-bottom:16px"><a href="login.html">Sign in</a> to leave a review.</p>'}
      <div id="reviewList">${renderReviews(p.ratings)}</div>
    </section>
  `;

  const qtyInput = document.getElementById('qtyInput');
  document.getElementById('qtyMinus').addEventListener('click', () => {
    qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1, 10) - 1);
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    const max = p.stock || 99;
    qtyInput.value = Math.min(max, parseInt(qtyInput.value || 1, 10) + 1);
  });

  const addBtn = document.getElementById('detailAdd');
  if (inStock) {
    addBtn.addEventListener('click', () => {
      const qty = Math.max(1, parseInt(qtyInput.value || 1, 10));
      addToCart(p._id, qty);
    });
  }

  let selectedStar = 0;
  const starPicker = document.getElementById('starPicker');
  if (starPicker) {
    starPicker.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('mouseover', () => highlightStars(parseInt(btn.dataset.star)));
      btn.addEventListener('mouseout', () => highlightStars(selectedStar));
      btn.addEventListener('click', () => {
        selectedStar = parseInt(btn.dataset.star);
        highlightStars(selectedStar);
      });
    });
  }

  function highlightStars(n) {
    if (!starPicker) return;
    starPicker.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.star) <= n);
    });
  }

  const submitReviewBtn = document.getElementById('submitReviewBtn');
  if (submitReviewBtn) {
    submitReviewBtn.addEventListener('click', async () => {
      if (!selectedStar) { showToast('Please select a star rating', 'info'); return; }
      const review = (document.getElementById('reviewText').value || '').trim();
      submitReviewBtn.disabled = true;
      submitReviewBtn.textContent = 'Submitting...';
      try {
        const updated = await api.post(`/products/${p._id}/reviews`, { rating: selectedStar, review }, true);
        showToast('Review submitted! Thank you 🎉', 'success');
        document.getElementById('reviewList').innerHTML = renderReviews(updated.ratings);
        document.getElementById('reviewText').value = '';
        selectedStar = 0;
        highlightStars(0);
        document.querySelector('.reviews h2').textContent = `Reviews (${updated.ratings.length})`;
        const formWrap = document.getElementById('reviewFormWrap');
        if (formWrap) {
          formWrap.innerHTML = '<p class="muted" style="padding:12px 0">✓ Your review has been submitted. Thank you!</p>';
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        submitReviewBtn.disabled = false;
        submitReviewBtn.textContent = 'Submit Review';
      }
    });
  }
}

function renderReviews(ratings) {
  if (!ratings || ratings.length === 0) {
    return '<p class="muted">No reviews yet — be the first to share your experience!</p>';
  }
  return ratings
    .map(
      (r) => `
      <div class="review-card">
        <div class="review-head">
          <span class="review-author">${escapeHTML(r.name || 'Customer')}</span>
          ${renderStars(r.rating)}
        </div>
        <p class="muted" style="margin:6px 0 4px">${escapeHTML(r.review) || '<em>No comment</em>'}</p>
        <p class="review-date">${formatDate(r.createdAt || r.updatedAt || Date.now())}</p>
      </div>`
    )
    .join('');
}