<?php
$xml = file_get_contents('php://input');
$dir = '../download/';
$file = $_GET['filename'];
$fqn = $dir . $file;
$fh = fopen($fqn, 'w');
fwrite($fh, $xml);
fclose($fh);
?>