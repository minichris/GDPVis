<?php
if($_GET["url"]){ //if we've been sent a url
	$file_loc = getcwd()."/"."shorturl/" . $_GET["url"] . ".txt";
	if(file_exists($file_loc)){
		header("HTTP/1.1 301 Moved Permanently");
		header("Location: ".file_get_contents($file_loc));
		exit();
	}
	die(json_encode(array('error' => "redirect ".$_GET["url"]." doesn't exist")));
}