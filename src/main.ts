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