const products = [
    {
        id: 1,
        name: "Camiseta Oversized Strong",
        price: 89.90,
        featured: true,
        // Ajustado para sua pasta real 'img/produtos'
        image: "URSO-FRENTE-PRETO.jpeg", 
        category: "Streetwear"
    }
];

function renderProducts(productsList) {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    grid.innerHTML = productsList.map(product => `
        <div class="product-card">
            <div class="product-thumb">
                <img src="assets/img/produtos/${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                <button class="btn-buy" onclick="addToCart(${product.id})">COMPRAR</button>
            </div>
        </div>
    `).join('');
}