"use strict";
// src/main.ts
let totalCarrinho = 0;
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
        header === null || header === void 0 ? void 0 : header.classList.add('scroll-active');
    }
    else {
        header === null || header === void 0 ? void 0 : header.classList.remove('scroll-active');
    }
});
const searchInput = document.getElementById('search-input');
searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        console.log("Buscando por:", searchInput.value);
        // Aqui integraremos a lógica de filtro de produtos no futuro
    }
});
//# sourceMappingURL=main.js.map