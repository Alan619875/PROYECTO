// Función para validar el formato del correo electrónico
function validarCorreo(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

// Lógica para el formulario de creación de cuenta
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // Evitar recarga
    const nombre = document.getElementById("nombre")?.value.trim();
    const correo = document.getElementById("correo")?.value.trim();
    const telefono = document.getElementById("telefono")?.value.trim();
    const contrasena = document.getElementById("contrasena")?.value.trim();
    const confirmcontra = document.getElementById("confirmcontra")?.value.trim();
    // Validaciones
    if (!nombre || !correo || !telefono || !contrasena || !confirmcontra) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (!validarCorreo(correo)) {
      alert("Por favor, ingresa un correo válido.");
      return;
    }
    if (contrasena !== confirmcontra) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    try {
      const response = await fetch("crear_cuenta.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, telefono, contrasena }),
      });
      if (!response.ok) {
        throw new Error("Error en la conexión al servidor.");
      }
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        window.location.href = "login.html"; // Redirigir al login
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al conectar con el servidor.");
    }
  });
}

// Lógica para el formulario de inicio de sesión
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // Evitar recarga de la página
    const correo = document.getElementById("correo")?.value.trim();
    const contrasena = document.getElementById("contrasena")?.value.trim();
    if (!correo || !contrasena) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (!validarCorreo(correo)) {
      alert("Por favor, ingresa un correo válido.");
      return;
    }
    try {
      const response = await fetch("login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
      if (!response.ok) {
        throw new Error("Error en la conexión al servidor.");
      }
      const result = await response.json();
      if (result.success) {
        localStorage.setItem("usuario", JSON.stringify(result.user)); // Guardar usuario en localStorage
        alert(result.message);
        window.location.href = "index.html"; // Redirigir a la página principal
      } else {
        alert(result.message); // Mostrar el mensaje de error
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al conectar con el servidor.");
    }
  });
}
