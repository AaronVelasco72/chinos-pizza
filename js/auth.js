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
  const name = String(fd.get("name") || "").trim();
  const email = normalizeEmail(fd.get("email"));
  const password = String(fd.get("password") || "");
  const confirm = String(fd.get("confirm") || "");

  if (!name || !email || !password) return msg(registerMsg, "Completa todos los campos.", false);
  if (password.length < 6) return msg(registerMsg, "La contraseña debe tener al menos 6 caracteres.", false);
  if (password !== confirm) return msg(registerMsg, "Las contraseñas no coinciden.", false);

  const users = getUsers();
  if (users.some(u => normalizeEmail(u.email) === email)) {
    return msg(registerMsg, "Ese correo ya está registrado. Inicia sesión.", false);
  }

  const newUser = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    email,
    password // demo (luego backend con hash)
  };

  users.push(newUser);
  setUsers(users);

  msg(registerMsg, "Cuenta creada ✅ Ahora inicia sesión.", true);
  registerForm.reset();
  showLogin();
});

// Login
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const fd = new FormData(loginForm);
  const email = normalizeEmail(fd.get("email"));
  const password = String(fd.get("password") || "");

  const users = getUsers();
  const user = users.find(u => normalizeEmail(u.email) === email);

  if (!user || user.password !== password) {
    return msg(loginMsg, "Correo o contraseña incorrectos.", false);
  }

  setSessionUser(user);
  msg(loginMsg, `Bienvenido, ${user.name} ✅`, true);

  setTimeout(() => {
    window.location.href = "home.html";
  }, 600);
});

// Abre en modo login por defecto
showLogin();
