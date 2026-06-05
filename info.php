<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permite que tu web lea estos datos

$url = "https://app0102.sonicpanelradio.com/cp/get_info.php?p=8246";
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_URL, $url);
$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>