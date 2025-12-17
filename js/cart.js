const cartList = document.getElementById("cartList");
const cartEmpty = document.getElementById("cartEmpty");

const subTotalEl = document.getElementById("subTotal");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");

const couponInput = document.getElementById("couponInput");
const btnApplyCoupon = document.getElementById("btnApplyCoupon");
const couponMsg = document.getElementById("couponMsg");

const btnCheckout = document.getElementById("btnCheckout");

function money(n){ return `$${Number(n).toFixed(2)}`; }

function getCart(){
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function setCart(cart){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function getAppliedCoupon(){
  return JSON.parse(localStorage.getItem("appliedCoupon") || "null");
}
function setAppliedCoupon(c){
  localStorage.setItem("appliedCoupon", JSON.stringify(c));
}
function clearCoupon(){
  localStorage.removeItem("appliedCoupon");
}

function calc(cart){
  const subtotal = cart.reduce((acc, it) => acc + (Number(it.price) * (it.qty || 1)), 0);

  const coup = getAppliedCoupon();
  let discount = 0;
  if (coup) {
    if (coup.tipo === "porcentaje") discount = subtotal * (Number(coup.valor)/100);
    if (coup.tipo === "fijo") discount = Number(coup.valor);
    if (discount > subtotal) discount = subtotal;
  }

  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
}

function render(){
  const cart = getCart();

  if (!cart.length){
    cartEmpty.classList.remove("d-none");
    cartList.innerHTML = "";
    updateSummary();
    return;
  }

  cartEmpty.classList.add("d-none");

  cartList.innerHTML = cart.map(it => `
    <div class="cart-item">
      <div class="cart-img">
        <img src="${it.image || "../assets/img/placeholder.jpg"}" alt="${it.name}">
      </div>

      <div class="cart-info">
        <div class="d-flex justify-content-between gap-2">
          <div>
            <div class="fw-bold">${it.name}</div>
            <small class="text-muted">${it.type === "pizza" ? "Pizza" : "Complemento"}</small>
          </div>
          <div class="fw-bold">${money(it.price)}</div>
        </div>

        <div class="d-flex align-items-center justify-content-between mt-2 gap-2 flex-wrap">
          <div class="qty">
            <button class="btn btn-sm btn-outline-dark" data-dec="${it.key}">-</button>
            <span class="px-2 fw-bold">${it.qty || 1}</span>
            <button class="btn btn-sm btn-outline-dark" data-inc="${it.key}">+</button>
          </div>

          <div class="d-flex align-items-center gap-2">
            <div class="text-muted small">Importe: <span class="fw-bold">${money((it.qty||1)*it.price)}</span></div>
            <button class="btn btn-sm btn-outline-danger" data-del="${it.key}">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  // bind
  cartList.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.inc, +1)));
  cartList.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.dec, -1)));
  cartList.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => removeItem(b.dataset.del)));

  updateSummary();
}

function changeQty(key, delta){
  const cart = getCart();
  const item = cart.find(x => x.key === key);
  if (!item) return;

  item.qty = (item.qty || 1) + delta;
  if (item.qty <= 0) {
    const idx = cart.findIndex(x => x.key === key);
    cart.splice(idx, 1);
  }

  setCart(cart);
  render();
}

function removeItem(key){
  const cart = getCart().filter(x => x.key !== key);
  setCart(cart);
  render();
}

function updateSummary(){
  const { subtotal, discount, total } = calc(getCart());
  subTotalEl.textContent = money(subtotal);
  discountEl.textContent = `- ${money(discount)}`;
  totalEl.textContent = money(total);

  // mensaje cupón
  const coup = getAppliedCoupon();
  if (coup) {
    couponMsg.textContent = `Cupón aplicado: ${coup.codigo}`;
    couponMsg.className = "small mt-2 text-success";
    couponInput.value = coup.codigo;
  } else {
    couponMsg.textContent = "";
  }
}

// Cupón (lee data/promos.json)
btnApplyCoupon?.addEventListener("click", async () => {
  const code = (couponInput.value || "").trim().toUpperCase();
  if (!code) return;

  try{
    const res = await fetch("../data/promos.json");
    const promos = await res.json();
    const p = promos.find(x => String(x.codigo).toUpperCase() === code);

    if (!p){
      clearCoupon();
      couponMsg.textContent = "Cupón no válido.";
      couponMsg.className = "small mt-2 text-danger";
      updateSummary();
      return;
    }

    // Guardamos lo mínimo necesario
    setAppliedCoupon({ codigo: p.codigo, tipo: p.tipo, valor: p.valor });
    couponMsg.textContent = "Cupón aplicado ✅";
    couponMsg.className = "small mt-2 text-success";
    updateSummary();

  } catch {
    couponMsg.textContent = "No se pudo validar el cupón (revisa promos.json).";
    couponMsg.className = "small mt-2 text-danger";
  }
});

// Checkout (simulado) -> guarda orden para historial
btnCheckout?.addEventListener("click", () => {
  const cart = getCart();
  if (!cart.length){
    alert("Tu carrito está vacío.");
    return;
  }

  const session = JSON.parse(localStorage.getItem("sessionUser") || "null");
  if (!session){
    alert("Inicia sesión para guardar tu compra en el historial.");
    window.location.href = "login.html";
    return;
  }

  const payMethod = document.querySelector("input[name='pay']:checked")?.value || "Tarjeta";
  const { subtotal, discount, total } = calc(cart);
  const coupon = getAppliedCoupon();

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const order = {
    id: "ORD-" + Date.now(),
    userEmail: session.email,
    createdAt: new Date().toISOString(),
    items: cart,
    subtotal,
    discount,
    total,
    paymentMethod: payMethod,
    coupon: coupon ? coupon.codigo : null
  };

  orders.unshift(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  // Limpia carrito y cupón
  setCart([]);
  clearCoupon();

  alert("Compra confirmada ✅");
  window.location.href = "history.html";
});

render();
