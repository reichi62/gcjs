<?php
declare(strict_types=1);
ini_set('display_errors','On');
require_once "classGPXFile.php";
?>

<!DOCTYPE HTML>
<html>
	<head>
		<title>GPX Companion V0.5</title>
		<meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
		<meta name='viewport' content='width=device-width, initial-scale=1'>
		<link rel='icon' type='image/ico' sizes='32x32' href='favicon/favicon.ico' type='image/ico' />
		<link rel='stylesheet' href='../leaflet/leaflet.css' />
		<link rel='stylesheet' href='css/layout.css' />
		<link rel='stylesheet' href='css/gc.css' />
        <link rel='stylesheet' href='css/tooltip.css' />
	</head>
	<body>
		<script src='../leaflet/leaflet.js'></script>
		<script src='classMap.js'></script>
		<script src='classMarker.js'></script>
		<script src='classWaypoint.js'></script>
		<script src='classSegment.js'></script>
		<script src='classTrack.js'></script>
		<script src='classGpxData.js'></script>
		<script src='classXmlDoc.js'></script>
		<script src='classActionIcon.js'></script>
		<script src='gui.js'></script>
		<script src='gpx.js'></script>
		<?php
		if (isset($_POST['task'])) $task = $_POST['task']; else $task = 'init';
		if (sizeof($_FILES) > 0 && $_FILES["userfile"]["error"] == 0) {
			$gpxFile = new GPXFile($_FILES);
			if ($gpxFile->upload()) {
				$uniqueName = $gpxFile->getUniqueName();
				if ($task == 'uploadFile1') {
					$xmlStr = "";
					$fileName1 = $gpxFile->getFileName();
					$fileName2 = "";
					echo "<script>loadGPXdataFromFile('$fileName1','$uniqueName', 1, '$fileName2');</script>";
				}
				if ($task == 'uploadFile2') {
					$fileName1 = $_POST['fileName1'];
					$fileName2 = $gpxFile->getFileName();
					echo "<script>loadGPXdataFromFile('$fileName1','$uniqueName', 2, '$fileName2');</script>";
				}
			}
			else
				echo "Upload error!<br>";
		}
		?>
		<div id='grid-container-toplevel'>
			<header id='grid-item-header'>
				<table width='100%'>
					<tr><td><h1>GPX Companion</h1></td><td align='right'>Version 0.4<br>April 2021</td></tr>
				</table>
			</header>
			<main id='grid-item-main'>
				<div id='grid-container-main'>
					<div id='grid-item-dialog'>
						<div id='dialog-container'>
							<div id='dialog-file'>
								<div id='dialog-file-load'>
									<p>Select GPX file (max. 2000 kByte):</p>
									<form action='gc.php' method='post' enctype='multipart/form-data'>
										<input type='file' name='userfile' size=40>
										<input type='hidden' name='task' value='uploadFile1' />
										<input type='submit' name='btn' value='load'>
									</form>
								</div>
								<div id='dialog-file-save'>
								</div>
							</div>
							<div id='dialog-action-buttons'>
							</div>
							<div id='dialog-help'>
								<p id="help">
									<b>Help</b>To start use buttton <i>upload GPX file</i> to load a file. Important: we don't store your GPX file permanently. It is deleted after your session has ended.
								</p>
							</div>
						</div>
					</div>
					<div id='grid-item-waypoints'>
						<div id='waypoints-container'>
							<table id='waypoint-table'>
								<thead>
									<tr><th>id</th><th>time</th><th>latitude</th><th>longitude</th><th>elev</th><th>dist</th><th>speed</th></tr>
								</thead>
								<tbody id='waypoint-table-body'>
								</tbody>
							</table>
						</div>
					</div>
					<div id='grid-item-gpxinfo'>
						<div id='gpxinfo-container'>
							<div id="gpxinfo-header"></div>
							<div id="gpxinfo-body"></div>
						</div>
					</div>
					<figure id='grid-item-map'>
						<div id='TheMap'></div>
					</figure>
					<aside id='grid-item-aside'>
						<p>ads</p>
					</aside>
				</main>
			<footer id='grid-item-footer'>
				<p>&copy Markus Reichenbach, April 2021<p>
			</footer>
		</div>
	</body>
</html>
