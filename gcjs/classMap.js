'use strict';

class llMap {

	constructor() {
		this._llMap = L.map('TheMap');
		L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.llMap);
		this._llMap.on('click', eventClickOnMap);
	}

	get llMap() { return this._llMap; }

	showMe(bounds) {
		console.log("method llMap.showMe");
		this._llMap.fitBounds(bounds);	
	}

}
