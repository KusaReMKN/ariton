<?php

error_reporting(0);
const aritonPath = './ariton.txt';

header('Content-Type: text/plain; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$url = $_POST['url'];
	$isUrl = filter_var($url, FILTER_VALIDATE_URL);
	if (!$isUrl) {
		http_response_code(400);
		die($url . ' is not a valid URL.');
	}
	$success = file_put_contents(aritonPath, $_POST['url']);
	if (!$success) {
		http_response_code(500);
		die('Error while saving URL.');
	}
	die($url);
}
$url = file_get_contents(aritonPath);
if ($url === false) {
	http_response_code(500);
	die('Error while reading URL.  URL may be not set.');
}
http_response_code(303);
header('Location: ' . $url);
die($url);
