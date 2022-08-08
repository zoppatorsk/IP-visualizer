import { MapboxLayer } from '@deck.gl/mapbox';
import { GridLayer, HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import { get } from 'svelte/store';
import { layerSettings } from './stores/';

export default function createLayer(selectedLayer, ipData) {
	let layer;
	switch (selectedLayer) {
		case 'Heatmap':
			console.log('heatmap case');
			layer = new MapboxLayer({
				type: HeatmapLayer,
				id: selectedLayer,
				data: ipData,
				getPosition: (d) => d.coordinates,
				getWeight: (d) => d.hosts,
				radiusPixels: get(layerSettings)[selectedLayer].radiusPixels,
				intensity: get(layerSettings)[selectedLayer].intensity,
				radiusMinPixels: 1,
				radiusMaxPixels: 100,

				// colorRange: [
				// 	[0, 'rgba(0, 0, 255, 0.2)'],
				// 	[1, 'rgba(0, 0, 255, 0.2)'],
				// ],
			});
			break;

		case 'Grid':
			console.log('grid case');
			layer = new MapboxLayer({
				type: GridLayer,
				id: selectedLayer,
				data: ipData,
				cellSize: get(layerSettings)[selectedLayer].cellSize,
				extruded: true,
				elevationScale: get(layerSettings)[selectedLayer].elevationScale,
				elevationRange: get(layerSettings)[selectedLayer].elevationRange,
				getPosition: (d) => d.coordinates,
				getElevationVeight: (d) => d.hosts * 10,
				getColorWeight: (d) => ipData.filter((ip) => ip.coordinates[0] === d.coordinates[0] && ip.coordinates[1] === d.coordinates[1]).reduce((acc, cur) => acc + cur.hosts, 0),
				pickable: true,

				// 	[0, 'rgba(0, 0, 255, 0.2)'],
				// 	[1, 'rgba(0, 0, 255, 0.2)'],
				// ],
			});
			break;

		case 'Scatterplotter':
			layer = new MapboxLayer({
				type: ScatterplotLayer,
				id: selectedLayer,
				data: ipData,
				stroked: true,
				filled: true,
				radiusMinPixels: 1,
				radiusMaxPixels: 50,
				getRadius: (d) => d.hosts / 10,
				radiusScale: get(layerSettings)[selectedLayer].radiusScale,
				lineWidthMinPixels: get(layerSettings)[selectedLayer].lineWidthMinPixels,
				getPosition: (d) => d.coordinates,
				// getFillColor: (d) => [1, 'rgba(0, 0, 255, 0.2)'],
				getFillColor: (d) => colorByHosts(d.hosts),
				pickable: true,
				onHover: (info) => info.object && document.dispatchEvent(new CustomEvent('info', { bubbles: true, detail: info.object })),
				// onHover: (info) => info && document.dispatchEvent(new CustomEvent('info', { bubbles: true, detail: { data: info.object, x: info.x, y: info.y } })),

				// onClick: (info) => console.log(info.object),

				// 	[0, 'rgba(0, 0, 255, 0.2)'],
				// 	,
				// ],
			});
			break;

		default:
			break;
	}
	return layer;
}

//fix these colors later
function colorByHosts(hosts) {
	if (hosts >= 50000) return [132, 94, 194];
	if (hosts >= 10000) return [214, 93, 177];
	if (hosts >= 5000) return [255, 150, 113];
	if (hosts > 1024) return [255, 150, 113];
	if (hosts >= 512) return [255, 199, 95];
	if (hosts > 0) return [249, 248, 113];
}
