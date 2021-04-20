'use strict';

var gpxData, gpxData2;
var map;
var mode, activeTrackIdx, activeSegmentIdx;

function loadGPXdataFromFile(fileName1, uniqueName, fileNumber, fileName2) {
	console.log("loadGPXdataFromFile");
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			if (fileNumber == 1) {
				console.log("Load 1st file");
				gpxData = new GpxData(this.responseText, fileName1);
				gpxData.parse();
				gpxData.showInfo();
				map = new llMap();
				map.showMe(gpxData.bounds);
				gpxData.showOnMap();
				gpxData.showOnTable();
				showActionButtons();
			}
			if (fileNumber == 2) {
				console.log("Load 2nd file");
				console.log("fileName1", fileName1);
				console.log("fileName2", fileName2);
				let xmlStr1 = localStorage.getItem('xmlStr1');
				console.log(xmlStr1.length);
				gpxData = new GpxData(xmlStr1, fileName1);
				gpxData.parse();
				map = new llMap();
				map.showMe(gpxData.bounds);
				gpxData.showOnMap();
				gpxData.showInfo();
				gpxData2 = new GpxData(this.responseText, fileName2);
				gpxData2.parse();
				gpxData2.showOnMap();
				gpxData2.showInfo();
				showImportDecisionForm();
			}
		}
	};
	xhr.open("GET", uniqueName, true);
	xhr.send();
}

function saveXMLdata() {
	console.log("Function - saveXMLdata");
	let s = new XMLSerializer();
	let xmlString = s.serializeToString(gpxData.xmlDoc.xml);
	createGPXfile(xmlString);	
}

function createGPXfile(xmlStr) {
	console.log("Function - createGPXfile");
	let script = `createGPXfile.php?filename=${gpxData.fileName}`;
	console.log("script: ", script)
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		//console.log("state createGPXfile: ", this.readyState);
		//console.log("status: ", this.status);
		if (this.readyState == 4 && this.status == 200)
			window.open('downloadGPXfile.php?filename=' + gpxData.fileName, '_blank');
	};
	xhr.open('POST', script, true);
	xhr.setRequestHeader('Content-Type', 'text/xml');
	xhr.send(xmlStr);
}

function sendXmlStr(xmlStr) {
	console.log("Function - sendXmlStr");
	let script = `receiveXMLdata.php`;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		console.log("transfer XML string completed");
	};
	xhr.open('POST', script, true);
	xhr.setRequestHeader('Content-Type', 'text/xml');
	xhr.send(xmlStr);
}
