// === Función para cargar el perfil del usuario ===
function cargarPerfilUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuario")); // Obtener datos del usuario desde localStorage
  const userProfile = document.querySelector(".header-top");

  if (userProfile) {
    if (usuario) {
      // Mostrar el perfil del usuario
      userProfile.innerHTML = `
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

      // Eventos para el perfil del usuario
      document.getElementById("perfilFoto").addEventListener("click", alternarMenu);
      document.getElementById("cerrar-sesion").addEventListener("click", cerrarSesion);
      manejarCargaDeFoto(); // Activar funcionalidad para añadir foto

      // Ocultar campos Nombre y Teléfono si el usuario está autenticado
      ocultarCamposUsuario(usuario);
    } else {
      // Mostrar el botón de "Iniciar sesión" si no hay un usuario autenticado
      userProfile.innerHTML = `<a href="login.html" class="btn-login">Iniciar sesión</a>`;
    }
  }
}

// === Función para manejar la carga de una nueva foto ===
function manejarCargaDeFoto() {
  const inputFoto = document.getElementById("inputFoto");
  const perfilFoto = document.getElementById("perfilFoto");

  if (inputFoto && perfilFoto) {
    inputFoto.addEventListener("change", function (e) {
      const file = e.target.files[0]; // Obtener el archivo seleccionado

      if (file) {
        // Previsualizar la imagen seleccionada
        const reader = new FileReader();
        reader.onload = function (event) {
          perfilFoto.src = event.target.result; // Actualizar la imagen del perfil
        };
        reader.readAsDataURL(file);

        // Subir la imagen al servidor (opcional)
        subirFotoAlServidor(file);
      }
    });
  }
}

// === Función para subir la foto al servidor ===
async function subirFotoAlServidor(file) {
  const usuario = JSON.parse(localStorage.getItem("usuario")); // Obtener usuario logueado

  if (!usuario) {
    alert("Debe iniciar sesión para subir una foto.");
    return;
  }

  const formData = new FormData();
  formData.append("foto", file);
  formData.append("userId", usuario.id); // Suponiendo que tienes un identificador de usuario

  try {
    const response = await fetch("subir_foto.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      alert("Foto actualizada exitosamente.");
      // Actualizar el localStorage con la nueva foto
      usuario.foto = result.fotoUrl;
      localStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      alert(result.message || "Error al subir la foto.");
    }
  } catch (error) {
    console.error("Error al subir la foto:", error);
    alert("Hubo un error al intentar subir la foto.");
  }
}

// === Función para alternar la visibilidad del menú desplegable ===
function alternarMenu() {
  const menuOpciones = document.getElementById("menuOpciones");
  if (menuOpciones) {
    menuOpciones.classList.toggle("mostrar"); // Mostrar/ocultar el menú
  }
}

// === Función para cerrar sesión ===
function cerrarSesion() {
  localStorage.removeItem("usuario"); // Eliminar datos del usuario de localStorage
  window.location.href = "login.html"; // Redirigir al inicio de sesión
}

// === Función para ocultar los campos de Nombre y Teléfono si está autenticado ===
function ocultarCamposUsuario(usuario) {
  const nombreField = document.getElementById("nombre");
  const telefonoField = document.getElementById("telefono");

  if (nombreField && telefonoField) {
    // Rellenar los campos con los datos del usuario
    nombreField.value = usuario.nombre;
    telefonoField.value = usuario.telefono;

    // Ocultar los contenedores de los campos
    const campoNombre = nombreField.closest(".cita-opcion");
    const campoTelefono = telefonoField.closest(".cita-opcion");

    if (campoNombre) campoNombre.style.display = "none";
    if (campoTelefono) campoTelefono.style.display = "none";
  }
}

// === Función para manejar cambios en el método de pago ===
function mostrarBotonPago() {
  const metodoPago = document.getElementById("metodoPago").value;
  const btnMetodoPago = document.getElementById("btnMetodoPago");

  if (metodoPago === "Tarjeta" || metodoPago === "PayPal") {
    btnMetodoPago.style.display = "inline-block"; // Mostrar el botón
  } else {
    btnMetodoPago.style.display = "none"; // Ocultar el botón
  }
}

// === Restricción para seleccionar solo fechas futuras ===
window.addEventListener("load", function () {
  const fechaInput = document.getElementById("fecha");
  if (fechaInput) {
    const hoy = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
    fechaInput.setAttribute("min", hoy); // Establecer fecha mínima
  }
});

// === Inicialización: Cargar el perfil del usuario al cargar la página ===
window.addEventListener("DOMContentLoaded", cargarPerfilUsuario);
