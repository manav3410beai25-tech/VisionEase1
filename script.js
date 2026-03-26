document.addEventListener('DOMContentLoaded', () => {
    // Reveal Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.querySelectorAll('.hover-trigger, a, button').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
            });
        });
    }

    // Hero video playback handling
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.play().catch(error => {
            console.log("Autoplay was prevented by browser:", error);
        });
    }

    // --- Cart Logic ---
    let cart = JSON.parse(localStorage.getItem('visionease_cart')) || [];

    function updateCartCount() {
        const cartBtns = document.querySelectorAll('.nav-btn');
        cartBtns.forEach(btn => {
            if (btn.textContent.includes('CART')) {
                const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
                btn.textContent = `CART (${totalQty})`;
            }
        });
    }

    function addToCart(name, price, image) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }
        localStorage.setItem('visionease_cart', JSON.stringify(cart));
        updateCartCount();
        
        // Show feedback inside view-btn
        const buttons = document.querySelectorAll('.view-btn');
        buttons.forEach(btn => {
            const gridItem = btn.closest('.grid-item');
            if (gridItem) {
                const gridName = gridItem.querySelector('h3').textContent;
                if (gridName === name && btn.textContent === 'ADD TO CART') {
                    btn.textContent = 'ADDED!';
                    btn.style.background = 'var(--sage)';
                    btn.style.color = '#fff';
                    setTimeout(() => {
                        btn.textContent = 'ADD TO CART';
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 2000);
                }
            }
        });
    }

    document.querySelectorAll('.view-btn').forEach(btn => {
        if (btn.textContent === 'ADD TO CART') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const gridItem = btn.closest('.grid-item');
                if (gridItem) {
                    const name = gridItem.querySelector('h3').textContent;
                    const priceText = gridItem.querySelector('p').textContent;
                    const price = parseFloat(priceText.replace('$', ''));
                    const img = gridItem.querySelector('img');
                    
                    // Capture computed styles like filters if present to replicate in cart
                    let computedFilter = 'none';
                    if (img.style.filter) {
                        computedFilter = img.style.filter;
                    }

                    const imageStyle = computedFilter !== 'none' ? `filter:${computedFilter};` : '';
                    const image = img.src;
                    
                    cart.push({ name, price, image, quantity: 1, style: imageStyle });
                    // Remove duplicate pushes
                    cart.pop();
                    
                    // Call addToCart which handles duplicate check correctly
                    // Pass image and a dummy wrapper with filter state if we want, but straightforward src is fine if style not strictly complex
                    
                    const existingItem = cart.find(item => item.name === name);
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        cart.push({ name, price, image, quantity: 1, style: imageStyle });
                    }
                    localStorage.setItem('visionease_cart', JSON.stringify(cart));
                    updateCartCount();
                    
                    btn.textContent = 'ADDED!';
                    btn.style.background = 'var(--sage)';
                    btn.style.color = '#fff';
                    setTimeout(() => {
                        btn.textContent = 'ADD TO CART';
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 2000);
                }
            });
        }
    });

    // cart.html render logic
    function renderCart() {
        const cartContainer = document.getElementById('cart-items-container');
        if (!cartContainer) return;
        
        if (cart.length === 0) {
            cartContainer.innerHTML = '<div style="text-align:center; padding: 40px; font-size: 1.5rem;">Your cart is empty.</div>';
            const totalContainer = document.getElementById('cart-total-container');
            if (totalContainer) totalContainer.style.display = 'none';
            return;
        }

        let html = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const extraStyle = item.style ? item.style : '';
            html += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 20px; margin-bottom: 20px;">
              <div style="display: flex; gap: 20px; align-items: center;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; ${extraStyle}">
                <div>
                  <h3 style="font-family: var(--font-anton); font-size: 1.5rem; letter-spacing: 0.05em;">${item.name}</h3>
                  <p style="color: var(--sage);">Quantity: ${item.quantity}</p>
                </div>
              </div>
              <div style="font-weight: 600; font-size: 1.2rem;">$${itemTotal.toFixed(2)}</div>
            </div>
            `;
        });

        cartContainer.innerHTML = html;
        
        const totalEl = document.getElementById('cart-total-amount');
        if (totalEl) {
            totalEl.textContent = `$${total.toFixed(2)}`;
        }
    }

    updateCartCount();
    renderCart();

});
