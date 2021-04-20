'use strict';

class XmlDoc {

	constructor(xmlString) {
		let parser = new DOMParser();
		this._xml = parser.parseFromString(xmlString,"text/xml");
	}

	get xml() { return this._xml; }

	appendSegment(tIdx, newSegment) {
		console.log("xmlDoc.appendSegment");
		console.log("tIdx:", tIdx);
		let trackNode = this._xml.getElementsByTagName('trk')[tIdx];
		let newSegmentNode = this._xml.createElementNS(this.getNS(), 'trkseg');
		trackNode.appendChild(newSegmentNode);
		if (newSegment != null) {
			for (let p = 0; p < newSegment.waypoints.length; p++) {
				let segCount = trackNode.childElementCount;
				console.log("seg count:", segCount);
				this.appendWaypoint(tIdx, trackNode.childElementCount - 1, newSegment.waypoints[p]);
			}
		}
	}

	appendTrack(trackToAppend) {
		console.log('XmlDoc.appendTrack');
		let gpxNode = this._xml.getElementsByTagName('gpx')[0];
		let newTrackNode = this._xml.createElementNS(this.getNS(), 'trk');
		gpxNode.appendChild(newTrackNode);
		for (let s = 0; s < trackToAppend.segments.length; s++)
			this.appendSegment(trackToAppend.idx, trackToAppend.segments[s]);
	}

	appendWaypoint(tIdx, sIdx, wp) {
		console.log("xmlDoc.appendWaypoint");
		console.log("tIdx:", tIdx, "sIdx:", sIdx)
		//console.log("wp:", wp);
		let newWpNode = this._xml.createElementNS(this.getNS(), 'trkpt');
		newWpNode.setAttribute('lat', wp.coord.lat);
		newWpNode.setAttribute('lon', wp.coord.lng);
		let newTimeNode = this._xml.createElementNS(this.getNS(), 'time');
		let timeString = this._createTimeString(wp.ts);
		let timeTextNode = this._xml.createTextNode(timeString);
		newTimeNode.appendChild(timeTextNode);
        newWpNode.appendChild(newTimeNode);
        console.log("count points:", this.getTrackPoints(tIdx, sIdx).length);
        if (this.getTrackPoints(tIdx, sIdx).length > 0) {
//		if (gpxData.tracks[tIdx].segments[sIdx].waypoints.length > 1) {
//			let currentLastWaypoint = this.getTrackPoint(tIdx, sIdx, gpxData.tracks[tIdx].segments[sIdx].waypoints.length - 2);
			let currentLastWaypoint = this.getTrackPoint(tIdx, sIdx, this.getTrackPoints(tIdx, sIdx).length - 1);
			currentLastWaypoint.insertAdjacentElement('afterend', newWpNode);
		}
		else {
			let segment = this.getSegment(tIdx, sIdx);
			segment.appendChild(newWpNode);
		}
	}
	
	deleteSegment(tIdx, sIdx) {
		console.log('method XmlDoc.deleteSegment(', tIdx, ', ', sIdx, ')');
		let track = this._xml.getElementsByTagName('trk')[tIdx];
		let segment = track.getElementsByTagName('trkseg')[sIdx];
		track.removeChild(segment);
	}

	deleteTrack(tIdx) {
		console.log('method XmlDoc.deleteTrack', tIdx);
		let gpx = this._xml.getElementsByTagName('gpx')[0];
		let track = this._xml.getElementsByTagName('trk')[tIdx];
		gpx.removeChild(track);
	}

	deleteWaypoint(tIdx, sIdx, pIdx) {
		console.log('method XmlDoc.deleteWaypoint(', pIdx, ')');
		let segment = this.getSegment(tIdx, sIdx);
		let waypoint = this.getTrackPoint(tIdx, sIdx, pIdx);
		segment.removeChild(waypoint);
	}

	getNS() { return this._xml.getElementsByTagName('gpx')[0].getAttribute('xmlns')}

	getTracks() { return this._xml.getElementsByTagName('trk'); }

	getTrack(tIdx) { return this.getTracks()[tIdx];	}

	getSegments(tIdx) {	
		let track = this.getTrack(tIdx);
		let segments = track.getElementsByTagName('trkseg');
		return this.getTrack(tIdx).getElementsByTagName('trkseg'); }

	getSegment(tIdx, sIdx) { return this.getSegments(tIdx)[sIdx]; }

	getTrackPoints(tIdx, sIdx) { return this.getSegment(tIdx, sIdx).getElementsByTagName('trkpt'); }

	getTrackPoint(tIdx, sIdx, pIdx) { return this.getTrackPoints(tIdx, sIdx)[pIdx]; }

	prependWaypoint(tIdx, sIdx, wp) {
		let newWpNode = this._xml.createElementNS(this.getNS(), 'trkpt');
		newWpNode.setAttribute('lat', wp.coord.lat);
		newWpNode.setAttribute('lon', wp.coord.lng);
		let newTimeNode = this._xml.createElementNS(this.getNS(), 'time');
		console.log("wp.ts:", wp.ts);
		let timeString = this._createTimeString(wp.ts);
		let timeTextNode = this._xml.createTextNode(timeString);
		newTimeNode.appendChild(timeTextNode);
		newWpNode.appendChild(newTimeNode);		
		let currentFirstWaypoint = this.getTrackPoint(tIdx, sIdx, 0);
		currentFirstWaypoint.insertAdjacentElement('beforebegin', newWpNode);
	}
	
	updateTrackPointCoordinates(tIdx, sIdx, pIdx, coord) {
		let trackPoint = this.getTrackPoint(tIdx, sIdx, pIdx);
		trackPoint.setAttribute('lat', coord.lat);
		trackPoint.setAttribute('lon', coord.lng);
	}

	_appendLeadingZeroes(n) {
		if(n <= 9) return "0" + n;
		return n
	}
	
	_createTimeString(t) {
		let tsString = 	t.getFullYear() + '-' +
						this._appendLeadingZeroes(t.getMonth() + 1) + "-" + 
						this._appendLeadingZeroes(t.getDate()) + "T" + 
						this._appendLeadingZeroes(t.getUTCHours()) + ":" + 
						this._appendLeadingZeroes(t.getMinutes()) + ":" + 
						this._appendLeadingZeroes(t.getSeconds()) + "." +
						t.getMilliseconds() + "Z";
		console.log("tsString", tsString);
		return tsString;
	}
}
