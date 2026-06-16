(function () {
  "use strict";
  const CART_KEY = "louis_mart_cart";
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveCart(c) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(c));
    } catch (e) {}
  }
  window.addToCart = function (p) {
    const c = getCart();
    const i = c.findIndex((x) => x.id === p.id);
    if (i > -1) {
      c[i].quantity += p.quantity || 1;
    } else {
      c.push({ ...p, quantity: p.quantity || 1 });
    }
    saveCart(c);
    updateCartCount();
    updateCartSidebar();
    showToast("Added to cart!");
  };
  window.removeFromCart = function (id) {
    let c = getCart();
    c = c.filter((x) => x.id !== id);
    saveCart(c);
    updateCartCount();
    updateCartSidebar();
  };
  window.updateQty = function (id, q) {
    const c = getCart();
    const i = c.find((x) => x.id === id);
    if (i) {
      i.quantity = Math.max(1, q);
      saveCart(c);
      updateCartCount();
      updateCartSidebar();
    }
  };
  window.updateCartCount = function () {
    const t = getCart().reduce((s, x) => s + (x.quantity || 0), 0);
    document
      .querySelectorAll(".cart-count")
      .forEach((e) => (e.textContent = t));
  };
  window.calcTotal = function () {
    return getCart().reduce(
      (s, x) => s + (x.price || 0) * (x.quantity || 1),
      0,
    );
  };
  window.updateCartSidebar = function () {
    const b = document.getElementById("cartSidebarBody"),
      tel = document.getElementById("cartSidebarTotal");
    if (!b || !tel) return;
    const c = getCart();
    if (!c.length) {
      b.innerHTML =
        '<div class="text-center py-10 text-cool-gray"><i class="fa-solid fa-bag-shopping text-4xl mb-3 opacity-50"></i><p>Your cart is empty</p></div>';
      tel.textContent = "₦0";
      return;
    }
    let h = "";
    c.forEach((x) => {
      h += `<div class="flex gap-3 items-start p-3 bg-white/[0.03] rounded-xl mb-2"><img src="${x.image}" class="w-16 h-16 rounded-lg object-cover" onerror="this.src='https://images.unsplash.com/photo-1552346154-21d32810aba3?w=100&q=80'"><div class="flex-1 min-w-0"><h4 class="text-white text-sm font-medium truncate">${x.name}</h4><p class="text-xs text-warm-gray">Size: ${x.size || "N/A"}</p><div class="flex items-center gap-2 mt-1"><button class="w-6 h-6 bg-white/10 rounded text-xs qty-dec" data-id="${x.id}">−</button><span class="text-white text-sm">${x.quantity || 1}</span><button class="w-6 h-6 bg-white/10 rounded text-xs qty-inc" data-id="${x.id}">+</button></div></div><div class="text-right flex-shrink-0"><span class="text-premium-gold font-semibold text-sm">₦${((x.price || 0) * (x.quantity || 1)).toLocaleString()}</span><button class="block text-xs text-cool-gray hover:text-rose-400 mt-1 remove-item" data-id="${x.id}"><i class="fa-solid fa-trash"></i></button></div></div>`;
    });
    b.innerHTML = h;
    tel.textContent = `₦${calcTotal().toLocaleString()}`;
    b.querySelectorAll(".qty-dec").forEach(
      (btn) =>
        (btn.onclick = () => {
          const c = getCart();
          const i = c.find((x) => x.id === btn.dataset.id);
          if (i && i.quantity > 1) updateQty(btn.dataset.id, i.quantity - 1);
        }),
    );
    b.querySelectorAll(".qty-inc").forEach(
      (btn) =>
        (btn.onclick = () => {
          const c = getCart();
          const i = c.find((x) => x.id === btn.dataset.id);
          if (i) updateQty(btn.dataset.id, (i.quantity || 1) + 1);
        }),
    );
    b.querySelectorAll(".remove-item").forEach(
      (btn) => (btn.onclick = () => removeFromCart(btn.dataset.id)),
    );
  };
  window.openCart = function () {
    document.getElementById("cartOverlay")?.classList.remove("hidden");
    document.getElementById("cartSidebar")?.classList.remove("hidden");
    updateCartSidebar();
  };
  window.closeCart = function () {
    document.getElementById("cartOverlay")?.classList.add("hidden");
    document.getElementById("cartSidebar")?.classList.add("hidden");
  };
  window.showToast = function (m, t = "success") {
    const el = document.createElement("div");
    el.className = `toast ${t}`;
    el.innerHTML = `<i class="fa-solid fa-${t === "success" ? "circle-check" : "circle-exclamation"}"></i> ${m}`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateX(100%)";
      setTimeout(() => el.remove(), 300);
    }, 2500);
  };
  // Navbar scroll
  const navbar = document.getElementById("navbar"),
    backBtn = document.getElementById("backToTop");
  window.addEventListener(
    "scroll",
    () => {
      const y = window.pageYOffset;
      navbar?.classList.toggle("scrolled", y > 50);
      backBtn?.classList.toggle("visible", y > 500);
    },
    { passive: true },
  );
  backBtn?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
  // Mobile menu
  const menuBtn = document.getElementById("mobileMenuBtn"),
    menu = document.getElementById("mobileMenu");
  menuBtn?.addEventListener("click", () => {
    const e = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", !e);
    menu?.classList.toggle("active");
    menuBtn.querySelector("i")?.classList.toggle("fa-bars");
    menuBtn.querySelector("i")?.classList.toggle("fa-xmark");
  });
  menu?.querySelectorAll("a").forEach((l) =>
    l.addEventListener("click", () => {
      menu.classList.remove("active");
      menuBtn?.setAttribute("aria-expanded", "false");
      menuBtn?.querySelector("i")?.classList.add("fa-bars");
      menuBtn?.querySelector("i")?.classList.remove("fa-xmark");
    }),
  );
  // Cart sidebar triggers
  document
    .querySelectorAll(".cart-trigger, a[href='cart.html']")
    .forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        openCart();
      }),
    );
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("cartClose")?.addEventListener("click", closeCart);
  // Wishlist
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".wishlist-btn");
    if (!btn) return;
    e.preventDefault();
    const icon = btn.querySelector("i");
    if (icon?.classList.contains("fa-regular")) {
      icon.classList.replace("fa-regular", "fa-solid");
      icon.style.color = "#ef4444";
      showToast("Added to wishlist!");
    }
  });
  // Add to cart buttons (shop)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart-btn");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const card = btn.closest(".product-card");
    if (!card) return;
    const name = card.querySelector("h3")?.textContent.trim() || "Sneaker";
    const priceText =
      card.querySelector(".font-bold")?.textContent.replace(/[^0-9]/g, "") ||
      "0";
    const img =
      card
        .querySelector("img")
        ?.src.replace("w=600", "w=200")
        .replace("w=400", "w=200") ||
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=200&q=80";
    addToCart({
      id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name,
      price: parseInt(priceText) || 0,
      image: img,
      size: "UK 9",
      quantity: 1,
    });
  });
  // Init
  updateCartCount();
  console.log(
    "%c👑 Louis Mart %cReady",
    "font-size:1.5em;font-weight:bold;color:#C8A951;",
    "color:#9CA3AF;",
  );
})();
