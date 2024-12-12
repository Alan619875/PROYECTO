// === Eliminar cita (disponible globalmente) ===
function eliminarCita(id) {
  if (!confirm("¿Estás seguro de que deseas marcar esta cita como realizada?")) {
    return; // Cancelar la acción si el usuario no confirma
  }

  fetch("admin.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ action: "eliminarCita", id }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        console.log("Cita eliminada con éxito.");
        listarCitas(); // Recargar la tabla de citas para reflejar el cambio
      } else {
        console.error("Error al eliminar la cita:", data.message);
      }
    })
    .catch((err) => console.error("Error al eliminar cita:", err));
}

document.addEventListener("DOMContentLoaded", function () {
  let esAdmin = false;

  // === Verificar si el usuario es administrador ===
  function verificarAdmin() {
    return fetch("admin.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ action: "verificarRol" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          esAdmin = data.message === "Usuario Administrador";
          console.log(`Estado de administrador: ${esAdmin}`);
          gestionarVistaAdmin();
        } else {
          console.warn("Usuario no es administrador.");
          listarCitas(); // Cargar citas para usuario regular
        }
      })
      .catch((err) => console.error("Error al verificar administrador:", err));
  }

  // === Gestión de la vista de administrador ===
  function gestionarVistaAdmin() {
    ocultarFormularioCitas();
    listarCitas(); // Mostrar todas las citas
    cargarServicios(); // Cargar servicios
  }

  function ocultarFormularioCitas() {
    const formularioCitas = document.querySelector(".container-citas");
    if (esAdmin && formularioCitas) {
      formularioCitas.style.display = "none"; // Oculta el formulario de citas si es administrador
    }
  }

  // === Mostrar mensaje de bienvenida ===
  function mostrarMensajeBienvenida() {
    fetch("admin.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ action: "verificarRol" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const contenedorMensaje = document.getElementById("mensajeBienvenida");
        if (data.success && contenedorMensaje) {
          contenedorMensaje.innerText = data.message;
        }
      })
      .catch((err) => console.error("Error al mostrar el mensaje de bienvenida:", err));
  }

  // === Listar citas ===
  function listarCitas() {
    fetch("admin.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ action: "listarCitas" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          actualizarTablaCitas(data.items || []);
        } else {
          console.error("Error al listar citas:", data.message);
        }
      })
      .catch((err) => console.error("Error al cargar citas:", err));
  }

  // === Actualizar tabla de citas ===
  function actualizarTablaCitas(citas) {
    const tablaCitas = document.getElementById("tablaCitas");
    const sinCitas = document.getElementById("sinCitas");

    if (!citas || citas.length === 0) {
      sinCitas.style.display = "block";
      tablaCitas.style.display = "none";
      sinCitas.innerText = "No hay citas programadas.";
      return;
    }

    sinCitas.style.display = "none";
    tablaCitas.style.display = "table";

    const tbody = tablaCitas.querySelector("tbody");
    tbody.innerHTML = ""; // Limpia el contenido anterior

    citas.forEach((cita) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${cita.cliente || "No disponible"}</td>
        <td>${cita.trabajo}</td>
        <td>${cita.fecha}</td>
        <td>${cita.hora}</td>
        <td>${cita.metodo_pago}</td>
        <td>$${cita.total}</td>
        <td>
          ${
            esAdmin
              ? `<button onclick="eliminarCita(${cita.cita_id})" class="btn-realizada">Cita realizada</button>`
              : ""
          }
        </td>
      `;

      tbody.appendChild(fila);
    });
  }

  // === Cargar servicios ===
  function cargarServicios() {
    fetch("admin.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ action: "listarServicios" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          actualizarTablaServicios(data.items || []);
        } else {
          console.error("Error al listar servicios:", data.message);
        }
      })
      .catch((err) => console.error("Error al cargar servicios:", err));
  }

  // === Actualizar tabla de servicios ===
  function actualizarTablaServicios(servicios) {
    const tablaServicios = document.getElementById("tablaServicios");
    if (!tablaServicios) return;

    tablaServicios.innerHTML = servicios
      .map(
        (servicio) => `
          <tr onclick="abrirModalServicio(${servicio.id}, '${servicio.nombre}', '${servicio.descripcion}', '${servicio.precio}', '${servicio.imagen}')">
            <td><img src="${servicio.imagen}" width="50"></td>
            <td>${servicio.nombre}</td>
            <td>${servicio.descripcion}</td>
            <td>$${servicio.precio}</td>
          </tr>`
      )
      .join("");
  }

  // === Inicializar la página ===
  mostrarMensajeBienvenida();
  verificarAdmin();
});
