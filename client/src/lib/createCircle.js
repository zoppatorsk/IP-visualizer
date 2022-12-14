import Point from '@mapbox/point-geometry';
import distance from '@turf/distance';
import { point as turfPoint } from '@turf/helpers';
import circle from '@turf/circle';

export default function createCircle(map) {
	return new Promise(function (resolve, reject) {
		const maxRadius = 500;
		let centerPos;
		let center;
		let radius = 0;
		let circleElement = null;
		const canvas = map.getCanvasContainer();
		const c = map.getCanvas();
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('pointerdown', mouseDown);
		document.addEventListener('contextmenu', onContextMenu);

		function mousePos(e) {
			let rect = canvas.getBoundingClientRect();
			return new Point(e.clientX - rect.left - canvas.clientLeft, e.clientY - rect.top - canvas.clientTop);
		}
		function cleanUp() {
			document.removeEventListener('pointerdown', mouseDown);
			document.removeEventListener('pointermove', onMouseMove);
			document.removeEventListener('pointerup', onMouseUp);
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('contextmenu', onContextMenu);
			map.dragRotate.enable();
			map.touchZoomRotate.enable();
			map.dragPan.enable();
			map.scrollZoom.enable();
			if (circleElement && circleElement.parentNode) circleElement.parentNode.removeChild(circleElement);
		}

		function onKeyDown(e) {
			if (e.keyCode === 27) {
				cleanUp();
				resolve(false);
			}
		}
		//right click, ie contextmenu is used as cancel button
		function onContextMenu(e) {
			e.preventDefault();
			cleanUp();
			resolve(false);
		}

		function mouseDown(e) {
			if (e.button == 0) {
				map.dragRotate.disable();
				map.touchZoomRotate.disableRotation();
				map.dragPan.disable();
				map.scrollZoom.disable();
				centerPos = mousePos(e);
				document.addEventListener('pointermove', onMouseMove);
				document.addEventListener('pointerup', onMouseUp);
			}
		}

		function onMouseMove(e) {
			let endPos = mousePos(e);

			//element used when drawing the circle on screen
			if (!circleElement) {
				circleElement = document.createElement('div');
				circleElement.style.cssText = 'background: rgba(56, 135, 190, 0.1);border: 2px solid var(--primary);position: absolute;top: 0;left: 0;z-index: 9;border-radius: 50%; display:flex;align-items:center;justify-content:center;color:white;font-size:13px;text-align:center;';
				canvas.appendChild(circleElement);
			}
			center = turfPoint([map.unproject(centerPos).lng, map.unproject(centerPos).lat]);
			let endPoint = turfPoint([map.unproject(endPos).lng, map.unproject(endPos).lat]);
			const currentRadius = distance(center, endPoint);

			//do some math n position the element in the corrrect place.
			circleElement.innerText = radius.toFixed().toString() + ' km';
			if (currentRadius > maxRadius) radius = maxRadius;
			if (currentRadius <= maxRadius) {
				radius = currentRadius;
				let x = Math.abs(centerPos.x - endPos.x);
				let y = Math.abs(centerPos.y - endPos.y);
				let r = Math.sqrt(x * x + y * y);

				let pos = 'translate(-50%, -50%)';
				circleElement.style.transform = pos;
				circleElement.style.width = r * 2 + 'px';
				circleElement.style.height = r * 2 + 'px';
				circleElement.style.top = centerPos.y + 'px';
				circleElement.style.left = centerPos.x + 'px';
			}
		}
		function onMouseUp(e) {
			e.preventDefault();
			if (e.button == 0) {
				e.preventDefault();
				finish();
			}
		}
		function finish() {
			renderCircle(circle(center, radius));
			cleanUp();
			resolve({ radius, lng: center.geometry.coordinates[0], lat: center.geometry.coordinates[1] });
		}
		function renderCircle(circle) {
			if (circle) {
				removeLayerIfExist('drawCirclePolygon');
				let circlePolygon = {
					type: 'geojson',
					data: circle,
				};
				map.addSource('drawCirclePolygon', circlePolygon);
				map.addLayer({
					id: 'drawCirclePolygon',
					type: 'line',
					source: 'drawCirclePolygon',
					layout: {},
					paint: {
						'line-color': '#107895',
						'line-width': 2,
					},
				});
			}
		}

		function removeLayerIfExist(name) {
			if (typeof map.getLayer(name) !== 'undefined') map.removeLayer(name).removeSource(name);
		}
	});
}
