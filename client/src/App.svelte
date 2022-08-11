<script>
	import { layerSettings } from './lib/stores/';
	import maplibregl from 'maplibre-gl';
	import { onMount } from 'svelte';
	import CircleCreator from './lib/CircleCreator.js';
	import createLayer from './lib/createLayer.js';
	import ArrowLeft from 'svelte-material-icons/ArrowLeft.svelte';
	import ArrowRight from 'svelte-material-icons/ArrowRight.svelte';

	import SelectionEllipse from 'svelte-material-icons/Crosshairs.svelte';
	import fetchData from './lib/fetchData';

	let circleCreator;
	let ipData = [];
	let waitingForData = false;
	let layer;
	let selectedLayer;
	let availableLayers = ['Heatmap', 'Hexagon', 'Scatterplotter', 'Grid'];
	let map;
	let mapLoaded = false; //changes to true when map has loaded
	let info;
	let hideController = false;
	let madeVisible = false;
	$: selectedLayer && mapLoaded && changeLayer(); //will run changeLayer function when map is loaded and layer is selected

	document.addEventListener('info', (e) => {
		// @ts-ignore
		info = e.detail;
	});

	document.addEventListener('circleCreated', async (e) => {
		// @ts-ignore
		if (e?.detail) {
			// @ts-ignore
			let { radius, center } = e.detail;
			radius = parseInt(radius);
			waitingForData = true;
			const postData = { radius, lng: center.geometry.coordinates[0], lat: center.geometry.coordinates[1] };
			ipData = await fetchData(postData);
			updateLayer();
			waitingForData = false;
		}
	});

	function changeLayer() {
		console.log('change layer');
		console.log('selectedLayer', selectedLayer);

		if (!mapLoaded) return; //prevent function from running when map is not loaded

		//loop layers n remove if exists
		availableLayers.forEach((l) => {
			if (typeof map.getLayer(l) !== 'undefined') map.removeLayer(l);
		});
		layer = createLayer(selectedLayer, ipData);
		if (layer) {
			map.addLayer(layer);
		}
		info = null;
	}

	function send() {
		console.log('send');
		if (circleCreator) circleCreator.activate();
		// socket.emit('chat message', 'kewk');
	}

	function updateLayer() {
		//if have layer and is set then just update data
		if (layer && typeof map.getLayer(selectedLayer) !== 'undefined') {
			console.log('update data');
			layer.setProps({ data: ipData });
		} else if (layer) {
			//think this is not needed realy.. but hey, better safe than sorry
			console.log('have layer but not set?');
			//have a layer but it is not set, so just set it
			map.addLayer(layer);
		} else {
			//Just for debugging, shld not happen if other code is ok
			console.log('some shit must be wrong??');
			changeLayer();
		}
	}

	//'mapbox://styles/mapbox/satellite-v9'
	onMount(() => {
		//mapboxgl.accessToken = import.meta.env.VITE_MAPBOXKEY;
		map = new maplibregl.Map({
			container: 'map',
			style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // style URL
			center: [14.052833595128646, 58.41176811801333],
			zoom: 3,
			renderWorldCopies: false,
			attributionControl: false,
			maxBounds: [
				[-179, -75],
				[179, 75],
			],
			// });
		}).addControl(
			new maplibregl.AttributionControl({
				customAttribution: 'This product includes GeoLite2 data created by MaxMind, available from<br><a href="https://www.maxmind.com">https://www.maxmind.com</a>.',
				compact: false,
			})
		);

		map.on('load', function () {
			mapLoaded = true;
			circleCreator = new CircleCreator(map);
		});
	});
</script>

<main>
	<h1>IP Visualizer</h1>
	<div class="button-wrapper">
		<div role="button" disabled={!map || waitingForData || !circleCreator || circleCreator.active} class="outline" on:click={send} aria-busy={waitingForData}>
			{#if !waitingForData}<SelectionEllipse /> {/if}
		</div>
	</div>
	<div class="controller" class:hide-controller={hideController}>
		<div class="tab" on:click={() => (hideController = !hideController)}>
			{#if hideController}<ArrowLeft />{:else}<ArrowRight />{/if}
		</div>
		<div class="layer-controll" class:disableClick={waitingForData}>
			<label for="layertype">Layer type</label>
			<select name="layertype" id="layertype" bind:value={selectedLayer}>
				{#each availableLayers as value}<option {value}>{value}</option>{/each}
			</select>

			<div class="layerControl">
				{#if selectedLayer === 'Heatmap'}
					<label for="radiusPixels">Radius Pixels: {$layerSettings[selectedLayer].radiusPixels}</label>
					<input type="range" name="radiusPixels" min="0" max="100" bind:value={$layerSettings[selectedLayer].radiusPixels} on:change={() => layer.setProps({ radiusPixels: $layerSettings[selectedLayer].radiusPixels })} />
					<label for="intensity">Intensity: {$layerSettings[selectedLayer].intensity}</label>
					<input type="range" name="intensity" min="1" max="100" bind:value={$layerSettings[selectedLayer].intensity} on:change={() => layer.setProps({ intensity: $layerSettings[selectedLayer].intensity })} />
				{:else if selectedLayer === 'Grid'}
					<label for="cellSize">Cell Size: {$layerSettings[selectedLayer].cellSize}</label>
					<input type="range" name="cellSize" min="0" max="5000" bind:value={$layerSettings[selectedLayer].cellSize} on:change={() => layer.setProps({ cellSize: $layerSettings[selectedLayer].cellSize })} />
					<label for="elevationScale">Elevation Scale: {$layerSettings[selectedLayer].elevationScale}</label>
					<input type="range" name="elevationScale" min="1" max="100" bind:value={$layerSettings[selectedLayer].elevationScale} on:change={() => layer.setProps({ elevationScale: $layerSettings[selectedLayer].elevationScale })} />
				{:else if selectedLayer === 'Scatterplotter'}
					<label for="radiusScale">Radius Scale: {$layerSettings[selectedLayer].radiusScale}</label>
					<input type="range" name="radiusScale" min="1" max="20" bind:value={$layerSettings[selectedLayer].radiusScale} on:change={() => layer.setProps({ radiusScale: $layerSettings[selectedLayer].radiusScale })} />
					<label for="lineWidthMinPixels">Min Pixel Width: {$layerSettings[selectedLayer].lineWidthMinPixels}</label>
					<input type="range" name="lineWidthMinPixels" min="1" max="5" bind:value={$layerSettings[selectedLayer].lineWidthMinPixels} on:change={() => layer.setProps({ lineWidthMinPixels: $layerSettings[selectedLayer].lineWidthMinPixels })} />
				{:else if selectedLayer === 'Hexagon'}
					<label for="radius">Radius: {$layerSettings[selectedLayer].radius}</label>
					<input type="range" name="radiusScale" min="100" max="10000" step="100" bind:value={$layerSettings[selectedLayer].radius} on:change={() => layer.setProps({ radius: $layerSettings[selectedLayer].radius })} />
					<label for="coverage">Coverage: {$layerSettings[selectedLayer].coverage}</label>
					<input type="range" name="coverage" min="0.1" max="1" step="0.1" bind:value={$layerSettings[selectedLayer].coverage} on:change={() => layer.setProps({ coverage: $layerSettings[selectedLayer].coverage })} />
					<label for="upperPrecentile">Upper Percentile: {$layerSettings[selectedLayer].upperPercentile}</label>
					<input type="range" name="upperPrecentile" min="90" max="100" step="1" bind:value={$layerSettings[selectedLayer].upperPercentile} on:change={() => layer.setProps({ upperPercentile: $layerSettings[selectedLayer].upperPercentile })} />
				{/if}
			</div>
			<div class="ip-selection">
				IP's in selection: <span class="bold"
					>{ipData
						.reduce((prev, curr) => prev + curr.hosts, 0)
						.toString()
						.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
				</span>
			</div>
			{#if selectedLayer == 'Scatterplotter'}
				<div>
					Clicked item:<br />CIDR: <span class="bold">{info ? info.CIDR : 'none'}</span><br />
					IP's: <span class="bold">{info ? info.hosts : 'none'}</span>
				</div>
			{:else if selectedLayer == 'Grid' || selectedLayer == 'Hexagon'}
				<div>
					Total IP's clicked item:<br /><span class="bold">
						{info
							? info
									.reduce((prev, curr) => prev + curr.source.hosts, 0)
									.toString()
									.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
							: 'none'}</span
					>
				</div>
			{/if}
		</div>
	</div>
	<div id="map" />
	<div class="made" class:made-visible={madeVisible} on:click={() => (madeVisible = !madeVisible)}>
		&lt; Made with ☕ and <img src="./svelte.svg" alt="svelte logo" /> &gt;
	</div>
</main>

<style>
	h1 {
		position: absolute;
		top: 10px;
		left: 40px;
		z-index: 1;
		pointer-events: none;
		color: var(--primary);
		font-size: 4em;
		opacity: 0.9;
	}

	.made {
		position: absolute;
		bottom: 5px;
		left: -174px;
		z-index: 1;
		user-select: none;
		color: whitesmoke;
		font-size: 1rem;
		font-weight: 600;
		transition: left 0.8s ease-in-out;
	}

	.made img {
		height: 1.2rem;
		width: auto;
	}
	.made-visible {
		left: 20px;
	}

	.button-wrapper {
		position: absolute;
		bottom: 30px;
		left: 0;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
	}
	.button-wrapper div {
		font-size: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--black-bg);
	}
	#map {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		z-index: 0;
	}

	.controller {
		position: absolute;
		top: 10px;
		right: 0px;

		z-index: 2;
		pointer-events: none;
		transition: right 0.5s ease-in-out;
	}
	.hide-controller {
		right: -280px;
	}
	.ip-selection {
		margin-bottom: 10px;
	}
	.bold {
		font-weight: bold;
	}
	.tab {
		cursor: pointer;
		pointer-events: all;
		float: left;
		background-color: var(--primary);
		width: 30px;
		height: 30px;
		border-top-left-radius: 8px;
		border-bottom-left-radius: 8px;
		display: flex;
		font-size: 22px;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: white;
	}
	.layer-controll {
		pointer-events: all;
		float: right;
		display: block;
		width: 280px;
		height: auto;
		background-color: var(--black-bg);
		user-select: none;
		padding: 20px;
		border: 1px var(--primary) solid;
		overflow: hidden;
	}

	.disableClick {
		pointer-events: none;
	}

	@media only screen and (max-width: 450px) {
		h1 {
			font-size: 3em;
		}
	}
</style>
