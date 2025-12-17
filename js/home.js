const grid = document.getElementById("grid");
const tabs = document.getElementById("menuTabs");
const search = document.getElementById("search");

let currentTab = "Pizzas";
let pizzas = [];
let complementos = []; // Bebidas/Postres/Extras

function getCart(){
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function setCart(cart){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(item, qty = 1){
  const cart = getCart();
  const key = `${item.type}-${item.id}`;

  const existing = cart.find(x => x.key === key);
  if (existing) existing.qty += qty;
  else {
    cart.push({
      key,
      type: item.type,
      id: item.id,
      name: item.nombre,
      price: Number(item.precio),
      image: item.imagen,
      qty
    });
  }
  setCart(cart);

  // actualiza contador (si existe)
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl){
    const total = cart.reduce((acc, x) => acc + (x.qty || 1), 0);
    cartCountEl.textContent = total;
  }

  alert("Agregado al carrito ✅");
}

function card(item){
  return `
  <div class="col-sm-6 col-lg-4">
    <div class="item-card2">
      <div class="item-img2">
        <img src="${item.imagen}" alt="${item.nombre}">
      </div>
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div class="fw-bold">${item.nombre}</div>
            <small class="text-muted">${item.badge}</small>
          </div>
          <div class="fw-bold">$${Number(item.precio).toFixed(2)}</div>
        </div>
        <p class="text-muted small mt-2 mb-3">${item.descripcion}</p>

        <div class="d-flex gap-2">
          <button class="btn btn-danger btn-sm w-100" data-add="${item.type}|${item.id}">
            Agregar
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

function getCurrentList(){
  const q = (search.value || "").trim().toLowerCase();

  let list = [];
  if (currentTab === "Pizzas"){
    list = pizzas.map(p => ({...p, type:"pizza", badge:"Pizza"}));
  } else {
    list = complementos
      .filter(c => c.categoria === currentTab)
      .map(c => ({...c, type:"comp", badge:c.categoria}));
  }

  if (q){
    list = list.filter(x =>
      (x.nombre + " " + x.descripcion + " " + x.badge).toLowerCase().includes(q)
    );
  }
  return list;
}

function render(){
  const list = getCurrentList();
  grid.innerHTML = list.map(card).join("");

  // bind add buttons
  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const [type, id] = btn.dataset.add.split("|");

      if (type === "pizza"){
        const p = pizzas.find(x => x.id === id);
        if (!p) return;
        addToCart({ ...p, type:"pizza" }, 1);
      } else {
        const c = complementos.find(x => x.id === id);
        if (!c) return;
        addToCart({ ...c, type:"comp" }, 1);
      }
    });
  });
}

tabs?.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-tab]");
  if (!btn) return;

  tabs.querySelectorAll(".nav-link").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");

  currentTab = btn.dataset.tab;
  render();
});

search?.addEventListener("input", render);

async function init(){
  try{
    const [pRes, cRes] = await Promise.all([
      fetch("../data/pizzas.json"),
      fetch("../data/complementos.json")

    ]);
    pizzas = await pRes.json();
    complementos = await cRes.json();
    render();
  }catch(e){
    grid.innerHTML = `<div class="col-12"><div class="alert alert-danger">
      No se pudo cargar el menú. Revisa rutas: ../data/pizzas.json y ../data/complementos.json
    </div></div>`;
  }
}

init();
