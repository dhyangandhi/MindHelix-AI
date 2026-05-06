<?php
// database connection
$con = mysqli_connect('localhost', 'root', '', 'db_contact');

if (!$con) {
    die("Connection failed: " . mysqli_connect_error());
}

// get the post records
$fullName = $_POST['FullName'];
$userName = $_POST['UserName'];
$email = $_POST['email'];
$phoneNumber = $_POST['PhoneNumber'];
$password = $_POST['Password'];
$confirmPassword = $_POST['ConfirmPassword'];

// Optional: Check if passwords match
if ($password !== $confirmPassword) {
    die("Passwords do not match.");
}

// Insert into database
$sql = "INSERT INTO tbl_contact (fldName, fldUsername, fldEmail, fldMobileNumber, fldPassword, fldConfirmPassword) 
VALUES ('$fullName', '$userName', '$email', '$phoneNumber', '$password', '$confirmPassword')";

$rs = mysqli_query($con, $sql);

if ($rs) {
    echo "Registration Successful!";
} else {
    echo "Error: " . mysqli_error($con);
}

// Close connection
mysqli_close($con);
?>

