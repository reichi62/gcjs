'use strict';

function round(x, decimals) {
	x = parseFloat(x);
	return x.toFixed(decimals);
}

function eventappendSegment(tIdx) {
	gpxData.tracks[tIdx].appendSegment();
}

function eventappendTrack() {
	gpxData.appendTrack();
}

function eventClickOnMap(e) {
	console.log("eventClickOnMap");
	if (!mode || mode == 'normalOperation') return;
	let segment = gpxData.tracks[activeTrackIdx].segments[activeSegmentIdx];
	let wpId = -1;
	if (mode == 'appendPoints') {
		wpId = gpxData.tracks[activeTrackIdx].segments[activeSegmentIdx].waypoints.length;
		let wp = new Waypoint(e.latlng, wpId, activeSegmentIdx, activeTrackIdx);
		wp.createWPmarker(segment.color);
		segment.appendWaypoint(wp);
	}
	if (mode == 'prependPoints') {
		wpId = 0;
		let wp = new Waypoint(e.latlng, wpId, activeSegmentIdx, activeTrackIdx);
		wp.createWPmarker(segment.color);
		segment.prependWaypoint(wp);
	}
}

function eventdeleteSegment(tIdx, sIdx) {
	console.log('function eventDeleteSegment(', tIdx, sIdx, ")");
	if (gpxData.tracks[tIdx].segments.length > 1)
		gpxData.tracks[tIdx].deleteSegment(sIdx);
	else window.alert("You cannot delete the last segment.");
}

function eventdeleteTrack(tIdx) {
	console.log('function eventDeleteTrack');
	if (gpxData.tracks.length > 1)
		gpxData.deleteTrack(tIdx);
	else window.alert("You cannot delete the last track.");
}

function eventstartAppendPoints(tIdx, sIdx) {
	console.log('function eventStartAppendPoints');
	mode = 'appendPoints';
	activeTrackIdx = tIdx;
	activeSegmentIdx = sIdx;
	for (let t = 0; t < gpxData.tracks.length; t++) {
		for (let i = 0; i < gpxData.tracks[t].actionIcons.length; i++)
			if (gpxData.tracks[t].actionIcons[i].isVisible())
				gpxData.tracks[t].actionIcons[i].hide();
		for (let s = 0; s < gpxData.tracks[t].segments.length; s++) {
			for (let i = 0; i < gpxData.tracks[t].segments[s].actionIcons.length - 1; i++)
				if (gpxData.tracks[t].segments[s].actionIcons[i].isVisible())
					gpxData.tracks[t].segments[s].actionIcons[i].hide();
			gpxData.tracks[t].segments[s].disableDragging();
		}
	}
	gpxData.tracks[tIdx].segments[sIdx].actionIcons[ICON_STOP_APPEND_POINTS].show(); // show stopAppendPoints
	document.getElementById("help").innerHTML = "<b>Help</b><br>Insert points: click on a marker and next click to a free space on the map, where the new marker shall be created.";
	document.getElementById('TheMap').style.cursor = 'crosshair';
}

function eventstartPrependPoints(tIdx, sIdx) {
	console.log('function eventStartPrependPoints');
	mode = 'prependPoints';
	activeTrackIdx = tIdx;
	activeSegmentIdx = sIdx;
	for (let t = 0; t < gpxData.tracks.length; t++) {
		for (let i = 0; i < gpxData.tracks[t].actionIcons.length; i++)
			if (gpxData.tracks[t].actionIcons[i].isVisible())
				gpxData.tracks[t].actionIcons[i].hide();
		for (let s = 0; s < gpxData.tracks[t].segments.length; s++) {
			for (let i = 0; i < gpxData.tracks[t].segments[s].actionIcons.length - 1; i++)
				if (gpxData.tracks[t].segments[s].actionIcons[i].isVisible())
					gpxData.tracks[t].segments[s].actionIcons[i].hide();
			gpxData.tracks[t].segments[s].disableDragging();
		}
	}
	gpxData.tracks[tIdx].segments[sIdx].actionIcons[ICON_STOP_PREPEND_POINTS].show();
	document.getElementById("dialog-help").innerHTML = "<p>Insert points: click on a free space in the map, where the new marker shall be created. Repeat until ready. Click on icon stop insert points of the segment.</p>";
	document.getElementById('TheMap').style.cursor = 'crosshair';
}

function eventstopAppendPoints(tIdx, sIdx) {
	console.log('function eventStopAppendPoints');
	eventstopInsertPoints(tIdx, sIdx);
}

function eventstopInsertPoints(tIdx, sIdx) {
	console.log('function eventStopInsertPoints');
	mode = 'normalOperation';
	gpxData.tracks[tIdx].segments[sIdx].actionIcons[ICON_STOP_APPEND_POINTS].hide();
	gpxData.tracks[tIdx].segments[sIdx].actionIcons[ICON_STOP_PREPEND_POINTS].hide();
	for (let t = 0; t < gpxData.tracks.length; t++) {
		gpxData.tracks[t].actionIcons[ICON_DELETE_TRACK].show();
		if (t == 0) gpxData.tracks[t].actionIcons[ICON_PREPEND_TRACK].show();
		if (t == gpxData.tracks.length - 1) gpxData.tracks[t].actionIcons[ICON_APPEND_TRACK].show();
		for (let s = 0; s < gpxData.tracks[t].segments.length; s++) {
			for (let i = 0; i < 3; i++) gpxData.tracks[t].segments[s].actionIcons[i].show();
			if (s == 0) gpxData.tracks[t].segments[s].actionIcons[ICON_PREPEND_SEGMENT].show();
			if (s == gpxData.tracks[t].segments.length - 1) gpxData.tracks[t].segments[s].actionIcons[ICON_APPEND_SEGMENT].show();
			gpxData.tracks[t].segments[s].enableDragging();
		}
	}
	document.getElementById('TheMap').style.cursor = '';
}

function eventstopPrependPoints(tIdx, sIdx) {
	console.log('function eventStopPrependPoints');
	eventstopInsertPoints(tIdx, sIdx);
}

function showActionButtons() {
	document.getElementById('dialog-action-buttons').innerHTML = 
	    "<button id='btn-import-file'>import GPX file</button>" +
		"<button id='btn-delete-points'>delete waypoints</button>" +
		"<button id='btn-move-points'>move waypoints</button>" + 
		"<div id='help'></div>";
	let btnImportFile = document.getElementById('btn-import-file');
	btnImportFile.addEventListener('click', showImportFileForm, false);
	let btnDeletePoints = document.getElementById('btn-delete-points');
	btnDeletePoints.addEventListener('click', showDeletePointsForm, false);
	let btnMovePoints = document.getElementById('btn-move-points');
	btnMovePoints.addEventListener('click', showMovePointsForm, false);
}

function showDeletePointsForm() {
	document.getElementById('dialog-action-buttons').innerHTML = 
		"Track: <input type='text' id='input-track'> " +
		"Segment: <input type='text' id='input-segment' size='2'> " +
		"First point: <input type='text' id='input-first-point' size='5'> " +
		"Last point: <input type='text' id='input-last-point' size='5'><br>" +
		"<button id='btn-delete'>delete waypoints</button><button id='btn-cancel'>cancel</button>";
	let btnDelete = document.getElementById('btn-delete');
	btnDelete.addEventListener('click', processDeletePointsInput, false);
	let btnCancel = document.getElementById('btn-cancel');
	btnCancel.addEventListener('click', showActionButtons, false);
}

function showImportDecisionForm() {
	console.log("gui.js showImportDecisionForm()");
	document.getElementById('dialog-action-buttons').innerHTML = 
		"<div><p>Do you want to import?</p>" +
		"<button id='btn-import'>import</button> <button id='btn-cancel'>cancel</button></div>";
	let btnImport = document.getElementById('btn-import');
	btnImport.addEventListener('click', processImport, false);
	let btnCancel = document.getElementById('btn-cancel');
	btnCancel.addEventListener('click', showActionButtons, false);
}

function showImportFileForm() {
	console.log("gui.js showImportFileForm()");
	let s = new XMLSerializer();
	let xmlStr = s.serializeToString(gpxData.xmlDoc.xml);
	localStorage.setItem('xmlStr1', xmlStr);
	let fileName1 = gpxData.fileName;
	console.log ("fileName1", fileName1);
	console.log("xmlStr.length", xmlStr.length);
	document.getElementById('dialog-action-buttons').innerHTML = 
		"<div><p>Select 2nd GPX file:</p>" +
		"<form action='gc.php' method='post' enctype='multipart/form-data'>" +
		"<input type='file' name='userfile' size=40>" +
		"<button id='btn-import'>load</button>" +
		"<button id='btn-cancel'>cancel</button>" +
		"<input type='hidden' name='task' value='uploadFile2' />" +
		`<input type='hidden' name='fileName1' value='${fileName1}' />` +
		"</form></div>";
	let btnCancel = document.getElementById('btn-cancel');
	btnCancel.addEventListener('click', showActionButtons, false);
}

function showMovePointsForm() {
	document.getElementById('dialog-action-buttons').innerHTML = 
		"<table><tr><th></th><th>track</th><th>segment</th></tr>" +
		"<tr><td>source</td><td><input type='text' id='input-source-track' size='3'></td>" +
		"<td><input type='text' id='input-source-segment' size='3'></td></tr>" +
		"<tr><td>target</td><td><input type='text' id='input-target-track' size='3'></td>" +
		"<td><input type='text' id='input-target-segment' size='3'></td></tr></table>" +
		"First point: <input type='text' id='input-first-point' size='5'> " +
		"Last point: <input type='text' id='input-last-point' size='5'><br>" +
		"<button id='btn-move'>move waypoints</button> <button id='btn-cancel'>cancel</button>";
	let btnMove = document.getElementById('btn-move');
	btnMove.addEventListener('click', processMovePointsInput, false);
	let btnCancel = document.getElementById('btn-cancel');
	btnCancel.addEventListener('click', showActionButtons, false);
}

function processDeletePointsInput() {
	let tIdx = parseInt(document.getElementById('input-track').value);
	if (!(Number.isInteger(tIdx) && tIdx < gpxData.tracks.length && tIdx >= 0)) { window.alert("Track Id is not valid."); return; }
	let sIdx = parseInt(document.getElementById('input-segment').value);
	if (!(Number.isInteger(sIdx) && sIdx < gpxData.tracks[tIdx].segments.length && sIdx >= 0)) { window.alert("Segment Id is not valid."); return; }
	let pIdxStart = parseInt(document.getElementById('input-first-point').value);
	if (!(Number.isInteger(pIdxStart) && pIdxStart < gpxData.tracks[tIdx].segments[sIdx].waypoints.length && pIdxStart >= 0)) { window.alert("Start point Id is not valid."); return; }
	let pIdxEnd = parseInt(document.getElementById('input-last-point').value);
	if (!(Number.isInteger(pIdxEnd) && pIdxEnd < gpxData.tracks[tIdx].segments[sIdx].waypoints.length && pIdxEnd >= 0)) { window.alert("End point Id is not valid."); return; }
	gpxData.tracks[tIdx].segments[sIdx].deleteWaypoints(pIdxStart, pIdxEnd);
	showActionButtons();
}

function processImport() {
	console.log("Function - processImport");
	console.log("Number of tracks to import:", gpxData2.tracks.length);
	for (let t = 0; t < gpxData2.tracks.length; t++) {
		gpxData2.tracks[t].idx = gpxData.tracks.length + t;
		gpxData.appendTrack(gpxData2.tracks[t]);
	}
	showActionButtons();
}

function processMovePointsInput() {
	let tSourceIdx = parseInt(document.getElementById('input-source-track').value);
	if (!(Number.isInteger(tSourceIdx) && tSourceIdx < gpxData.tracks.length && tSourceIdx >= 0)) { window.alert("Track Id is not valid."); return; }
	let sSourceIdx = parseInt(document.getElementById('input-source-segment').value);
	if (!(Number.isInteger(sSourceIdx) && sSourceIdx < gpxData.tracks[tSourceIdx].segments.length && sSourceIdx >= 0)) { window.alert("Segment Id is not valid."); return; }
	let tTargetIdx = parseInt(document.getElementById('input-target-track').value);
	if (!(Number.isInteger(tTargetIdx) && tTargetIdx < gpxData.tracks.length && tTargetIdx >= 0)) { window.alert("Track Id is not valid."); return; }
	let sTargetIdx = parseInt(document.getElementById('input-target-segment').value);
	if (!(Number.isInteger(sTargetIdx) && sTargetIdx < gpxData.tracks[tTargetIdx].segments.length && sTargetIdx >= 0)) { window.alert("Segment Id is not valid."); return; }
	let pIdxStart = parseInt(document.getElementById('input-first-point').value);
	if (!(Number.isInteger(pIdxStart) && pIdxStart < gpxData.tracks[tSourceIdx].segments[sSourceIdx].waypoints.length && pIdxStart >= 0)) { window.alert("Start point Id is not valid."); return; }
	let pIdxEnd = parseInt(document.getElementById('input-last-point').value);
	if (!(Number.isInteger(pIdxEnd) && pIdxEnd < gpxData.tracks[tSourceIdx].segments[sSourceIdx].waypoints.length && pIdxEnd >= 0)) { window.alert("End point Id is not valid."); return; }
	gpxData.tracks[tSourceIdx].segments[sSourceIdx].moveWaypoints(tTargetIdx, sTargetIdx, pIdxStart, pIdxEnd);
	showActionButtons();
}

function createCookie(name, value, days2expire, path) {
	var date = new Date();
	date.setTime(date.getTime() + (days2expire * 24 * 60 * 60 * 1000));
	var expires = date.toUTCString();
	document.cookie = name + '=' + value + ';' + 'expires=' + expires + ';' + 'path=' + path + ';';
}

function objToString(object) {
	var str = '';
	for (var k in object) {
		if (object.hasOwnProperty(k)) {
		str += k + '::' + object[k] + '\n';
	  }
	}
	console.log(str);
	return str;
}