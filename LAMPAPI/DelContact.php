<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$in = json_decode(file_get_contents("php://input"), true) ?? [];
$id = (int)($in["id"] ?? 0);
$userId = (int)($in["userId"] ?? 0);

if (!$id || !$userId) {
    echo json_encode(["success" => false, "error" => "Missing contact ID or user ID"]);
    exit;
}

$conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "DB connection failed"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
$stmt->bind_param("ii", $id, $userId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Contact not found"]);
}

$stmt->close();
$conn->close();
?>
