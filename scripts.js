// === Función para cargar el perfil del usuario ===
function cargarPerfilUsuario() {
  const usuarioRaw = localStorage.getItem("usuario");
  let usuario = null;

  if (usuarioRaw) {
    try {
      usuario = JSON.parse(usuarioRaw); // Parsear el JSON
    } catch (error) {
      console.error("Error al analizar JSON del usuario:", error);
      localStorage.removeItem("usuario"); // Si está dañado, eliminarlo
    }
  }

  const perfilContainer = document.getElementById("perfilContainer");

  if (usuario) {
    perfilContainer.innerHTML = `
      <div class="perfil-menu" id="perfilMenu">
        <img src="${usuario.foto || 'img/user.jpeg'}" alt="Foto de perfil" class="foto-perfil" id="perfilFoto">
        <span>${usuario.nombre}</span>
        <div class="menu-desplegable" id="menuOpciones">
          <label for="inputFoto" class="opcion">Añadir foto</label>
          <input type="file" id="inputFoto" accept="image/*" style="display: none;">
          <a href="#" id="cerrar-sesion">Cerrar sesión</a>
        </div>
      </div>
    `;
    document.getElementById("cerrar-sesion").addEventListener("click", cerrarSesion);
    manejarCargaDeFoto();
    document.getElementById("perfilFoto").addEventListener("click", alternarMenu);
  } else {
    perfilContainer.innerHTML = `
      <a href="login.html" class="btn-login">Iniciar sesión</a>
    `;
  }
}

function verificarAdmin() {
  const usuarioRaw = localStorage.getItem("usuario");
  if (!usuarioRaw) return false;

  try {
    const usuario = JSON.parse(usuarioRaw);
    return usuario.rol && usuario.rol === "admin";
  } catch (error) {
    console.error("Error al verificar rol de administrador:", error);
    return false;
  }
}

// === Función para alternar la visibilidad del menú desplegable ===
function alternarMenu() {
  const menuOpciones = document.getElementById("menuOpciones");
  if (menuOpciones) {
    menuOpciones.classList.toggle("mostrar");
  }
}
// === Función para manejar la carga de la foto de perfil ===
function manejarCargaDeFoto() {
  const inputFoto = document.getElementById("inputFoto");
  if (inputFoto) {
    inputFoto.addEventListener("change", function () {
      const file = inputFoto.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        const usuario = JSON.parse(localStorage.getItem("usuario")) || { nombre: "Usuario" };
        usuario.foto = e.target.result;
        localStorage.setItem("usuario", JSON.stringify(usuario));
        document.getElementById("perfilFoto").src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}

// === Función para cerrar sesión ===
function cerrarSesion() {
  localStorage.removeItem("usuario");
  location.reload();
}

// Establecer restricciones en la fecha
const fechaInput = document.getElementById("fecha");
if (fechaInput) {
  const hoy = new Date().toISOString().split("T")[0];
  fechaInput.setAttribute("min", hoy);
  fechaInput.addEventListener("input", function () {
    const fechaSeleccionada = new Date(this.value);
    if (fechaSeleccionada.getDay() === 0) {
      alert("No se puede seleccionar domingos. Por favor, elige otra fecha.");
      this.value = "";
    }
  });
}

// === Función para manejar cambios en el método de pago ===
function mostrarBotonPago() {
  const metodoPago = document.getElementById("metodoPago").value;
  const btnMetodoTarjeta = document.getElementById("btnMetodoTarjeta");
  const btnMetodoPayPal = document.getElementById("btnMetodoPayPal");

  if (metodoPago === "Tarjeta") {
    btnMetodoTarjeta.style.display = "inline-block";
    btnMetodoPayPal.style.display = "none";
  } else if (metodoPago === "PayPal") {
    btnMetodoTarjeta.style.display = "none";
    btnMetodoPayPal.style.display = "inline-block";
  } else {
    btnMetodoTarjeta.style.display = "none";
    btnMetodoPayPal.style.display = "none";
  }
}

// === Función para abrir y cerrar modales ===
function abrirModalTarjeta() {
  const modalTarjeta = document.getElementById("modalTarjeta");
  if (modalTarjeta) modalTarjeta.style.display = "block";
}

function cerrarModalTarjeta() {
  const modalTarjeta = document.getElementById("modalTarjeta");
  if (modalTarjeta) modalTarjeta.style.display = "none";
}

function abrirModalPayPal() {
  const modalPayPal = document.getElementById("modalPayPal");
  if (modalPayPal) modalPayPal.style.display = "block";
}

function cerrarModalPayPal() {
  const modalPayPal = document.getElementById("modalPayPal");
  if (modalPayPal) modalPayPal.style.display = "none";
}

// === Función para calcular el total de la cita ===
function calcularTotal(trabajo) {
  const precios = {
    "Corte de Cabello": 15,
    "Manicure y Pedicure": 30,
    "Facial": 40,
  };
  return precios[trabajo] || 0;
}

// === Función para generar la cita (mostrar modal de confirmación) ===
function generarCita() {
  const trabajo = document.getElementById("trabajo").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const metodoPago = document.getElementById("metodoPago").value;

  if (!trabajo || !fecha || !hora || !metodoPago) {
    alert("Por favor, completa todos los campos antes de generar la cita.");
    return;
  }

  const total = calcularTotal(trabajo);

  document.getElementById("modalTrabajo").textContent = trabajo;
  document.getElementById("modalFecha").textContent = fecha;
  document.getElementById("modalHora").textContent = hora;
  document.getElementById("modalMetodoPago").textContent = metodoPago;
  document.getElementById("modalTotal").textContent = `$${total}`;

  document.getElementById("modalConfirmacion").style.display = "flex";
}

// === Función para confirmar la cita y guardarla ===
function confirmarCita() {
  const trabajo = document.getElementById("trabajo").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const metodoPago = document.getElementById("metodoPago").value;
  const total = calcularTotal(trabajo);

  fetch("guardar_cita.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ trabajo, fecha, hora, metodo_pago: metodoPago, total }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("¡Cita guardada correctamente!");
        cerrarModal();
        limpiarFormulario();
      } else {
        alert("Error al guardar la cita: " + data.error);
      }
    })
    .catch((error) => {
      alert("Error al procesar la solicitud.");
    });
}

function cerrarModal() {
  document.getElementById("modalConfirmacion").style.display = "none";
}

function limpiarFormulario() {
  document.getElementById("trabajo").value = "";
  document.getElementById("fecha").value = "";
  document.getElementById("hora").value = "";
  document.getElementById("metodoPago").value = "";
  mostrarBotonPago();
}

// === Restricciones para administrador ===
function verificarAdmin() {
  const usuarioRaw = localStorage.getItem("usuario");
  if (!usuarioRaw) return false;

  try {
    const usuario = JSON.parse(usuarioRaw);
    return usuario.rol && usuario.rol === "admin";
  } catch (error) {
    console.error("Error al verificar rol de administrador:", error);
    return false;
  }
}

function inicializarRestriccionesAdmin() {
  const esAdmin = verificarAdmin();

  // Restricciones en la página de inicio
  const btnAgregarInicio = document.getElementById("btnAgregarInicio");
  if (btnAgregarInicio) btnAgregarInicio.style.display = esAdmin ? "block" : "none";

  // Restricciones en servicios
  const btnAgregarServicio = document.getElementById("btnAgregarServicio");
  if (btnAgregarServicio) btnAgregarServicio.style.display = esAdmin ? "block" : "none";

  const botonesEliminarServicios = document.querySelectorAll(".btn-eliminar-servicio");
  botonesEliminarServicios.forEach((boton) => {
    boton.style.display = esAdmin ? "block" : "none";
  });

  // Restricciones en citas
  const tablaCitas = document.getElementById("tablaCitas");
  if (tablaCitas) {
    if (!esAdmin) {
      tablaCitas.innerHTML = "<tr><td colspan='6'>Acceso denegado. Solo disponible para administradores.</td></tr>";
    }
  }
}

// === Inicializar eventos y restricciones ===
document.addEventListener("DOMContentLoaded", function () {
  cargarPerfilUsuario();
  inicializarRestriccionesAdmin();

  const btnGenerarCita = document.getElementById("btnGenerarCita");
  if (btnGenerarCita) btnGenerarCita.addEventListener("click", generarCita);

  const btnConfirmarCita = document.getElementById("btnConfirmarCita");
  if (btnConfirmarCita) btnConfirmarCita.addEventListener("click", confirmarCita);

  const btnCancelarModal = document.getElementById("btnCancelarModal");
  if (btnCancelarModal) btnCancelarModal.addEventListener("click", cerrarModal);
});

// === Añadido: Función para iniciar sesión ===
function iniciarSesion(correo, contrasena) {
  fetch("login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Guardar datos del usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(data.user));

        // Redirigir según el rol del usuario
        window.location.href = data.redirect;
      } else {
        alert(data.message); // Mostrar mensaje de error
      }
    })
    .catch((error) => console.error("Error al iniciar sesión:", error));
}
// Ejemplo de uso (puedes ajustarlo según el HTML de tu formulario de login)
document.getElementById("btnLogin")?.addEventListener("click", function () {
  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;
  iniciarSesion(correo, contrasena);
});
