
/* Aurelle Studio storefront interactions — demo/localStorage edition */
(() => {
  "use strict";

  const PRODUCTS = [
    {
      id: "linen-midi-dress", name: "The Linen Midi Dress", category: "Dresses",
      price: 18500, color: "Natural", tag: "Bestseller",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
      description: "An effortless midi dress with a soft drape and considered details. Designed to move easily from slow mornings to evening plans."
    },
    {
      id: "structured-tote", name: "The Everyday Tote", category: "Accessories",
      price: 12500, color: "Espresso", tag: "Essential",
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
      description: "A refined everyday carryall with a clean silhouette and room for the things you take everywhere."
    },
    {
      id: "soft-knit-top", name: "The Soft Knit Top", category: "Tops",
      price: 9800, color: "Oat", tag: "",
      image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=85",
      description: "A versatile knit with a gentle hand-feel, easy proportions, and a timeless finish."
    },
    {
      id: "tailored-trousers", name: "The Tailored Trouser", category: "Bottoms",
      price: 16500, color: "Stone", tag: "New",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85",
      description: "A polished wardrobe staple with a relaxed tailored shape, made for repeat wear."
    },
    {
      id: "weekend-shirt", name: "The Weekend Shirt", category: "Tops",
      price: 11200, color: "Ivory", tag: "",
      image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=85",
      description: "An easy button-up that layers beautifully and works just as well on its own."
    },
    {
      id: "minimal-shoulder-bag", name: "The Shoulder Bag", category: "Accessories",
      price: 14900, color: "Cocoa", tag: "",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
      description: "A compact, considered silhouette for daily essentials and understated finishing."
    },
    {
      id: "classic-wrap-dress", name: "The Wrap Dress", category: "Dresses",
      price: 19900, color: "Clay", tag: "",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
      description: "A flattering wrap silhouette with a fluid line and thoughtful versatility."
    },
    {
      id: "everyday-flats", name: "The Everyday Flat", category: "Shoes",
      price: 13500, color: "Tan", tag: "",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85",
      description: "A simple finishing touch designed to complement the pieces already in your wardrobe."
    }
  ];

  const KEYS = {
    cart: "aurelle.storefront.cart",
    wishlist: "aurelle.storefront.wishlist",
    orders: "aurelle.storefront.demo-orders"
  };

  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = value => new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", maximumFractionDigits: 0
  }).format(Number(value) || 0);
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const getProduct = id => PRODUCTS.find(product => product.id === id);
  const cart = () => read(KEYS.cart, []);
  const wishlist = () => read(KEYS.wishlist, []);
  const cartCount = () => cart().reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = () => cart().reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  function toast(message, type = "success") {
    let element = document.querySelector(".toast");
    if (!element) {
      element = document.createElement("div");
      element.className = "toast";
      element.setAttribute("role", "status");
      element.setAttribute("aria-live", "polite");
      document.body.appendChild(element);
    }
    element.textContent = message;
    element.className = `toast show ${type}`;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove("show"), 2800);
  }

  function updateHeader() {
    document.querySelectorAll("[data-cart-count]").forEach(node => node.textContent = cartCount());
    document.querySelectorAll("[data-wishlist-count]").forEach(node => node.textContent = wishlist().length);
  }

  function addToCart(id, quantity = 1, size = "One size") {
    if (!getProduct(id)) return toast("This product could not be found.", "error");
    const items = cart();
    const existing = items.find(item => item.id === id && item.size === size);
    if (existing) existing.quantity += quantity;
    else items.push({ id, quantity, size });
    write(KEYS.cart, items);
    updateHeader();
    toast("Added to your bag.");
  }

  function toggleWishlist(id) {
    if (!getProduct(id)) return;
    const items = wishlist();
    const exists = items.includes(id);
    write(KEYS.wishlist, exists ? items.filter(item => item !== id) : [...items, id]);
    updateHeader();
    renderWishlist();
    toast(exists ? "Removed from your wishlist." : "Saved to your wishlist.");
  }

  function productCard(product) {
    const saved = wishlist().includes(product.id);
    return `
      <article class="product-card">
        <div class="product-image">
          <a href="product-details.html?id=${encodeURIComponent(product.id)}" aria-label="View ${escapeHTML(product.name)}">
            <img loading="lazy" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
          </a>
          ${product.tag ? `<span class="product-tag">${escapeHTML(product.tag)}</span>` : ""}
          <button class="product-heart" type="button" data-wishlist="${escapeHTML(product.id)}"
            aria-label="${saved ? "Remove from" : "Add to"} wishlist" aria-pressed="${saved}">${saved ? "♥" : "♡"}</button>
        </div>
        <div class="product-info">
          <p>${escapeHTML(product.category)} · ${escapeHTML(product.color)}</p>
          <h3><a href="product-details.html?id=${encodeURIComponent(product.id)}">${escapeHTML(product.name)}</a></h3>
          <div class="product-price">${money(product.price)}</div>
        </div>
      </article>`;
  }

  function renderProductGrids() {
    document.querySelectorAll("[data-product-grid]").forEach(grid => {
      const category = grid.dataset.category || "";
      const query = (grid.dataset.query || "").toLowerCase();
      let products = PRODUCTS.filter(product =>
        (!category || product.category.toLowerCase() === category.toLowerCase()) &&
        (!query || `${product.name} ${product.category} ${product.color}`.toLowerCase().includes(query))
      );
      if (grid.dataset.limit) products = products.slice(0, Number(grid.dataset.limit));
      grid.innerHTML = products.length
        ? products.map(productCard).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><h2>No pieces found</h2><p>Try another search or browse the full collection.</p><a class="button secondary" href="shop.html">Browse shop</a></div>`;
    });
  }

  function renderProductDetail() {
    const host = document.querySelector("[data-product-detail]");
    if (!host) return;
    const id = new URLSearchParams(location.search).get("id") || PRODUCTS[0].id;
    const product = getProduct(id);
    if (!product) {
      host.innerHTML = `<div class="empty-state"><h2>Piece not found</h2><p>This product may no longer be available.</p><a class="button" href="shop.html">Return to shop</a></div>`;
      return;
    }
    document.title = `${product.name} | Aurelle Studio`;
    host.innerHTML = `
      <div class="product-detail-grid">
        <div class="product-gallery"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}"></div>
        <div class="product-copy">
          <span class="eyebrow">${escapeHTML(product.category)} / Aurelle Essentials</span>
          <h1>${escapeHTML(product.name)}</h1>
          <div class="price">${money(product.price)}</div>
          <p>${escapeHTML(product.description)}</p>
          <p>Thoughtfully selected for easy styling, repeat wear, and a wardrobe that feels like you.</p>
          <div class="option-row"><label>Colour</label><div>${escapeHTML(product.color)}</div></div>
          <div class="option-row"><label for="product-size">Size</label>
            <select id="product-size" class="search-input" aria-label="Select size">
              <option value="One size">One size</option><option value="XS">XS</option><option value="S">S</option>
              <option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
            </select>
          </div>
          <div class="option-row"><label>Quantity</label><div class="quantity-control">
            <button type="button" data-detail-qty="-1" aria-label="Decrease quantity">−</button>
            <span data-detail-quantity>1</span>
            <button type="button" data-detail-qty="1" aria-label="Increase quantity">+</button>
          </div></div>
          <button class="button full" type="button" data-add-product="${escapeHTML(product.id)}">Add to bag — ${money(product.price)}</button>
          <button class="button secondary full" style="margin-top:10px" type="button" data-wishlist="${escapeHTML(product.id)}">♡ Save to wishlist</button>
          <div class="notice">Need help choosing? Visit our <a class="text-link" href="contact.html">customer care</a> page.</div>
        </div>
      </div>`;
  }

  function renderCart() {
    const host = document.querySelector("[data-cart-items]");
    if (!host) return;
    const items = cart().filter(item => getProduct(item.id));
    if (!items.length) {
      host.innerHTML = `<div class="empty-state"><h2>Your bag is taking a break</h2><p>Discover pieces made to become part of your everyday.</p><a class="button" href="shop.html">Explore the collection</a></div>`;
    } else {
      host.innerHTML = items.map(item => {
        const product = getProduct(item.id);
        return `<article class="cart-item">
          <a href="product-details.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}"></a>
          <div><h3><a href="product-details.html?id=${encodeURIComponent(product.id)}">${escapeHTML(product.name)}</a></h3>
            <p>Colour: ${escapeHTML(product.color)} · Size: ${escapeHTML(item.size)}</p>
            <p>${money(product.price)} each</p>
            <div class="quantity-control"><button type="button" data-cart-qty="-1" data-id="${escapeHTML(item.id)}" data-size="${escapeHTML(item.size)}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-cart-qty="1" data-id="${escapeHTML(item.id)}" data-size="${escapeHTML(item.size)}" aria-label="Increase quantity">+</button></div>
            <br><button class="remove-item" type="button" data-remove-cart="${escapeHTML(item.id)}" data-size="${escapeHTML(item.size)}">Remove</button>
          </div><div class="item-total"><strong>${money(product.price * item.quantity)}</strong></div>
        </article>`;
      }).join("");
    }
    const total = subtotal();
    document.querySelectorAll("[data-subtotal]").forEach(node => node.textContent = money(total));
    document.querySelectorAll("[data-shipping]").forEach(node => node.textContent = total === 0 || total >= 50000 ? "Free" : money(2500));
    document.querySelectorAll("[data-total]").forEach(node => node.textContent = money(total === 0 ? 0 : total + (total >= 50000 ? 0 : 2500)));
    updateHeader();
  }

  function renderWishlist() {
    const host = document.querySelector("[data-wishlist-grid]");
    if (!host) return;
    const products = wishlist().map(getProduct).filter(Boolean);
    host.innerHTML = products.length ? products.map(productCard).join("") :
      `<div class="empty-state" style="grid-column:1/-1"><h2>Your wishlist is waiting</h2><p>Save the pieces you love and come back to them anytime on this device.</p><a class="button" href="shop.html">Discover the collection</a></div>`;
  }

  function renderOrderSummary() {
    const host = document.querySelector("[data-checkout-items]");
    if (!host) return;
    const items = cart().filter(item => getProduct(item.id));
    host.innerHTML = items.length ? items.map(item => {
      const product = getProduct(item.id);
      return `<div class="summary-line"><span>${escapeHTML(product.name)} × ${item.quantity}</span><strong>${money(product.price * item.quantity)}</strong></div>`;
    }).join("") : `<p>Your bag is empty. <a class="text-link" href="shop.html">Browse the shop</a></p>`;
    document.querySelectorAll("[data-subtotal]").forEach(node => node.textContent = money(subtotal()));
    document.querySelectorAll("[data-shipping]").forEach(node => node.textContent = subtotal() === 0 || subtotal() >= 50000 ? "Free" : money(2500));
    document.querySelectorAll("[data-total]").forEach(node => node.textContent = money(subtotal() === 0 ? 0 : subtotal() + (subtotal() >= 50000 ? 0 : 2500)));
    const button = document.querySelector("[data-place-order]");
    if (button) button.disabled = !items.length;
  }

  function renderTracking() {
    const form = document.querySelector("[data-tracking-form]");
    if (!form) return;
    form.addEventListener("submit", event => {
      event.preventDefault();
      const code = form.querySelector("input").value.trim();
      const result = document.querySelector("[data-tracking-result]");
      if (!code) return toast("Enter an order number to continue.", "error");
      const orders = read(KEYS.orders, []);
      const order = orders.find(item => item.id.toLowerCase() === code.toLowerCase());
      if (!order) {
        result.innerHTML = `<div class="notice">We couldn't find a demo order with that reference. If you placed an order through another channel, please <a class="text-link" href="contact.html">contact customer care</a>.</div>`;
        return;
      }
      result.innerHTML = `<div class="summary-card"><h2>Order ${escapeHTML(order.id)}</h2><p>Placed on ${escapeHTML(order.date)} · Status: <strong>${escapeHTML(order.status)}</strong></p><p>Order total: <strong>${money(order.total)}</strong></p><p>This is a locally stored demo order; live courier tracking is not connected.</p></div>`;
    });
  }

  function initMobileNav() {
    const toggle = document.querySelector("[data-mobile-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (toggle && nav) toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.addEventListener("click", event => {
    const wishlistButton = event.target.closest("[data-wishlist]");
    if (wishlistButton) {
      event.preventDefault();
      toggleWishlist(wishlistButton.dataset.wishlist);
      document.querySelectorAll(`[data-wishlist="${CSS.escape(wishlistButton.dataset.wishlist)}"]`).forEach(button => {
        const saved = wishlist().includes(button.dataset.wishlist);
        button.textContent = saved ? "♥" : "♡";
        button.setAttribute("aria-pressed", String(saved));
      });
      return;
    }

    const addButton = event.target.closest("[data-add-product]");
    if (addButton) {
      const quantity = Number(document.querySelector("[data-detail-quantity]")?.textContent || 1);
      const size = document.querySelector("#product-size")?.value || "One size";
      addToCart(addButton.dataset.addProduct, quantity, size);
      return;
    }

    const detailQty = event.target.closest("[data-detail-qty]");
    if (detailQty) {
      const display = document.querySelector("[data-detail-quantity]");
      const next = Math.max(1, Math.min(10, Number(display.textContent) + Number(detailQty.dataset.detailQty)));
      display.textContent = next;
      return;
    }

    const cartQty = event.target.closest("[data-cart-qty]");
    if (cartQty) {
      const items = cart();
      const item = items.find(row => row.id === cartQty.dataset.id && row.size === cartQty.dataset.size);
      if (item) item.quantity = Math.max(0, Math.min(10, item.quantity + Number(cartQty.dataset.cartQty)));
      write(KEYS.cart, items.filter(row => row.quantity > 0));
      renderCart();
      return;
    }

    const remove = event.target.closest("[data-remove-cart]");
    if (remove) {
      write(KEYS.cart, cart().filter(row => !(row.id === remove.dataset.removeCart && row.size === remove.dataset.size)));
      renderCart();
      toast("Item removed from your bag.");
    }
  });

  document.addEventListener("submit", event => {
    const newsletter = event.target.closest("[data-newsletter-form]");
    if (newsletter) {
      event.preventDefault();
      if (!newsletter.reportValidity()) return;
      toast("Thank you for joining Aurelle Studio.");
      newsletter.reset();
      return;
    }
    const contact = event.target.closest("[data-contact-form]");
    if (contact) {
      event.preventDefault();
      if (!contact.reportValidity()) return;
      toast("Your message has been prepared in this demo. Connect a backend to send it to the team.");
      contact.reset();
      return;
    }
    const checkout = event.target.closest("[data-checkout-form]");
    if (checkout) {
      event.preventDefault();
      if (!checkout.reportValidity()) return;
      if (!cart().length) return toast("Your bag is empty.", "error");
      const data = new FormData(checkout);
      const order = {
        id: `AUR-${Date.now().toString().slice(-8)}`,
        date: new Date().toLocaleDateString("en-NG"),
        status: "Order received",
        total: subtotal() + (subtotal() >= 50000 ? 0 : 2500),
        customer: String(data.get("email") || "")
      };
      const orders = read(KEYS.orders, []);
      orders.unshift(order);
      write(KEYS.orders, orders);
      write("aurelle.storefront.last-order", order);
      write(KEYS.cart, []);
      location.href = `order-success.html?order=${encodeURIComponent(order.id)}`;
    }
  });

  const lastOrder = read("aurelle.storefront.last-order", null);
  document.querySelectorAll("[data-order-number]").forEach(node => {
    const requested = new URLSearchParams(location.search).get("order");
    node.textContent = requested || lastOrder?.id || "—";
  });

  initMobileNav();
  renderProductGrids();
  renderProductDetail();
  renderCart();
  renderWishlist();
  renderOrderSummary();
  renderTracking();
  updateHeader();
})();
