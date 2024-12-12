<?php
require_once 'conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $nombre = $data['nombre'] ?? null;
    $correo = $data['correo'] ?? null;
    $telefono = $data['telefono'] ?? null;
    $contrasena = $data['contrasena'] ?? null;

    if (!$nombre || !$correo || !$contrasena) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben completarse.']);
        exit;
    }

    try {
        // Verificar si el correo ya existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'El correo ya está registrado.']);
            exit;
        }

        // Cifrar la contraseña
        $hashedPassword = password_hash($contrasena, PASSWORD_DEFAULT);

        // Insertar el usuario como cliente
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, telefono, contrasena, rol) VALUES (?, ?, ?, ?, 'cliente')");
        $stmt->execute([$nombre, $correo, $telefono, $hashedPassword]);

        echo json_encode(['success' => true, 'message' => 'Cuenta creada exitosamente.']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
}
?>
