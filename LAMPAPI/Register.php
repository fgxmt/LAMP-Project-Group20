<?php
// ===== REST headers =====
header("Content-Type: application/json");
// Optional CORS headers (only if you call from a browser frontend)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

// ===== Read JSON body =====
$in = json_decode(file_get_contents("php://input"), true) ?? [];
$firstName = trim($in["firstName"] ?? "");
$lastName  = trim($in["lastName"] ?? "");
$login     = trim($in["login"] ?? "");
$password  = (string)($in["password"] ?? "");

// ===== Basic validation =====
if ($firstName === "" || $lastName === "" || $login === "" || $password === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// ===== DB connect =====
$conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

// ===== Ensure unique login =====
$check = $conn->prepare("SELECT ID FROM Users WHERE Login = ?");
$check->bind_param("s", $login);
$check->execute();
$exists = $check->get_result()->fetch_assoc();
$check->close();

if ($exists) {
    http_response_code(409); // Conflict
    echo json_encode(["success" => false, "error" => "Login already in use"]);
    $conn->close();
    exit;
}

// ===== Insert user =====
$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);

if ($stmt->execute()) {
    http_response_code(201); // Created
    echo json_encode([
        "success" => true,
        "data" => [
            "userId"    => (int)$stmt->insert_id,
            "firstName" => $firstName,
            "lastName"  => $lastName,
            "login"     => $login
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Insert failed"]);
}

$stmt->close();
$conn->close();
