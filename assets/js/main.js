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
    }
    else {
        container.innerHTML = `<p>Seu carrinho está vazio.</p>`;
    }
}
function updateCartSummary() {
    var _a;
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
            const priceEl = container === null || container === void 0 ? void 0 : container.querySelector('.ship-price');
            if (priceEl) {
                const priceTxt = ((_a = priceEl.textContent) === null || _a === void 0 ? void 0 : _a.replace('R$', '').replace(',', '.').trim()) || '0';
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
// @ts-ignore
window.updateQuantity = (index, delta) => {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    atualizarInterface();
};
// @ts-ignore
window.removeFromCart = (index) => {
    cart.splice(index, 1);
    atualizarInterface();
};
// Inicializa a interface
atualizarInterface();
// Lógica de frete na página de frete
if (document.body.classList.contains('frete-page')) {
    const radios = document.querySelectorAll('.shipping-option input[type="radio"]');
    radios.forEach(r => r.addEventListener('change', () => {
        updateCartSummary();
    }));
}

// Lógica para os botões de "Adicionar rápido" (abrir detalhes)
const quickAddBtns = document.querySelectorAll('.add-to-cart');
const productDetailSection = document.getElementById('product-detail');

quickAddBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.product-card');
        if (!card || !productDetailSection) return;

        // Extrai dados do card
        const name = card.querySelector('h3').textContent;
        const priceStr = card.querySelector('.price').textContent;
        const frontImg = card.querySelector('.img-front').getAttribute('src');
        
        // Deriva imagem de costas (substituindo FRENTE por COSTAS)
        const backImg = frontImg.replace('FRENTE', 'COSTAS');

        // Popula a seção de detalhes
        productDetailSection.querySelector('.detail-title').textContent = name;
        productDetailSection.querySelector('.detail-price').textContent = priceStr;
        
        const detailFront = productDetailSection.querySelector('.detail-image-front');
        const detailBack = productDetailSection.querySelector('.detail-image-back');
        
        detailFront.src = frontImg;
        detailFront.alt = `${name} (Frente)`;
        detailBack.src = backImg;
        detailBack.alt = `${name} (Costas)`;

        // Resetar galeria para mostrar a frente por padrão
        detailFront.classList.add('is-active');
        detailBack.classList.remove('is-active');
        const dots = productDetailSection.querySelectorAll('.detail-dot');
        dots.forEach(d => d.classList.remove('active'));
        productDetailSection.querySelector('.dot-front')?.classList.add('active');

        // Mostrar a seção e scroll
        productDetailSection.classList.remove('hidden');
        productDetailSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// Seleciona apenas os botões que realmente adicionam ao carrinho (CTA de compra)
const botoesComprar = document.querySelectorAll('.cta-buy');
botoesComprar.forEach((botao) => {
    botao.addEventListener('click', (e) => {
        var _a, _b, _c;
        e.preventDefault();
        const card = botao.closest('.product-detail');
        if (!card) return;
        
        const name = ((_a = card.querySelector('.detail-title')) === null || _a === void 0 ? void 0 : _a.textContent) || 'Produto';
        const priceStr = ((_b = card.querySelector('.detail-price')) === null || _b === void 0 ? void 0 : _b.textContent) || '0';
        const price = parseFloat(priceStr.replace('R$', '').replace(',', '.').trim());
        const image = ((_c = card.querySelector('.detail-image-front')) === null || _c === void 0 ? void 0 : _c.getAttribute('src')) || '';
        
        // Busca o tamanho selecionado
        let size = 'M'; // Padrão
        const selectedSize = card.querySelector('.size-option.selected');
        if (selectedSize) {
            size = selectedSize.textContent || 'M';
        }
        
        const existingItem = cart.find(item => item.name === name && item.size === size);
        if (existingItem) {
            existingItem.quantity++;
        }
        else {
            cart.push({ name, price, image, size, quantity: 1 });
        }
        
        atualizarInterface();
        alert("Produto adicionado ao carrinho!");
    });
});
// Lógica para abrir a barra lateral (menu mobile) ao clicar na logo
const logoImg = document.querySelector('.logo-img');
const mainNavMobile = document.getElementById('main-nav-mobile');
const closeNavMobile = document.getElementById('close-nav-mobile');

if (logoImg && mainNavMobile) {
    logoImg.addEventListener('click', (e) => {
        e.stopPropagation();
        mainNavMobile.classList.add('active');
    });
}

if (closeNavMobile && mainNavMobile) {
    closeNavMobile.addEventListener('click', () => {
        mainNavMobile.classList.remove('active');
    });
}

// Fechar menu mobile ao clicar em um link
const mobileLinks = mainNavMobile?.querySelectorAll('a');
mobileLinks?.forEach(link => {
    link.addEventListener('click', () => {
        mainNavMobile?.classList.remove('active');
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
// Lógica do Carrinho (Modal)
const cartBtn = document.getElementById('cart-btn');
const closeCartModal = document.getElementById('close-cart-modal');
const cartModal = document.getElementById('cart-modal');
const checkoutBtn = document.getElementById('checkout-btn');

if (cartBtn && cartModal) {
    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.classList.add('active');
    });
}

if (closeCartModal && cartModal) {
    closeCartModal.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const isPageInAdmin = window.location.pathname.includes('/admin/');
        window.location.href = isPageInAdmin ? '../carrinho.html' : 'carrinho.html';
    });
}

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('active');
    }
});

const searchInput = document.getElementById('search-input');
const searchBtn = document.querySelector('.search-btn');

if (searchBtn && searchInput) {
    const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/produto?search=${encodeURIComponent(query)}#catalogo`;
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
// Seletores de Elementos
const authModal = document.getElementById('auth-modal');
const loginBtns = document.querySelectorAll('.header-link-login'); // Todos os botões que abrem o login
const registerBtns = document.querySelectorAll('#open-register'); // Botões que abrem o cadastro
const closeModal = document.getElementById('close-modal');
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

// Função para abrir o modal em uma aba específica
const openAuthModal = (tab = 'login') => {
    if (!authModal) return;
    authModal.style.display = 'flex';
    
    // Alterna para a aba correta
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    authForms.forEach(form => {
        if (form.id === `${tab}-form`) {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    });
};

// 1. Abrir Modal via botões de Login
loginBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('login');
    });
});

// Abrir Modal via botões de Cadastro
registerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('register');
    });
});

// 2. Fechar Modal (No X ou clicando fora)
closeModal === null || closeModal === void 0 ? void 0 : closeModal.addEventListener('click', () => {
    if (authModal) authModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.style.display = 'none';
    }
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

// Lógica do Dropdown de Usuário
const userBtns = document.querySelectorAll('.user-btn');
userBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Fecha outros dropdowns se houver
        userBtns.forEach(otherBtn => {
            if (otherBtn !== btn) otherBtn.classList.remove('active');
        });
        btn.classList.toggle('active');
    });
});

// Fechar dropdown ao clicar fora
window.addEventListener('click', (e) => {
    userBtns.forEach(btn => {
        if (!btn.contains(e.target)) {
            btn.classList.remove('active');
        }
    });
});

// Lógica do Carrossel de Produtos com Autoplay e Efeito 3D
const carouselTracks = document.querySelectorAll('.carousel-track');
carouselTracks.forEach(track => {
    const prevBtn = track.parentElement.querySelector('.carousel-arrow.prev');
    const nextBtn = track.parentElement.querySelector('.carousel-arrow.next');
    const cards = Array.from(track.querySelectorAll('.product-card'));
    let currentIndex = 0;
    let autoplayInterval;

    const updateCarousel = () => {
        cards.forEach((card, index) => {
            card.classList.remove('is-center', 'is-near', 'is-far');
            
            if (index === currentIndex) {
                card.classList.add('is-center');
            } else if (index === (currentIndex + 1) % cards.length || index === (currentIndex - 1 + cards.length) % cards.length) {
                card.classList.add('is-near');
            } else {
                card.classList.add('is-far');
            }
        });

        // Scroll para o card central
        const cardWidth = cards[0].offsetWidth + 12; // card + gap
        const offset = currentIndex * cardWidth - (track.clientWidth / 2) + (cards[0].offsetWidth / 2);
        track.scrollTo({ left: offset, behavior: 'smooth' });
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    };

    const startAutoplay = () => {
        stopAutoplay();
        autoplayInterval = setInterval(nextSlide, 3000);
    };

    const stopAutoplay = () => {
        clearInterval(autoplayInterval);
    };

    if (prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            nextSlide();
            startAutoplay();
        });
        
        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            prevSlide();
            startAutoplay();
        });
    }

    // Eventos de mouse
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Inicialização
    if (cards.length > 0) {
        // Garantir que os 5 produtos apareçam bem no carrossel
        // O CSS já define a largura para 5 itens, mas vamos garantir que o track possa scrollar
        updateCarousel();
        startAutoplay();
    }
});

// Lógica da Galeria de Detalhes do Produto (Frente/Costas)
const detailDots = document.querySelectorAll('.detail-dot');
const detailImages = document.querySelectorAll('.detail-image');

detailDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const isBack = dot.classList.contains('dot-back');
        
        // Atualiza dots
        detailDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        
        // Atualiza imagens
        detailImages.forEach(img => {
            img.classList.remove('is-active');
            if (isBack && img.classList.contains('detail-image-back')) {
                img.classList.add('is-active');
            } else if (!isBack && img.classList.contains('detail-image-front')) {
                img.classList.add('is-active');
            }
        });
    });
});

// Lógica de Seleção de Tamanho
const sizeOptions = document.querySelectorAll('.size-option');
sizeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const parent = option.parentElement;
        parent.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
    });
});

//# sourceMappingURL=main.js.map