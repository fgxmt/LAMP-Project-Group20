<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

session_start();
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$in = json_decode(file_get_contents('php://input'), true) ?? [];
$firstName = trim($in["firstName"] ?? "");
$lastName  = trim($in["lastName"]  ?? "");
$phone     = trim($in["phone"]     ?? "");
$email     = trim($in["email"]     ?? "");

$userId = isset($_SESSION['userId']) ? (int)$_SESSION['userId'] : 0;
if ($userId <= 0) { http_response_code(401); echo json_encode(["success"=>false,"error"=>"Not logged in"]); exit; }

if ($firstName === "" || $lastName === "") { http_response_code(400); echo json_encode(["success"=>false,"error"=>"First and last name required"]); exit; }
if ($phone === "") { http_response_code(400); echo json_encode(["success"=>false,"error"=>"Missing phone field!"]); exit; }
if ($email === "") { http_response_code(400); echo json_encode(["success"=>false,"error"=>"Missing email field!"]); exit; }

try {
  $conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
  $conn->set_charset('utf8mb4');

  $stmt = $conn->prepare("INSERT INTO Contacts (UserID, FirstName, LastName, PhoneNumber, EmailAddress) VALUES (?, ?, ?, ?, ?)");
  $stmt->bind_param("issss", $userId, $firstName, $lastName, $phone, $email);
  $stmt->execute();
  $contactId = $stmt->insert_id;
  $stmt->close();

  $get = $conn->prepare("SELECT ID, FirstName, LastName, PhoneNumber, EmailAddress FROM Contacts WHERE ID=? AND UserID=?");
  $get->bind_param("ii", $contactId, $userId);
  $get->execute();
  $row = $get->get_result()->fetch_assoc();
  $get->close();
  $conn->close();

  http_response_code(201);
  echo json_encode([
    "success"=>true,
    "data"=>[
      "id"        => (int)$row["ID"],
      "firstName" => $row["FirstName"],
      "lastName"  => $row["LastName"],
      "phone"     => $row["PhoneNumber"],
      "email"     => $row["EmailAddress"]
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(["success"=>false,"error"=>"Insert failed"]);
}
