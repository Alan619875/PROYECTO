<?php
session_start(); // Iniciar sesión
require_once 'conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $correo = $data['correo'] ?? null;
    $contrasena = $data['contrasena'] ?? null;

    if (!$correo || !$contrasena) {
        echo json_encode(['success' => false, 'message' => 'Por favor, completa todos los campos.']);
        exit;
    }

    try {
        // Buscar usuario por correo
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && password_verify($contrasena, $usuario['contrasena'])) {
            // Guardar información del usuario en la sesión
            $_SESSION['usuario'] = [
                'id' => $usuario['id'],
                'nombre' => $usuario['nombre'],
                'correo' => $usuario['correo'],
                'rol' => $usuario['rol'], // Aquí se incluye el rol del usuario
            ];

            // Respuesta con todos los datos necesarios para el frontend
            echo json_encode([
                'success' => true,
                'message' => 'Inicio de sesión exitoso.',
                'redirect' => 'index.html', // Cambia según tu flujo de redirección
                'user' => [
                    'id' => $usuario['id'],
                    'nombre' => $usuario['nombre'],
                    'correo' => $usuario['correo'],
                    'rol' => $usuario['rol'], // Incluir rol en la respuesta
                ],
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Correo o contraseña incorrectos.']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
}
?>
