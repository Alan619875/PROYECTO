<?php
$host = '127.0.0.1'; // Cambia esto si el host es diferente
$dbname = 'evelynbeautylounge'; // Reemplaza con el nombre de tu base de datos
$username = 'root'; // Reemplaza con tu usuario
$password = ''; // Reemplaza con tu contraseña

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]));
}
?>

