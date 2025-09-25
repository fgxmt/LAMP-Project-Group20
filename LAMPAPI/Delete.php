<?php
// Delete.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

session_start();
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // Read JSON body
    $in = json_decode(file_get_contents('php://input'), true) ?? [];
    $contactId = isset($in['id']) ? (int)$in['id'] : (isset($in['ID']) ? (int)$in['ID'] : 0);

    // Auth: user must be logged in
    $userId = isset($_SESSION['userId']) ? (int)$_SESSION['userId'] : 0;
    if ($userId <= 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Not logged in"]);
        exit;
    }

    // Validate
    if ($contactId <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Missing or invalid id"]);
        exit;
    }

    // DB
    $conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
    $conn->set_charset('utf8mb4');

    // (Optional) fetch the contact first so we can return it after deletion
    $get = $conn->prepare("
        SELECT ID, FirstName, LastName, PhoneNumber, EmailAddress
        FROM Contacts
        WHERE ID = ? AND UserID = ?
        LIMIT 1
    ");
    $get->bind_param("ii", $contactId, $userId);
    $get->execute();
    $row = $get->get_result()->fetch_assoc();
    $get->close();

    if (!$row) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Contact not found"]);
        $conn->close();
        exit;
    }

    // Delete
    $del = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ? LIMIT 1");
    $del->bind_param("ii", $contactId, $userId);
    $del->execute();
    $affected = $del->affected_rows;
    $del->close();
    $conn->close();

    if ($affected !== 1) {
        http_response_code(409);
        echo json_encode(["success" => false, "error" => "Delete failed or already removed"]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "data" => [
            "id"        => (int)$row["ID"],
            "firstName" => $row["FirstName"],
            "lastName"  => $row["LastName"],
            "phone"     => $row["PhoneNumber"],
            "email"     => $row["EmailAddress"]
        ]
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error"]);
}
