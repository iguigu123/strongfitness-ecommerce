"use strict";
// src/main.ts
let cart = JSON.parse(localStorage.getItem('strong_cart') || '[]');
const cartCountElement = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');

function atualizarInterface() {
    // Atualiza o contador do cabeçalho
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.innerText = totalItems.toString();
    }
    
    // Atualiza o total no modal
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (cartTotalElement) {
        cartTotalElement.innerText = totalPrice.toFixed(2);
    }

    localStorage.setItem('strong_cart', JSON.stringify(cart));
    localStorage.setItem('cartCount', totalItems.toString());

    // Renderiza itens no Modal do Carrinho
    const cartItemsContainer = document.querySelector('#cart-modal .cart-items');
    if (cartItemsContainer) {
        renderCartItems(cartItemsContainer);
    }

    // Renderiza itens na página de Carrinho (carrinho.html)
    const fullCartContainer = document.querySelector('.cart-page .cart-items');
    if (fullCartContainer) {
        renderCartItems(fullCartContainer);
        updateCartSummary();
    }

    // Renderiza itens no resumo do Checkout (checkout.html)
    const checkoutSummaryContainer = document.getElementById('checkout-summary-items');
    if (checkoutSummaryContainer) {
        renderCartItems(checkoutSummaryContainer);
        updateCartSummary();
    }
}

function renderCartItems(container) {
    if (cart.length > 0) {
        container.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img class="cart-thumb" src="${item.image}" alt="${item.name}">
                <div class="cart-info">
                    <h3>${item.name}</h3>
                    <div class="cart-meta">
                        <span class="cart-size">Tamanho: ${item.size}</span>
                    </div>
                    <div class="qty-row">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        <button class="trash-btn" onclick="removeFromCart(${index})" aria-label="Remover item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M14 4a2 2 0 0 0-2-2 2 2 0 0 0-2 2H4v2h16V4z"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="cart-price">
                    <span class="price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `<p>Seu carrinho está vazio.</p>`;
    }
}

function updateCartSummary() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // Atualiza elementos da página de carrinho
    const summaryRows = document.querySelectorAll('.cart-summary .summary-row span:last-child');
    const totalRow = document.querySelector('.summary-total span:last-child');
    
    if (summaryRows.length >= 1) {
        summaryRows[0].innerText = `R$ ${subtotal.toFixed(2)}`;
    }
    if (totalRow) {
        totalRow.innerText = `R$ ${subtotal.toFixed(2)}`;
    }

    // Atualiza elementos da página de checkout e frete
    const checkoutSubtotal = document.getElementById('summary-subtotal');
    const checkoutTotal = document.getElementById('summary-total');
    const checkoutDiscount = document.getElementById('summary-discount');
    const checkoutShipping = document.querySelector('.summary-frete');

    if (checkoutSubtotal) {
        checkoutSubtotal.innerText = `R$ ${subtotal.toFixed(2)}`;
    }

    // Lógica específica para página de frete
    let shippingValue = 0;
    let discountValue = 0;

    if (document.body.classList.contains('frete-page')) {
        const selectedRadio = document.querySelector('.shipping-option input[type="radio"]:checked');
        if (selectedRadio) {
            const container = selectedRadio.closest('.shipping-option');
            const priceEl = container.querySelector('.ship-price');
            if (priceEl) {
                const priceTxt = priceEl.textContent.replace('R$', '').replace(',', '.').trim();
                shippingValue = parseFloat(priceTxt) || 0;
            }
        }

        // Exemplo de regra: frete grátis acima de R$ 199
        if (subtotal >= 199) {
            discountValue = shippingValue;
            shippingValue = 0;
        }
    }

    if (checkoutShipping) {
        checkoutShipping.innerText = `R$ ${shippingValue.toFixed(2).replace('.', ',')}`;
    }
    if (checkoutDiscount) {
        checkoutDiscount.innerText = discountValue > 0 ? `- R$ ${discountValue.toFixed(2).replace('.', ',')}` : '—';
    }
    if (checkoutTotal) {
        const finalTotal = subtotal + shippingValue - discountValue;
        checkoutTotal.innerText = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
    }
}

// Funções globais para o carrinho
window.updateQuantity = (index, delta) => {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    atualizarInterface();
};

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    atualizarInterface();
};

// Inicializa a interface
atualizarInterface();

// Lógica para seleção de tamanho
const sizeOptions = document.querySelectorAll('.size-option');
sizeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        sizeOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
    });
});

// Seleciona botões de adicionar
const botoesAdicionar = Array.from(document.querySelectorAll('.add-to-cart, .cta-buy')).filter((b) => {
    const isCarousel = b.closest('.products-carousel');
    const isLink = b.tagName.toLowerCase() === 'a';
    return !isCarousel && !isLink;
});

botoesAdicionar.forEach((botao) => {
    botao.addEventListener('click', (e) => {
        e.preventDefault();
        
        const card = botao.closest('.product-card') || botao.closest('.product-detail');
        if (!card) return;

        const name = card.querySelector('h3, .detail-title')?.textContent || 'Produto';
        const priceStr = card.querySelector('.price, .detail-price')?.textContent || '0';
        const price = parseFloat(priceStr.replace('R$', '').replace(',', '.').trim());
        const image = card.querySelector('img')?.getAttribute('src') || '';
        
        // Busca o tamanho selecionado
        let size = 'M'; // Padrão
        const selectedSize = card.querySelector('.size-option.selected');
        if (selectedSize) {
            size = selectedSize.textContent;
        }

        const existingItem = cart.find(item => item.name === name && item.size === size);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, image, size, quantity: 1 });
        }

        atualizarInterface();
        alert("Produto adicionado ao carrinho!");
    });
});
// Efeito de mudar o header no scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header === null || header === void 0 ? void 0 : header.classList.add('scroll-active');
    }
    else {
        header === null || header === void 0 ? void 0 : header.classList.remove('scroll-active');
    }
});

// Sidebar Mobile Toggle
document.addEventListener('DOMContentLoaded', () => {
    const navToggleBtns = document.querySelectorAll('.nav-toggle-btn');
    const mainNavMobile = document.getElementById('main-nav-mobile');
    const closeNavMobile = document.getElementById('close-nav-mobile');

    if (navToggleBtns && mainNavMobile) {
        navToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                mainNavMobile.classList.add('active');
            });
        });
    }

    if (closeNavMobile && mainNavMobile) {
        closeNavMobile.addEventListener('click', () => {
            mainNavMobile.classList.remove('active');
        });
    }

    // Search functionality for all pages
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchBtn && searchInput) {
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `produto.html?search=${encodeURIComponent(query)}#catalogo`;
            }
        };

        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

    // Filter products on produto.html if search param exists
    if (window.location.pathname.includes('produto.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        const productCards = document.querySelectorAll('.product-card');

        if (searchTerm) {
            const decodedSearchTerm = decodeURIComponent(searchTerm).toLowerCase();
            productCards.forEach(card => {
                const productName = card.querySelector('.product-info h3')?.textContent.toLowerCase();
                if (productName && productName.includes(decodedSearchTerm)) {
                    card.style.display = ''; // Show the card
                } else {
                    card.style.display = 'none'; // Hide the card
                }
            });
        }
    }
});

// Seletores de Elementos
const authModal = document.getElementById('auth-modal');
const loginBtn = document.querySelector('.header-link-login'); // Link que abre a modal
const registerBtn = document.getElementById('open-register'); // Botão que abre a modal para cadastro
const closeModal = document.getElementById('close-modal');
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
// 1. Abrir Modal (Login)
loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (authModal) {
        authModal.style.display = 'flex';
        // Garante que a aba de login esteja ativa por padrão
        tabBtns.forEach(b => b.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="login"]')?.classList.add('active');
        document.getElementById('login-form')?.classList.add('active');
    }
});
// 1. Abrir Modal (Cadastro)
registerBtn === null || registerBtn === void 0 ? void 0 : registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (authModal) {
        authModal.style.display = 'flex';
        // Ativa a aba de cadastro
        tabBtns.forEach(b => b.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="register"]')?.classList.add('active');
        document.getElementById('register-form')?.classList.add('active');
    }
});
// 2. Fechar Modal (No X ou clicando fora)
closeModal === null || closeModal === void 0 ? void 0 : closeModal.addEventListener('click', () => authModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === authModal)
        authModal.style.display = 'none';
});
// 3. Alternar entre Login e Cadastro
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        var _a;
        const tab = btn.getAttribute('data-tab');
        // Remove active de todos
        tabBtns.forEach(b => b.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        // Adiciona active no clicado
        btn.classList.add('active');
        (_a = document.getElementById(`${tab}-form`)) === null || _a === void 0 ? void 0 : _a.classList.add('active');
    });
});
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        // Fecha outros itens abertos (opcional)
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        // Alterna o estado do item clicado
        item === null || item === void 0 ? void 0 : item.classList.toggle('active');
    });
});
const filterSelect = document.getElementById('sort-products');
filterSelect === null || filterSelect === void 0 ? void 0 : filterSelect.addEventListener('change', () => {
    const selectedValue = filterSelect.value;
    console.log(`Filtrando por: ${selectedValue}`);
});
loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Evita qualquer comportamento padrão
    if (authModal)
        authModal.style.display = 'flex';
});
const productsCarousel = document.querySelector('.products-carousel');
if (productsCarousel) {
    const track = productsCarousel.querySelector('.carousel-track');
    const grid = productsCarousel.querySelector('.product-grid');
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    const prev = productsCarousel.querySelector('.carousel-arrow.prev');
    const next = productsCarousel.querySelector('.carousel-arrow.next');
    let active = 2;
    let GAP = 24;
    const gapVar = getComputedStyle(productsCarousel).getPropertyValue('--pc-gap');
    const parsedGap = parseInt(gapVar.trim(), 10);
    if (!isNaN(parsedGap)) GAP = parsedGap;
    const TOTAL = cards.length;
    function applyClasses() {
        cards.forEach((c, i) => {
            c.classList.remove('is-center', 'is-near', 'is-far');
            if (i === active) {
                c.classList.add('is-center');
            } else if (i === ((active - 1 + TOTAL) % TOTAL) || i === ((active + 1) % TOTAL)) {
                c.classList.add('is-near');
            } else {
                c.classList.add('is-far');
            }
            const rightDist = (i - active + TOTAL) % TOTAL; // distância para direita [0..TOTAL-1]
            let rel = rightDist;
            if (rel > TOTAL / 2) rel = rel - TOTAL; // normaliza para intervalo negativo do lado esquerdo
            // Clamp para [-2, -1, 0, 1, 2] como "vizinhança" visível
            if (rel < -2) rel = -3;
            if (rel > 2) rel = 3;
            const angle = rel * 10; // inclinação giratória
            const depth = rel === 0 ? 40 : (Math.abs(rel) === 1 ? 20 : 0);
            const scale = rel === 0 ? 1.06 : (Math.abs(rel) === 1 ? 0.95 : 0.88);
            c.style.transform = `translateZ(${depth}px) rotateY(${angle}deg) scale(${scale})`;
            c.style.zIndex = (100 - Math.abs(rel)).toString();
        });
    }
    function wrapIndex() {
        if (active < 0) active = TOTAL - 1;
        if (active > TOTAL - 1) active = 0;
    }
    function update() {
        const itemW = cards[0] ? cards[0].getBoundingClientRect().width : 0;
        const offset = active - 2;
        const tx = -(offset * (itemW + GAP));
        grid.style.transform = `translateX(${tx}px)`;
    }
    function go(dir) {
        active += dir;
        wrapIndex();
        applyClasses();
        update();
    }
    prev === null || prev === void 0 ? void 0 : prev.addEventListener('click', () => go(-1));
    next === null || next === void 0 ? void 0 : next.addEventListener('click', () => go(1));
    let autoplayId = null;
    function startAutoplay() {
        stopAutoplay();
        autoplayId = setInterval(() => go(1), 4000);
    }
    function stopAutoplay() {
        if (autoplayId) {
            clearInterval(autoplayId);
            autoplayId = null;
        }
    }
    productsCarousel.addEventListener('mouseenter', stopAutoplay);
    productsCarousel.addEventListener('mouseleave', startAutoplay);
    window.addEventListener('blur', stopAutoplay);
    window.addEventListener('focus', startAutoplay);
    window.addEventListener('resize', update);
    applyClasses();
    update();
    startAutoplay();
}
//# sourceMappingURL=main.js.map
// Seleção de tamanho na página de detalhes
document.querySelectorAll('.sizes-grid .size-option').forEach((btn) => {
    btn.addEventListener('click', () => {
        const group = btn.parentElement;
        group.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});
// Mostrar detalhes ao selecionar um produto no carrossel
const detailSection = document.getElementById('product-detail');
if (detailSection) {
    const detailImg = detailSection.querySelector('.detail-image');
    const detailFront = detailSection.querySelector('.detail-image-front');
    const detailBack = detailSection.querySelector('.detail-image-back');
    const detailTitle = detailSection.querySelector('.detail-title');
    const detailPrice = detailSection.querySelector('.detail-price');
    const dotFront = detailSection.querySelector('.detail-dots .dot-front');
    const dotBack = detailSection.querySelector('.detail-dots .dot-back');
    function setActive(side) {
        if (!detailFront || !detailBack) return;
        detailFront.classList.toggle('is-active', side === 'front');
        detailBack.classList.toggle('is-active', side === 'back');
        if (dotFront && dotBack) {
            dotFront.classList.toggle('active', side === 'front');
            dotBack.classList.toggle('active', side === 'back');
        }
    }
    dotFront && dotFront.addEventListener('click', () => setActive('front'));
    dotBack && dotBack.addEventListener('click', () => setActive('back'));
    document.querySelectorAll('.products-carousel .product-card .add-to-cart').forEach((btn) => {
        btn.textContent = '+ Selecionar';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.product-card');
            if (!card) return;
            const imgFront = card.querySelector('.img-front');
            const frontSrc = (imgFront === null || imgFront === void 0 ? void 0 : imgFront.getAttribute('src')) || '';
            const backSrc = frontSrc.replace(/FRENTE/i, 'COSTAS');
            const titleEl = card.querySelector('.product-info h3');
            const priceEl = card.querySelector('.price');
            if (detailFront && frontSrc) {
                detailFront.setAttribute('src', frontSrc);
                detailFront.setAttribute('alt', titleEl ? `${titleEl.textContent} (Frente)` : 'Produto (Frente)');
            }
            if (detailBack && backSrc) {
                detailBack.setAttribute('src', backSrc);
                detailBack.setAttribute('alt', titleEl ? `${titleEl.textContent} (Costas)` : 'Produto (Costas)');
            }
            if (detailTitle && titleEl) detailTitle.textContent = titleEl.textContent || '';
            if (detailPrice && priceEl) detailPrice.textContent = priceEl.textContent || '';
            detailSection.classList.remove('hidden');
            setActive('front');
            detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}
// Lógica de frete na página de frete
if (document.body && document.body.classList.contains('frete-page')) {
    const radios = document.querySelectorAll('.shipping-option input[type="radio"]');
    radios.forEach(r => r.addEventListener('change', () => {
        updateCartSummary();
    }));
}

// Lógica para o dropdown do botão de usuário
const userBtn = document.querySelector('.user-btn');
if (userBtn) {
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique se propague para o document
        userBtn.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target)) {
            userBtn.classList.remove('active');
        }
    });
}

// Lógica para o modal do carrinho
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartModal = document.getElementById('close-cart-modal');
const checkoutBtn = document.getElementById('checkout-btn');

if (cartBtn && cartModal && closeCartModal && checkoutBtn) {
    cartBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique se propague para o document
        cartModal.classList.toggle('active');
    });

    closeCartModal.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    document.addEventListener('click', (e) => {
        if (!cartBtn.contains(e.target) && !cartModal.contains(e.target)) {
            cartModal.classList.remove('active');
        }
    });

    checkoutBtn.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
}

// Lógica para o menu de navegação mobile
const mainNavMobile = document.getElementById('main-nav-mobile');
const closeNavMobile = document.getElementById('close-nav-mobile');
const navToggleButtons = document.querySelectorAll('.nav-toggle-btn');

if (mainNavMobile) {
    navToggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            mainNavMobile.classList.add('active');
        });
    });

    if (closeNavMobile) {
        closeNavMobile.addEventListener('click', () => {
            mainNavMobile.classList.remove('active');
        });
    }

    document.addEventListener('click', (e) => {
        // Fecha o menu se o clique for fora do botão e do próprio menu
        let clickedOnToggle = false;
        navToggleButtons.forEach(btn => {
            if (btn.contains(e.target)) clickedOnToggle = true;
        });

        if (!clickedOnToggle && !mainNavMobile.contains(e.target)) {
            mainNavMobile.classList.remove('active');
        }
    });
}

// Lógica para Salvar Endereço no Checkout
const saveAddressBtn = document.getElementById('save-address');
if (saveAddressBtn) {
    saveAddressBtn.addEventListener('click', () => {
        const addressData = {
            cep: document.getElementById('cep').value,
            endereco: document.getElementById('endereco').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            uf: document.getElementById('uf').value
        };

        localStorage.setItem('saved_address', JSON.stringify(addressData));
        alert('Endereço salvo com sucesso!');
    });

    // Carregar endereço salvo ao iniciar
    const savedAddress = JSON.parse(localStorage.getItem('saved_address'));
    if (savedAddress) {
        document.getElementById('cep').value = savedAddress.cep || '';
        document.getElementById('endereco').value = savedAddress.endereco || '';
        document.getElementById('bairro').value = savedAddress.bairro || '';
        document.getElementById('cidade').value = savedAddress.cidade || '';
        document.getElementById('uf').value = savedAddress.uf || '';
    }
}
