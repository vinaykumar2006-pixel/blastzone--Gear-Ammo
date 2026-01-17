
const DEFAULT_PRODUCTS = [
  {
    id: "x500",
    name: "Elite Strike X-500",
    price: 79.99,
    img: "images/elitestrike.png"
  },
  {
    id: "pro",
    name: "Tactical Blaster Pro",
    price: 49.99,
    img: "images/tacticalpro.png"
  },
  {
    id: "ammo1",
    name: "Foam Dart Pack (50)",
    price: 19.99,
    img: "images/dart_50.png"
  },
  {
    id: "ammo2",
    name: "Mega Dart Pack (100)",
    price: 29.99,
    img: "images/dart_100.png"
  },
  {
    id: "pistol",
    name: "Rapid Fire Pistol",
    price: 34.99,
    img: "images/rapidfirepistol.png"
  },
  {
    id: "bundle",
    name: "Ultimate Arsenal Bundle (Christmas Special)",
    price: 99,
    originalPrice: 200,
    img: "images/bundle.png"
  }
];

let PRODUCTS = [];

async function fetchProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    PRODUCTS = await response.json();
    renderProducts();
  } catch (error) {
    console.warn("Backend API unavailable, using local fallback data.", error);
    PRODUCTS = DEFAULT_PRODUCTS;
    renderProducts();
  }
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const productGrid = document.getElementById("productGrid");
const cartBox = document.getElementById("cart");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

function renderProducts() {
  if (!productGrid) return;

  productGrid.innerHTML = "";
  PRODUCTS.forEach(p => {
    const priceDisplay = p.originalPrice
      ? `<span style="text-decoration: line-through; color: #888; margin-right: 5px;">$${p.originalPrice}</span> $${p.price}`
      : `$${p.price}`;

    productGrid.innerHTML += `
      <div class="card ${p.id === 'bundle' ? 'christmas-special' : ''}">
        <!-- Image is now clickable and opens new window -->
        <a href="product.html?id=${p.id}" target="_blank">
            <img src="${p.img}" style="cursor: pointer;">
        </a>
        <h4>${p.name}</h4>
        <p class="price">${priceDisplay}</p>
        <div class="card-actions-row" style="display: flex; gap: 10px;">
             <button class="pill" onclick="addToCart('${p.id}')">Add</button>
        </div>
      </div>
    `;
  });
}

function fetchProductDetails(id) {
  // Ideally this would also fetch from an API endpoint like /api/products/:id
  // For now, we wait for the main list to load if it hasn't
  if (PRODUCTS.length === 0) {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        PRODUCTS = data;
        showProductDetail(id);
      })
      .catch(err => console.error(err));
  } else {
    showProductDetail(id);
  }
}

function showProductDetail(id) {
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    const error = document.getElementById('error');
    if (error) error.style.display = 'block';
    return;
  }

  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
  const pDetail = document.getElementById('productDetail');
  if (pDetail) pDetail.style.display = 'grid';

  const img = document.getElementById('pImg');
  if (img) img.src = product.img;
  const name = document.getElementById('pName');
  if (name) name.textContent = product.name;
  const price = document.getElementById('pPrice');
  if (price) price.textContent = "$" + product.price;

  const addBtn = document.getElementById('addToCartBtn');
  if (addBtn) {
    addBtn.onclick = () => {
      cart.push(product);
      saveCart();
      alert("Added " + product.name + " to cart!");
    };
  }
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (product) {
    cart.push(product);
    saveCart();
    alert("Added to cart");
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  if (!cartList) return;

  cartList.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    cartList.innerHTML += `<div>${item.name} - $${item.price}</div>`;
    total += item.price;
  });

  if (cartTotal) cartTotal.textContent = "$" + total.toFixed(2);
  if (cartCount) cartCount.textContent = cart.length;
}

const openCartBtn = document.getElementById("openCart");
if (openCartBtn) {
  openCartBtn.onclick = () => {
    cartBox.style.display = "";
    cartBox.classList.add("open");
  };
}

const closeCartBtn = document.getElementById("closeCart");
if (closeCartBtn) {
  closeCartBtn.onclick = () => {
    cartBox.classList.remove("open");
  };
}

const clearCartBtn = document.getElementById("clearCartBtn");
if (clearCartBtn) {
  clearCartBtn.onclick = () => {
    cart = [];
    saveCart();
  };
}

const checkoutModal = document.getElementById("checkoutModal");
const checkoutForm = document.getElementById("checkoutForm");

const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) {
  checkoutBtn.onclick = () => {
    if (cart.length === 0) return alert("Cart is empty");
    checkoutModal.style.display = "flex";
  };
}

const closeCheckout = document.getElementById("closeCheckout");
if (closeCheckout) {
  closeCheckout.onclick = () => {
    checkoutModal.style.display = "none";
  };
}

const cancelCheckout = document.getElementById("cancelCheckout");
if (cancelCheckout) {
  cancelCheckout.onclick = () => {
    checkoutModal.style.display = "none";
  };
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(checkoutForm);
    const customer = {
      name: formData.get("name"),
      email: formData.get("email"),
      address: formData.get("address")
    };

    // Calculate details
    let total = 0;
    cart.forEach(c => total += c.price);

    const order = {
      id: "ORD-" + Math.floor(Math.random() * 100000),
      date: new Date().toLocaleDateString(),
      customer: customer,
      items: cart,
      total: total.toFixed(2)
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });

      if (response.ok) {
        finalizeOrder(order);
      } else {
        throw new Error("API Error");
      }
    } catch (err) {
      console.warn("Backend API unavailable, simulating order success.", err);
      finalizeOrder(order);
    }
  });
}

function finalizeOrder(order) {
  localStorage.setItem("lastOrder", JSON.stringify(order));
  cart = [];
  saveCart();
  checkoutModal.style.display = "none";
  checkoutForm.reset();
  window.location.href = "thankyou.html";
}

const shopNowBtn = document.getElementById("shopNow");
if (shopNowBtn) {
  shopNowBtn.onclick = () => {
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  };
}

const contactSalesBtn = document.getElementById("contactSales");
if (contactSalesBtn) {
  contactSalesBtn.onclick = () => {
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  };
}

const subscribeBtn = document.getElementById("subscribe");
if (subscribeBtn) {
  subscribeBtn.onclick = () => {
    const email = document.getElementById("email").value;
    if (!email) return alert("Enter email");
    alert("Subscribed: " + email);
    document.getElementById("email").value = "";
  };
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("cname").value;
    const email = document.getElementById("cemail").value;
    const message = document.getElementById("cmsg").value;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (response.ok) {
        alert("Message sent successfully");
        e.target.reset();
      } else {
        throw new Error("API Error");
      }
    } catch (err) {
      console.warn("Backend API unavailable, simulating contact success.", err);
      alert("Message sent successfully (Offline Mode)");
      e.target.reset();
    }
  });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

if (productGrid) {
  fetchProducts();
}

updateCartUI();
