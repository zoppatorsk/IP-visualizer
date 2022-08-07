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
				getFillColor: (d) => [255, 140, 0],
				pickable: true,
				// onHover: (info) => info && showTooltip(info),
				getTooltip: ({ object }) => object && object.CIDR,
				onClick: (info) => console.log(info.object),

				// 	[0, 'rgba(0, 0, 255, 0.2)'],
				// 	[1, 'rgba(0, 0, 255, 0.2)'],
				// ],
			});
			break;

		default:
			break;
	}
	return layer;
}
function showTooltip(info) {
	console.log(info);
}
