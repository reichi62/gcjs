<?php
$dir = '../download/';
$file = $_GET['filename'];
$fqn = $dir . $file;
$fileSize = filesize($fqn);
header("Content-Type: text/xml");
header("Content-Disposition: attachment; filename=\"$file\"");
header("Content-Length: $fileSize");
readfile($fqn);   
?>