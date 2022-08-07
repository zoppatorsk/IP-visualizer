import { Point as MapBoxPoint } from 'mapbox-gl';
import distance from '@turf/distance';
import { point } from '@turf/helpers';
import circle from '@turf/circle';

export default class CircleCreator {
	constructor(map, pointClass) {
		this.map = map;
		this.radius = 0;
		this.center = null; //hold coordinates of center of circle
		this.centerPos = null; //holds pos NOT latlng
		this.endPos = null; //pos for when releasing mouse button
		this.escape = false;
		this.acitve = false;
		this.maxRadius = 500;
		this.circleElement = null;
		this.canvas = map.getCanvasContainer();
		this.MouseMoveListener = this.onMouseMove.bind(this); //do some ugly stuff so can remove event listeners later
		this.MouseUpListener = this.onMouseUp.bind(this);
		this.MouseDownListener = this.mouseDown.bind(this);
		this.KeyDownListener = this.onKeyDown.bind(this);
	}
	activate() {
		//only add listern if not already active
		if (this.acitve) console.log('already active');
		if (this.acitve == false) {
			//reset stuff
			this.escape = false;
			this.radius = 0;
			this.center = null;
			this.centerPos = null;
			this.endPos = null;
			this.circleElement = null;
			this.canvas.addEventListener('mousedown', this.MouseDownListener);
			this.acitve = true;
		}
	}
	mousePos(e) {
		let rect = this.canvas.getBoundingClientRect();
		return new MapBoxPoint(e.clientX - rect.left - this.canvas.clientLeft, e.clientY - rect.top - this.canvas.clientTop);
	}

	mouseDown(e) {
		console.log('mouseDown');
		if (!(this.acitve && e.button === 0)) return;
		this.map.dragPan.disable();
		this.centerPos = this.mousePos(e);

		this.canvas.addEventListener('mousemove', this.MouseMoveListener);
		this.canvas.addEventListener('mouseup', this.MouseUpListener);
		document.addEventListener('keydown', this.KeyDownListener);
	}

	onKeyDown(e) {
		// If the ESC key is pressed
		if (e.keyCode === 27) {
			this.escape = true;
			this.finish();
		}
	}
	onMouseMove(e) {
		this.endPos = this.mousePos(e);

		//element used when drawing the circle on screen
		if (!this.circleElement) {
			this.circleElement = document.createElement('div');
			this.circleElement.style.cssText = 'background: rgba(56, 135, 190, 0.1);border: 2px solid #3887be;position: absolute;top: 0;left: 0;z-index: 999;border-radius: 50%; display:flex;align-items:center;justify-content:center;color:white;font-size:13px;text-align:center;';
			this.canvas.appendChild(this.circleElement);
		}
		this.center = point([this.map.unproject(this.centerPos).lng, this.map.unproject(this.centerPos).lat]);
		let endPoint = point([this.map.unproject(this.endPos).lng, this.map.unproject(this.endPos).lat]);
		const currentRadius = distance(this.center, endPoint);

		//do some math n position the element in the corrrect place if radius is below threshold
		this.circleElement.innerText = this.radius.toFixed().toString() + ' km';
		if (currentRadius > this.maxRadius) this.radius = this.maxRadius;
		if (currentRadius <= this.maxRadius) {
			this.radius = currentRadius;

			let x = Math.abs(this.centerPos.x - this.endPos.x);
			let y = Math.abs(this.centerPos.y - this.endPos.y);
			let r = Math.sqrt(x * x + y * y);

			let pos = 'translate(-50%, -50%)';
			this.circleElement.style.transform = pos;
			this.circleElement.style.width = r * 2 + 'px';
			this.circleElement.style.height = r * 2 + 'px';
			this.circleElement.style.top = this.centerPos.y + 'px';
			this.circleElement.style.left = this.centerPos.x + 'px';
		}
		// this.center = point([this.map.unproject(this.centerPos).lng, this.map.unproject(this.centerPos).lat]);
		// let endPoint = point([this.map.unproject(this.endPos).lng, this.map.unproject(this.endPos).lat]);
		// this.radius = distance(this.center, endPoint);
	}
	onMouseUp(e) {
		//finish upp all stuff
		this.finish();
	}
	finish() {
		this.canvas.removeEventListener('mousemove', this.MouseMoveListener);
		this.canvas.removeEventListener('mouseup', this.MouseUpListener);
		document.removeEventListener('keydown', this.KeyDownListener);
		this.canvas.removeEventListener('mousedown', this.MouseDownListener);

		if (!this.escape && this.centerPos && this.radius) {
			this.renderCircle(circle(this.center, this.radius));
			//dispatch the event with the needed stuff
			document.dispatchEvent(new CustomEvent('circleCreated', { bubbles: true, detail: { radius: this.radius, center: this.center } }));
			console.log('circleCreated');
		}

		//remove the element
		if (this.circleElement) {
			this.circleElement.parentNode.removeChild(this.circleElement);
		}

		this.acitve = false;
		this.map.dragPan.enable();
	}

	renderCircle(circle) {
		if (circle) {
			this.removeLayerIfExist('drawCirclePolygon');
			let circlePolygon = {
				type: 'geojson',
				data: circle,
			};
			this.map.addSource('drawCirclePolygon', circlePolygon);
			this.map.addLayer({
				id: 'drawCirclePolygon',
				type: 'line',
				source: 'drawCirclePolygon',
				layout: {},
				paint: {
					'line-color': '#6495ed',
					'line-width': 2,
				},
			});
		}
	}

	removeLayerIfExist(name) {
		let mapLayer = this.map.getLayer(name);
		if (typeof mapLayer !== 'undefined') {
			this.map.removeLayer(name).removeSource(name);
		}
	}
}
