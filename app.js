const API_URL = 'http://localhost:3000/api/products';
const IMAGES_DIR = 'images/';
const CART_STORAGE_KEY = 'pokeshop_cart';
const FREE_DELIVERY_THRESHOLD = 250;

const DISCOUNT_CODES = {
  POKEMON10: 10,
  PIKACHU20: 20,
  TRAINER50: 50,
  ASH15: 15,
};

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Booster Scarlet & Violet',
    price: 18.9,
    category: 'Boostery',
    description: 'Pakiet kart z serii Scarlet & Violet do rozbudowy kolekcji i talii.',
    stock: 12,
    image: '',
  },
  {
    id: 2,
    name: 'Elite Trainer Box',
    price: 249.99,
    category: 'Zestawy',
    description: 'Duże pudełko startowe z boosterami, koszulkami i akcesoriami dla gracza.',
    stock: 4,
    image: '',
  },
  {
    id: 3,
    name: 'Mata Pikachu Playmat',
    price: 59.9,
    category: 'Akcesoria',
    description: 'Antypoślizgowa mata do gry z nadrukiem Pikachu i miękkim spodem.',
    stock: 9,
    image: '',
  },
  {
    id: 4,
    name: 'Binder na 9 kart',
    price: 72,
    category: 'Akcesoria',
    description: 'Album z bezpiecznymi kieszeniami do przechowywania i transportu kart.',
    stock: 7,
    image: '',
  },
  {
    id: 5,
    name: 'Battle Deck Charizard',
    price: 89.5,
    category: 'Talie',
    description: 'Gotowa talia turniejowa dla osób, które chcą szybko rozpocząć grę.',
    stock: 3,
    image: '',
  },
  {
    id: 6,
    name: 'Kostki i znaczniki',
    price: 21.5,
    category: 'Akcesoria',
    description: 'Zestaw kości i znaczników obrażeń przydatnych podczas rozgrywki.',
    stock: 16,
    image: '',
  },
  {
    id: 7,
    name: 'Collector Tin Eevee',
    price: 129,
    category: 'Zestawy',
    description: 'Metalowe pudełko kolekcjonerskie z kartą promo i dodatkowymi boosterami.',
    stock: 0,
    image: '',
  },
  {
    id: 8,
    name: 'Booster Paldea Evolved',
    price: 21.99,
    category: 'Boostery',
    description: 'Dodatek z nowej serii, idealny do uzupełniania kolekcji i otwierania na prezent.',
    stock: 10,
    image: '',
  },
];

const catalogState = {
  products: [],
  usesFallback: false,
  selectedProductId: null,
  filters: {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'default',
  },
};

const cartState = {
  items: loadCart(),
  discount: { code: '', pct: 0 },
};

const formState = {
  isSubmitting: false,
};

const dom = {
  productGrid: document.getElementById('productGrid'),
  productCount: document.getElementById('productCount'),
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  minPriceFilter: document.getElementById('minPriceFilter'),
  maxPriceFilter: document.getElementById('maxPriceFilter'),
  sortSelect: document.getElementById('sortSelect'),
  resetFilters: document.getElementById('resetFilters'),
  filterSummary: document.getElementById('filterSummary'),
  cartBtn: document.getElementById('cartBtn'),
  cartCount: document.getElementById('cartCount'),
  cartSidebar: document.getElementById('cartSidebar'),
  overlay: document.getElementById('overlay'),
  closeCart: document.getElementById('closeCart'),
  cartItems: document.getElementById('cartItems'),
  cartFooter: document.getElementById('cartFooter'),
  subtotal: document.getElementById('subtotal'),
  deliveryValue: document.getElementById('deliveryValue'),
  deliveryNote: document.getElementById('deliveryNote'),
  discountLine: document.getElementById('discountLine'),
  discountLabel: document.getElementById('discountLabel'),
  discountAmount: document.getElementById('discountAmount'),
  grandTotal: document.getElementById('grandTotal'),
  discountInput: document.getElementById('discountInput'),
  applyDiscount: document.getElementById('applyDiscount'),
  discountMsg: document.getElementById('discountMsg'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  toast: document.getElementById('toast'),
  detailsOverlay: document.getElementById('detailsOverlay'),
  detailsClose: document.getElementById('detailsClose'),
  detailsContent: document.getElementById('productDetailsContent'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalClose: document.getElementById('modalClose'),
  step1: document.getElementById('step1'),
  step2: document.getElementById('step2'),
  orderSummary: document.getElementById('orderSummary'),
  modalSubtotal: document.getElementById('modalSubtotal'),
  modalDelivery: document.getElementById('modalDelivery'),
  modalDiscountRow: document.getElementById('modalDiscountRow'),
  modalDiscountLabel: document.getElementById('modalDiscountLabel'),
  modalDiscount: document.getElementById('modalDiscount'),
  modalTotal: document.getElementById('modalTotal'),
  checkoutForm: document.getElementById('checkoutForm'),
  fullName: document.getElementById('fullName'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  address: document.getElementById('address'),
  city: document.getElementById('city'),
  postalCode: document.getElementById('postalCode'),
  paymentMethod: document.getElementById('paymentMethod'),
  blikField: document.getElementById('blikField'),
  blikCode: document.getElementById('blikCode'),
  notes: document.getElementById('notes'),
  terms: document.getElementById('terms'),
  payBtn: document.getElementById('payBtn'),
  doneBtn: document.getElementById('doneBtn'),
  successMessage: document.getElementById('successMessage'),
};

bindUI();
fetchProducts();
updateCartUI();
renderFilterSummary();
updatePaymentFieldVisibility();

function bindUI() {
  dom.searchInput.addEventListener('input', handleFilterChange);
  dom.categoryFilter.addEventListener('change', handleFilterChange);
  dom.minPriceFilter.addEventListener('input', handleFilterChange);
  dom.maxPriceFilter.addEventListener('input', handleFilterChange);
  dom.sortSelect.addEventListener('change', handleFilterChange);
  dom.resetFilters.addEventListener('click', resetFilters);

  dom.productGrid.addEventListener('click', handleProductGridClick);
  dom.cartItems.addEventListener('click', handleCartClick);
  dom.detailsContent.addEventListener('click', handleDetailsClick);

  dom.cartBtn.addEventListener('click', openCart);
  dom.closeCart.addEventListener('click', closeCart);
  dom.overlay.addEventListener('click', closeCart);

  dom.applyDiscount.addEventListener('click', applyDiscount);
  dom.discountInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    applyDiscount();
  });

  dom.checkoutBtn.addEventListener('click', openCheckout);
  dom.detailsClose.addEventListener('click', closeDetails);
  dom.detailsOverlay.addEventListener('click', (event) => {
    if (event.target === dom.detailsOverlay) closeDetails();
  });

  dom.modalClose.addEventListener('click', closeCheckout);
  dom.modalOverlay.addEventListener('click', (event) => {
    if (event.target === dom.modalOverlay) closeCheckout();
  });

  dom.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  dom.checkoutForm.addEventListener('input', handleCheckoutFieldChange);
  dom.checkoutForm.addEventListener('change', handleCheckoutFieldChange);
  dom.doneBtn.addEventListener('click', finishCheckout);

  document.addEventListener('keydown', handleGlobalKeydown);
}

async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : data.products;
    catalogState.products = normalizeProducts(items);
    catalogState.usesFallback = false;
  } catch (error) {
    catalogState.products = normalizeProducts(FALLBACK_PRODUCTS);
    catalogState.usesFallback = true;
    showToast('Nie udało się pobrać API. Wczytano dane demonstracyjne.');
  }

  syncCartWithCatalog();
  populateCategoryFilter();
  renderCatalog();
  updateCartUI();
}
async function syncOrderWithServer(entries) {
  for (const item of entries) {
    const response = await fetch(`${API_URL}/${item.id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quantity: item.qty,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Nie udało się zaktualizować stanu produktu ${item.name}.`);
    }
  }
}

function normalizeProducts(items) {
  if (!Array.isArray(items)) return [];

  return items.map((product, index) => {
    const rawId = Number(product?.id);
    const rawPrice = Number(product?.price);
    const rawStock = Number(product?.stock);

    return {
      id: Number.isFinite(rawId) ? rawId : index + 1,
      name: String(product?.name || `Produkt ${index + 1}`),
      price: Number.isFinite(rawPrice) ? rawPrice : 0,
      category: String(product?.category || 'Inne'),
      description: String(product?.description || 'Brak opisu produktu.'),
      stock: Number.isFinite(rawStock) && rawStock >= 0 ? rawStock : 10,
      image: product?.image ? String(product.image) : '',
    };
  });
}

function handleFilterChange() {
  catalogState.filters.search = dom.searchInput.value.trim();
  catalogState.filters.category = dom.categoryFilter.value;
  catalogState.filters.minPrice = dom.minPriceFilter.value.trim();
  catalogState.filters.maxPrice = dom.maxPriceFilter.value.trim();
  catalogState.filters.sort = dom.sortSelect.value;
  renderCatalog();
}

function resetFilters() {
  catalogState.filters = {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'default',
  };

  dom.searchInput.value = '';
  dom.categoryFilter.value = '';
  dom.minPriceFilter.value = '';
  dom.maxPriceFilter.value = '';
  dom.sortSelect.value = 'default';

  renderCatalog();
}

function populateCategoryFilter() {
  const selected = catalogState.filters.category;
  const categories = [...new Set(catalogState.products.map((product) => product.category))]
    .sort((a, b) => a.localeCompare(b, 'pl'));

  dom.categoryFilter.innerHTML = [
    '<option value="">Wszystkie kategorie</option>',
    ...categories.map((category) => `<option value="${escHtml(category)}">${escHtml(category)}</option>`),
  ].join('');

  if (categories.includes(selected)) {
    dom.categoryFilter.value = selected;
  }
}

function getVisibleProducts() {
  const { search, category, minPrice, maxPrice, sort } = catalogState.filters;
  const min = minPrice === '' ? null : Number(minPrice);
  const max = maxPrice === '' ? null : Number(maxPrice);

  const filtered = catalogState.products.filter((product) => {
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    if (category && product.category !== category) {
      return false;
    }

    if (Number.isFinite(min) && product.price < min) {
      return false;
    }

    if (Number.isFinite(max) && product.price > max) {
      return false;
    }

    return true;
  });

  return sortProducts(filtered, sort);
}

function sortProducts(products, sortMode) {
  const items = [...products];

  switch (sortMode) {
    case 'name-asc':
      items.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
      break;
    case 'name-desc':
      items.sort((a, b) => b.name.localeCompare(a.name, 'pl'));
      break;
    case 'price-asc':
      items.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, 'pl'));
      break;
    case 'price-desc':
      items.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, 'pl'));
      break;
    case 'stock-desc':
      items.sort((a, b) => b.stock - a.stock || a.name.localeCompare(b.name, 'pl'));
      break;
    default:
      items.sort((a, b) => a.id - b.id);
  }

  return items;
}

function renderCatalog() {
  const visibleProducts = getVisibleProducts();
  const totalProducts = catalogState.products.length;
  dom.productCount.textContent = visibleProducts.length === totalProducts
    ? `${totalProducts} produktów${catalogState.usesFallback ? ' • dane demo' : ''}`
    : `${visibleProducts.length} z ${totalProducts} produktów${catalogState.usesFallback ? ' • dane demo' : ''}`;

  if (!totalProducts) {
    dom.productGrid.innerHTML = `
      <div class="error-state">
        <h3>Brak produktów do wyświetlenia</h3>
        <p>Nie udało się przygotować danych katalogu.</p>
        <code>${escHtml(API_URL)}</code>
      </div>
    `;
    renderFilterSummary();
    return;
  }

  if (!visibleProducts.length) {
    dom.productGrid.innerHTML = `
      <div class="empty-state">
        <h3>Brak wyników</h3>
        <p>Nie znaleziono produktów pasujących do wybranych filtrów.</p>
        <button class="secondary-btn" type="button" data-action="reset-filters">Wyczyść filtry</button>
      </div>
    `;
    renderFilterSummary();
    return;
  }

  dom.productGrid.innerHTML = visibleProducts.map(renderProductCard).join('');
  renderFilterSummary();
}

function renderProductCard(product) {
  const inCartQty = cartState.items[product.id]?.qty || 0;
  const isOutOfStock = product.stock === 0;
  const reachedLimit = inCartQty >= product.stock && product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const stockClass = isOutOfStock ? 'out' : lowStock ? 'low' : '';
  const stockLabel = isOutOfStock
    ? 'Brak w magazynie'
    : lowStock
      ? `Ostatnie ${product.stock} szt.`
      : `Dostępne: ${product.stock}`;
  const addLabel = isOutOfStock
    ? 'Niedostępny'
    : reachedLimit
      ? 'Limit w koszyku'
      : inCartQty
        ? `Dodaj kolejną (${inCartQty})`
        : 'Dodaj do koszyka';

  return `
    <article class="product-card">
      ${renderImageMarkup(product, {
        wrapperClass: 'image-frame',
        imageClass: 'card-img',
        placeholderClass: 'card-img-placeholder',
        placeholderText: 'Brak zdjęcia',
      })}
      <div class="card-body">
        <div class="card-topline">
          <span class="card-category">${escHtml(product.category)}</span>
          <span class="card-stock ${stockClass}">${stockLabel}</span>
        </div>
        <h3 class="card-name">${escHtml(product.name)}</h3>
        <p class="card-desc">${escHtml(truncate(product.description, 98))}</p>
        <div class="card-meta">
          <span class="card-price">${fmt(product.price)}</span>
          <span class="card-stock">${inCartQty ? `W koszyku: ${inCartQty}` : 'Kliknij po szczegóły'}</span>
        </div>
        <div class="card-actions">
          <button class="details-btn" type="button" data-action="details" data-id="${product.id}">
            Szczegóły
          </button>
          <button
            class="add-btn"
            type="button"
            data-action="add"
            data-id="${product.id}"
            ${isOutOfStock || reachedLimit ? 'disabled' : ''}
          >
            ${addLabel}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderFilterSummary() {
  const chips = [];
  const { search, category, minPrice, maxPrice, sort } = catalogState.filters;

  if (catalogState.usesFallback) {
    chips.push('<span class="filter-chip highlight">Dane demonstracyjne</span>');
  }

  if (search) {
    chips.push(`<span class="filter-chip">Nazwa: ${escHtml(search)}</span>`);
  }

  if (category) {
    chips.push(`<span class="filter-chip">Kategoria: ${escHtml(category)}</span>`);
  }

  if (minPrice) {
    chips.push(`<span class="filter-chip">Cena od: ${fmt(Number(minPrice))}</span>`);
  }

  if (maxPrice) {
    chips.push(`<span class="filter-chip">Cena do: ${fmt(Number(maxPrice))}</span>`);
  }

  if (sort !== 'default') {
    chips.push(`<span class="filter-chip">Sortowanie: ${escHtml(getSortLabel(sort))}</span>`);
  }

  if (!chips.length) {
    chips.push('<span class="filter-chip">Brak aktywnych filtrów</span>');
  }

  dom.filterSummary.innerHTML = chips.join('');
}

function handleProductGridClick(event) {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;

  const { action } = actionButton.dataset;

  if (action === 'reset-filters') {
    resetFilters();
    return;
  }

  const id = Number(actionButton.dataset.id);
  if (!Number.isFinite(id)) return;

  if (action === 'add') {
    addToCart(id);
  }

  if (action === 'details') {
    openDetails(id);
  }
}

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.fromEntries(
      Object.values(parsed)
        .map((item) => {
          const id = Number(item?.id);
          const qty = Number(item?.qty);
          if (!Number.isFinite(id) || !Number.isFinite(qty) || qty <= 0) return null;
          return [id, { id, qty }];
        })
        .filter(Boolean),
    );
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState.items));
}

function syncCartWithCatalog() {
  const nextItems = {};
  let changed = false;

  for (const entry of Object.values(cartState.items)) {
    const product = getProductById(entry.id);
    if (!product || product.stock <= 0) {
      changed = true;
      continue;
    }

    const nextQty = Math.min(entry.qty, product.stock);
    nextItems[entry.id] = { id: entry.id, qty: nextQty };
    if (nextQty !== entry.qty) {
      changed = true;
    }
  }

  cartState.items = nextItems;
  if (changed) {
    saveCart();
  }
}

function addToCart(id) {
  const product = getProductById(id);
  if (!product) {
    showToast('Nie znaleziono produktu.');
    return;
  }

  if (product.stock === 0) {
    showToast('Ten produkt jest chwilowo niedostępny.');
    return;
  }

  const currentQty = cartState.items[id]?.qty || 0;
  if (currentQty >= product.stock) {
    showToast('Osiągnięto maksymalną liczbę sztuk dla tego produktu.');
    return;
  }

  cartState.items[id] = {
    id,
    qty: currentQty + 1,
  };

  saveCart();
  refreshAfterCartChange();
  showToast(`Dodano do koszyka: ${product.name}`);
}

function changeQty(id, delta) {
  const entry = cartState.items[id];
  if (!entry) return;

  const product = getProductById(id);
  if (!product) {
    delete cartState.items[id];
    saveCart();
    refreshAfterCartChange();
    return;
  }

  const nextQty = entry.qty + delta;
  if (nextQty <= 0) {
    removeFromCart(id);
    return;
  }

  if (nextQty > product.stock) {
    showToast('Nie można dodać więcej sztuk niż dostępny stan magazynowy.');
    return;
  }

  cartState.items[id] = { id, qty: nextQty };
  saveCart();
  refreshAfterCartChange();
}

function removeFromCart(id) {
  const product = getProductById(id);
  delete cartState.items[id];
  saveCart();
  refreshAfterCartChange();
  if (product) {
    showToast(`Usunięto z koszyka: ${product.name}`);
  }
}

function getCartEntries() {
  return Object.values(cartState.items)
    .map((entry) => {
      const product = getProductById(entry.id);
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image: product.image,
        qty: entry.qty,
        description: product.description,
        lineTotal: product.price * entry.qty,
      };
    })
    .filter(Boolean);
}

function calculateCartTotals(entries = getCartEntries()) {
  const subtotal = entries.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalQty = entries.reduce((sum, item) => sum + item.qty, 0);
  const delivery = getDeliveryCost(subtotal);
  const discountAmount = subtotal * (cartState.discount.pct / 100);
  const total = Math.max(subtotal + delivery - discountAmount, 0);

  return {
    subtotal,
    totalQty,
    delivery,
    discountAmount,
    total,
  };
}

function getDeliveryCost(subtotal) {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  if (subtotal >= 120) return 9.99;
  return 16.99;
}

function updateCartUI() {
  const entries = getCartEntries();
  const totals = calculateCartTotals(entries);

  dom.cartCount.textContent = totals.totalQty;

  if (!entries.length) {
    dom.cartItems.innerHTML = `
      <div class="empty-cart">
        <div class="empty-ball"></div>
        <p>Koszyk jest pusty</p>
      </div>
    `;
    dom.cartFooter.style.display = 'none';
    return;
  }

  dom.cartItems.innerHTML = entries.map(renderCartItem).join('');
  dom.cartFooter.style.display = '';

  dom.subtotal.textContent = fmt(totals.subtotal);
  dom.deliveryValue.textContent = totals.delivery === 0 ? 'Gratis' : fmt(totals.delivery);
  dom.deliveryNote.textContent = totals.subtotal >= FREE_DELIVERY_THRESHOLD
    ? 'Darmowa dostawa została naliczona automatycznie.'
    : `Do darmowej dostawy brakuje ${fmt(FREE_DELIVERY_THRESHOLD - totals.subtotal)}.`;

  if (cartState.discount.pct > 0) {
    dom.discountLine.style.display = '';
    dom.discountLabel.textContent = `Rabat (${cartState.discount.code} -${cartState.discount.pct}%)`;
    dom.discountAmount.textContent = `-${fmt(totals.discountAmount)}`;
  } else {
    dom.discountLine.style.display = 'none';
  }

  dom.grandTotal.textContent = fmt(totals.total);

  if (dom.modalOverlay.classList.contains('active')) {
    renderCheckoutSummary();
  }
}

function renderCartItem(item) {
  const atLimit = item.qty >= item.stock;

  return `
    <div class="cart-item">
      ${renderImageMarkup(item, {
        wrapperClass: 'image-frame',
        imageClass: 'cart-item-img',
        placeholderClass: 'cart-item-img-placeholder',
        placeholderText: 'Brak zdjęcia',
      })}
      <div class="cart-item-info">
        <div class="cart-item-top">
          <div>
            <p class="cart-item-name">${escHtml(item.name)}</p>
            <p class="cart-item-category">${escHtml(item.category)}</p>
          </div>
          <p class="cart-item-price">${fmt(item.lineTotal)}</p>
        </div>
        <p class="cart-item-meta">Cena za sztukę: ${fmt(item.price)} • Dostępne: ${item.stock}</p>
        <div class="cart-item-actions">
          <div class="qty-ctrl">
            <button class="qty-btn" type="button" data-cart-action="decrease" data-id="${item.id}">-</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" type="button" data-cart-action="increase" data-id="${item.id}" ${atLimit ? 'disabled' : ''}>+</button>
          </div>
          <button class="remove-item" type="button" data-cart-action="remove" data-id="${item.id}">Usuń</button>
        </div>
      </div>
    </div>
  `;
}

function handleCartClick(event) {
  const actionButton = event.target.closest('[data-cart-action]');
  if (!actionButton) return;

  const action = actionButton.dataset.cartAction;
  const id = Number(actionButton.dataset.id);
  if (!Number.isFinite(id)) return;

  if (action === 'increase') changeQty(id, 1);
  if (action === 'decrease') changeQty(id, -1);
  if (action === 'remove') removeFromCart(id);
}

function applyDiscount() {
  const code = dom.discountInput.value.trim().toUpperCase();

  if (!Object.keys(cartState.items).length) {
    setDiscountMessage('Dodaj produkt do koszyka, aby użyć kodu rabatowego.', 'err');
    return;
  }

  if (!code) {
    setDiscountMessage('Wpisz kod rabatowy.', 'err');
    return;
  }

  if (DISCOUNT_CODES[code]) {
    cartState.discount = { code, pct: DISCOUNT_CODES[code] };
    setDiscountMessage(`Kod ${code} aktywny. Rabat: ${cartState.discount.pct}%.`, 'ok');
    updateCartUI();
    return;
  }

  cartState.discount = { code: '', pct: 0 };
  setDiscountMessage('Nieprawidłowy kod rabatowy.', 'err');
  updateCartUI();
}

function setDiscountMessage(message, type) {
  dom.discountMsg.className = `discount-msg ${type}`;
  dom.discountMsg.textContent = message;
}

function openCart() {
  dom.cartSidebar.classList.add('open');
  dom.overlay.classList.add('active');
  syncBodyLock();
}

function closeCart() {
  dom.cartSidebar.classList.remove('open');
  dom.overlay.classList.remove('active');
  syncBodyLock();
}

function openDetails(id) {
  const product = getProductById(id);
  if (!product) return;

  catalogState.selectedProductId = id;
  renderDetails(product);
  dom.detailsOverlay.classList.add('active');
  syncBodyLock();
}

function closeDetails() {
  dom.detailsOverlay.classList.remove('active');
  syncBodyLock();
}

function renderDetails(product) {
  const inCartQty = cartState.items[product.id]?.qty || 0;
  const isOutOfStock = product.stock === 0;
  const isAtLimit = inCartQty >= product.stock && product.stock > 0;

  dom.detailsContent.innerHTML = `
    <div class="detail-media">
      ${renderImageMarkup(product, {
        wrapperClass: 'image-frame',
        imageClass: 'detail-img',
        placeholderClass: 'detail-img-placeholder',
        placeholderText: 'Brak zdjęcia produktu',
      })}
    </div>
    <div class="detail-content">
      <div class="detail-badges">
        <span class="detail-pill">${escHtml(product.category)}</span>
        <span class="detail-pill">${product.stock > 0 ? `Stan magazynowy: ${product.stock}` : 'Produkt niedostępny'}</span>
        <span class="detail-pill">W koszyku: ${inCartQty}</span>
      </div>
      <h3 class="detail-title">${escHtml(product.name)}</h3>
      <p class="detail-price">${fmt(product.price)}</p>
      <p class="detail-description">${escHtml(product.description)}</p>
      <div class="detail-stats">
        <div class="detail-stat">
          <span>Kategoria</span>
          <strong>${escHtml(product.category)}</strong>
        </div>
        <div class="detail-stat">
          <span>Dostępność</span>
          <strong>${product.stock > 0 ? `${product.stock} szt.` : 'Brak'}</strong>
        </div>
        <div class="detail-stat">
          <span>Status koszyka</span>
          <strong>${inCartQty ? `${inCartQty} szt.` : 'Jeszcze nie dodano'}</strong>
        </div>
      </div>
      <div class="detail-actions">
        <button class="secondary-btn" type="button" data-detail-action="close">Zamknij</button>
        <button
          class="add-btn"
          type="button"
          data-detail-action="add"
          data-id="${product.id}"
          ${isOutOfStock || isAtLimit ? 'disabled' : ''}
        >
          ${isOutOfStock ? 'Brak w magazynie' : isAtLimit ? 'Limit osiągnięty' : 'Dodaj do koszyka'}
        </button>
      </div>
    </div>
  `;
}

function handleDetailsClick(event) {
  const actionButton = event.target.closest('[data-detail-action]');
  if (!actionButton) return;

  const action = actionButton.dataset.detailAction;
  if (action === 'close') {
    closeDetails();
    return;
  }

  const id = Number(actionButton.dataset.id);
  if (action === 'add' && Number.isFinite(id)) {
    addToCart(id);
    const product = getProductById(id);
    if (product) {
      renderDetails(product);
    }
  }
}

function openCheckout() {
  const entries = getCartEntries();
  if (!entries.length) {
    showToast('Koszyk jest pusty. Dodaj produkty przed złożeniem zamówienia.');
    return;
  }

  renderCheckoutSummary();
  dom.step1.classList.remove('hidden');
  dom.step2.classList.add('hidden');
  dom.modalOverlay.classList.add('active');
  closeCart();
  syncBodyLock();
}

function renderCheckoutSummary() {
  const entries = getCartEntries();
  const totals = calculateCartTotals(entries);

  dom.orderSummary.innerHTML = entries.map((item) => `
    <div class="order-line">
      <div>
        <span>${escHtml(item.name)} × ${item.qty}</span>
        <small>${escHtml(item.category)}</small>
      </div>
      <strong>${fmt(item.lineTotal)}</strong>
    </div>
  `).join('');

  dom.modalSubtotal.textContent = fmt(totals.subtotal);
  dom.modalDelivery.textContent = totals.delivery === 0 ? 'Gratis' : fmt(totals.delivery);

  if (cartState.discount.pct > 0) {
    dom.modalDiscountRow.style.display = '';
    dom.modalDiscountLabel.textContent = `Rabat (${cartState.discount.code} -${cartState.discount.pct}%)`;
    dom.modalDiscount.textContent = `-${fmt(totals.discountAmount)}`;
  } else {
    dom.modalDiscountRow.style.display = 'none';
  }

  dom.modalTotal.textContent = fmt(totals.total);
}

function closeCheckout() {
  if (formState.isSubmitting) return;
  dom.modalOverlay.classList.remove('active');
  syncBodyLock();
}

function handleCheckoutFieldChange(event) {
  const field = event.target;
  if (!field.name) return;

  if (field.name === 'phone' || field.name === 'blikCode') {
    field.value = field.value.replace(/\D/g, '');
  }

  if (field.name === 'phone') {
    field.value = field.value.slice(0, 9);
  }

  if (field.name === 'blikCode') {
    field.value = field.value.slice(0, 6);
  }

  if (field.name === 'postalCode') {
    const digits = field.value.replace(/\D/g, '').slice(0, 5);
    field.value = digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
  }

  if (field.name === 'paymentMethod') {
    updatePaymentFieldVisibility();
  }

  validateField(field.name);
}

function updatePaymentFieldVisibility() {
  const shouldShowBlik = dom.paymentMethod.value === 'blik';
  dom.blikField.classList.toggle('hidden', !shouldShowBlik);

  if (!shouldShowBlik) {
    dom.blikCode.value = '';
    clearFieldError('blikCode');
  }
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();

  const entries = getCartEntries();
  if (!entries.length) {
    showToast('Koszyk jest pusty. Zamówienie nie może zostać wysłane.');
    closeCheckout();
    return;
  }

  if (!validateCheckoutForm()) {
    showToast('Popraw zaznaczone pola formularza.');
    return;
  }

  const values = getFormValues();
  const totals = calculateCartTotals(entries);

  formState.isSubmitting = true;
  dom.payBtn.disabled = true;
  dom.payBtn.textContent = 'Przetwarzanie zamówienia...';

  try {
    await syncOrderWithServer(entries);

    dom.step1.classList.add('hidden');
    dom.step2.classList.remove('hidden');
    dom.successMessage.textContent = `Dziękujemy, ${getFirstName(values.fullName)}. Potwierdzenie zamówienia o wartości ${fmt(totals.total)} zostało wysłane na adres ${values.email}.`;

    cartState.items = {};
    cartState.discount = { code: '', pct: 0 };
    saveCart();
    dom.discountInput.value = '';
    setDiscountMessage('', 'ok');
    clearCheckoutForm();

    await fetchProducts();
    updateCartUI();
    renderCatalog();
  } catch (error) {
    showToast(error.message || 'Nie udało się zaktualizować magazynu.');
  } finally {
    formState.isSubmitting = false;
    dom.payBtn.disabled = false;
    dom.payBtn.textContent = 'Złóż zamówienie';
  }
}


function finishCheckout() {
  closeCheckout();
  showToast('Zamówienie zostało zapisane.');
}

function clearCheckoutForm() {
  dom.checkoutForm.reset();
  clearAllFieldErrors();
  updatePaymentFieldVisibility();
}

function validateCheckoutForm() {
  const fields = [
    'fullName',
    'email',
    'phone',
    'address',
    'city',
    'postalCode',
    'paymentMethod',
    'blikCode',
    'terms',
  ];

  return fields.every((fieldName) => validateField(fieldName));
}

function validateField(fieldName) {
  const values = getFormValues();
  let error = '';

  switch (fieldName) {
    case 'fullName':
      if (values.fullName.length < 4 || !values.fullName.includes(' ')) {
        error = 'Podaj imię i nazwisko.';
      }
      break;
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        error = 'Podaj poprawny adres e-mail.';
      }
      break;
    case 'phone':
      if (!/^\d{9}$/.test(values.phone)) {
        error = 'Podaj 9-cyfrowy numer telefonu.';
      }
      break;
    case 'address':
      if (values.address.length < 5) {
        error = 'Podaj ulicę i numer.';
      }
      break;
    case 'city':
      if (values.city.length < 2) {
        error = 'Podaj nazwę miasta.';
      }
      break;
    case 'postalCode':
      if (!/^\d{2}-\d{3}$/.test(values.postalCode)) {
        error = 'Użyj formatu 00-000.';
      }
      break;
    case 'paymentMethod':
      if (!values.paymentMethod) {
        error = 'Wybierz metodę płatności.';
      }
      break;
    case 'blikCode':
      if (values.paymentMethod === 'blik' && !/^\d{6}$/.test(values.blikCode)) {
        error = 'Kod BLIK musi mieć 6 cyfr.';
      }
      break;
    case 'terms':
      if (!values.terms) {
        error = 'Zaakceptuj warunki realizacji zamówienia.';
      }
      break;
    default:
      error = '';
  }

  setFieldError(fieldName, error);
  return !error;
}

function setFieldError(fieldName, message) {
  const errorNode = dom.checkoutForm.querySelector(`[data-error-for="${fieldName}"]`);
  const field = dom.checkoutForm.elements[fieldName];

  if (errorNode) {
    errorNode.textContent = message;
  }

  if (field) {
    field.classList.toggle('input-invalid', Boolean(message));
  }
}

function clearFieldError(fieldName) {
  setFieldError(fieldName, '');
}

function clearAllFieldErrors() {
  dom.checkoutForm.querySelectorAll('[data-error-for]').forEach((node) => {
    node.textContent = '';
  });

  dom.checkoutForm.querySelectorAll('.input-invalid').forEach((field) => {
    field.classList.remove('input-invalid');
  });
}

function getFormValues() {
  return {
    fullName: dom.fullName.value.trim(),
    email: dom.email.value.trim(),
    phone: dom.phone.value.trim(),
    address: dom.address.value.trim(),
    city: dom.city.value.trim(),
    postalCode: dom.postalCode.value.trim(),
    paymentMethod: dom.paymentMethod.value,
    blikCode: dom.blikCode.value.trim(),
    notes: dom.notes.value.trim(),
    terms: dom.terms.checked,
  };
}

function refreshAfterCartChange() {
  updateCartUI();
  renderCatalog();

  if (catalogState.selectedProductId) {
    const product = getProductById(catalogState.selectedProductId);
    if (product && dom.detailsOverlay.classList.contains('active')) {
      renderDetails(product);
    }
  }
}

function getProductById(id) {
  return catalogState.products.find((product) => product.id === id);
}

function renderImageMarkup(item, config) {
  const imageUrl = resolveImage(item.image);
  if (!imageUrl) {
    return `<div class="${config.placeholderClass}">${config.placeholderText}</div>`;
  }

  return `
    <div class="${config.wrapperClass}">
      <img
        class="${config.imageClass}"
        src="${escHtml(imageUrl)}"
        alt="${escHtml(item.name || 'Produkt')}"
        loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div class="${config.placeholderClass}" style="display:none">${config.placeholderText}</div>
    </div>
  `;
}

function resolveImage(image) {
  if (!image) return '';
  if (/^(https?:)?\/\//.test(image) || image.startsWith('data:')) {
    return image;
  }
  return `${IMAGES_DIR}${image}`;
}

function handleGlobalKeydown(event) {
  if (event.key !== 'Escape') return;

  if (dom.detailsOverlay.classList.contains('active')) {
    closeDetails();
    return;
  }

  if (dom.modalOverlay.classList.contains('active')) {
    closeCheckout();
    return;
  }

  if (dom.cartSidebar.classList.contains('open')) {
    closeCart();
  }
}

function syncBodyLock() {
  const isLocked = dom.cartSidebar.classList.contains('open')
    || dom.detailsOverlay.classList.contains('active')
    || dom.modalOverlay.classList.contains('active');

  document.body.style.overflow = isLocked ? 'hidden' : '';
}

let toastTimer;
function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toast.classList.remove('show');
  }, 2400);
}

function getSortLabel(sortMode) {
  const labels = {
    'name-asc': 'nazwa A-Z',
    'name-desc': 'nazwa Z-A',
    'price-asc': 'cena rosnąco',
    'price-desc': 'cena malejąco',
    'stock-desc': 'największa dostępność',
  };

  return labels[sortMode] || 'domyślnie';
}

function getFirstName(fullName) {
  return fullName.split(/\s+/)[0] || 'Kliencie';
}

function truncate(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

function fmt(value) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}

function escHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
