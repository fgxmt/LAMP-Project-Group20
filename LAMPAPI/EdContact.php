<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$in = json_decode(file_get_contents("php://input"), true) ?? [];
$id = (int)($in["id"] ?? 0);
$firstName = trim($in["firstName"] ?? "");
$lastName  = trim($in["lastName"] ?? "");
$phone     = trim($in["phone"] ?? "");
$email     = trim($in["email"] ?? "");
$userId    = (int)($in["userId"] ?? 0);

if (!$id || !$userId) {
    echo json_encode(["success" => false, "error" => "Missing contact ID or user ID"]);
    exit;
}

$conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "DB connection failed"]);
    exit;
}

$stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, PhoneNumber=?, EmailAddress=? WHERE ID=? AND UserID=?");
$stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $id, $userId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "No changes made or contact not found"]);
}

$stmt->close();
$conn->close();
?>
