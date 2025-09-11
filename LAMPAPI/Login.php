<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$in = json_decode(file_get_contents("php://input"), true) ?? [];
$login    = trim($in["login"] ?? "");
$password = (string)($in["password"] ?? "");

if ($login === "" || $password === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing login or password"]);
    exit;
}

$conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

$stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Users WHERE Login=? AND Password=?");
$stmt->bind_param("ss", $login, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "success" => true,
        "data" => [
            "userId"    => (int)$row["ID"],
            "firstName" => $row["FirstName"],
            "lastName"  => $row["LastName"]
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid credentials"]);
}

$stmt->close();
$conn->close();
