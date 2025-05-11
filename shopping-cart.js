  // Cart Data
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // DOM Elements
  const cartBtn = document.getElementById('cart-btn');
  const cartModal = document.getElementById('cart-modal');
  const closeBtn = document.querySelector('.close-btn');
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTotal = document.getElementById('cart-total');
  
  // Add to Cart
  function addToCart(e) {
    const productId = parseInt(e.currentTarget.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCart();
    showCartNotification();
  }
  
  // Update Cart
  function updateCart() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartSubtotal.textContent = '$0.00';
        cartTotal.textContent = '$0.00';
    } else {
        let subtotal = 0;
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
        cartItem.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-actions">
                <div class="quantity-control">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <span class="remove-item" data-id="${item.id}">Remove</span>
                </div>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });

          // Add click event to show product view
    cartItems.addEventListener('click', (e) => {
      const cartItemElement = e.target.closest('.cart-item');
      if (cartItemElement) {
      const productId = parseInt(cartItemElement.querySelector('.quantity-btn.minus').getAttribute('data-id'));
      const product = products.find(p => p.id === productId);
      if (product) {
        closeCartModal(); // Close the cart modal
        showProductView(product); // Open the product view modal
      }
      }
    });
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', decreaseQuantity);
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', increaseQuantity);
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeItem);
        });
        
        const shipping = 0.00;
        const total = subtotal + shipping;
        
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    updateCartCount();
  }
  
  // Update Cart Count
  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
  }
  
  // Decrease Quantity
  function decreaseQuantity(e) {
    const productId = parseInt(e.currentTarget.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    if (item.quantity > 1) {
        item.quantity -= 1;
    } else {
        cart = cart.filter(item => item.id !== productId);
    }
    
    saveCart();
    updateCart();
  }
  
  // Increase Quantity
  function increaseQuantity(e) {
    const productId = parseInt(e.currentTarget.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    item.quantity += 1;
    saveCart();
    updateCart();
  }
  
  // Remove Item
  function removeItem(e) {
    const productId = parseInt(e.currentTarget.getAttribute('data-id'));
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
  }
  
  // Show cart notification
  function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = 'Item added to cart!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
  }
  
  // Save Cart to LocalStorage
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  
  // Open Cart Modal
  function openCartModal(e) {
    e.preventDefault();
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  
  // Close Cart Modal
  function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  // Initialize the App
  function init() {
    // Update cart and wishlist from localStorage
    updateCart();
    updateCartCount();
    
    cartBtn.addEventListener('click', openCartModal);
    closeBtn.addEventListener('click', closeCartModal);
          
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) closeCartModal();
    });
  }
  
  // Initialize the app when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);