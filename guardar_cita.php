<?php
// Configuración de conexión a la base de datos
$host = '127.0.0.1'; // Cambia si el host es diferente
$dbname = 'evelynbeautylounge'; // Nombre de tu base de datos
$username = 'root'; // Usuario
$password = ''; // Contraseña

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]));
}

// Verificar si se trata de una solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $trabajo = $_POST['trabajo'] ?? null;
    $fecha = $_POST['fecha'] ?? null;
    $hora = $_POST['hora'] ?? null;
    $metodo_pago = $_POST['metodo_pago'] ?? null;
    $total = $_POST['total'] ?? null;

    // Validar que todos los campos están presentes
    if (!$trabajo || !$fecha || !$hora || !$metodo_pago || !$total) {
        http_response_code(400);
        echo json_encode(['error' => 'Todos los campos son obligatorios.']);
        exit;
    }

    // Validación adicional: formato de fecha y hora
    $fechaValida = preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha);
    $horaValida = preg_match('/^\d{2}:\d{2}$/', $hora);

    if (!$fechaValida || !$horaValida) {
        http_response_code(400);
        echo json_encode(['error' => 'Formato de fecha u hora inválido.']);
        exit;
    }

    // Validar que el total sea numérico
    if (!is_numeric($total) || $total <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'El total debe ser un valor numérico positivo.']);
        exit;
    }

    try {
        // Preparar consulta para insertar datos
        $query = "INSERT INTO citas_user (trabajo, fecha, hora, metodo_pago, total, created_at) 
                  VALUES (:trabajo, :fecha, :hora, :metodo_pago, :total, NOW())";
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            ':trabajo' => $trabajo,
            ':fecha' => $fecha,
            ':hora' => $hora,
            ':metodo_pago' => $metodo_pago,
            ':total' => $total,
        ]);

        // Respuesta exitosa
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Cita guardada correctamente.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar la cita: ' . $e->getMessage()]);
    }
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}
?>
