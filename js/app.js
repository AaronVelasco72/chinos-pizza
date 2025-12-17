// contador carrito (mock)
const cartCount = document.getElementById("cartCount");
if (cartCount) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  cartCount.textContent = total;
}

// botones (mañana solo navegan al menú)
document.getElementById("btnDelivery")?.addEventListener("click", () => {
  localStorage.setItem("orderType", "delivery");
  window.location.href = "pages/home.html";
});

document.getElementById("btnPickup")?.addEventListener("click", () => {
  localStorage.setItem("orderType", "pickup");
  window.location.href = "pages/home.html";
});
