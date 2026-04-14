const defaultProducts = [
  {
    id: 1,
    name: "Classic Kurung",
    category: "Kurung",
    price: 120,
    image: "images/kurung.png",
    description: "Elegant classic kurung suitable for festive and formal events.",
    size: "S, M, L",
    stock: 5
  },
  {
    id: 2,
    name: "Traditional Saree",
    category: "Saree",
    price: 150,
    image: "images/saree.png",
    description: "Beautiful traditional saree with premium fabric.",
    size: "Free Size",
    stock: 3
  },
  {
    id: 3,
    name: "Modern Dress",
    category: "Dress",
    price: 99,
    image: "images/dress.png",
    description: "Stylish modern dress for casual wear.",
    size: "M, L",
    stock: 7
  },
  {
    id: 4,
    name: "Luxury Handbag",
    category: "Accessories",
    price: 80,
    image: "images/bag.jpg",
    description: "Trendy handbag to complete your outfit.",
    size: "Standard",
    stock: 2
  }
];

function getProducts() {
  let products = JSON.parse(localStorage.getItem('products'));
  if (!Array.isArray(products) || products.length === 0) {
    products = [...defaultProducts];
  }
  products = products.map(product => ({
    stock: product.stock != null ? product.stock : 0,
    ...product
  }));
  localStorage.setItem('products', JSON.stringify(products));
  return products;
}

function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

// Function to display featured products on index.html
function loadFeaturedProducts() {
  const featuredContainer = document.getElementById('featuredProducts');
  const featured = getProducts().slice(0, 3); // Show first 3 products as featured
  featuredContainer.innerHTML = featured.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
      <h3>${product.name}</h3>
      <p>RM ${product.price}</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <button onclick="viewProduct(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
        ${product.stock === 0 ? 'Out of Stock' : 'View Details'}
      </button>
    </div>
  `).join('');
  updateCartNav();
}

// Function to display all products on products.html
function loadProductsPage() {
  const container = document.getElementById('productsContainer');
  const filter = document.getElementById('categoryFilter').value;
  const products = getProducts();
  const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);
  container.innerHTML = filteredProducts.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
      <h3>${product.name}</h3>
      <p>RM ${product.price}</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <button onclick="viewProduct(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
        ${product.stock === 0 ? 'Out of Stock' : 'View Details'}
      </button>
    </div>
  `).join('');
  updateCartNav();
}

// Function to view product details
function viewProduct(id) {
  const product = getProducts().find(p => p.id === id);
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
    
    const outOfStock = product.stock === 0;
    container.innerHTML = `
      <div class="product-details">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
        <h2>${product.name}</h2>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Price:</strong> RM ${product.price}</p>
        <p><strong>Stock:</strong> ${product.stock}</p>
        <p><strong>Description:</strong> ${product.description}</p>
        ${sizeSelect}
        <button onclick="addToCart(${product.id})" ${outOfStock ? 'disabled' : ''}>
          ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    `;
  }
  updateCartNav();
}

// Function to add product to cart
function addToCart(id) {
  const product = getProducts().find(p => p.id === id);
  if (product) {
    if (product.stock === 0) {
      alert('Sorry, this item is out of stock.');
      return;
    }
    const selectedSize = product.size === 'Free Size' ? 'Free Size' : document.getElementById('sizeSelect').value;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === id && item.selectedSize === selectedSize);
    const desiredQuantity = existingItem ? existingItem.quantity + 1 : 1;
    if (desiredQuantity > product.stock) {
      alert(`Cannot add more than ${product.stock} item(s) for this product.`);
      return;
    }
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
  const product = getProducts().find(p => p.id === id);
  if (item && product) {
    if (newQuantity <= 0) {
      removeFromCart(id, selectedSize);
    } else if (newQuantity > product.stock) {
      alert(`There are only ${product.stock} item(s) available for this product.`);
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

// Function to load and display admin inventory
function loadAdminProducts() {
  const products = getProducts();
  const adminContainer = document.getElementById('adminProducts');
  if (!adminContainer) return;
  if (products.length === 0) {
    adminContainer.innerHTML = '<p>No products available.</p>';
  } else {
    adminContainer.innerHTML = products.map(product => `
      <div class="inventory-item">
        <div class="inventory-item-top">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
          <div>
            <h4>${product.name}</h4>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> RM ${product.price.toFixed(2)}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <p><strong>Size:</strong> ${product.size}</p>
          </div>
        </div>
        <div class="inventory-actions">
          <button class="admin-action-btn" onclick="changeStock(${product.id}, -1)">- Stock</button>
          <button class="admin-action-btn" onclick="changeStock(${product.id}, 1)">+ Stock</button>
          <button class="admin-action-btn delete-btn" onclick="deleteProduct(${product.id})">Delete Product</button>
        </div>
      </div>
    `).join('');
  }
  updateCartNav();
}

function addProduct() {
  const name = document.getElementById('productName').value.trim();
  const category = document.getElementById('productCategory').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const imageFile = document.getElementById('productImageFile').files[0];
  const description = document.getElementById('productDescription').value.trim();
  const size = document.getElementById('productSize').value.trim();
  const stock = parseInt(document.getElementById('productStock').value, 10);
  const message = document.getElementById('adminMessage');

  if (!name || !category || isNaN(price) || price <= 0 || !description || !size || isNaN(stock) || stock < 0) {
    message.textContent = 'Please fill in all product fields and enter a valid stock number.';
    message.style.color = 'red';
    return false;
  }

  const products = getProducts();
  const nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = {
    id: nextId,
    name,
    category,
    price,
    image: 'images/placeholder.png',
    description,
    size,
    stock
  };

  function saveNewProduct(imageData) {
    newProduct.image = imageData || newProduct.image;
    products.push(newProduct);
    saveProducts(products);
    message.textContent = 'Product added successfully.';
    message.style.color = 'green';
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productImageFile').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productSize').value = '';
    document.getElementById('productStock').value = '';
    loadAdminProducts();
  }

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
      saveNewProduct(event.target.result);
    };
    reader.readAsDataURL(imageFile);
  } else {
    saveNewProduct(null);
  }

  return false;
}

function changeStock(id, delta) {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;
  const newStock = product.stock + delta;
  if (newStock < 0) {
    alert('Stock cannot go below zero.');
    return;
  }
  product.stock = newStock;
  saveProducts(products);
  loadAdminProducts();
}

function deleteProduct(id) {
  if (!confirm('Delete this product from inventory?')) return;
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
  loadAdminProducts();
}