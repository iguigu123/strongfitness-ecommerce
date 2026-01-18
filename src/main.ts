// src/main.ts

// Interface para definir o que é um Produto (Boa prática de Programador Sênior)
interface Produto {
    nome: string;
    preco: number;
}

let totalCarrinho: number = 0;
const cartCountElement = document.getElementById('cart-count');

// Seleciona todos os botões de adicionar
const botoesAdicionar = document.querySelectorAll('.add-to-cart');

botoesAdicionar.forEach((botao) => {
    botao.addEventListener('click', () => {
        totalCarrinho++;
        atualizarInterface();
        alert("Produto adicionado ao drop!");
    });
});

function atualizarInterface() {
    if (cartCountElement) {
        cartCountElement.innerText = totalCarrinho.toString();
    }
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