<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$inData = getRequestInfo();

$firstName = $inData["firstName"];
$lastName = $inData["lastName"];

$phone = $inData["phone"];
$email = $inData["email"];

// Both of the below are required for now, consistent with the NOT NULL database fields
if ($phone === "") {
	http_response_code(400);
	echo json_encode(["success" => false, "error" => "Missing phone field!"]);
	exit;
}
if ($email === "") {
	http_response_code(400);
	echo json_encode(["success" => false, "error" => "Missing email field!"]);
	exit;
}

$userId = (int) $inData["userId"];

$conn = new mysqli("localhost", "Group20", "SuperCoolPassword20", "LAMPSTACK");
if ($conn->connect_error) 
{
	http_response_code(500);
	echo json_encode(["success" => false, "error" => "Database connection failed"]);
	exit;
}

$stmt = $conn->prepare("INSERT into Contacts (UserID, FirstName, LastName, PhoneNumber, EmailAddress) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issss", $userId, $firstName, $lastName, $phone, $email);

if ($stmt->execute()) {
	http_response_code(201);
	echo json_encode([
		"success" => true,
		"data" => [
			"userId"    => $userId,
			"firstName" => $firstName,
			"lastName"  => $lastName,
			"phone"     => $phone,
			"email"		=> $email
		]
	]);
} 
else {
	http_response_code(500);
	echo json_encode(["success" => false, "error" => "Insert failed"]);
}

function getRequestInfo()
{
	return json_decode(file_get_contents('php://input'), true);
}