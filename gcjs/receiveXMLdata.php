<?php
//session_start();
$xml = file_get_contents('php://input');
$_SESSION['xmlData'] = serialize($xmlStr);
$_SESSION['mode'] = 'SESSION_XML_upload2ndFile';
var_dump($_SESSION);
?>