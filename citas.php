<?php
require 'conexion.php';

$query = "SELECT * FROM citas_user ORDER BY fecha DESC";
$stmt = $pdo->prepare($query);
$stmt->execute();
$citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($citas);
?>
