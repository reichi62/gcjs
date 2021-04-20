'use strict';

class Segment {

	constructor(tIdx, sIdx) {
		this._distance = 0; // distance in m
		this._duration = 0; // duration in s
		this._speed = 0; // speed in m/s
		this._waypoints = []; // Array of Waypoints
		this._bounds = null;
		this._polyline = null; // Polyline which represents the connector of points
		this._tIdx = tIdx; // Idx of the track array
		this._idx = sIdx; // Idx of the segment in the segment array
		this._color = this._determineColor();
		this._iconIndex = ['deleteSegment', 'startPrependPoints', 'startAppendPoints', 'prependSegment', 'appendSegment', 'stopPrependPoints', 'stopAppendPoints'];
		this._actionIcons = [];
		for (let i = 0; i < this._iconIndex.length; i++) this._actionIcons.push(new ActionIcon(this._iconIndex[i], this._tIdx, this._idx));
	}
		
	get distance() { return this._distance; }
	get duration() { return this._duration; }
	get speed() { return this._speed; }
	get bounds() { return this._bounds; }
	get color() { return this._color; }
	set color(newColor) { this._color = newColor; }
	get idx() { return this._idx; }
	set idx(newIdx) { this._idx = newIdx; }
	get polyline() { return this._polyline; }
	set polyline(newPolyline) { this._polyline = newPolyline; }
	get tIdx() { return this._tIdx; }
	set tIdx(newIdx) { this._tIdx = newIdx; }
	get waypoints() { return this._waypoints; }
	get actionIcons() { return this._actionIcons; }
	
	appendWaypoint(newWP) {
		console.log("Segment.appendWaypoint");
		if (!newWP.ts) newWP.ts = this._calculateTSappend(newWP);
		this._waypoints.push(newWP);
		this._waypoints[this._waypoints.length - 1].showOnMap();
		//gpxData.xmlDoc.appendWaypoint(this._tIdx, this._idx, newWP);
	}

	changeDefaultColor() {
		console.log("Segment.changeDefaultColor");
		for (let p = 0; p < this._waypoints.length; p++) this._waypoints[p].changeDefaultColor();
	}

	decreaseSegmentIndex() {
		this._idx = this._idx - 1;
		this._color = this._determineColor();
		for (let p = 0; p < this._waypoints.length; p++) {
			this._waypoints[p].pIdx = this._idx;
			this._waypoints[p].createWPmarker(this._color);
		}
		for (let i = 0; i < this._actionIcons.length; i++) this._actionIcons[i].sIdx = this._idx;
	}

	deleteWaypoints(pIdxStart, pIdxEnd) {
		console.log('method Segment.deleteWaypoint(', pIdxStart, pIdxEnd, ')');
		for (let p = pIdxEnd; p >= pIdxStart; p--) gpxData.xmlDoc.deleteWaypoint(this._tIdx, this._idx, p);
		for (let p = pIdxStart; p < this._waypoints.length; p++) this._waypoints[p].removeWPmarkerFromMap();
		this._waypoints.splice(pIdxStart, pIdxEnd - pIdxStart + 1);
		let polylineLatLngs = this._polyline.getLatLngs();
		polylineLatLngs.splice(pIdxStart, pIdxEnd - pIdxStart + 1);
		this._polyline.setLatLngs(polylineLatLngs);
		for (let p = pIdxStart; p < this._waypoints.length; p++) {
			this._waypoints[p].idx = p;
			this._waypoints[p].createWPmarker(this._color);
			this._waypoints[p].showOnMap();
		}
		gpxData.showOnTable();
	}

	disableDragging() {
		for (let p = 0; p < this._waypoints.length; p++)
			this._waypoints[p].wpMarker.disableDragging();
	}

	enableDragging() {
		for (let p = 0; p < this._waypoints.length; p++)
			this._waypoints[p].wpMarker.enableDragging();
	}

	insertWaypointArray(pointsToBeInserted, latLngsToBeInserted) {
		console.log("method Segment.insertWaypointArray");
		for (let p = 0; p < pointsToBeInserted.length; p++)
			gpxData.xmlDoc.appendWaypoint(this._tIdx, this._idx, pointsToBeInserted[p]);
		this._waypoints = this._waypoints.concat(pointsToBeInserted);
		console.log("polyline before:", this._polyline);
		if (!this._polyline)
			this._polyline = new L.Polyline(latLngsToBeInserted, {color: 'grey'});
		else
			for (let p = 0; p < latLngsToBeInserted.length; p++) this._polyline.addLatLng(latLngsToBeInserted[p]);
	}

	moveWaypoints(tTargetIdx, sTargetIdx, pStartIdx, pEndIdx) {
		console.log('method Segment.moveWaypoint(', tTargetIdx, sTargetIdx, pStartIdx, pEndIdx, ')');
		for (let p = pEndIdx; p >= pStartIdx; p--) gpxData.xmlDoc.deleteWaypoint(this._tIdx, this._idx, p);
		for (let p = pStartIdx; p <= pEndIdx; p++) this._waypoints[p].removeWPmarkerFromMap();
		let latLngsToBeMoved = this._polyline.getLatLngs().splice(pStartIdx, pEndIdx - pStartIdx + 1);
		let pointsToBeMoved = this._waypoints.splice(pStartIdx, pEndIdx - pStartIdx + 1);	
		for (let p = 0; p < pointsToBeMoved.length; p++) {
			pointsToBeMoved[p].ppIdx = tTargetIdx;
			pointsToBeMoved[p].pIdx = sTargetIdx;
			pointsToBeMoved[p].color = gpxData.tracks[tTargetIdx].segments[sTargetIdx].color;
			pointsToBeMoved[p].wpMarker.popupStr = `<div>${tTargetIdx}/${sTargetIdx}/${p}</div>`;
		}
		gpxData.tracks[tTargetIdx].segments[sTargetIdx].insertWaypointArray(pointsToBeMoved, latLngsToBeMoved);
		gpxData.tracks[tTargetIdx].segments[sTargetIdx].showOnMap();
		gpxData.showOnTable();
		// Update source segment info
		this.updateDistance();
		this.updateDuration();
		// Update target segment info
		gpxData.tracks[tTargetIdx].segments[sTargetIdx].updateDistance();
		gpxData.tracks[tTargetIdx].segments[sTargetIdx].updateDuration();
		// Update source and target track info
		gpxData.tracks[this._tIdx].updateTrackInfo();
		gpxData.tracks[this._tIdx].showInfo();
		gpxData.tracks[tTargetIdx].updateTrackInfo();
		gpxData.tracks[tTargetIdx].showInfo();
	}

	parse(xmlDoc) { 
		console.log("method Segment", this._idx, ".parse");
		let pointsXML = xmlDoc.getTrackPoints(this._tIdx, this._idx);
		let polylineLatLngs = [];
		for (let p = 0; p < pointsXML.length; p++) {
			let coord1 = L.latLng(parseFloat(pointsXML[p].getAttribute('lat')), parseFloat(pointsXML[p].getAttribute('lon'))); 
			let p1 = new Waypoint(coord1, p, this._idx, this._tIdx);
			if (pointsXML[p].getElementsByTagName('time').length > 0)
				p1.ts = new Date(pointsXML[p].getElementsByTagName('time')[0].textContent);
			p1.createWPmarker(this._color);
			this._waypoints.push(p1);
			polylineLatLngs.push(p1.coord);
			if (p == 0) {
				let coordTmp = L.latLng(p1.coord.lat, p1.coord.lng);
				this._bounds = L.latLngBounds(coord1, coordTmp);
			}
			if (p > 0) {
				this._waypoints[p].distance = this._waypoints[p].distanceTo(this._waypoints[p-1]);
				this._waypoints[p].duration = this._waypoints[p].durationTo(this._waypoints[p-1]);
				if (this._waypoints[p].ts > 0 && this._waypoints[p-1].ts > 0)
					this._waypoints[p].speed = this._waypoints[p].distance / this._waypoints[p].duration;
				this._distance += this._waypoints[p].distance;
				this._bounds.extend(coord1);
			}
		}
		if (this._waypoints.length > 0)
			this._duration = this._waypoints[0].durationTo(this._waypoints[this._waypoints.length - 1]);
		if (this._duration > 0) this._speed = this._distance / this._duration;
		this._polyline = new L.Polyline(polylineLatLngs, {color: 'grey'});
	}

	prependWaypoint(newWP) {
		console.log("Segment.prependWaypoint");
		if (!newWP.ts) newWP.ts = this._calculateTSprepend(newWP);
		for (let p = 0; p < this._waypoints.length; p++) {
			this._waypoints[p].idx = this._waypoints[p].idx + 1;
			let popupStr = `<div>${this._tIdx}/${this._idx}/${this._waypoints[p].idx}</div>`;
			this._waypoints[p].wpMarker.popupStr = popupStr;
		}
		this._waypoints.unshift(newWP);
		this._waypoints[1].distance = this._waypoints[1].distanceTo(this._waypoints[0]);
		this._waypoints[1].duration = this._waypoints[1].durationTo(this._waypoints[0]);
		this._waypoints[1].speed = this._waypoints[1].distance / this._waypoints[1].duration;
		this._distance += this._waypoints[0].distanceTo(this._waypoints[1]);
		this._duration += this._waypoints[0].durationTo(this._waypoints[1]);
		this._waypoints[0].showOnMap();
		gpxData.xmlDoc.prependWaypoint(this._tIdx, this._idx, newWP);
	}

	removeFromMap() {
		for (let p = 0; p < this._waypoints.length; p++) this._waypoints[p].removeWPmarkerFromMap();
		if (this._waypoints.length > 1) this._polyline.remove();
	}

	removeFromTable() {
		for (let p = 0; p < this._waypoints.length; p++) this._waypoints[p].removeWPmarkerFromTable();
	}

	showInfo() {
		console.log("method Segment.showInfo");
		console.log("tIdx", this._tIdx);
		let div = document.createElement('div');
		div.setAttribute('id', `gpi-track${this._tIdx}-segment${this._idx}`);
		div.innerHTML =
			`<div class='gpi-headline-container' id='gpi-track${this._tIdx}-segment${this._idx}-head'>` + 
			`<div class='gpxinfo-segment-header' id='gpi-track${this._tIdx}-segment${this._idx}-title'>Segment ${this._idx}</div>` +
			`<div class='colorbar'></div>` +
			`<div class='actionicons-container' id='gpi-track${this._tIdx}-segment${this._idx}-icons'></div></div>` +
			`<div class='gpxinfo-segment-data' id='gpi-track${this._tIdx}-segment${this._idx}-data'>` +
			"Distance: " + round(this._distance, 0) + " m = " + round(this._distance / 1000, 1) + " km<br>" +
			"Duration: " + round(this._duration, 0) + " s = " + round(this._duration / 60, 0) + " min<br>" +
			"Speed: " + round(this._speed, 1) + " m/s = " + round(this.speed * 3.6, 1) + " km/h = " + round(this._speed * 2.236936, 1) + " mph <br></div>";
		if (document.body.contains(document.getElementById(`gpi-track${this._tIdx}-segment${this._idx}`))) 
			document.getElementById(`gpi-track${this._tIdx}-segment${this._idx}`).replaceWith(div);
		else
			document.getElementById(`gpi-track${this._tIdx}`).appendChild(div);
		for (let i = 0; i < 3; i++) this._actionIcons[i].show(); // shows the standard: delete, prepend points, append points
		if (this._idx == 0) this._actionIcons[ICON_PREPEND_SEGMENT].show(); // shows prepend segment
		if (this._idx == gpxData.tracks[this._tIdx].segments.length - 1) this._actionIcons[ICON_APPEND_SEGMENT].show(); // shows append segment
	}

	showOnMap() {
		console.log("method Segment.showOnMap");
		console.log("waypoints:", this._waypoints.length);
		for (let p = 0; p < this._waypoints.length; p++) this._waypoints[p].showOnMap();
		if (this._waypoints.length > 1) this._polyline.addTo(map.llMap); // Connectors
	}

	showOnTable() {
		console.log("method Segment.showOnTable");
		for (let p = 0; p < this._waypoints.length; p++) this._waypoints[p].appendToTable();
	}

	updateDistance() {
		this._distance = 0;
		for (let p = 1; p < this._waypoints.length; p++)
			this._distance += this._waypoints[p].distanceTo(this._waypoints[p - 1]);
	}

	updateDuration() {
		console.log("method Segment.updateDuration");
		console.log("TrackId:", this._tIdx, "SegmentId:", this._idx);
		console.log("number of waypoints:", this._waypoints.length);
		this._duration = 0;
		if (this._waypoints.length > 0) {
			this._duration = this._waypoints[0].durationTo(this._waypoints[this._waypoints.length - 1]);
			if (this._duration > 0) this._speed = this._distance / this._duration;
		}
	}

	_calculateTSappend(newWP) { // Get speed from the last 10 points and calculate the average
		let p, speed = 0;
		let sliceStart = this._waypoints.length > 10 ? 10 : this._waypoints.length;
		let lastWPs = this._waypoints.slice(sliceStart * -1);
		for (p = 0; p < lastWPs.length; p++) speed = speed + lastWPs[p].speed;
		let avgSpeed = speed / p; // avgSpeed in [m/s]
		let distance = newWP.distanceTo(lastWPs[lastWPs.length - 1]); // distance in [m]
		let duration = distance / avgSpeed; // duration in [s]
		let milliSecs = lastWPs[lastWPs.length - 1].ts.getTime();
		let newTimestamp = new Date(milliSecs + duration * 1000);
		newWP.speed = avgSpeed;
		console.log("TS", newTimestamp);
		return newTimestamp;
	}

	_calculateTSprepend(newWP) { // Get speed from the first 10 points and calculate the average
		console.log("_calculateTSprepend");
		let p, speed = 0;
		for (p = 0; p < 10 && p < this._waypoints.length; p++) speed = speed + this._waypoints[p].speed;
		console.log("sum of speed of first 10 points:", speed);
		console.log("p:", p);
		let avgSpeed = speed / p; // avgSpeed in [m/s]
		console.log("avgSpeed:", avgSpeed);
		let distance = newWP.distanceTo(this._waypoints[0]); // distance in [m]
		console.log("distance to first point:", distance);
		let duration = distance / avgSpeed; // duration in [s]
		console.log("duration:", duration);
		let newTimestamp = new Date(this._waypoints[0].ts - (duration * 1000)); // Subtract ms form first date
		return newTimestamp;
	}

	_determineColor() {
		let col = "";
		if (this._tIdx % 2 == 1) col = "purple"; else col = "blue";
		if (this._idx % 2 == 1) col = "light" + col;
		return col;
	}

}