const STORAGE = {
    token: 'shopapp_token',
    username: 'shopapp_username',
    role: 'shopapp_role',
    cart: 'shopapp_cart'
};

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusLabels = {
    PENDING: 'Новый',
    CONFIRMED: 'Подтверждён',
    SHIPPED: 'Отправлен',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён'
};

const productImages = {
    iphone: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
    samsung: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80',
    macbook: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    nike: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    levi: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
    code: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
    spring: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80',
    гантели: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    коврик: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=900&q=80',
    кофемашина: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80'
};

const storedToken = localStorage.getItem(STORAGE.token);

const state = {
    token: storedToken,
    username: storedToken ? null : localStorage.getItem(STORAGE.username),
    role: null,
    userId: null,
    categories: [],
    productsPage: null,
    adminProducts: [],
    adminOrders: [],
    users: [],
    page: 0,
    size: 12,
    categoryId: null,
    search: '',
    cart: readCart(),
    authMode: 'login',
    currentView: 'catalog',
    adminSection: 'products',
    productCache: new Map()
};

const els = {
    layout: document.querySelector('.layout'),
    categoryList: document.querySelector('#categoryList'),
    productGrid: document.querySelector('#productGrid'),
    catalogMeta: document.querySelector('#catalogMeta'),
    pageInfo: document.querySelector('#pageInfo'),
    userBadge: document.querySelector('#userBadge'),
    authToggle: document.querySelector('#authToggle'),
    authDialog: document.querySelector('#authDialog'),
    authForm: document.querySelector('#authForm'),
    authTitle: document.querySelector('#authTitle'),
    authMessage: document.querySelector('#authMessage'),
    switchAuthModeBtn: document.querySelector('#switchAuthModeBtn'),
    closeAuthBtn: document.querySelector('#closeAuthBtn'),
    cartNavBtn: document.querySelector('#cartNavBtn'),
    cartNavCount: document.querySelector('#cartNavCount'),
    ordersNavBtn: document.querySelector('#ordersNavBtn'),
    adminNavBtn: document.querySelector('#adminNavBtn'),
    searchInput: document.querySelector('#searchInput'),
    searchBtn: document.querySelector('#searchBtn'),
    resetSearchBtn: document.querySelector('#resetSearchBtn'),
    prevPageBtn: document.querySelector('#prevPageBtn'),
    nextPageBtn: document.querySelector('#nextPageBtn'),
    cartList: document.querySelector('#cartList'),
    cartMeta: document.querySelector('#cartMeta'),
    cartTotal: document.querySelector('#cartTotal'),
    cartCount: document.querySelector('#cartCount'),
    clearCartBtn: document.querySelector('#clearCartBtn'),
    continueShoppingBtn: document.querySelector('#continueShoppingBtn'),
    checkoutBtn: document.querySelector('#checkoutBtn'),
    orderAddress: document.querySelector('#orderAddress'),
    ordersList: document.querySelector('#ordersList'),
    refreshOrdersBtn: document.querySelector('#refreshOrdersBtn'),
    adminDenied: document.querySelector('#adminDenied'),
    adminContent: document.querySelector('#adminContent'),
    refreshAdminBtn: document.querySelector('#refreshAdminBtn'),
    categoryForm: document.querySelector('#categoryForm'),
    categoryFormTitle: document.querySelector('#categoryFormTitle'),
    categoryIdInput: document.querySelector('#categoryIdInput'),
    categorySubmitBtn: document.querySelector('#categorySubmitBtn'),
    cancelCategoryEditBtn: document.querySelector('#cancelCategoryEditBtn'),
    adminCategoryList: document.querySelector('#adminCategoryList'),
    productForm: document.querySelector('#productForm'),
    productFormTitle: document.querySelector('#productFormTitle'),
    productIdInput: document.querySelector('#productIdInput'),
    productSubmitBtn: document.querySelector('#productSubmitBtn'),
    cancelProductEditBtn: document.querySelector('#cancelProductEditBtn'),
    productCategorySelect: document.querySelector('#productCategorySelect'),
    adminProductList: document.querySelector('#adminProductList'),
    adminOrdersList: document.querySelector('#adminOrdersList'),
    adminUsersList: document.querySelector('#adminUsersList'),
    productDialog: document.querySelector('#productDialog'),
    productDetails: document.querySelector('#productDetails'),
    productDialogTitle: document.querySelector('#productDialogTitle'),
    closeProductBtn: document.querySelector('#closeProductBtn'),
    toast: document.querySelector('#toast')
};

function readCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE.cart) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function authHeaders(path) {
    if (!state.token || path.startsWith('/api/auth/')) {
        return {};
    }
    return { Authorization: `Bearer ${state.token}` };
}

async function api(path, options = {}) {
    const headers = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders(path),
        ...(options.headers || {})
    };

    let response;
    try {
        response = await fetch(path, { ...options, headers });
    } catch {
        const error = new Error('Не удалось подключиться к серверу');
        error.status = 0;
        throw error;
    }

    const text = await response.text();
    const data = parseResponseBody(text);

    if (!response.ok) {
        const error = new Error(getErrorMessage(response.status, data));
        error.status = response.status;
        error.details = data;

        if (response.status === 401 && !path.startsWith('/api/auth/')) {
            clearAuthState();
            renderAccount();
        }

        throw error;
    }

    return data;
}

function parseResponseBody(text) {
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function getErrorMessage(status, data) {
    const message = typeof data === 'string'
        ? data
        : data?.message || data?.error || data?.detail;

    if (message) {
        return message;
    }
    if (status === 401) {
        return 'Нужен вход в аккаунт или сессия истекла';
    }
    if (status === 403) {
        return 'Доступ запрещён';
    }
    if (status === 404) {
        return 'Не найдено';
    }
    return `Ошибка ${status || 'сети'}`;
}

function isAdmin() {
    return state.role === 'ADMIN';
}

function formatMoney(value) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'USD'
    }).format(Number(value || 0));
}

function formatDate(value) {
    if (!value) {
        return '';
    }
    return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value));
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function notice(message, type = '') {
    return `<div class="notice ${type}">${escapeHtml(message)}</div>`;
}

function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => els.toast.classList.remove('show'), 3000);
}

function saveAuth(auth) {
    state.token = auth.token || state.token;
    state.username = auth.username;
    state.role = auth.role;
    state.userId = auth.id ?? state.userId;
    localStorage.setItem(STORAGE.token, state.token);
    localStorage.setItem(STORAGE.username, state.username);
    localStorage.setItem(STORAGE.role, state.role);
    renderAccount();
}

function clearAuthState() {
    state.token = null;
    state.username = null;
    state.role = null;
    state.userId = null;
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.username);
    localStorage.removeItem(STORAGE.role);
}

function logout() {
    clearAuthState();
    renderAccount();
    switchView('catalog', { silent: true });
    els.ordersList.innerHTML = notice('Войдите, чтобы увидеть заказы');
    toast('Вы вышли из аккаунта');
}

function renderAccount() {
    const label = state.role === 'ADMIN' ? 'админ' : 'пользователь';
    els.userBadge.textContent = state.username ? `${state.username} · ${label}` : 'Гость';
    els.authToggle.textContent = state.username ? 'Выйти' : 'Войти';
    els.cartNavBtn.classList.toggle('hidden', isAdmin());
    els.ordersNavBtn.classList.toggle('hidden', !state.token || isAdmin());
    els.adminNavBtn.classList.toggle('hidden', !isAdmin());
    document.body.classList.toggle('is-admin', isAdmin());
    els.adminContent.classList.toggle('hidden', !isAdmin());
    els.adminDenied.classList.toggle('hidden', isAdmin());

    if (!isAdmin() && state.currentView === 'admin') {
        switchView('catalog', { silent: true });
    }
    if (!state.token && state.currentView === 'orders') {
        switchView('catalog', { silent: true });
    }
    if (isAdmin() && state.currentView === 'orders') {
        switchView('admin', { silent: true });
    }
    if (isAdmin() && state.currentView === 'cart') {
        switchView('catalog', { silent: true });
    }
}

async function refreshProfile({ silent = false } = {}) {
    if (!state.token) {
        clearAuthState();
        renderAccount();
        return;
    }

    try {
        const profile = await api('/api/users/profile');
        saveAuth({
            token: state.token,
            id: profile.id,
            username: profile.username,
            role: profile.role
        });
    } catch (error) {
        clearAuthState();
        renderAccount();
        if (!silent) {
            toast(error.status === 401 ? 'Сессия истекла, войдите снова' : error.message);
        }
    }
}

async function loadCategories() {
    els.categoryList.innerHTML = '<p class="muted">Загрузка...</p>';
    state.categories = await api('/api/categories');
    renderCategories();
    renderProductCategorySelect();
}

function renderCategories() {
    const buttons = [
        `<button class="category-btn ${state.categoryId === null ? 'active' : ''}" data-category="">
            <strong>Все товары</strong>
            <small>Весь каталог</small>
        </button>`,
        ...state.categories.map(category => `
            <button class="category-btn ${state.categoryId === category.id ? 'active' : ''}" data-category="${category.id}">
                <strong>${escapeHtml(category.name)}</strong>
                <small>${escapeHtml(category.description || 'Без описания')}</small>
            </button>
        `)
    ];
    els.categoryList.innerHTML = buttons.join('');
    renderAdminCategories();
}

function renderProductCategorySelect() {
    els.productCategorySelect.innerHTML = state.categories.length
        ? state.categories
            .map(category => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
            .join('')
        : '<option value="">Сначала создайте категорию</option>';
    els.productCategorySelect.disabled = state.categories.length === 0;
}

async function loadProducts() {
    els.productGrid.innerHTML = notice('Загрузка товаров...');
    els.catalogMeta.textContent = 'Загрузка каталога';

    let path = `/api/products?page=${state.page}&size=${state.size}`;
    if (state.search) {
        path = `/api/products/search?name=${encodeURIComponent(state.search)}&page=${state.page}&size=${state.size}`;
    } else if (state.categoryId) {
        path = `/api/products/category/${state.categoryId}?page=${state.page}&size=${state.size}`;
    }

    state.productsPage = await api(path);
    cacheProducts(state.productsPage?.content || []);
    renderProducts();
}

function cacheProducts(products) {
    products.forEach(product => state.productCache.set(Number(product.id), product));
}

function renderProducts() {
    const page = state.productsPage;
    const products = page?.content || [];
    const totalPages = page?.totalPages || 1;
    const total = page?.totalElements || 0;
    els.catalogMeta.textContent = `${total} товаров · страница ${(page?.number || 0) + 1} из ${totalPages}`;
    els.pageInfo.textContent = `Страница ${(page?.number || 0) + 1}`;
    els.prevPageBtn.disabled = page?.first ?? true;
    els.nextPageBtn.disabled = page?.last ?? true;

    if (!products.length) {
        els.productGrid.innerHTML = notice('Товары не найдены');
        return;
    }

    els.productGrid.innerHTML = products.map(product => productCard(product)).join('');
    wireImageFallbacks(els.productGrid);
}

function productCard(product) {
    const outOfStock = Number(product.stock || 0) <= 0;
    const cartAction = isAdmin()
        ? ''
        : `<button class="primary-btn" data-cart="${product.id}" ${outOfStock ? 'disabled' : ''}>В корзину</button>`;
    return `
        <article class="product-card">
            <div class="product-media">${imageMarkup(product)}</div>
            <div class="product-body">
                <h3>${escapeHtml(product.name)}</h3>
                <p class="product-description">${escapeHtml(product.description || 'Описание скоро появится')}</p>
                <div class="product-meta">
                    <span class="price">${formatMoney(product.price)}</span>
                    <span>${escapeHtml(product.categoryName || 'Без категории')}</span>
                    <span class="stock ${outOfStock ? 'empty' : ''}">
                        ${outOfStock ? 'Нет в наличии' : `На складе: ${product.stock}`}
                    </span>
                </div>
                <div class="card-actions ${isAdmin() ? 'single' : ''}">
                    <button class="secondary-btn" data-details="${product.id}">Подробнее</button>
                    ${cartAction}
                </div>
            </div>
        </article>
    `;
}

function getProductImage(product) {
    const source = `${product.name || ''} ${product.categoryName || ''}`.toLowerCase();
    const match = Object.keys(productImages).find(key => source.includes(key));
    if (match) {
        return productImages[match];
    }
    return product.imageUrl;
}

function imageMarkup(product, className = '') {
    const image = getProductImage(product);
    const letter = (product.name || 'S').trim().charAt(0).toUpperCase() || 'S';
    if (!image || image.includes('example.com')) {
        return `<div class="fallback ${className}">${escapeHtml(letter)}</div>`;
    }
    return `<img class="${className}" src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" data-fallback="${escapeHtml(letter)}">`;
}

function wireImageFallbacks(root) {
    root.querySelectorAll('img[data-fallback]').forEach(img => {
        img.addEventListener('error', () => {
            const fallback = document.createElement('div');
            fallback.className = `fallback ${img.className || ''}`.trim();
            fallback.textContent = img.dataset.fallback || 'S';
            img.replaceWith(fallback);
        }, { once: true });
    });
}

function saveCart() {
    localStorage.setItem(STORAGE.cart, JSON.stringify(state.cart));
    renderCart();
}

function addToCart(productId) {
    if (isAdmin()) {
        toast('Администратору корзина не нужна');
        return;
    }

    const product = state.productCache.get(Number(productId));
    if (!product) {
        toast('Товар не найден');
        return;
    }

    const stock = Number(product.stock || 0);
    if (stock <= 0) {
        toast('Товара нет в наличии');
        return;
    }

    const existing = state.cart.find(item => item.productId === Number(productId));
    if (existing) {
        if (existing.quantity >= stock) {
            toast('Больше доступного остатка добавить нельзя');
            return;
        }
        existing.quantity += 1;
    } else {
        state.cart.push({
            productId: Number(productId),
            name: product.name,
            price: product.price,
            stock,
            quantity: 1
        });
    }

    saveCart();
    toast('Товар добавлен в корзину');
}

function changeCartQuantity(productId, delta) {
    const item = state.cart.find(cartItem => cartItem.productId === Number(productId));
    if (!item) {
        return;
    }

    const product = state.productCache.get(Number(productId));
    const stock = Number(product?.stock ?? item.stock ?? 9999);
    const nextQuantity = item.quantity + delta;

    if (nextQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (nextQuantity > stock) {
        toast('Больше доступного остатка добавить нельзя');
        return;
    }

    item.quantity = nextQuantity;
    saveCart();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.productId !== Number(productId));
    saveCart();
}

function clearCart() {
    state.cart = [];
    saveCart();
    toast('Корзина очищена');
}

function renderCart() {
    if (!state.cart.length) {
        els.cartList.innerHTML = `
            <div class="notice">
                Корзина пуста. Выберите товары в каталоге, и они появятся здесь.
            </div>
        `;
    } else {
        els.cartList.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <div class="cart-main">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span class="muted cart-subtitle">${formatMoney(item.price)} за шт. · ${item.quantity} шт.</span>
                </div>
                <div class="cart-controls">
                    <div class="qty-controls" aria-label="Количество">
                        <button type="button" data-cart-dec="${item.productId}">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-cart-inc="${item.productId}">+</button>
                    </div>
                    <strong class="cart-line-total">${formatMoney(Number(item.price) * item.quantity)}</strong>
                    <button class="ghost-btn" type="button" data-remove-cart="${item.productId}">Убрать</button>
                </div>
            </div>
        `).join('');
    }

    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = state.cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    els.cartCount.textContent = count;
    els.cartNavCount.textContent = count;
    els.cartMeta.textContent = count
        ? `${count} товаров на сумму ${formatMoney(total)}`
        : 'Корзина пуста';
    els.cartTotal.textContent = formatMoney(total);
    els.checkoutBtn.disabled = state.cart.length === 0;
    els.clearCartBtn.disabled = state.cart.length === 0;
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

    const address = els.orderAddress.value.trim();
    if (!address) {
        toast('Введите адрес доставки');
        els.orderAddress.focus();
        return;
    }

    await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
            address,
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
    if (state.currentView === 'orders') {
        await loadOrders();
    }
}

async function loadOrders() {
    if (!state.token) {
        els.ordersList.innerHTML = notice('Войдите, чтобы увидеть заказы');
        return;
    }

    els.ordersList.innerHTML = notice('Загрузка заказов...');
    try {
        const orders = await api('/api/orders/my');
        renderOrders(orders, els.ordersList, { admin: false });
    } catch (error) {
        els.ordersList.innerHTML = notice(error.message, 'danger');
        throw error;
    }
}

function renderOrders(orders, target, { admin }) {
    if (!orders.length) {
        target.innerHTML = notice(admin ? 'Заказов пока нет' : 'У вас пока нет заказов');
        return;
    }

    target.innerHTML = orders.map(order => `
        <article class="order-card">
            <div class="item-head">
                <strong>Заказ #${order.id} · ${escapeHtml(statusLabels[order.status] || order.status)}</strong>
                <span class="pill">${formatMoney(order.totalPrice)}</span>
            </div>
            <p>${admin && order.username ? `Покупатель: ${escapeHtml(order.username)} · ` : ''}${escapeHtml(order.address || 'Адрес не указан')}</p>
            <p>${formatDate(order.createdAt)}</p>
            <ul>
                ${(order.items || []).map(item => `
                    <li>${escapeHtml(item.productName)} × ${item.quantity} · ${formatMoney(item.subtotal)}</li>
                `).join('')}
            </ul>
            ${admin ? adminStatusControls(order) : ''}
        </article>
    `).join('');
}

function adminStatusControls(order) {
    return `
        <div class="status-row">
            <select class="field" data-status-select="${order.id}">
                ${ORDER_STATUSES.map(status => `
                    <option value="${status}" ${status === order.status ? 'selected' : ''}>${statusLabels[status]}</option>
                `).join('')}
            </select>
            <button class="secondary-btn" type="button" data-update-status="${order.id}">Сменить статус</button>
        </div>
    `;
}

async function showProduct(productId) {
    const [product, reviews] = await Promise.all([
        api(`/api/products/${productId}`),
        api(`/api/products/${productId}/reviews`)
    ]);
    state.productCache.set(Number(product.id), product);

    const outOfStock = Number(product.stock || 0) <= 0;
    const cartAction = isAdmin()
        ? ''
        : `<button class="primary-btn" data-cart="${product.id}" ${outOfStock ? 'disabled' : ''}>
                Добавить в корзину
            </button>`;

    els.productDialogTitle.textContent = product.name;
    els.productDetails.innerHTML = `
        <div class="details-image">${imageMarkup(product)}</div>
        <div>
            <p>${escapeHtml(product.description || 'Описание скоро появится')}</p>
            <p><strong>${formatMoney(product.price)}</strong> · ${escapeHtml(product.categoryName || 'Без категории')}</p>
            <p class="stock ${outOfStock ? 'empty' : ''}">
                ${outOfStock ? 'Нет в наличии' : `На складе: ${product.stock}`}
            </p>
            ${cartAction}
            <section class="reviews">
                <h3>Отзывы</h3>
                <div class="stack-list">
                    ${reviews.length ? reviews.map(review => `
                        <div class="review-card">
                            <strong>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</strong>
                            <p>${escapeHtml(review.comment || '')}</p>
                            <span class="muted">${escapeHtml(review.username || 'Пользователь')}</span>
                        </div>
                    `).join('') : '<p class="muted">Отзывов пока нет</p>'}
                </div>
                ${reviewFormMarkup()}
            </section>
        </div>
    `;

    wireImageFallbacks(els.productDetails);

    if (!els.productDialog.open) {
        els.productDialog.showModal();
    }

    const reviewForm = document.querySelector('#reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', event => submitReview(event, productId).catch(error => toast(error.message)));
    }
}

function reviewFormMarkup() {
    if (!state.token) {
        return '<div class="notice">Войдите, чтобы оставить отзыв</div>';
    }

    return `
        <form id="reviewForm" class="form-panel">
            <select name="rating" class="field">
                <option value="5">5 - отлично</option>
                <option value="4">4 - хорошо</option>
                <option value="3">3 - нормально</option>
                <option value="2">2 - плохо</option>
                <option value="1">1 - ужасно</option>
            </select>
            <textarea name="comment" class="field" placeholder="Ваш отзыв" required></textarea>
            <button class="secondary-btn" type="submit">Оставить отзыв</button>
        </form>
    `;
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
    const emailInput = els.authForm.elements.email;
    const passwordInput = els.authForm.elements.password;

    els.authTitle.textContent = isRegister ? 'Регистрация' : 'Вход';
    els.switchAuthModeBtn.textContent = isRegister ? 'Уже есть аккаунт' : 'Создать аккаунт';
    emailInput.classList.toggle('hidden', !isRegister);
    emailInput.required = isRegister;
    passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password';
    els.authMessage.classList.add('hidden');
    els.authMessage.classList.remove('danger');
    els.authMessage.textContent = '';

    if (!els.authDialog.open) {
        els.authDialog.showModal();
    }
}

async function submitAuth(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = {
        username: String(form.get('username') || '').trim(),
        password: String(form.get('password') || '')
    };

    if (state.authMode === 'register') {
        payload.email = String(form.get('email') || '').trim();
    }

    try {
        const auth = await api(`/api/auth/${state.authMode === 'register' ? 'register' : 'login'}`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        saveAuth(auth);
        await refreshProfile({ silent: true });
        els.authDialog.close();
        els.authForm.reset();
        toast(state.authMode === 'register' ? 'Аккаунт создан' : 'Вы вошли в систему');
        if (state.currentView === 'orders') {
            await loadOrders();
        }
    } catch (error) {
        els.authMessage.textContent = error.status === 401 ? 'Неверный логин или пароль' : error.message;
        els.authMessage.classList.remove('hidden');
        els.authMessage.classList.add('danger');
    }
}

function activateView(view) {
    state.currentView = view;
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
    document.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === `${view}View`));
    els.layout.classList.toggle('sidebar-hidden', view !== 'catalog');
}

function switchAdminSection(section) {
    state.adminSection = section;
    document.querySelectorAll('[data-admin-section]').forEach(button => {
        button.classList.toggle('active', button.dataset.adminSection === section);
    });
    document.querySelectorAll('[data-admin-panel]').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.adminPanel === section);
    });
}

function switchView(view, options = {}) {
    if (view === 'cart' && isAdmin()) {
        switchView('catalog', options);
        if (!options.silent) {
            toast('Администратору корзина не нужна');
        }
        return;
    }

    if (view === 'orders' && !state.token) {
        activateView('catalog');
        if (!options.silent) {
            openAuth('login');
            toast('Войдите, чтобы увидеть заказы');
        }
        return;
    }

    if (view === 'orders' && isAdmin()) {
        switchView('admin', options);
        return;
    }

    if (view === 'admin' && !isAdmin()) {
        activateView('admin');
        els.adminContent.classList.add('hidden');
        els.adminDenied.classList.remove('hidden');
        if (!options.silent) {
            toast('Доступ запрещён');
        }
        window.setTimeout(() => activateView('catalog'), 700);
        return;
    }

    activateView(view);
    els.adminContent.classList.toggle('hidden', view === 'admin' ? false : !isAdmin());
    els.adminDenied.classList.add('hidden');

    if (view === 'orders') {
        loadOrders().catch(error => toast(error.message));
    }
    if (view === 'admin') {
        switchAdminSection(state.adminSection);
        loadAdminData().catch(error => toast(error.message));
    }
}

function requireAdmin() {
    if (isAdmin()) {
        return true;
    }
    switchView('admin');
    return false;
}

async function loadAdminData() {
    if (!requireAdmin()) {
        return;
    }

    els.adminCategoryList.innerHTML = notice('Загрузка категорий...');
    els.adminProductList.innerHTML = notice('Загрузка товаров...');
    els.adminOrdersList.innerHTML = notice('Загрузка заказов...');
    els.adminUsersList.innerHTML = notice('Загрузка пользователей...');

    const [categories, productsPage, orders, users] = await Promise.all([
        api('/api/categories'),
        api('/api/products?page=0&size=100'),
        api('/api/orders'),
        api('/api/users')
    ]);

    state.categories = categories;
    state.adminProducts = productsPage?.content || [];
    state.adminOrders = orders || [];
    state.users = users || [];
    cacheProducts(state.adminProducts);

    renderCategories();
    renderProductCategorySelect();
    renderAdminProducts();
    renderOrders(state.adminOrders, els.adminOrdersList, { admin: true });
    renderAdminUsers();
}

function renderAdminCategories() {
    if (!els.adminCategoryList || !isAdmin()) {
        return;
    }

    if (!state.categories.length) {
        els.adminCategoryList.innerHTML = notice('Категорий пока нет');
        return;
    }

    els.adminCategoryList.innerHTML = state.categories.map(category => `
        <div class="admin-item">
            <div class="admin-main">
                <strong>${escapeHtml(category.name)}</strong>
                <p>${escapeHtml(category.description || 'Без описания')}</p>
            </div>
            <div class="item-actions">
                <button class="secondary-btn" type="button" data-edit-category="${category.id}">Редактировать</button>
                <button class="danger-btn" type="button" data-delete-category="${category.id}">Удалить</button>
            </div>
        </div>
    `).join('');
}

function renderAdminProducts() {
    if (!state.adminProducts.length) {
        els.adminProductList.innerHTML = notice('Товаров пока нет');
        return;
    }

    els.adminProductList.innerHTML = state.adminProducts.map(product => `
        <div class="admin-item">
            <div class="admin-main">
                <strong>${escapeHtml(product.name)}</strong>
                <p>${formatMoney(product.price)} · ${escapeHtml(product.categoryName || 'Без категории')} · остаток: ${product.stock}</p>
            </div>
            <div class="item-actions">
                <button class="secondary-btn" type="button" data-edit-product="${product.id}">Редактировать</button>
                <button class="danger-btn" type="button" data-delete-product="${product.id}">Удалить</button>
            </div>
        </div>
    `).join('');
}

function upsertVisibleProduct(product) {
    if (!product?.id || !state.productsPage?.content) {
        return;
    }

    const index = state.productsPage.content.findIndex(item => Number(item.id) === Number(product.id));
    if (index === -1) {
        return;
    }

    state.productsPage.content[index] = product;
    renderProducts();
}

function upsertAdminProduct(product) {
    if (!product?.id) {
        return;
    }

    const index = state.adminProducts.findIndex(item => Number(item.id) === Number(product.id));
    if (index === -1) {
        state.adminProducts.unshift(product);
    } else {
        state.adminProducts[index] = product;
    }

    cacheProducts([product]);
    renderAdminProducts();
    upsertVisibleProduct(product);
}

function renderAdminUsers() {
    if (!state.users.length) {
        els.adminUsersList.innerHTML = notice('Пользователей пока нет');
        return;
    }

    els.adminUsersList.innerHTML = state.users.map(user => {
        const currentUser = state.userId === user.id || state.username === user.username;
        return `
            <div class="admin-item">
                <div class="admin-main">
                    <strong>${escapeHtml(user.username)} · ${escapeHtml(user.role)}</strong>
                    <p>${escapeHtml(user.email || '')} · ${formatDate(user.createdAt)}</p>
                </div>
                <div class="item-actions">
                    <button class="danger-btn" type="button" data-delete-user="${user.id}" ${currentUser ? 'disabled' : ''}>
                        ${currentUser ? 'Текущий пользователь' : 'Удалить'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function resetCategoryForm() {
    els.categoryForm.reset();
    els.categoryIdInput.value = '';
    els.categoryFormTitle.textContent = 'Новая категория';
    els.categorySubmitBtn.textContent = 'Создать категорию';
    els.cancelCategoryEditBtn.classList.add('hidden');
}

function resetProductForm() {
    els.productForm.reset();
    els.productIdInput.value = '';
    els.productFormTitle.textContent = 'Новый товар';
    els.productSubmitBtn.textContent = 'Создать товар';
    els.cancelProductEditBtn.classList.add('hidden');
}

async function submitCategory(event) {
    event.preventDefault();
    if (!requireAdmin()) {
        return;
    }

    const form = new FormData(event.target);
    const id = String(form.get('id') || '').trim();
    await api(id ? `/api/categories/${id}` : '/api/categories', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({
            name: String(form.get('name') || '').trim(),
            description: String(form.get('description') || '').trim()
        })
    });

    resetCategoryForm();
    toast(id ? 'Категория обновлена' : 'Категория создана');
    await loadAdminData();
    await loadProducts();
}

function editCategory(categoryId) {
    const category = state.categories.find(item => item.id === Number(categoryId));
    if (!category) {
        return;
    }

    switchAdminSection('categories');
    els.categoryIdInput.value = category.id;
    els.categoryForm.elements.name.value = category.name;
    els.categoryForm.elements.description.value = category.description || '';
    els.categoryFormTitle.textContent = 'Редактирование категории';
    els.categorySubmitBtn.textContent = 'Сохранить категорию';
    els.cancelCategoryEditBtn.classList.remove('hidden');
    els.categoryForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deleteCategory(categoryId) {
    if (!requireAdmin() || !confirm('Удалить категорию? Связанные товары тоже могут быть удалены.')) {
        return;
    }

    await api(`/api/categories/${categoryId}`, { method: 'DELETE' });
    resetCategoryForm();
    toast('Категория удалена');
    await loadAdminData();
    await loadProducts();
}

async function submitProduct(event) {
    event.preventDefault();
    if (!requireAdmin()) {
        return;
    }

    const form = new FormData(event.target);
    const id = String(form.get('id') || '').trim();
    const imageUrl = String(form.get('imageUrl') || '').trim();

    const savedProduct = await api(id ? `/api/products/${id}` : '/api/products', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({
            name: String(form.get('name') || '').trim(),
            description: String(form.get('description') || '').trim(),
            price: Number(form.get('price')),
            stock: Number(form.get('stock')),
            imageUrl: imageUrl || null,
            categoryId: Number(form.get('categoryId'))
        })
    });

    upsertAdminProduct(savedProduct);
    resetProductForm();
    toast(id ? 'Товар обновлён' : 'Товар создан');
    await loadAdminData();
    await loadProducts();
}

function editProduct(productId) {
    const product = state.adminProducts.find(item => item.id === Number(productId))
        || state.productCache.get(Number(productId));
    if (!product) {
        return;
    }

    switchAdminSection('products');
    els.productIdInput.value = product.id;
    els.productForm.elements.name.value = product.name;
    els.productForm.elements.description.value = product.description || '';
    els.productForm.elements.price.value = product.price;
    els.productForm.elements.stock.value = product.stock;
    els.productForm.elements.imageUrl.value = product.imageUrl || '';
    els.productForm.elements.categoryId.value = product.categoryId || '';
    els.productFormTitle.textContent = 'Редактирование товара';
    els.productSubmitBtn.textContent = 'Сохранить товар';
    els.cancelProductEditBtn.classList.remove('hidden');
    els.productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deleteProduct(productId) {
    if (!requireAdmin() || !confirm('Удалить товар?')) {
        return;
    }

    await api(`/api/products/${productId}`, { method: 'DELETE' });
    resetProductForm();
    removeFromCart(productId);
    toast('Товар удалён');
    await loadAdminData();
    await loadProducts();
}

async function updateOrderStatus(orderId) {
    if (!requireAdmin()) {
        return;
    }
    const select = els.adminOrdersList.querySelector(`[data-status-select="${orderId}"]`);
    const status = select?.value;
    if (!status) {
        return;
    }

    await api(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
    toast('Статус заказа обновлён');
    await loadAdminData();
}

async function deleteUser(userId) {
    if (!requireAdmin() || !confirm('Удалить пользователя?')) {
        return;
    }

    await api(`/api/users/${userId}`, { method: 'DELETE' });
    toast('Пользователь удалён');
    await loadAdminData();
}

function bindEvents() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    document.querySelector('.admin-menu').addEventListener('click', event => {
        const button = event.target.closest('[data-admin-section]');
        if (!button) {
            return;
        }
        switchAdminSection(button.dataset.adminSection);
    });

    els.authToggle.addEventListener('click', () => state.token ? logout() : openAuth('login'));
    els.closeAuthBtn.addEventListener('click', () => els.authDialog.close());
    els.switchAuthModeBtn.addEventListener('click', () => openAuth(state.authMode === 'login' ? 'register' : 'login'));
    els.authForm.addEventListener('submit', submitAuth);

    els.searchBtn.addEventListener('click', () => {
        state.search = els.searchInput.value.trim();
        state.categoryId = null;
        state.page = 0;
        renderCategories();
        loadProducts().catch(error => toast(error.message));
    });

    els.searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            els.searchBtn.click();
        }
    });

    els.resetSearchBtn.addEventListener('click', () => {
        state.search = '';
        state.categoryId = null;
        state.page = 0;
        els.searchInput.value = '';
        renderCategories();
        switchView('catalog', { silent: true });
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
        if (!button) {
            return;
        }
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
        if (cartBtn) {
            addToCart(Number(cartBtn.dataset.cart));
        }
        if (detailsBtn) {
            showProduct(Number(detailsBtn.dataset.details)).catch(error => toast(error.message));
        }
    });

    els.productDetails.addEventListener('click', event => {
        const cartBtn = event.target.closest('[data-cart]');
        if (cartBtn) {
            addToCart(Number(cartBtn.dataset.cart));
        }
    });

    els.cartList.addEventListener('click', event => {
        const incBtn = event.target.closest('[data-cart-inc]');
        const decBtn = event.target.closest('[data-cart-dec]');
        const removeBtn = event.target.closest('[data-remove-cart]');
        if (incBtn) {
            changeCartQuantity(Number(incBtn.dataset.cartInc), 1);
        }
        if (decBtn) {
            changeCartQuantity(Number(decBtn.dataset.cartDec), -1);
        }
        if (removeBtn) {
            removeFromCart(Number(removeBtn.dataset.removeCart));
        }
    });

    els.checkoutBtn.addEventListener('click', () => checkout().catch(error => toast(error.message)));
    els.continueShoppingBtn.addEventListener('click', () => switchView('catalog'));
    els.clearCartBtn.addEventListener('click', clearCart);
    els.refreshOrdersBtn.addEventListener('click', () => loadOrders().catch(error => toast(error.message)));
    els.refreshAdminBtn.addEventListener('click', () => loadAdminData().catch(error => toast(error.message)));

    els.categoryForm.addEventListener('submit', event => submitCategory(event).catch(error => toast(error.message)));
    els.cancelCategoryEditBtn.addEventListener('click', resetCategoryForm);
    els.productForm.addEventListener('submit', event => submitProduct(event).catch(error => toast(error.message)));
    els.cancelProductEditBtn.addEventListener('click', resetProductForm);

    els.adminCategoryList.addEventListener('click', event => {
        const editBtn = event.target.closest('[data-edit-category]');
        const deleteBtn = event.target.closest('[data-delete-category]');
        if (editBtn) {
            editCategory(Number(editBtn.dataset.editCategory));
        }
        if (deleteBtn) {
            deleteCategory(Number(deleteBtn.dataset.deleteCategory)).catch(error => toast(error.message));
        }
    });

    els.adminProductList.addEventListener('click', event => {
        const editBtn = event.target.closest('[data-edit-product]');
        const deleteBtn = event.target.closest('[data-delete-product]');
        if (editBtn) {
            editProduct(Number(editBtn.dataset.editProduct));
        }
        if (deleteBtn) {
            deleteProduct(Number(deleteBtn.dataset.deleteProduct)).catch(error => toast(error.message));
        }
    });

    els.adminOrdersList.addEventListener('click', event => {
        const updateBtn = event.target.closest('[data-update-status]');
        if (updateBtn) {
            updateOrderStatus(Number(updateBtn.dataset.updateStatus)).catch(error => toast(error.message));
        }
    });

    els.adminUsersList.addEventListener('click', event => {
        const deleteBtn = event.target.closest('[data-delete-user]');
        if (deleteBtn) {
            deleteUser(Number(deleteBtn.dataset.deleteUser)).catch(error => toast(error.message));
        }
    });

    els.closeProductBtn.addEventListener('click', () => els.productDialog.close());
}

async function init() {
    renderAccount();
    renderCart();
    bindEvents();
    await refreshProfile({ silent: true });
    await loadCategories();
    await loadProducts();
}

init().catch(error => {
    els.productGrid.innerHTML = notice(error.message, 'danger');
    toast(error.message);
});
