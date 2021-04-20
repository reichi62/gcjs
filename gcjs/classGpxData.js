'use strict';

class GpxData {

	constructor(xmlString, fileName) {
		this._xmlDoc = new XmlDoc(xmlString);
		this._xmlNS = "";
		this._fileName = fileName;
		this._tracks = [];
		this._routes = [];
		this._bounds = new Object();
	}

	get bounds() { return this._bounds }
	get fileName() { return this._fileName }
	get tracks() { return this._tracks }
	get xmlDoc() { return this._xmlDoc }

	appendTrack(trackToAppend) {
		console.log("GpxData.appendTrack(", trackToAppend, ")");
		let newTrack = new Track(this._tracks.length);
		this._xmlDoc.appendTrack(newTrack);		
		if (trackToAppend == null) {
			console.log("we must create a empty segment");
			newTrack.appendSegment(null);
		}
		else
			for (let s = 0; s < trackToAppend.segments.length; s++)
				newTrack.appendSegment(trackToAppend.segments[s]);
		this._tracks.push(newTrack);
		this.showInfo();
	}

	createNewRoute(idx) {
	}

	deleteTrack(tIdx) {
		console.log('method GpxData.deleteTrack(', tIdx, ')');
		this._xmlDoc.deleteTrack(tIdx);
		for (let t = tIdx; t < this._tracks.length; t++) {
			this._tracks[t].removeFromMap();
			this._tracks[t].removeFromTable();
		}
		for (let t = tIdx + 1; t < this._tracks.length; t++) this._tracks[t].decreaseTrackIndex();
		this._tracks.splice(tIdx, 1);
		this.updateBounds();
		map.showMe(gpxData.bounds);
		for (let t = tIdx; t < this._tracks.length; t++) {
			this._tracks[t].showOnMap();
			this._tracks[t].showOnTable();
		}
		this.showInfo();
	}

	parse() {
		console.log("method GpxData.parse");
		this._xmlNS = this.xmlDoc.getNS();
		let tracksXml = this.xmlDoc.getTracks();
		for (let t = 0; t < tracksXml.length; t++) {
			let track = new Track(t);
			track.parse(this.xmlDoc);
			this._tracks.push(track);
			if (t == 0) this._bounds = track.bounds;
			if (t > 0) this._bounds.extend(track.bounds);
		}
	}

	showOnMap() {
		console.log("GpxData.showOnMap");
		for (let t = 0; t < this._tracks.length; t++) this._tracks[t].showOnMap();
	}

	showOnTable() {
		document.getElementById('waypoint-table-body').innerHTML = '';
		for (let t = 0; t < this._tracks.length; t++) this._tracks[t].showOnTable();
	}

	showInfo() {
		console.log('method GpxData.showInfo');
		document.getElementById('dialog-file-save').innerHTML = 'Current file: ' + this._fileName + ' <button type="button" onclick="saveXMLdata()">Save</button>';
		document.getElementById('gpxinfo-header').innerHTML = 'GPX Info';
		document.getElementById('gpxinfo-body').innerHTML = ''; // delete the old GPX info
		for (let t = 0; t < this._tracks.length; t++) this._tracks[t].showInfo();
	}

	updateBounds() {
		if (this._tracks.length > 0) {
			this._bounds = this._tracks[0].bounds;
			for (let t = 1; t < this._tracks.length; t++) this._bounds.extend(this._tracks[t].bounds);
		}
	}
}
