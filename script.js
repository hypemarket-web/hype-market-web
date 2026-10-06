const STORAGE_KEYS = {
  products: 'hype-market-products',
  cart: 'hype-market-cart',
  orders: 'hype-market-orders',
};

const STATUSES = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

const defaultProducts = [
  {
    id: 'p1',
    name: 'Barcelona 2024 Matchday Jersey',
    player: 'Lamine Yamal',
    club: 'Barcelona',
    category: 'Jersey',
    condition: 'Mint',
    price: 2499,
    stock: 3,
    image:
      'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'p2',
    name: 'Cristiano Ronaldo 2021 Card',
    player: 'Cristiano Ronaldo',
    club: 'Al Nassr',
    category: 'Trading Card',
    condition: 'Excellent',
    price: 1899,
    stock: 5,
    image:
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'p3',
    name: 'Real Madrid 2018 Replica Kit',
    player: 'Karim Benzema',
    club: 'Real Madrid',
    category: 'Jersey',
    condition: 'Used',
    price: 1499,
    stock: 2,
    image:
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'p4',
    name: 'Manchester City Signed Card',
    player: 'Erling Haaland',
    club: 'Manchester City',
    category: 'Collectible',
    condition: 'Mint',
    price: 3499,
    stock: 1,
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'p5',
    name: 'Liverpool Home Jersey 2023',
    player: 'Mohamed Salah',
    club: 'Liverpool',
    category: 'Jersey',
    condition: 'Good',
    price: 1999,
    stock: 4,
    image:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'p6',
    name: 'Argentina World Cup Card',
    player: 'Lionel Messi',
    club: 'Argentina',
    category: 'Trading Card',
    condition: 'Excellent',
    price: 2799,
    stock: 6,
    image:
      'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=900&q=80',
  },
];

const state = {
  products: loadProducts(),
  cart: loadFromStorage(STORAGE_KEYS.cart, []),
  orders: loadFromStorage(STORAGE_KEYS.orders, []),
  currentOrder: null,
};

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const cartItems = document.getElementById('cartItems');
const itemCount = document.getElementById('cartCountBadge');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutSection = document.getElementById('checkoutSection');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutReviewItems = document.getElementById('checkoutReviewItems');
const checkoutTotalText = document.getElementById('checkoutTotalText');
const currentOrderCard = document.getElementById('currentOrderCard');
const ordersHistory = document.getElementById('ordersHistory');
const productModal = document.getElementById('productModal');
const productDetailContent = document.getElementById('productDetailContent');
const sellerForm = document.getElementById('sellerForm');
const sellerOrders = document.getElementById('sellerOrders');
const inventoryCount = document.getElementById('inventoryCount');

function loadProducts() {
  const stored = localStorage.getItem(STORAGE_KEYS.products);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Could not read stored products:', error);
    }
  }
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(defaultProducts));
  return [...defaultProducts];
}

function loadFromStorage(key, fallback) {
  const item = localStorage.getItem(key);
  if (!item) return fallback;
  try {
    return JSON.parse(item);
  } catch (error) {
    console.error(`Could not parse ${key}:`, error);
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function filterProducts() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return state.products;

  return state.products.filter((product) => {
    const fields = [product.name, product.player, product.club, product.category].join(' ').toLowerCase();
    return fields.includes(query);
  });
}

function renderProducts() {
  const filtered = filterProducts();
  inventoryCount.textContent = `${filtered.length} Items`;

  if (!filtered.length) {
    productGrid.innerHTML = '<div class="empty-state">No football products match your search.</div>';
    return;
  }

  productGrid.innerHTML = filtered
    .map(
      (product) => `
        <article class="product-card" data-id="${product.id}">
          <div class="product-image" style="background-image:url('${product.image}')">
            <span class="product-badge">${product.category}</span>
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <div class="meta-line">
              <span class="meta-pill">${product.player}</span>
              <span>${product.club}</span>
            </div>
            <div class="meta-line">
              <span>${product.condition}</span>
              <span>•</span>
              <span>${product.stock} in stock</span>
            </div>
            <div class="product-footer">
              <div>
                <div class="price">${formatPrice(product.price)}</div>
              </div>
            </div>
            <div class="product-actions">
              <button class="primary add-to-cart" data-product-id="${product.id}">Add to Cart</button>
              <button class="secondary quick-buy" data-product-id="${product.id}">Buy Now</button>
            </div>
          </div>
        </article>
      `,
    )
    .join('');

  productGrid.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      const productId = card.dataset.id;
      const target = event.target;
      if (target.closest('.add-to-cart') || target.closest('.quick-buy')) return;
      openProductModal(productId);
    });
  });

  productGrid.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      addToCart(button.dataset.productId);
    });
  });

  productGrid.querySelectorAll('.quick-buy').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const product = getProductById(button.dataset.productId);
      if (product) {
        addToCart(product.id);
        renderCheckoutReview();
        checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function getProductById(id) {
  return state.products.find((product) => product.id === id);
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function updateCartItem(productId, delta) {
  const item = state.cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== productId);
  }

  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function removeCartItem(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function computeCartTotal() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  return { subtotal, total: subtotal };
}

function renderCart() {
  itemCount.textContent = String(state.cart.reduce((sum, item) => sum + item.quantity, 0));

  if (!state.cart.length) {
    cartItems.innerHTML = '<div class="cart-empty">Your cart is empty. Add some football gear.</div>';
    cartSubtotal.textContent = formatPrice(0);
    cartTotal.textContent = formatPrice(0);
    checkoutTotalText.textContent = formatPrice(0);
    checkoutReviewItems.innerHTML = '<div class="empty-state">No items in cart.</div>';
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-thumb" style="background-image:url('${item.image}')"></div>
          <div>
            <h4>${item.name}</h4>
            <div class="qty-box">
              <button type="button" data-action="decrease" data-product-id="${item.id}">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-product-id="${item.id}">+</button>
            </div>
            <button class="item-remove" data-product-id="${item.id}">Remove</button>
          </div>
          <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
      `,
    )
    .join('');

  const totals = computeCartTotal();
  cartSubtotal.textContent = formatPrice(totals.subtotal);
  cartTotal.textContent = formatPrice(totals.total);
  checkoutTotalText.textContent = formatPrice(totals.total);

  cartItems.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const { action, productId } = button.dataset;
      if (action === 'increase') updateCartItem(productId, 1);
      if (action === 'decrease') updateCartItem(productId, -1);
      renderCheckoutReview();
    });
  });

  cartItems.querySelectorAll('.item-remove').forEach((button) => {
    button.addEventListener('click', () => removeCartItem(button.dataset.productId));
  });

  renderCheckoutReview();
}

function renderCheckoutReview() {
  if (!state.cart.length) {
    checkoutReviewItems.innerHTML = '<div class="empty-state">No items selected.</div>';
    checkoutTotalText.textContent = formatPrice(0);
    return;
  }

  const total = computeCartTotal().total;
  checkoutTotalText.textContent = formatPrice(total);

  checkoutReviewItems.innerHTML = state.cart
    .map(
      (item) => `
        <div class="review-row">
          <span>${item.name} × ${item.quantity}</span>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </div>
      `,
    )
    .join('');
}

function openProductModal(productId) {
  const product = getProductById(productId);
  if (!product) return;

  productDetailContent.innerHTML = `
    <div class="product-detail-content">
      <div class="product-detail-image" style="background-image:url('${product.image}')"></div>
      <div class="product-detail-info">
        <span class="section-label">${product.category}</span>
        <h2>${product.name}</h2>
        <div class="price">${formatPrice(product.price)}</div>
        <div class="detail-stats">
          <span class="meta-pill">${product.player}</span>
          <span class="meta-pill">${product.club}</span>
          <span class="meta-pill">${product.condition}</span>
        </div>
        <p>Available in stock: <strong>${product.stock}</strong></p>
        <div class="detail-actions">
          <button class="primary add-to-cart" data-product-id="${product.id}">Add to Cart</button>
          <button class="secondary quick-buy" data-product-id="${product.id}">Buy Now</button>
        </div>
      </div>
    </div>
  `;

  productModal.classList.remove('hidden');
  productModal.setAttribute('aria-hidden', 'false');

  productDetailContent.querySelector('.add-to-cart').addEventListener('click', () => {
    addToCart(product.id);
    closeModal();
  });

  productDetailContent.querySelector('.quick-buy').addEventListener('click', () => {
    addToCart(product.id);
    closeModal();
    checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function closeModal() {
  productModal.classList.add('hidden');
  productModal.setAttribute('aria-hidden', 'true');
}

checkoutBtn.addEventListener('click', () => {
  if (!state.cart.length) {
    alert('Your cart is empty. Add products before checkout.');
    return;
  }
  checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!state.cart.length) {
    alert('Cart is empty.');
    return;
  }

  const formData = new FormData(checkoutForm);
  const order = {
    id: `HM-${Math.floor(100000 + Math.random() * 900000)}`,
    statusIndex: 0,
    status: STATUSES[0],
    items: state.cart.map((item) => ({ ...item })),
    total: computeCartTotal().total,
    customer: {
      fullName: formData.get('fullName'),
      mobile: formData.get('mobile'),
      email: formData.get('email'),
      houseNumber: formData.get('houseNumber'),
      street: formData.get('street'),
      city: formData.get('city'),
      state: formData.get('state'),
      pin: formData.get('pin'),
    },
    createdAt: new Date().toISOString(),
  };

  state.orders.unshift(order);
  state.currentOrder = order;
  saveToStorage(STORAGE_KEYS.orders, state.orders);
  state.cart = [];
  saveToStorage(STORAGE_KEYS.cart, state.cart);

  checkoutForm.reset();
  renderCart();
  renderOrderPanel();
  renderSellerOrders();
  alert(`Order placed successfully! Your order number is ${order.id}`);
});

function renderOrderPanel() {
  if (!state.currentOrder && !state.orders.length) {
    currentOrderCard.className = 'current-order empty-state';
    currentOrderCard.textContent = 'No order placed yet.';
    return;
  }

  const order = state.currentOrder || state.orders[0];
  if (!order) return;

  currentOrderCard.className = 'current-order';
  currentOrderCard.innerHTML = `
    <div class="order-header">
      <div class="order-id">Order #${order.id}</div>
      <span class="status-pill">${order.status}</span>
    </div>
    <div class="order-grid">
      <div class="order-box">
        <h4>Products</h4>
        <div class="order-items">
          ${order.items
            .map((item) => `<div>${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}</div>`)
            .join('')}
        </div>
      </div>

      <div class="order-box">
        <h4>Customer Details</h4>
        <div>${order.customer.fullName}</div>
        <div>${order.customer.mobile}</div>
        <div>${order.customer.email}</div>
      </div>

      <div class="order-box">
        <h4>Delivery Address</h4>
        <div>${order.customer.houseNumber}, ${order.customer.street}</div>
        <div>${order.customer.city}, ${order.customer.state}</div>
        <div>PIN: ${order.customer.pin}</div>
      </div>

      <div class="order-box">
        <h4>Order Summary</h4>
        <div>Total: <strong>${formatPrice(order.total)}</strong></div>
        <div>Status Flow: ${STATUSES.join(' → ')}</div>
      </div>
    </div>
  `;

  renderHistory();
}

function renderHistory() {
  if (!state.orders.length) {
    ordersHistory.className = 'history-list empty-state';
    ordersHistory.textContent = 'No previous orders yet.';
    return;
  }

  ordersHistory.className = 'history-list';
  ordersHistory.innerHTML = state.orders
    .map(
      (order) => `
        <div class="history-item">
          <div>
            <h4>Order #${order.id}</h4>
            <div class="history-meta">${order.items.length} items • ${new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
          </div>
          <div>
            <div class="history-meta">${order.status}</div>
            <strong>${formatPrice(order.total)}</strong>
          </div>
        </div>
      `,
    )
    .join('');
}

function renderSellerOrders() {
  if (!state.orders.length) {
    sellerOrders.innerHTML = '<div class="empty-state">No customer orders yet.</div>';
    return;
  }

  sellerOrders.innerHTML = state.orders
    .map(
      (order) => `
        <div class="seller-order-card">
          <strong>${order.id}</strong>
          <div>${order.customer.fullName} • ${order.customer.mobile}</div>
          <div>${order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</div>
          <div>Total: ${formatPrice(order.total)}</div>
          <select data-order-id="${order.id}">
            ${STATUSES.map(
              (status, idx) =>
                `<option value="${idx}" ${idx === order.statusIndex ? 'selected' : ''}>${status}</option>`,
            ).join('')}
          </select>
        </div>
      `,
    )
    .join('');

  sellerOrders.querySelectorAll('select').forEach((select) => {
    select.addEventListener('change', (event) => {
      updateOrderStatus(event.target.dataset.orderId, Number(event.target.value));
    });
  });
}

function updateOrderStatus(orderId, statusIndex) {
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) return;

  order.statusIndex = statusIndex;
  order.status = STATUSES[statusIndex];
  saveToStorage(STORAGE_KEYS.orders, state.orders);

  if (state.currentOrder && state.currentOrder.id === orderId) {
    state.currentOrder = order;
  }

  renderOrderPanel();
  renderSellerOrders();
}

sellerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(sellerForm);
  const item = {
    id: `seller-${Date.now()}`,
    name: formData.get('productName'),
    player: formData.get('player'),
    club: formData.get('club'),
    category: formData.get('category'),
    condition: formData.get('condition'),
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    image: formData.get('image'),
  };

  state.products.unshift(item);
  saveToStorage(STORAGE_KEYS.products, state.products);
  renderProducts();
  sellerForm.reset();
  alert('Product uploaded successfully.');
});

searchInput.addEventListener('input', renderProducts);

document.querySelector('[data-scroll="market"]').addEventListener('click', () => {
  document.getElementById('market').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('[data-scroll="seller"]').addEventListener('click', () => {
  document.getElementById('seller').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('focusSearchBtn').addEventListener('click', () => {
  searchInput.focus();
  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('cancelCheckout').addEventListener('click', () => {
  checkoutForm.reset();
  checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelectorAll('[data-close-modal="true"]').forEach((element) => {
  element.addEventListener('click', closeModal);
});

renderProducts();
renderCart();
renderOrderPanel();
renderHistory();
renderSellerOrders();
