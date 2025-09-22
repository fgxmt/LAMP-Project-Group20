<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$inData = json_decode(file_get_contents("php://input"), true) ?? [];
$searchText = trim($inData["search"] ?? "");
$userId     = (int)($inData["userId"] ?? 0);

if ($searchText === "" || $userId === 0) {
    echo json_encode(["success" => false, "error" => "Missing search text or user ID"]);
    exit;
}

$conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

$stmt = $conn->prepare("SELECT FirstName, LastName, PhoneNumber, EmailAddress FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID=?");
$likeSearch = "%" . $searchText . "%";
$stmt->bind_param("ssi", $likeSearch, $likeSearch, $userId);
$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = ["id"           => (int)$row["ID"], "firstName"    => $row["FirstName"],"lastName"     => $row["LastName"], "phoneNumber"  => $row["PhoneNumber"],"emailAddress" => $row["EmailAddress"]];
}

$stmt->close();
$conn->close();

if (count($contacts) === 0) {
    echo json_encode(["success" => false, "error" => "No contacts found"]);
} else {
    echo json_encode(["success" => true, "results" => $contacts]);
}
?>
