<?php
// Incluir conexión a la base de datos
require_once 'conexion.php';

// Configuración de encabezado para devolver JSON
header('Content-Type: application/json');

// Validar solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $fecha = $input['fecha'] ?? null;
    $hora = $input['hora'] ?? null;
    $metodo_pago = $input['metodo_pago'] ?? null;
    $nombre = $input['nombre'] ?? null;
    $telefono = $input['telefono'] ?? null;

    if (!$fecha || !$hora || !$metodo_pago || !$nombre || !$telefono) {
        echo json_encode(["error" => "Faltan datos obligatorios para guardar la cita."]);
        exit;
    }

    try {
        // Inserta una nueva cita en la tabla citas
        $stmt = $pdo->prepare(
            "INSERT INTO citas (fecha, hora, metodo_pago, nombre, telefono) 
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$fecha, $hora, $metodo_pago, $nombre, $telefono]);

        echo json_encode(["success" => "Cita guardada exitosamente."]);
    } catch (Exception $e) {
        echo json_encode(["error" => "Error al guardar la cita: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Método no permitido."]);
}
