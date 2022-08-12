import { writable } from 'svelte/store';

const setttings = {
	Heatmap: {
		radiusPixels: 20,
		intensity: 1,
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
	Hexagon: {
		radius: 1000,
		coverage: 1,
		upperPercentile: 100,
	},
};

export const waitingForData = writable(false);
export const layerSettings = writable(setttings);
