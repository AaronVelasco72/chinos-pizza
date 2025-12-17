const grid = document.getElementById("promosGrid");
const search = document.getElementById("searchPromo");

const hint = document.getElementById("promoHint");
const detail = document.getElementById("promoDetail");

const detailImg = document.getElementById("detailImg");
const detailTitle = document.getElementById("detailTitle");
const detailDesc = document.getElementById("detailDesc");
const detailCode = document.getElementById("detailCode");
const detailVigencia = document.getElementById("detailVigencia");
const btnCopy = document.getElementById("btnCopy");

let promos = [];
let selectedPromo = null;

function promoCard(p) {
  return `
    <div class="col-md-6">
      <button class="promo-ui" data-id="${p.id}">
        <div class="promo-ui-img">
          <img src="${p.imagen}" alt="${p.titulo}">
        </div>
        <div class="promo-ui-body">
          <div class="promo-ui-title">${p.titulo}</div>
          <div class="promo-ui-desc">${p.descripcion}</div>
          <div class="promo-ui-code">Código: <span>${p.codigo}</span></div>
        </div>
      </button>
    </div>
  `;
}

function render(list) {
  grid.innerHTML = list.map(promoCard).join("");

  grid.querySelectorAll(".promo-ui").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const p = promos.find(x => x.id === id);
      if (!p) return;
      showDetail(p);
    });
  });
}

function showDetail(p) {
  selectedPromo = p;
  hint.classList.add("d-none");
  detail.classList.remove("d-none");

  detailImg.src = p.imagen;
  detailTitle.textContent = p.titulo;
  detailDesc.textContent = p.descripcion;
  detailCode.textContent = p.codigo;
  detailVigencia.textContent = `Vigencia: ${p.vigencia}`;
}

btnCopy?.addEventListener("click", async () => {
  if (!selectedPromo) return;
  try {
    await navigator.clipboard.writeText(selectedPromo.codigo);
    btnCopy.textContent = "Copiado";
    setTimeout(() => (btnCopy.textContent = "Copiar"), 900);
  } catch {
    alert("No se pudo copiar. Copia manualmente el código.");
  }
});

search?.addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = promos.filter(p =>
    (p.titulo + " " + p.descripcion + " " + p.codigo).toLowerCase().includes(q)
  );
  render(filtered);
});

async function init() {
  try {
    const res = await fetch("../data/promos.json");
    promos = await res.json();
    render(promos);
  } catch (e) {
    grid.innerHTML = `<div class="col-12"><div class="alert alert-danger">
      No se pudieron cargar las promos. Revisa la ruta de ../data/promos.json
    </div></div>`;
  }
}

init();
