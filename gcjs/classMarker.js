'use strict';

class WaypointMarker {

	constructor(coord, color, ppIdx, pIdx, idx) {
		var marker = L.marker(coord, {draggable: "true", icon: L.icon({iconUrl: `images/square_${color}.png`})});
		marker.on('mouseover', function(e) {evHandlerMouseOver(marker, ppIdx, pIdx, idx)});
		marker.on('mouseout', evHandlerMouseOut);
		marker.on('drag', function(e) {evHandlerDrag(marker, ppIdx, pIdx, idx)});
		marker.on('dragend', function(e) {evHandlerDragEnd(marker, ppIdx, pIdx, idx)});
		this._popupStr = `<div>${ppIdx}/${pIdx}/${idx}</div>`;
		marker.bindPopup(this._popupStr);
		this._color = color;
		this._marker = marker;
	}

	get color() { return this._color; }
	set color(newColor) { 
		this._color = newColor;
		this._marker.setIcon(L.icon({iconUrl: 'images/square_' + newColor + '.png'}));
	}
	get marker() { return this._marker; }
	/**
	 * @param {string} newStr
	 */
	set popupStr(newStr) {
		this._popupStr = newStr;
		this._marker.bindPopup(newStr);
	}
	
	changeDefaultColor() {
		if (this._color.substr(0, 5).localeCompare("light") == 0)       // Instead of changening the property _color directly,
			this.color = this._color.substr(5, this._color.length - 5); // we use the setter "color", to change the property and the icon
		else
			this.color = "light" + this._color;
	}

	disableDragging() {
		this._marker.dragging.disable();
	}

	enableDragging() {
		this._marker.dragging.enable();
	}

}



function evHandlerDrag(marker, ppIdx, pIdx, idx) {
	console.log("Event -> Drag");
	let polyline;
	if (ppIdx == -1) // route
		polyline = gpxData.routes[pIdx].polyline;
	else // track with segment
		polyline = gpxData.tracks[ppIdx].segments[pIdx].polyline;
	let polylineLatLngs = polyline.getLatLngs();
	let markerLatlng = marker.getLatLng();
	polylineLatLngs.splice(idx, 1, markerLatlng);
	polyline.setLatLngs(polylineLatLngs);
	if (ppIdx == -1) // route
		gpxData.routes[pIdx].polyline = polyline;
	else // track with segment
		gpxData.tracks[ppIdx].segments[pIdx].polyline = polyline;
}

function evHandlerDragEnd(marker, ppIdx, pIdx, idx) {
	console.log("Event -> DragEnd");
	let markerLatLng = marker.getLatLng();
	gpxData.xmlDoc.updateTrackPointCoordinates(ppIdx, pIdx, idx, markerLatLng);
}

function evHandlerMouseOver(marker, ppIdx, pIdx, idx) {
	console.log("Event -> MouseOver");
	marker.openPopup();
}

function evHandlerMouseOut(e) {
	console.log("Event -> MouseOut");
	this.closePopup();
}
