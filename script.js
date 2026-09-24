// Año actual en el pie
document.getElementById("anio").textContent = new Date().getFullYear();

// Aparición suave de las secciones al hacer scroll
const secciones = document.querySelectorAll(".seccion");

const observadorAparicion = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visible");
      observadorAparicion.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15 });

secciones.forEach((seccion) => {
  seccion.classList.add("oculto");
  observadorAparicion.observe(seccion);
});

// Resalta en el menú la sección que se está viendo
const enlaces = document.querySelectorAll(".nav__lista a");

const observadorMenu = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      enlaces.forEach((enlace) => {
        enlace.classList.toggle("activo", enlace.getAttribute("href") === "#" + entrada.target.id);
      });
    }
  });
}, { rootMargin: "-50% 0px -50% 0px" });

document.querySelectorAll("section[id], footer[id]").forEach((el) => observadorMenu.observe(el));

// ===== Menú hamburguesa (móvil) =====
const botonMenu = document.getElementById("botonMenu");
const menu = document.getElementById("menu");

function cerrarMenu() {
  menu.classList.remove("abierto");
  botonMenu.setAttribute("aria-expanded", "false");
  botonMenu.setAttribute("aria-label", "Abrir menú");
}

botonMenu.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  botonMenu.setAttribute("aria-expanded", abierto);
  botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});

// Al pulsar un enlace, el menú se cierra
enlaces.forEach((enlace) => enlace.addEventListener("click", cerrarMenu));

// ===== Juego: tanda de penaltis =====
const ZONAS = ["izquierda", "centro", "derecha"];
const TOTAL_TIROS = 5;

const portero = document.getElementById("portero");
const balon = document.getElementById("balon");
const mensaje = document.getElementById("mensaje");
const textoGoles = document.getElementById("goles");
const textoTiro = document.getElementById("tiro");
const textoRecord = document.getElementById("record");
const botonesTiro = document.querySelectorAll(".boton-tiro");
const botonReiniciar = document.getElementById("reiniciar");

let goles = 0;
let tiros = 0;
let record = leerRecord();
textoRecord.textContent = record;

// El récord se guarda en el navegador (si lo permite)
function leerRecord() {
  try {
    return Number(localStorage.getItem("recordPenaltis")) || 0;
  } catch {
    return 0;
  }
}

function guardarRecord(valor) {
  try {
    localStorage.setItem("recordPenaltis", valor);
  } catch {
    // Sin almacenamiento: el récord solo dura esta visita
  }
}

function activarBotones(activos) {
  botonesTiro.forEach((boton) => (boton.disabled = !activos));
}

function ponerMensaje(texto, tipo = "") {
  mensaje.textContent = texto;
  mensaje.className = "juego__mensaje " + tipo;
}

function colocar(elemento, zona) {
  elemento.classList.remove(...ZONAS);
  if (zona) elemento.classList.add(zona);
}

function chutar(zona) {
  activarBotones(false);
  const zonaPortero = ZONAS[Math.floor(Math.random() * ZONAS.length)];

  colocar(balon, zona);
  colocar(portero, zonaPortero);

  setTimeout(() => {
    tiros++;
    if (zona === zonaPortero) {
      ponerMensaje("¡Parada del portero! 🧤", "parada");
    } else {
      goles++;
      ponerMensaje("¡GOOOL! Visca el Barça! 🔵🔴", "gol");
    }
    textoGoles.textContent = goles;
    textoTiro.textContent = tiros;

    setTimeout(tiros < TOTAL_TIROS ? siguienteTiro : finDeTanda, 1100);
  }, 450);
}

function siguienteTiro() {
  colocar(balon, null);
  colocar(portero, null);
  ponerMensaje("¡Elige tu tiro!");
  activarBotones(true);
}

function finDeTanda() {
  colocar(balon, null);
  colocar(portero, null);

  let texto = `Fin de la tanda: ${goles} de ${TOTAL_TIROS}.`;
  if (goles > record) {
    record = goles;
    guardarRecord(record);
    textoRecord.textContent = record;
    texto += " ¡Nuevo récord! 🏆";
  }
  ponerMensaje(texto, goles >= 3 ? "gol" : "parada");
  botonReiniciar.hidden = false;
}

function reiniciar() {
  goles = 0;
  tiros = 0;
  textoGoles.textContent = 0;
  textoTiro.textContent = 0;
  botonReiniciar.hidden = true;
  siguienteTiro();
}

botonesTiro.forEach((boton) => {
  boton.addEventListener("click", () => chutar(boton.dataset.zona));
});

botonReiniciar.addEventListener("click", reiniciar);
