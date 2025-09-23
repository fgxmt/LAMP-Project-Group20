<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$userId = isset($_SESSION['userId']) ? (int)$_SESSION['userId'] : 0;
$term   = isset($_GET['term']) ? trim($_GET['term']) : '';

if ($userId <= 0) { http_response_code(401); echo json_encode(["success"=>false,"error"=>"Not logged in"]); exit; }

try {
  $conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
  $conn->set_charset('utf8mb4');

  if ($term === '') {
    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, PhoneNumber, EmailAddress FROM Contacts WHERE UserID = ? ORDER BY FirstName, LastName LIMIT 50");
    $stmt->bind_param("i", $userId);
  } else {
    $like = "%{$term}%";
    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, PhoneNumber, EmailAddress FROM Contacts WHERE UserID = ? AND (FirstName LIKE ? OR LastName LIKE ? OR EmailAddress LIKE ? OR PhoneNumber LIKE ?) ORDER BY FirstName, LastName LIMIT 50");
    $stmt->bind_param("issss", $userId, $like, $like, $like, $like);
  }

  $stmt->execute();
  $res = $stmt->get_result();

  $contacts = [];
  while ($row = $res->fetch_assoc()) {
    $contacts[] = [
      "id"        => (int)$row["ID"],
      "firstName" => $row["FirstName"],
      "lastName"  => $row["LastName"],
      "phone"     => $row["PhoneNumber"],
      "email"     => $row["EmailAddress"]
    ];
  }
  $stmt->close();
  $conn->close();

  echo json_encode(["success"=>true,"contacts"=>$contacts]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(["success"=>false,"error"=>"Server error"]);
}
