import { writable } from 'svelte/store';

const setttings = {
	Heatmap: {
		radiusPixels: 20,
		intensity: 1,
		colorDomain: null,
		colorRange: [],
	},
	Grid: {
		cellSize: 1200,
		elevationScale: 50,
		elevationRange: [0, 10000],
	},
	Scatterplotter: {
		radiusScale: 1,
		lineWidthMinPixels: 1,
	},
};

export const layerSettings = writable(setttings);
