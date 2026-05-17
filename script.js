/* ============================================================
   Global Safety Wear (Pty) Ltd — Main JavaScript
   ============================================================ */

/* ---- Cart State ---- */
let cart = JSON.parse(localStorage.getItem('gsw_cart') || '[]');
let selectedDelivery = { label: 'Free Pickup', fee: 0, key: 'pickup' };

/* ---- Save cart ---- */
function saveCart() {
  localStorage.setItem('gsw_cart', JSON.stringify(cart));
  updateCartUI();
  updateNavCartCount();
}

/* ---- Add to cart ---- */
function addToCart(id, name, price, size, qty, icon) {
  const existing = cart.find(i => i.id === id && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price, size, qty, icon });
  }
  saveCart();
  showToast(`${name} (${size}) added to cart ✓`);
}

/* ---- Remove from cart ---- */
function removeFromCart(id, size) {
  cart = cart.filter(i => !(i.id === id && i.size === size));
  saveCart();
}

/* ---- Cart total ---- */
function cartSubtotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}
function cartTotal() {
  return cartSubtotal() + selectedDelivery.fee;
}

/* ---- Update nav badge ---- */
function updateNavCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

/* ---- Render cart sidebar (products page) ---- */
function updateCartUI() {
  const body = document.getElementById('cart-body');
  const countBadge = document.getElementById('cart-count-badge');
  if (!body) return;

  const total = cart.reduce((s, i) => s + i.qty, 0);
  if (countBadge) countBadge.textContent = total + ' item' + (total !== 1 ? 's' : '');

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <span class="ico">🛒</span>
        <p>Your cart is empty.</p>
        <p>Add products to get started.</p>
      </div>`;
    updateTotals();
    return;
  }

  let html = '';
  cart.forEach(item => {
    html += `
      <div class="cart-item">
        <div class="cart-item-icon">${item.icon}</div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>Size: ${item.size} &bull; Qty: ${item.qty}</span>
          <span class="item-price">R${(item.price * item.qty).toFixed(2)}</span>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}','${item.size}')" title="Remove">&times;</button>
      </div>`;
  });
  body.innerHTML = html;
  updateTotals();
}

/* ---- Update totals ---- */
function updateTotals() {
  const sub = cartSubtotal();
  const fee = selectedDelivery.fee;
  const grand = cartTotal();

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('cart-subtotal', 'R' + sub.toFixed(2));
  setEl('cart-delivery', fee === 0 ? 'Free' : 'R' + fee.toFixed(2));
  setEl('cart-total', 'R' + grand.toFixed(2));

  // Also update payment page summary if present
  renderPaymentSummary();
}

/* ---- Delivery selection ---- */
function selectDelivery(key, label, fee) {
  selectedDelivery = { key, label, fee };
  localStorage.setItem('gsw_delivery', JSON.stringify(selectedDelivery));
  updateTotals();
}

/* ---- Render payment page summary ---- */
function renderPaymentSummary() {
  const container = document.getElementById('payment-items');
  const summaryDelivery = document.getElementById('summary-delivery');
  const summaryTotal = document.getElementById('summary-total');
  const summarySubtotal = document.getElementById('summary-subtotal');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-summary">
        <span class="ico">🛒</span>
        <p>No items in cart.<br><a href="products.html" style="color:var(--blue-mid)">Browse products</a></p>
      </div>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="summary-item">
        <div class="summary-item-name">
          <strong>${item.name}</strong>
          <small>Size: ${item.size} &bull; Qty: ${item.qty}</small>
        </div>
        <div class="summary-item-price">R${(item.price * item.qty).toFixed(2)}</div>
      </div>`).join('');
  }

  if (summarySubtotal) summarySubtotal.textContent = 'R' + cartSubtotal().toFixed(2);
  if (summaryDelivery) summaryDelivery.textContent = selectedDelivery.fee === 0 ? 'Free' : 'R' + selectedDelivery.fee.toFixed(2);
  if (summaryTotal) summaryTotal.textContent = 'R' + cartTotal().toFixed(2);
}

/* ---- Toast notification ---- */
function showToast(msg) {
  let toast = document.getElementById('gsw-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gsw-toast';
    Object.assign(toast.style, {
      position: 'fixed', bottom: '28px', right: '28px', zIndex: '99999',
      background: 'var(--blue-dark)', color: 'white',
      padding: '12px 20px', borderRadius: '8px',
      fontFamily: 'Barlow, sans-serif', fontSize: '15px', fontWeight: '600',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      transition: 'opacity 0.3s ease', opacity: '0',
      maxWidth: '320px', lineHeight: '1.4'
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
}

/* ---- Navigation hamburger ---- */
function initNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (!hamburger || !mobileNav) return;
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // Mark active link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ---- Payment method toggle ---- */
function initPaymentMethods() {
  const methods = document.querySelectorAll('.pay-method');
  if (!methods.length) return;
  methods.forEach(m => {
    m.addEventListener('click', () => {
      methods.forEach(x => x.classList.remove('selected'));
      m.classList.add('selected');
      m.querySelector('input[type="radio"]').checked = true;
      const eftDetails = document.getElementById('eft-details');
      if (eftDetails) {
        eftDetails.classList.toggle('visible', m.dataset.method === 'eft');
      }
    });
  });
}

/* ---- Checkout form submit ---- */
function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty. Please add products first.');
      return;
    }
    const modal = document.getElementById('success-modal');
    if (modal) {
      modal.classList.add('visible');
      // Clear cart after successful order
      cart = [];
      saveCart();
    }
  });
}

/* ---- Modal close ---- */
function closeModal() {
  const modal = document.getElementById('success-modal');
  if (modal) modal.classList.remove('visible');
  window.location.href = 'index.html';
}

/* ---- Delivery radio init (products page) ---- */
function initDeliveryOptions() {
  const saved = localStorage.getItem('gsw_delivery');
  if (saved) {
    try {
      const d = JSON.parse(saved);
      selectedDelivery = d;
      const el = document.querySelector(`input[data-key="${d.key}"]`);
      if (el) el.checked = true;
    } catch (e) {}
  }

  document.querySelectorAll('.delivery-option input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      selectDelivery(
        input.dataset.key,
        input.dataset.label,
        parseFloat(input.dataset.fee)
      );
    });
  });
}

/* ---- Checkout redirect ---- */
function goToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  window.location.href = 'payment.html';
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  updateNavCartCount();
  updateCartUI();
  initDeliveryOptions();
  updateTotals();
  initPaymentMethods();
  initCheckoutForm();
  renderPaymentSummary();
});
