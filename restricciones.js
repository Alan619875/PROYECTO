// === Verificar si el usuario es administrador ===
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
// === Inicializar restricciones para administrador ===
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
 // Inicializar restricciones para administrador en citas
function inicializarRestriccionesAdminCitas() {
  const esAdmin = verificarAdmin();

  // Ocultar los elementos de generación de citas si es administrador
  const formularioCitas = document.querySelector(".container-citas");
  const btnGenerarCita = document.getElementById("btnGenerarCita");
  const elementosCitas = document.querySelectorAll("#trabajo, #fecha, #hora, #metodoPago");

  if (esAdmin) {
    if (formularioCitas) formularioCitas.style.display = "none"; // Ocultar el formulario completo
    elementosCitas.forEach((el) => (el.style.display = "none")); // Ocultar campos individuales
    if (btnGenerarCita) btnGenerarCita.style.display = "none"; // Ocultar botón de generación
  }
}

// Actualizar tabla de citas según el rol
function actualizarTablaCitas() {
  fetch("admin.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ action: "listarCitas" }),
  })
    .then((res) => res.json())
    .then((data) => {
      const tablaCitas = document.getElementById("tablaCitas");
      const sinCitas = document.getElementById("sinCitas");

      if (!data.items || data.items.length === 0) {
        sinCitas.style.display = "block";
        tablaCitas.style.display = "none";
        sinCitas.innerText = "No hay citas disponibles.";
        return;
      }

      sinCitas.style.display = "none";
      tablaCitas.style.display = "table";

      // Generar filas de la tabla
      const filas = data.items.map((cita) => {
        const acciones = esAdmin
          ? `<button onclick="marcarCitaRealizada(${cita.cita_id})">Marcar como realizada</button>
             <button onclick="eliminarCita(${cita.cita_id})" style="color: red;">Eliminar</button>`
          : "";
        return `
          <tr>
            <td>${cita.cliente || "No disponible"}</td>
            <td>${cita.trabajo}</td>
            <td>${cita.fecha}</td>
            <td>${cita.hora}</td>
            <td>${cita.metodo_pago}</td>
            <td>$${cita.total}</td>
            <td>${acciones}</td>
          </tr>`;
      });

      tablaCitas.querySelector("tbody").innerHTML = filas.join("");
    })
    .catch((err) => console.error("Error al cargar citas:", err));
}

// Iniciar restricciones al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  inicializarRestriccionesAdminCitas();
  actualizarTablaCitas();
});

  // Mensaje solo al inicio de sesión
  if (esAdmin && !sessionStorage.getItem("mensajeAdminMostrado")) {
    alert("Usuario verificado como administrador.");
    sessionStorage.setItem("mensajeAdminMostrado", "true");
  }
}

// === Inicializar restricciones al cargar el DOM ===
document.addEventListener("DOMContentLoaded", function () {
  inicializarRestriccionesAdmin();
});
