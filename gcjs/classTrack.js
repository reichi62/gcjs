'use strict';

class Track {

	constructor(tIdx) {
		this._distance = 0; // distance in m
		this._duration = 0; // duration in s
		this._speed = 0; // speed in m/s
		this._segments = []; // Array of Segments
		this._idx = tIdx; // Idx of the track in the track array
		this._bounds = null;
		this._iconIndex = ['deleteTrack', 'appendTrack', 'prependTrack'];
		this._actionIcons = [];
		for (let i = 0; i < this._iconIndex.length; i++) this._actionIcons.push(new ActionIcon(this._iconIndex[i], this._idx, -1));
	}

	get actionIcons() { return this._actionIcons; }
	get bounds() { return this._bounds; }
	get distance() { return this._distance; }
	get duration() { return this._duration; }
	get speed() { return this._speed; }
	get idx() { return this._idx; }
	set idx(newIdx) { this._idx = newIdx; }
	get segments() { return this._segments; }

	appendSegment(segmentToAppend) {
		console.log("Track.appendSegment");
		if (this._segments.length > 0)
			this._segments[this._segments.length - 1]._actionIcons[ICON_APPEND_SEGMENT].hide();
		let newSegment = new Segment(this._idx, this._segments.length);
		this._segments.push(newSegment);
		gpxData.xmlDoc.appendSegment(this._idx, segmentToAppend);
		if (segmentToAppend != null)
			for (let p = 0; p < segmentToAppend.waypoints.length; p++) newSegment.appendWaypoint(segmentToAppend.waypoints[p]);
	}

	decreaseTrackIndex() {
		let newIdx = this._idx - 1;
		for (let s = 0; s < this._segments.length; s++) {
			for (let p = 0; p < this._segments[s].waypoints.length; p++) {
				this._segments[s].waypoints[p].ppIdx = newIdx;
				this._segments[s].waypoints[p].createWPmarker(this._segments[s].determineDefaultColor());
			}
			for (let i = 0; i < this._segments[s].actionIcons.length; i++) this._segments[s].actionIcons[i].tIdx = newIdx;
			this._segments[s].tIdx = newIdx;	
		}
		this._idx = newIdx;	
		this._actionIcons['deleteTrack'].tIdx = newIdx;
	}

	deleteSegment(sIdx) {
		console.log('method Track.deleteSegment(', sIdx, ')');
		gpxData.xmlDoc.deleteSegment(this._idx, sIdx);
		for (let s = sIdx; s < this._segments.length; s++) {
			this._segments[s].removeFromMap();
			this._segments[s].removeFromTable();
		}
		for (let t = this._idx + 1; t < gpxData.tracks.length; t++) gpxData.tracks[t].removeFromTable();
		for (let s = sIdx + 1; s < this._segments.length; s++) this._segments[s].decreaseSegmentIndex();
		this._segments.splice(sIdx, 1);
		this.updateTrackInfo();
		gpxData.updateBounds();
		map.showMe(gpxData.bounds);
		for (let s = sIdx; s < this._segments.length; s++) {
			this._segments[s].changeDefaultColor();
			this._segments[s].showOnMap();
			this._segments[s].showOnTable();
		}
		for (let t = this._idx + 1; t < gpxData.tracks.length; t++) gpxData.tracks[t].showOnTable();
		this.showInfo();
	}

	parse(xmlDoc) {
		console.log("method Track", this._idx, ".parse");
		let segmentsXML = xmlDoc.getSegments(this._idx);
		for (let s = 0; s < segmentsXML.length; s++) {
			let segment = new Segment(this._idx, s);
			segment.parse(xmlDoc);
			this._segments.push(segment);
			this._distance += segment.distance;
			this._duration += segment.duration;
		}
		if (this._duration > 0) this._speed = this._distance / this._duration;
		this.updateBounds();
	}

	removeFromMap() {
		for (let s = 0; s < this._segments.length; s++) this._segments[s].removeFromMap();
	}

	removeFromTable() {
		for (let s = 0; s < this._segments.length; s++) this._segments[s].removeFromTable();
	}

	showOnMap() {
		for (let s = 0; s < this._segments.length; s++) this._segments[s].showOnMap();
	}

	showOnTable() {
		for (let s = 0; s < this._segments.length; s++) this._segments[s].showOnTable();
	}

	showInfo() {
		console.log("method Track.showInfo");
		var div = document.createElement('div');
		div.setAttribute('id', `gpi-track${this._idx}`);
		div.innerHTML = 
			`<div class='gpi-headline-container' id='gpi-track${this._idx}-head'>` +
			`<div class='gpxinfo-track-header' id='gpi-track${this._idx}-title'>Track ${this._idx}</div>` +
			`<div class='actionicons-container' id='gpi-track${this._idx}-icons'></div></div>` +
			`<div class='gpxinfo-track-data' id='gpi-track${this._idx}-data'>` +
			"Distance: " + round(this._distance, 0) + " m = " + round(this._distance / 1000, 1) + " km<br>" +
			"Duration: " + round(this._duration, 0) + " s = " + round(this._duration / 60, 0) + " min<br>" +
			"Speed: " + round(this._speed, 1) + " m/s = " + round(this.speed * 3.6, 1) + " km/h = " + round(this._speed * 2.236936, 1) + " mph <br></div>";
		if (document.body.contains(document.getElementById(`gpi-track${this._idx}`))) 
			document.getElementById(`gpi-track${this._idx}`).replaceWith(div);
		else
			document.getElementById("gpxinfo-body").appendChild(div);
		this._actionIcons[0].show(); // shows the standard: delete
		if (this._idx == 0) this._actionIcons[ICON_PREPEND_TRACK].show(); // shows prepend segment
		if (this._idx == gpxData.tracks.length - 1) this._actionIcons[ICON_APPEND_TRACK].show(); // shows append segment
		for (let s = 0; s < this._segments.length; s++) this._segments[s].showInfo();
	}

	updateBounds() {
		if (this._segments.length > 0) {
			this._bounds = this._segments[0].bounds;
			for (let s = 1; s < this._segments.length; s++) this._bounds.extend(this._segments[s].bounds);
		}
	}

	updateTrackInfo() {
		console.log("updateTrackInfo()");
		this._distance = 0;
		this._duration = 0;
		this._speed = 0;
		this._bounds = null;
		for (let s = 0; s < this._segments.length; s++) {
			if (!this._bounds && this._segments[s].bounds) this._bounds = this._segments[s].bounds; // initialize track bounds
			if (this._bounds && this._segments[s].bounds) this._bounds.extend(this._segments[s].bounds); // extend track bounds
			this._distance += this._segments[s].distance;
			this._duration += this._segments[s].duration;
		}
		if (this._duration > 0) this._speed = this._distance / this._duration;
	}

}