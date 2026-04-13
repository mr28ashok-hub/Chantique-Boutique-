const defaultProducts = [
  {
    id: 1,
    name: "Classic Kurung",
    category: "Kurung",
    price: 120,
    image: "images/kurung.png",
    description: "Elegant classic kurung suitable for festive and formal events.",
    size: "S, M, L"
  },
  {
    id: 2,
    name: "Traditional Saree",
    category: "Saree",
    price: 150,
    image: "images/saree.png",
    description: "Beautiful traditional saree with premium fabric.",
    size: "Free Size"
  },
  {
    id: 3,
    name: "Modern Dress",
    category: "Dress",
    price: 99,
    image: "images/dress.png",
    description: "Stylish modern dress for casual wear.",
    size: "M, L"
  },
  {
    id: 4,
    name: "Luxury Handbag",
    category: "Accessories",
    price: 80,
    image: "images/bag.jpg",
    description: "Trendy handbag to complete your outfit.",
    size: "Standard"
  }
];

// Function to display featured products on index.html
function loadFeaturedProducts() {
  const featuredContainer = document.getElementById('featuredProducts');
  const featured = defaultProducts.slice(0, 3); // Show first 3 products as featured
  featuredContainer.innerHTML = featured.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
      <h3>${product.name}</h3>
      <p>RM ${product.price}</p>
      <button onclick="viewProduct(${product.id})">View Details</button>
    </div>
  `).join('');
  updateCartNav();
}

// Function to display all products on products.html
function loadProductsPage() {
  const container = document.getElementById('productsContainer');
  const filter = document.getElementById('categoryFilter').value;
  const filteredProducts = filter === 'All' ? defaultProducts : defaultProducts.filter(p => p.category === filter);
  container.innerHTML = filteredProducts.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
      <h3>${product.name}</h3>
      <p>RM ${product.price}</p>
      <button onclick="viewProduct(${product.id})">View Details</button>
    </div>
  `).join('');
  updateCartNav();
}

// Function to view product details
function viewProduct(id) {
  const product = defaultProducts.find(p => p.id === id);
  if (product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    window.location.href = 'product-details.html';
  }
}

// Function to load product details on product-details.html
function loadProductDetails() {
  const product = JSON.parse(localStorage.getItem('selectedProduct'));
  if (product) {
    const container = document.getElementById('productDetailsContainer');
    const sizeOptions = product.size === 'Free Size' ? ['Free Size'] : product.size.split(', ');
    const sizeSelect = sizeOptions.length > 1 ? 
      `<label for="sizeSelect">Size:</label>
       <select id="sizeSelect">
         ${sizeOptions.map(size => `<option value="${size.trim()}">${size.trim()}</option>`).join('')}
       </select>` : 
      `<p><strong>Size:</strong> ${product.size}</p>`;
    
    container.innerHTML = `
      <div class="product-details">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
        <h2>${product.name}</h2>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Price:</strong> RM ${product.price}</p>
        <p><strong>Description:</strong> ${product.description}</p>
        ${sizeSelect}
        <button onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    `;
  }
  updateCartNav();
}

// Function to add product to cart
function addToCart(id) {
  const product = defaultProducts.find(p => p.id === id);
  if (product) {
    const selectedSize = product.size === 'Free Size' ? 'Free Size' : document.getElementById('sizeSelect').value;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === id && item.selectedSize === selectedSize);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, selectedSize });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${product.name} (Size: ${selectedSize}) to cart!`);
    updateCartNav();
  }
}

// Function to load and display cart items
function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartContainer = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    cartTotal.textContent = 'Total: RM 0.00';
    return;
  }
  
  let total = 0;
  cartContainer.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px;">
        <div>
          <h4>${item.name} (${item.selectedSize})</h4>
          <p>RM ${item.price} x ${item.quantity} = RM ${itemTotal}</p>
          <button onclick="updateQuantity(${item.id}, '${item.selectedSize}', ${item.quantity - 1})">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, '${item.selectedSize}', ${item.quantity + 1})">+</button>
          <button onclick="removeFromCart(${item.id}, '${item.selectedSize}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');
  
  cartTotal.textContent = `Total: RM ${total.toFixed(2)}`;
  updateCartNav();
}

// Function to update quantity
function updateQuantity(id, selectedSize, newQuantity) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(item => item.id === id && item.selectedSize === selectedSize);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(id, selectedSize);
    } else {
      item.quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      loadCart();
    }
  }
}

// Function to remove item from cart
function removeFromCart(id, selectedSize) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => !(item.id === id && item.selectedSize === selectedSize));
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

// Function to update cart count and total in navigation
function updateCartNav() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotalNav');
  if (countEl) countEl.textContent = count;
  if (totalEl) totalEl.textContent = total.toFixed(2);
}

// Function to validate checkout form
function validateCheckoutForm() {
  const name = document.getElementById('customerName').value;
  const email = document.getElementById('customerEmail').value;
  const address = document.getElementById('customerAddress').value;
  const payment = document.getElementById('paymentInfo').value;
  const message = document.getElementById('formMessage');
  
  if (!name || !email || !address || !payment) {
    message.textContent = 'Please fill in all fields.';
    message.style.color = 'red';
    return false;
  }
  
  message.textContent = 'Order placed successfully! Thank you for shopping with us.';
  message.style.color = 'green';
  
  // Clear cart after successful order
  localStorage.removeItem('cart');
  loadCart();
  updateCartNav();
  
  return false; // Prevent form submission
}

// Function to load admin products (placeholder)
function loadAdminProducts() {
  // Placeholder for admin functionality
  updateCartNav();
}