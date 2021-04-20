'use strict';

// Segment icons
const ICON_DELETE_SEGMENT = 0;
const ICON_PREPEND_SEGMENT = 3;
const ICON_APPEND_SEGMENT = 4;
const ICON_STOP_PREPEND_POINTS = 5;
const ICON_STOP_APPEND_POINTS = 6;

// Track icons
const ICON_DELETE_TRACK = 0;
const ICON_APPEND_TRACK = 1;
const ICON_PREPEND_TRACK = 2;

class ActionIcon {

	constructor(action, tIdx, sIdx) {
		this._tIdx = tIdx;
		this._sIdx = sIdx;
		this._action = action;
		this._isVisible = false;
		if (sIdx == -1)
			this._id = `gpi-track${tIdx}-icon-${action}`; // This icon belongs to a track
		else
			this._id = `gpi-track${tIdx}-segment${sIdx}-icon-${action}`; // This icon belongs to a segment
		this._iconContainer = this._createIconContainer();
	}

	get sIdx() { return this._sIdx; }
	set sIdx(newIdx) { 
		this._sIdx = newIdx;
		this._id = `gpi-track${this._tIdx}-segment${this._sIdx}-icon-${this._action}`;
		this._iconContainer.getElementsByTagName('img')[0].setAttribute('id', this._id);
		this._iconContainer.getElementsByTagName('img')[0].setAttribute('onclick', `event${this._action}(${this._tIdx}, ${this._sIdx})`);
	}
	get tIdx() { return this._tIdx; }
	set tIdx(newIdx) { 
		this._tIdx = newIdx;
		if (this._sIdx == -1) {
			this._id = `gpi-track${this._tIdx}-icon-${this._icon}`;
			this._img.setAttribute('id', this._id);
			this._img.setAttribute('onclick', `event${this._icon}(${this._tIdx}, -1)`);
		}
		else {
			this._id = `gpi-track${this._tIdx}-segment${this._sIdx}-icon-${this._icon}`;
			let img = this._img.getElementsByTagName('img')[0];
			img.setAttribute('id', this._id);
			img.setAttribute('onclick', `event${this._icon}(${this._tIdx}, ${this._sIdx})`);
		}
	}

	hide() {
		if (document.getElementById(this._id))
			document.getElementById(this._id).outerHTML = "";
		this._isVisible = false;
	}

	isVisible() {
		return this._isVisible;
	}

	show() {
		if (this._sIdx == -1)
			document.getElementById(`gpi-track${this._tIdx}-icons`).appendChild(this._iconContainer);
		else
			document.getElementById(`gpi-track${this._tIdx}-segment${this._sIdx}-icons`).appendChild(this._iconContainer);
		this._isVisible = true;
	}

	_createIconContainer() {
		let img = document.createElement('img');
		img.setAttribute('class', 'gpxinfo-icon');
		img.setAttribute('src', `images/${this._action}.png`);
		if (this._sIdx == -1)
			img.setAttribute('onclick', `event${this._action}(${this._tIdx})`);
		else
			img.setAttribute('onclick', `event${this._action}(${this._tIdx}, ${this._sIdx})`);
		img.setAttribute('height', '20');
		img.setAttribute('width', '20');
		let span = document.createElement('span');
		span.setAttribute('class', 'tooltiptext');
		let tipText = '';
		switch (this._action) {
			case 'appendSegment': tipText = 'Append new segment'; break;
			case 'appendTrack': tipText = 'Append new track'; break;
			case 'deleteSegment': tipText = 'Delete this segment'; break;
			case 'deleteTrack': tipText = 'Delete this track'; break;
			case 'prependSegment': tipText = 'Prepend new segment'; break;
			case 'prependTrack': tipText = 'Prepend new track'; break;
			case 'startPrependPoints': tipText = 'Prepend new points at the beginning of this segment.'; break;
			case 'startAppendPoints': tipText = 'Append new points at the end of this segment.'; break;
			case 'stopAppendPoints': 
			case 'stopPrependPoints': tipText = 'Stop inserting points. Return to standard mode.'; break;
		}
		span.textContent = tipText;
		let div = document.createElement('div');
		div.setAttribute('class', 'tooltip');
		div.setAttribute('id', this._id);
		div.appendChild(img);
		div.appendChild(span);
		return div;
	}
}
