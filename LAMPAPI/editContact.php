<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

session_start();
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$input = json_decode(file_get_contents("php://input"), true) ?? [];
$contactId = isset($input["id"]) ? (int)$input["id"] : 0;
$userId    = isset($_SESSION['userId']) ? (int)$_SESSION['userId'] : 0;

if ($contactId <= 0 || $userId <= 0) {
  http_response_code(400);
  echo json_encode(["success"=>false,"error"=>"Missing id or not logged in"]);
  exit;
}

// input -> DB column map (uses PhoneNumber/EmailAddress)
$map = ["firstName"=>"FirstName","lastName"=>"LastName","phone"=>"PhoneNumber","email"=>"EmailAddress"];
$fields=[]; $params=[]; $types="";
foreach ($map as $inKey=>$col) {
  if (array_key_exists($inKey, $input)) {
    $val = is_string($input[$inKey]) ? trim($input[$inKey]) : $input[$inKey];
    $fields[] = "$col = ?";
    $params[] = $val;
    $types   .= "s";
  }
}
if (!$fields) { http_response_code(400); echo json_encode(["success"=>false,"error"=>"No fields to update"]); exit; }

try {
  $conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
  $conn->set_charset('utf8mb4');

  $sql = "UPDATE Contacts SET ".implode(", ", $fields)." WHERE ID = ? AND UserID = ?";
  $params[] = $contactId; $params[] = $userId; $types .= "ii";

  $stmt = $conn->prepare($sql);
  $bind = [$types]; foreach ($params as $k=>$_) { $bind[] = &$params[$k]; }
  call_user_func_array([$stmt, "bind_param"], $bind);
  $stmt->execute();
  $stmt->close();

  $get = $conn->prepare("SELECT ID, FirstName, LastName, PhoneNumber, EmailAddress, UserID FROM Contacts WHERE ID=? AND UserID=?");
  $get->bind_param("ii", $contactId, $userId);
  $get->execute();
  $row = $get->get_result()->fetch_assoc();
  $get->close(); 
  $conn->close();

  if (!$row) { http_response_code(404); echo json_encode(["success"=>false,"error"=>"Contact not found"]); exit; }

  echo json_encode([
    "success"=>true,
    "data"=>[
      "id"        => (int)$row["ID"],
      "firstName" => $row["FirstName"],
      "lastName"  => $row["LastName"],
      "phone"     => $row["PhoneNumber"],
      "email"     => $row["EmailAddress"],
      "userId"    => (int)$row["UserID"]
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(["success"=>false,"error"=>"Update failed"]);
}
