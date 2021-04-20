'use strict';

class Waypoint {

	constructor(coord, idx, pIdx, ppIdx, color) {
		this._distance = 0; // distance to previous point
		this._duration = 0; // duration to previous point
		this._coord = coord; // coordinates of type LatLng
		this._wpMarker = new WaypointMarker(coord, color, ppIdx, pIdx, idx);
		this._color = color;
		this._speed = 0; // speed in m/s relative to previous point
		this._ts = 0; // timestamp of type Date
		this._idx = idx; // Idx of the point in the point array
		this._pIdx = pIdx; // Idx of the parent array (segment or route)
		this._ppIdx = ppIdx; // Idx of the grand parent array (track or -1, if it is a route)
	}

	get distance() { return this._distance; }
	set distance(newDistance) { this._distance = newDistance; }
	get duration() { return this._duration; }
	set duration(newDuration) { this._duration = newDuration; }
	get color() { return this._color; }
	set color(newColor) { 
		this._color = newColor;
		this._wpMarker.color = newColor;
	}
	get coord() { return this._coord; }
	get idx() { return this._idx; }
	set idx(newIdx) { this._idx = newIdx; }
	get pIdx() { return this._pIdx; }
	set pIdx(newIdx) { this._pIdx = newIdx; }
	get ppIdx() { return this._ppIdx; }
	set ppIdx(newIdx) { this._ppIdx = newIdx; }
	get speed() { return this._speed; }
	set speed(newSpeed) { this._speed = newSpeed; }
	get ts() {return this._ts; }
	set ts(newTs) { this._ts = newTs; }
	get wpMarker() { return this._wpMarker; }

	appendToTable() {
		let tableBody = document.getElementById('waypoint-table-body');
		let newRow = document.createElement('tr');
		let newRowStr = this._buildRowString();
		newRow.setAttribute('id', `wp-${this._ppIdx}-${this._pIdx}-${this._idx}`);
		newRow.innerHTML = newRowStr;
		tableBody.appendChild(newRow);
	} 

	changeDefaultColor() {
		this._wpMarker.changeDefaultColor();
	}

	createWPmarker(color) { // create a waypoint marker
		//console.log("method Waypoint.createWPMarker");
		this._wpMarker = new WaypointMarker(this.coord, color, this._ppIdx, this._pIdx, this._idx);
	}

	distanceTo(p2) {
		let d = this.coord.distanceTo(p2.coord);
		return d;
	}
	
	durationTo(p2) { // calculates the duration between two points
		let ts1 = new Date(this._ts);
		let ts2 = new Date(p2.ts);
		let t = Math.abs(ts2 - ts1) / 1000;
		return t;
	}
	
	removeWPmarkerFromMap() {
		this._wpMarker.marker.remove();
	}

	removeWPmarkerFromTable() {
		let row = document.getElementById(`wp-${this._ppIdx}-${this._pIdx}-${this._idx}`);
		row.parentNode.removeChild(row);
	}

	showOnMap() {
		this._wpMarker.marker.addTo(map.llMap);
	}

	_buildRowString() {
		let rowStr = `<td>${this._ppIdx}/${this._pIdx}/${this._idx}</td>`;
		if (this._ts)
			rowStr += `<td>${this._ts.getHours().toString().padStart(2,'0')}:${this._ts.getMinutes().toString().padStart(2,'0')}:${this._ts.getSeconds().toString().padStart(2,'0')}</td>`;
		else
			rowStr += `<td></td>`;
		rowStr +=	 `<td>${this._coord.lat}</td>` +
					 `<td>${this._coord.lng}</td>` +
					 `<td></td>` + // elevation: will come later
					 `<td>${round(this._distance, 0)}</td>` + 
					 `<td>${round(this._speed/1000*3600, 1)}</td>`; // speed: will come later
		return rowStr;
	}

}
