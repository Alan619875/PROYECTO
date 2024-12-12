<?php
session_start();

// Verificar si el usuario tiene la sesión iniciada
if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
    exit;
}

// Verificar si el usuario es administrador
$isAdmin = isset($_SESSION['usuario']['rol']) && $_SESSION['usuario']['rol'] === 'admin';

// Conexión a la base de datos
$host = '127.0.0.1';
$dbname = 'evelynbeautylounge';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// Función para manejar errores
function jsonError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

// Función para manejar respuestas exitosas
function jsonSuccess($items = [], $message = null) {
    echo json_encode(['success' => true, 'items' => $items, 'message' => $message]);
    exit;
}

// Verificar si se envió una acción desde el frontend
$action = $_POST['action'] ?? null;
if (!$action) {
    jsonError('Acción no especificada.');
}

// === Gestión de Roles ===
if ($action === 'verificarRol') {
    $rol = $_SESSION['usuario']['rol'] ?? null;
    $mensaje = ($rol === 'admin') ? 'Usuario Administrador' : 'Bienvenido';
    jsonSuccess([], $mensaje);
}

// === Gestión de Citas ===
if ($action === 'listarCitas') {
    try {
        if ($isAdmin) {
            // Administrador: Mostrar todas las citas
            $stmt = $pdo->query('
                SELECT 
                    citas_user.id AS cita_id,
                    citas_user.trabajo,
                    citas_user.fecha,
                    citas_user.hora,
                    citas_user.metodo_pago,
                    citas_user.total,
                    usuarios.nombre AS cliente
                FROM citas_user
                LEFT JOIN usuarios ON citas_user.usuario_id = usuarios.id
            ');
        } else {
            // Cliente: Mostrar solo sus citas
            $usuarioId = $_SESSION['usuario']['id'];
            $stmt = $pdo->prepare('
                SELECT 
                    citas_user.id AS cita_id,
                    citas_user.trabajo,
                    citas_user.fecha,
                    citas_user.hora,
                    citas_user.metodo_pago,
                    citas_user.total
                FROM citas_user
                WHERE usuario_id = ?
            ');
            $stmt->execute([$usuarioId]);
        }
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonSuccess($result);
    } catch (Exception $e) {
        jsonError('Error al listar citas: ' . $e->getMessage());
    }
}

if ($action === 'eliminarCita') {
    $id = $_POST['id'] ?? null; // Recibir el ID de la cita desde el frontend
    if (!$id) {
        jsonError('ID de la cita es obligatorio.');
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM citas_user WHERE id = ?');
        $stmt->execute([$id]);
        jsonSuccess([], 'Cita eliminada con éxito.');
    } catch (Exception $e) {
        jsonError('Error al eliminar la cita: ' . $e->getMessage());
    }
}

// === Gestión de Servicios ===
if ($action === 'listarServicios') {
    try {
        $stmt = $pdo->query('SELECT * FROM servicios');
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonSuccess($result);
    } catch (Exception $e) {
        jsonError('Error al listar servicios: ' . $e->getMessage());
    }
}

if ($action === 'agregarServicio') {
    if (!$isAdmin) {
        jsonError('Acceso denegado. No tienes permisos de administrador.', 403);
    }

    $nombre = $_POST['nombre'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $precio = $_POST['precio'] ?? null;
    $imagen = $_POST['imagen'] ?? null;

    if (!$nombre || !$descripcion || !$precio || !$imagen) {
        jsonError('Todos los campos son obligatorios.');
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO servicios (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)');
        $stmt->execute([$nombre, $descripcion, $precio, $imagen]);
        jsonSuccess([], 'Servicio agregado con éxito.');
    } catch (Exception $e) {
        jsonError('Error al agregar servicio: ' . $e->getMessage());
    }
}

if ($action === 'eliminarServicio') {
    if (!$isAdmin) {
        jsonError('Acceso denegado. No tienes permisos de administrador.', 403);
    }

    $id = $_POST['id'] ?? null;
    if (!$id) {
        jsonError('ID del servicio es obligatorio.');
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM servicios WHERE id = ?');
        $stmt->execute([$id]);
        jsonSuccess([], 'Servicio eliminado con éxito.');
    } catch (Exception $e) {
        jsonError('Error al eliminar servicio: ' . $e->getMessage());
    }
}

// Si la acción no coincide con las definidas
jsonError('Acción no válida o no autorizada.', 403);
