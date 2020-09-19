<?php
header("Access-Control-Allow-Origin: *");
function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyz', ceil($length/strlen($x)) )),1,$length);
}

if($_POST["url"]){ //if we've been sent a url
	$unique_string = generateRandomString(7);
	while(file_exists("shorturl/" . $unique_string . ".txt"))
	{
		$unique_string = generateRandomString(7);
	}
	$file = fopen("shorturl/" . $unique_string . ".txt", "w") or die(json_encode(array('error' => "could not open file for writing")));
	fwrite($file, $_POST["url"]);
	exit(json_encode(array('success' => "s.gdpv.is/" . $unique_string)));
}