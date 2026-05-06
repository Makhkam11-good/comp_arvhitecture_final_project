const state = {
    token: localStorage.getItem('shopapp_token'),
    username: localStorage.getItem('shopapp_username'),
    role: localStorage.getItem('shopapp_role'),
    categories: [],
    productsPage: null,
    page: 0,
    size: 10,
    categoryId: null,
    search: '',
    cart: JSON.parse(localStorage.getItem('shopapp_cart') || '[]'),
    authMode: 'login'
};

const productImages = {
    'iphone': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
    'samsung': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80',
    'macbook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    'nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    'levi': 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
    'code': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
    'spring': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80',
    'гантели': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    'коврик': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=900&q=80',
    'кофемашина': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80'
};

const els = {
    categoryList: document.querySelector('#categoryList'),
    productGrid: document.querySelector('#productGrid'),
    catalogMeta: document.querySelector('#catalogMeta'),
    pageInfo: document.querySelector('#pageInfo'),
    userBadge: document.querySelector('#userBadge'),
    authToggle: document.querySelector('#authToggle'),
    authDialog: document.querySelector('#authDialog'),
    authForm: document.querySelector('#authForm'),
    authTitle: document.querySelector('#authTitle'),
    switchAuthModeBtn: document.querySelector('#switchAuthModeBtn'),
    closeAuthBtn: document.querySelector('#closeAuthBtn'),
    searchInput: document.querySelector('#searchInput'),
    searchBtn: document.querySelector('#searchBtn'),
    resetSearchBtn: document.querySelector('#resetSearchBtn'),
    prevPageBtn: document.querySelector('#prevPageBtn'),
    nextPageBtn: document.querySelector('#nextPageBtn'),
    cartList: document.querySelector('#cartList'),
    cartTotal: document.querySelector('#cartTotal'),
    checkoutBtn: document.querySelector('#checkoutBtn'),
    orderAddress: document.querySelector('#orderAddress'),
    ordersList: document.querySelector('#ordersList'),
    refreshOrdersBtn: document.querySelector('#refreshOrdersBtn'),
    categoryForm: document.querySelector('#categoryForm'),
    productForm: document.querySelector('#productForm'),
    productCategorySelect: document.querySelector('#productCategorySelect'),
    productDialog: document.querySelector('#productDialog'),
    productDetails: document.querySelector('#productDetails'),
    productDialogTitle: document.querySelector('#productDialogTitle'),
    closeProductBtn: document.querySelector('#closeProductBtn'),
    toast: document.querySelector('#toast')
};

function authHeaders() {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function formatMoney(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function getProductImage(product) {
    const source = `${product.name || ''} ${product.categoryName || ''}`.toLowerCase();
    const match = Object.keys(productImages).find(key => source.includes(key));
    return match ? productImages[match] : product.imageUrl;
}

function imageMarkup(product, className = '') {
    const image = getProductImage(product);
    const letter = (product.name || 'S').trim().charAt(0).toUpperCase();
    if (!image || image.includes('example.com')) {
        return `<div class="fallback ${className}">${letter}</div>`;
    }
    return `<img class="${className}" src="${image}" alt="${escapeHtml(product.name)}" onerror="this.replaceWith(createFallback('${letter}'))">`;
}

function createFallback(letter) {
    const div = document.createElement('div');
    div.className = 'fallback';
    div.textContent = letter;
    return div;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    setTimeout(() => els.toast.classList.remove('show'), 2600);
}

function saveAuth(auth) {
    state.token = auth.token;
    state.username = auth.username;
    state.role = auth.role;
    localStorage.setItem('shopapp_token', auth.token);
    localStorage.setItem('shopapp_username', auth.username);
    localStorage.setItem('shopapp_role', auth.role);
    renderAccount();
}

function logout() {
    state.token = null;
    state.username = null;
    state.role = null;
    localStorage.removeItem('shopapp_token');
    localStorage.removeItem('shopapp_username');
    localStorage.removeItem('shopapp_role');
    renderAccount();
    toast('Вы вышли из аккаунта');
}

function renderAccount() {
    els.userBadge.textContent = state.username ? `${state.username} · ${state.role}` : 'Гость';
    els.authToggle.textContent = state.username ? 'Выйти' : 'Войти';
    document.body.classList.toggle('is-admin', state.role === 'ADMIN');
}

async function loadCategories() {
    state.categories = await api('/api/categories');
    renderCategories();
    renderProductCategorySelect();
}

function renderCategories() {
    const buttons = [
        `<button class="category-btn ${state.categoryId === null ? 'active' : ''}" data-category="">Все товары</button>`,
        ...state.categories.map(category => `
            <button class="category-btn ${state.categoryId === category.id ? 'active' : ''}" data-category="${category.id}">
                <strong>${escapeHtml(category.name)}</strong><br>
                <small>${escapeHtml(category.description || '')}</small>
            </button>
        `)
    ];
    els.categoryList.innerHTML = buttons.join('');
}

function renderProductCategorySelect() {
    els.productCategorySelect.innerHTML = state.categories
        .map(category => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
        .join('');
}

async function loadProducts() {
    let path = `/api/products?page=${state.page}&size=${state.size}`;
    if (state.search) {
        path = `/api/products/search?name=${encodeURIComponent(state.search)}&page=${state.page}&size=${state.size}`;
    } else if (state.categoryId) {
        path = `/api/products/category/${state.categoryId}?page=${state.page}&size=${state.size}`;
    }

    state.productsPage = await api(path);
    renderProducts();
}

function renderProducts() {
    const page = state.productsPage;
    const products = page?.content || [];
    els.catalogMeta.textContent = `${page?.totalElements || 0} товаров · страница ${(page?.number || 0) + 1} из ${page?.totalPages || 1}`;
    els.pageInfo.textContent = `Страница ${(page?.number || 0) + 1}`;
    els.prevPageBtn.disabled = page?.first;
    els.nextPageBtn.disabled = page?.last;

    if (!products.length) {
        els.productGrid.innerHTML = '<div class="panel form-panel">Товары не найдены</div>';
        return;
    }

    els.productGrid.innerHTML = products.map(product => `
        <article class="product-card">
            <div class="product-media">${imageMarkup(product)}</div>
            <div class="product-body">
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description || 'Описание скоро появится')}</p>
                <div class="product-meta">
                    <span class="price">${formatMoney(product.price)}</span>
                    <span class="stock">На складе: ${product.stock}</span>
                </div>
                <div class="card-actions">
                    <button class="secondary-btn" data-details="${product.id}">Подробнее</button>
                    <button class="primary-btn" data-cart="${product.id}">В корзину</button>
                </div>
            </div>
        </article>
    `).join('');
}

function saveCart() {
    localStorage.setItem('shopapp_cart', JSON.stringify(state.cart));
    renderCart();
}

function addToCart(productId) {
    const product = state.productsPage.content.find(item => item.id === productId);
    if (!product) return;
    const existing = state.cart.find(item => item.productId === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({
            productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    saveCart();
    toast('Товар добавлен в корзину');
}

function renderCart() {
    if (!state.cart.length) {
        els.cartList.innerHTML = '<p class="muted">Корзина пуста</p>';
    } else {
        els.cartList.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <strong>${escapeHtml(item.name)}</strong>
                <span>${item.quantity} x ${formatMoney(item.price)}</span>
                <button class="ghost-btn" data-remove-cart="${item.productId}">Убрать</button>
            </div>
        `).join('');
    }
    const total = state.cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    els.cartTotal.textContent = formatMoney(total);
}

async function checkout() {
    if (!state.token) {
        openAuth('login');
        toast('Войдите, чтобы оформить заказ');
        return;
    }
    if (!state.cart.length) {
        toast('Корзина пуста');
        return;
    }
    if (!els.orderAddress.value.trim()) {
        toast('Введите адрес доставки');
        return;
    }

    await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
            address: els.orderAddress.value.trim(),
            items: state.cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        })
    });
    state.cart = [];
    saveCart();
    els.orderAddress.value = '';
    toast('Заказ оформлен');
    await loadProducts();
    await loadOrders();
}

async function loadOrders() {
    if (!state.token) {
        els.ordersList.innerHTML = '<div class="panel form-panel">Войдите, чтобы увидеть заказы</div>';
        return;
    }
    const orders = await api('/api/orders/my');
    if (!orders.length) {
        els.ordersList.innerHTML = '<div class="panel form-panel">Заказов пока нет</div>';
        return;
    }
    els.ordersList.innerHTML = orders.map(order => `
        <article class="order-card">
            <strong>Заказ #${order.id} · ${escapeHtml(order.status)}</strong>
            <span>${escapeHtml(order.address)} · ${formatMoney(order.totalPrice)}</span>
            <ul>
                ${(order.items || []).map(item => `<li>${escapeHtml(item.productName)} x ${item.quantity}</li>`).join('')}
            </ul>
        </article>
    `).join('');
}

async function showProduct(productId) {
    const product = await api(`/api/products/${productId}`);
    const reviews = await api(`/api/products/${productId}/reviews`);
    els.productDialogTitle.textContent = product.name;
    els.productDetails.innerHTML = `
        <div class="details-image">${imageMarkup(product)}</div>
        <div>
            <p>${escapeHtml(product.description || '')}</p>
            <p><strong>${formatMoney(product.price)}</strong> · ${escapeHtml(product.categoryName || '')}</p>
            <p>На складе: ${product.stock}</p>
            <button class="primary-btn" data-cart="${product.id}">Добавить в корзину</button>
            <section class="reviews">
                <h3>Отзывы</h3>
                <div class="stack-list">
                    ${reviews.length ? reviews.map(review => `
                        <div class="review-card">
                            <strong>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</strong>
                            <p>${escapeHtml(review.comment || '')}</p>
                            <span>${escapeHtml(review.username || 'Пользователь')}</span>
                        </div>
                    `).join('') : '<p>Отзывов пока нет</p>'}
                </div>
                <form id="reviewForm" class="form-panel">
                    <select name="rating" class="field">
                        <option value="5">5 - отлично</option>
                        <option value="4">4 - хорошо</option>
                        <option value="3">3 - нормально</option>
                        <option value="2">2 - плохо</option>
                        <option value="1">1 - ужасно</option>
                    </select>
                    <textarea name="comment" class="field" placeholder="Ваш отзыв"></textarea>
                    <button class="secondary-btn" type="submit">Оставить отзыв</button>
                </form>
            </section>
        </div>
    `;
    if (!els.productDialog.open) {
        els.productDialog.showModal();
    }
    document.querySelector('#reviewForm').addEventListener('submit', event => submitReview(event, productId));
}

async function submitReview(event, productId) {
    event.preventDefault();
    if (!state.token) {
        openAuth('login');
        toast('Войдите, чтобы оставить отзыв');
        return;
    }
    const form = new FormData(event.target);
    await api(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
            rating: Number(form.get('rating')),
            comment: form.get('comment')
        })
    });
    toast('Отзыв добавлен');
    await showProduct(productId);
}

function openAuth(mode = 'login') {
    state.authMode = mode;
    const isRegister = mode === 'register';
    els.authTitle.textContent = isRegister ? 'Регистрация' : 'Вход';
    els.switchAuthModeBtn.textContent = isRegister ? 'Уже есть аккаунт' : 'Создать аккаунт';
    document.querySelector('.register-only').classList.toggle('hidden', !isRegister);
    els.authDialog.showModal();
}

async function submitAuth(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = {
        username: form.get('username'),
        password: form.get('password')
    };
    if (state.authMode === 'register') {
        payload.email = form.get('email');
    }
    const auth = await api(`/api/auth/${state.authMode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    saveAuth(auth);
    els.authDialog.close();
    toast('Вы вошли в систему');
    await loadOrders();
}

async function submitCategory(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    await api('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
            name: form.get('name'),
            description: form.get('description')
        })
    });
    event.target.reset();
    toast('Категория создана');
    await loadCategories();
}

async function submitProduct(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    await api('/api/products', {
        method: 'POST',
        body: JSON.stringify({
            name: form.get('name'),
            description: form.get('description'),
            price: Number(form.get('price')),
            stock: Number(form.get('stock')),
            imageUrl: form.get('imageUrl'),
            categoryId: Number(form.get('categoryId'))
        })
    });
    event.target.reset();
    toast('Товар создан');
    await loadProducts();
}

function switchView(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
    document.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === `${view}View`));
    if (view === 'orders') {
        loadOrders().catch(error => toast(error.message));
    }
}

function bindEvents() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    els.authToggle.addEventListener('click', () => state.token ? logout() : openAuth('login'));
    els.closeAuthBtn.addEventListener('click', () => els.authDialog.close());
    els.switchAuthModeBtn.addEventListener('click', () => openAuth(state.authMode === 'login' ? 'register' : 'login'));
    els.authForm.addEventListener('submit', event => submitAuth(event).catch(error => toast(error.message)));

    els.searchBtn.addEventListener('click', () => {
        state.search = els.searchInput.value.trim();
        state.categoryId = null;
        state.page = 0;
        loadProducts().catch(error => toast(error.message));
    });
    els.resetSearchBtn.addEventListener('click', () => {
        state.search = '';
        state.categoryId = null;
        state.page = 0;
        els.searchInput.value = '';
        renderCategories();
        loadProducts().catch(error => toast(error.message));
    });

    els.prevPageBtn.addEventListener('click', () => {
        if (state.page > 0) {
            state.page -= 1;
            loadProducts().catch(error => toast(error.message));
        }
    });
    els.nextPageBtn.addEventListener('click', () => {
        state.page += 1;
        loadProducts().catch(error => toast(error.message));
    });

    els.categoryList.addEventListener('click', event => {
        const button = event.target.closest('[data-category]');
        if (!button) return;
        state.categoryId = button.dataset.category ? Number(button.dataset.category) : null;
        state.search = '';
        state.page = 0;
        els.searchInput.value = '';
        renderCategories();
        loadProducts().catch(error => toast(error.message));
    });

    els.productGrid.addEventListener('click', event => {
        const cartBtn = event.target.closest('[data-cart]');
        const detailsBtn = event.target.closest('[data-details]');
        if (cartBtn) addToCart(Number(cartBtn.dataset.cart));
        if (detailsBtn) showProduct(Number(detailsBtn.dataset.details)).catch(error => toast(error.message));
    });

    els.productDetails.addEventListener('click', event => {
        const cartBtn = event.target.closest('[data-cart]');
        if (cartBtn) addToCart(Number(cartBtn.dataset.cart));
    });

    els.cartList.addEventListener('click', event => {
        const removeBtn = event.target.closest('[data-remove-cart]');
        if (!removeBtn) return;
        state.cart = state.cart.filter(item => item.productId !== Number(removeBtn.dataset.removeCart));
        saveCart();
    });

    els.checkoutBtn.addEventListener('click', () => checkout().catch(error => toast(error.message)));
    els.refreshOrdersBtn.addEventListener('click', () => loadOrders().catch(error => toast(error.message)));
    els.categoryForm.addEventListener('submit', event => submitCategory(event).catch(error => toast(error.message)));
    els.productForm.addEventListener('submit', event => submitProduct(event).catch(error => toast(error.message)));
    els.closeProductBtn.addEventListener('click', () => els.productDialog.close());
}

async function init() {
    renderAccount();
    renderCart();
    bindEvents();
    await loadCategories();
    await loadProducts();
}

init().catch(error => toast(error.message));
