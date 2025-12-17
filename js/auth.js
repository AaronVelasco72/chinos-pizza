const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");

const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginMsg = document.getElementById("loginMsg");
const registerMsg = document.getElementById("registerMsg");

function showLogin() {
  loginView.classList.remove("d-none");
  registerView.classList.add("d-none");

  tabLogin.classList.add("btn-dark");
  tabLogin.classList.remove("btn-outline-dark");
  tabRegister.classList.remove("btn-dark");
  tabRegister.classList.add("btn-outline-dark");

  loginMsg.textContent = "";
  registerMsg.textContent = "";
}

function showRegister() {
  registerView.classList.remove("d-none");
  loginView.classList.add("d-none");

  tabRegister.classList.add("btn-dark");
  tabRegister.classList.remove("btn-outline-dark");
  tabLogin.classList.remove("btn-dark");
  tabLogin.classList.add("btn-outline-dark");

  loginMsg.textContent = "";
  registerMsg.textContent = "";
}

tabLogin?.addEventListener("click", showLogin);
tabRegister?.addEventListener("click", showRegister);
goRegister?.addEventListener("click", (e) => { e.preventDefault(); showRegister(); });
goLogin?.addEventListener("click", (e) => { e.preventDefault(); showLogin(); });

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function setSessionUser(user) {
  localStorage.setItem("sessionUser", JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email
  }));
}
function msg(el, text, ok=true){
  el.textContent = text;
  el.className = "small mt-3 " + (ok ? "text-success" : "text-danger");
}

// Register
registerForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const fd = new FormData(registerForm);
  const newUser = {
    name: fd.get("name"),
    email: fd.get("email").trim().toLowerCase(),
    phone: fd.get("phone"),
    password: fd.get("password") // En un proyecto real, aquí usaríamos cifrado
  };

  fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      msg(registerMsg, "¡Cuenta creada! Redirigiendo al login...", true);
      setTimeout(() => {
        window.location.href = "login.html"; //
      }, 1500);
    } else {
      msg(registerMsg, data.message, false);
    }
  })
  .catch(err => msg(registerMsg, "Error de conexión con el servidor", false));
});
// Login
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const fd = new FormData(loginForm);
  const email = fd.get("email").trim().toLowerCase();
  const password = fd.get("password");

  // Petición al servidor de Node.js que creamos en server.js
  fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Guardamos la sesión en el navegador con los datos reales de la BD
      localStorage.setItem("sessionUser", JSON.stringify(data.user));
      msg(loginMsg, `Bienvenido, ${data.user.name} ✅`, true);
      
      setTimeout(() => {
        window.location.href = "home.html"; // Redirige al menú principal
      }, 600);
    } else {
      msg(loginMsg, data.message, false);
    }
  })
  .catch(err => {
    msg(loginMsg, "Error de conexión: ¿Olvidaste encender el servidor?", false);
  });
});

// Abre en modo login por defecto
showLogin();
