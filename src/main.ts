// src/main.ts

interface CartItem {
    name: string;
    price: number;
    image: string;
    size: string;
    quantity: number;
}

let cart: CartItem[] = JSON.parse(localStorage.getItem('strong_cart') || '[]');
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

function renderCartItems(container: Element) {
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
        (summaryRows[0] as HTMLElement).innerText = `R$ ${subtotal.toFixed(2)}`;
    }
    if (totalRow) {
        (totalRow as HTMLElement).innerText = `R$ ${subtotal.toFixed(2)}`;
    }

    // Atualiza elementos da página de checkout e frete
    const checkoutSubtotal = document.getElementById('summary-subtotal');
    const checkoutTotal = document.getElementById('summary-total');
    const checkoutDiscount = document.getElementById('summary-discount');
    const checkoutShipping = document.querySelector('.summary-frete');

    if (checkoutSubtotal) {
        (checkoutSubtotal as HTMLElement).innerText = `R$ ${subtotal.toFixed(2)}`;
    }

    // Lógica específica para página de frete
    let shippingValue = 0;
    let discountValue = 0;

    if (document.body.classList.contains('frete-page')) {
        const selectedRadio = document.querySelector('.shipping-option input[type="radio"]:checked') as HTMLInputElement;
        if (selectedRadio) {
            const container = selectedRadio.closest('.shipping-option');
            const priceEl = container?.querySelector('.ship-price');
            if (priceEl) {
                const priceTxt = priceEl.textContent?.replace('R$', '').replace(',', '.').trim() || '0';
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
        (checkoutShipping as HTMLElement).innerText = `R$ ${shippingValue.toFixed(2).replace('.', ',')}`;
    }
    if (checkoutDiscount) {
        (checkoutDiscount as HTMLElement).innerText = discountValue > 0 ? `- R$ ${discountValue.toFixed(2).replace('.', ',')}` : '—';
    }
    if (checkoutTotal) {
        const finalTotal = subtotal + shippingValue - discountValue;
        (checkoutTotal as HTMLElement).innerText = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
    }
}

// @ts-ignore
window.updateQuantity = (index: number, delta: number) => {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    atualizarInterface();
};

// @ts-ignore
window.removeFromCart = (index: number) => {
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

// Lógica para seleção de tamanho
const sizeOptions = document.querySelectorAll('.size-option');
sizeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        sizeOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
    });
});

// Seleciona todos os botões de adicionar
const botoesAdicionar = Array.from(document.querySelectorAll('.add-to-cart, .cta-buy')).filter((b) => {
    const isLink = b.tagName.toLowerCase() === 'a';
    const isCarousel = b.closest('.products-carousel');
    return !isLink && !isCarousel;
});

botoesAdicionar.forEach((botao) => {
    botao.addEventListener('click', (e) => {
        e.preventDefault();
        
        const card = botao.closest('.product-card') || (botao.closest('.product-detail') as HTMLElement);
        if (!card) return;

        const name = card.querySelector('h3, .detail-title')?.textContent || 'Produto';
        const priceStr = card.querySelector('.price, .detail-price')?.textContent || '0';
        const price = parseFloat(priceStr.replace('R$', '').replace(',', '.').trim());
        const image = card.querySelector('img')?.getAttribute('src') || '';
        
        // Busca o tamanho selecionado
        let size = 'M'; // Padrão
        const selectedSize = card.querySelector('.size-option.selected');
        if (selectedSize) {
            size = selectedSize.textContent || 'M';
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
// Lógica para abrir a barra lateral (menu mobile) ao clicar na logo
const logoImg = document.querySelector('.logo-img');
const mainNavMobile = document.getElementById('main-nav-mobile');
if (logoImg && mainNavMobile) {
    logoImg.addEventListener('click', (e) => {
        e.stopPropagation();
        mainNavMobile.classList.add('active');
    });
}

// Efeito de mudar o header no scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header?.classList.add('scroll-active');
    } else {
        header?.classList.remove('scroll-active');
    }
});
const searchInput = document.getElementById('search-input') as HTMLInputElement;

searchInput?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        console.log("Buscando por:", searchInput.value);
        // Aqui integraremos a lógica de filtro de produtos no futuro
    }
});
// Seletores de Elementos
const authModal = document.getElementById('auth-modal') as HTMLElement;
const loginBtn = document.querySelector('.header-link-login'); // Link que abre a modal
const closeModal = document.getElementById('close-modal');
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

// 1. Abrir Modal
loginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (authModal) authModal.style.display = 'flex';
});

// 2. Fechar Modal (No X ou clicando fora)
closeModal?.addEventListener('click', () => authModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === authModal) authModal.style.display = 'none';
});

// 3. Alternar entre Login e Cadastro
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        
        // Remove active de todos
        tabBtns.forEach(b => b.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));
        
        // Adiciona active no clicado
        btn.classList.add('active');
        document.getElementById(`${tab}-form`)?.classList.add('active');
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
        item?.classList.toggle('active');
    });
});
const filterSelect = document.getElementById('sort-products') as HTMLSelectElement;

filterSelect?.addEventListener('change', () => {
    const selectedValue = filterSelect.value;
    console.log(`Filtrando por: ${selectedValue}`);
    
});

loginBtn?.addEventListener('click', (e) => {
    e.preventDefault(); // Evita qualquer comportamento padrão
    if (authModal) authModal.style.display = 'flex';
});