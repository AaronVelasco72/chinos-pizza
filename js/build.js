function getCart(){ return JSON.parse(localStorage.getItem("cart") || "[]"); }
function setCart(cart){ localStorage.setItem("cart", JSON.stringify(cart)); }

function updateCartBadge(){
  const cart = getCart();
  const count = cart.reduce((a,i)=>a+(i.qty||1),0);
  const el = document.getElementById("cartCount");
  if (el) el.textContent = count;
}

const posiciones = [
  { x: 50, y: 15 }, { x: 70, y: 20 }, { x: 85, y: 35 }, { x: 85, y: 50 },
  { x: 85, y: 65 }, { x: 70, y: 80 }, { x: 50, y: 85 }, { x: 30, y: 80 },
  { x: 15, y: 65 }, { x: 15, y: 50 }, { x: 15, y: 35 }, { x: 30, y: 20 },
  { x: 50, y: 30 }, { x: 70, y: 35 }, { x: 70, y: 50 }, { x: 70, y: 65 },
  { x: 50, y: 70 }, { x: 30, y: 65 }, { x: 30, y: 50 }, { x: 30, y: 35 },
  { x: 45, y: 45 }, { x: 55, y: 45 }, { x: 45, y: 55 }, { x: 55, y: 55 }
];

const basePrice = { Mediana: 149, Grande: 199, Dominator: 259 };
const extraSauce = 10;
const extraCheese = 15;
const pricePerIngredient = 12;

function getConfig(){
  const tamano = document.querySelector('input[name="tamano"]:checked').value;

  const salsaOn = document.getElementById("salsaCheck").checked;
  const quesoOn = document.getElementById("quesoCheck").checked;

  const salsaQty = document.getElementById("salsaQty").value;
  const quesoQty = document.getElementById("quesoQty").value;

  const checks = Array.from(document.querySelectorAll(".ing-check:checked"));
  const ingredientes = checks.map(c => c.value);
  const icons = checks.map(c => c.dataset.ico || "•");

  return { tamano, salsaOn, quesoOn, salsaQty, quesoQty, ingredientes, icons };
}

function calcPrice(cfg){
  let total = basePrice[cfg.tamano] ?? 149;
  if (cfg.salsaOn && cfg.salsaQty === "Extra") total += extraSauce;
  if (cfg.quesoOn && cfg.quesoQty === "Extra") total += extraCheese;
  total += cfg.ingredientes.length * pricePerIngredient;
  return total;
}

function actualizarPizza(){
  const cfg = getConfig();
  const precio = calcPrice(cfg);

  document.getElementById("resumenTitulo").innerText = `Pizza ${cfg.tamano}`;
  document.getElementById("resumenDetalle").innerText =
    `Salsa: ${cfg.salsaOn ? cfg.salsaQty : "No"}, Queso: ${cfg.quesoOn ? cfg.quesoQty : "No"}`;

  document.getElementById("resumenLista").innerText =
    cfg.ingredientes.length ? cfg.ingredientes.join(", ") : "Sin ingredientes adicionales";

  document.getElementById("resumenPrecio").innerText = `$${precio} MXN`;

  const pizzaSalsa = document.getElementById("pizza-sauce");
  const pizzaQueso = document.getElementById("pizza-cheese");
  pizzaSalsa.style.display = cfg.salsaOn ? "block" : "none";
  pizzaQueso.style.display = cfg.quesoOn ? "block" : "none";
  if (cfg.quesoQty === "Extra") pizzaQueso.classList.add("pizza-cheese-extra");
  else pizzaQueso.classList.remove("pizza-cheese-extra");

  // Render emojis como toppings
  const cont = document.getElementById("pizza-ingredientes");
  cont.innerHTML = "";

  cfg.icons.forEach((ico, index) => {
    const cantidadItems = 6 + (index % 3);

    for(let i=0;i<cantidadItems;i++){
      const posIndex = (index * 7 + i * 3) % posiciones.length;
      const pos = posiciones[posIndex];
      const offsetX = (Math.random() - 0.5) * 4;
      const offsetY = (Math.random() - 0.5) * 4;

      const item = document.createElement("div");
      item.className = "ingredient-item";
      item.style.left = `${pos.x + offsetX}%`;
      item.style.top = `${pos.y + offsetY}%`;
      item.style.transform = `translate(-50%, -50%) rotate(${Math.random()*360}deg)`;
      item.textContent = ico;

      cont.appendChild(item);
    }
  });

  return { cfg, precio };
}

document.querySelectorAll("input, select").forEach(el => el.addEventListener("change", actualizarPizza));
updateCartBadge();
actualizarPizza();

document.querySelector(".btn-agregar")?.addEventListener("click", () => {
  const { cfg, precio } = actualizarPizza();

  const cart = getCart();
  cart.push({
    key: `CUSTOM-${Date.now()}`,
    id: "CUSTOM",
    type: "pizza",
    name: `Arma tu Pizza (${cfg.tamano})`,
    price: precio,
    qty: 1,
    image: "../assets/img/pizza-custom.jpg",
    meta: cfg
  });

  setCart(cart);
  updateCartBadge();
  window.location.href = "cart.html";
});
