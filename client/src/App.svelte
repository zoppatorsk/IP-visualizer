<script>
	import { layerSettings } from './lib/stores/';
	import maplibregl from 'maplibre-gl';
	import { onMount } from 'svelte';
	import CircleCreator from './lib/CircleCreator.js';
	import createLayer from './lib/createLayer.js';
	import ArrowLeft from 'svelte-material-icons/ArrowLeft.svelte';
	import ArrowRight from 'svelte-material-icons/ArrowRight.svelte';
	import SelectionEllipse from 'svelte-material-icons/Crosshairs.svelte';

	let circleCreator;
	let ipData = [];
	let waitingForData = false;
	let layer;
	let selectedLayer;
	let availableLayers = ['Heatmap', 'Grid', 'Scatterplotter'];
	let map;
	let mapLoaded = false; //changes to true when map has loeded, this is to prevent stuff to break on select layer
	let info;
	let hideController = false;
	$: selectedLayer && mapLoaded && changeLayer(); //will run when map is loaded and layer is selected

	document.addEventListener('info', (e) => {
		// @ts-ignore
		info = e.detail;
		console.log(info);
	});

	document.addEventListener('circleCreated', async (e) => {
		// @ts-ignore
		if (e?.detail) {
			// @ts-ignore
			let { radius, center } = e.detail;
			radius = parseInt(radius);
			waitingForData = true;
			const postData = { radius, lng: center.geometry.coordinates[0], lat: center.geometry.coordinates[1] };

			try {
				const result = await fetch(import.meta.env.VITE_API_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(postData),
				});

				if (!result.ok) {
					console.log(result.status); //check stuff later n decide what to do when error happens
					throw new Error(`Error! status: ${result.status}`); //throw it n handle in catch block
				}

				ipData = await result.json();
				updateLayer();
			} catch (error) {
				console.log('catched in catch block');
				console.log(error);
			} finally {
				waitingForData = false;
			}
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
			maxBounds: [
				[-179, -75],
				[179, 75],
			],

			// projection: 'globe',
		});

		map.on('load', function () {
			mapLoaded = true;
			circleCreator = new CircleCreator(map);
		});
	});
</script>

<main>
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
					<label for="radiusPixels">radius pixels {$layerSettings[selectedLayer].radiusPixels}</label>
					<input type="range" name="radiusPixels" min="0" max="100" bind:value={$layerSettings[selectedLayer].radiusPixels} on:change={() => layer.setProps({ radiusPixels: $layerSettings[selectedLayer].radiusPixels })} />
					<label for="intensity">Intensity {$layerSettings[selectedLayer].intensity}</label>
					<input type="range" name="intensity" min="1" max="100" bind:value={$layerSettings[selectedLayer].intensity} on:change={() => layer.setProps({ intensity: $layerSettings[selectedLayer].intensity })} />
				{/if}
				{#if selectedLayer === 'Grid'}
					<label for="cellSize">Cell Size {$layerSettings[selectedLayer].cellSize}</label>
					<input type="range" name="cellSize" min="0" max="5000" bind:value={$layerSettings[selectedLayer].cellSize} on:change={() => layer.setProps({ cellSize: $layerSettings[selectedLayer].cellSize })} />
					<label for="elevationScale">Elevation Scale {$layerSettings[selectedLayer].elevationScale}</label>
					<input type="range" name="elevationScale" min="1" max="100" bind:value={$layerSettings[selectedLayer].elevationScale} on:change={() => layer.setProps({ elevationScale: $layerSettings[selectedLayer].elevationScale })} />
				{/if}
				{#if selectedLayer === 'Scatterplotter'}
					<label for="radiusScale">Radius Scale {$layerSettings[selectedLayer].radiusScale}</label>
					<input type="range" name="radiusScale" min="1" max="20" bind:value={$layerSettings[selectedLayer].radiusScale} on:change={() => layer.setProps({ radiusScale: $layerSettings[selectedLayer].radiusScale })} />
					<label for="lineWidthMinPixels">Min Pixel Width {$layerSettings[selectedLayer].lineWidthMinPixels}</label>
					<input type="range" name="lineWidthMinPixels" min="1" max="5" bind:value={$layerSettings[selectedLayer].lineWidthMinPixels} on:change={() => layer.setProps({ lineWidthMinPixels: $layerSettings[selectedLayer].lineWidthMinPixels })} />
				{/if}
			</div>
			<div>
				IP's in selection: {ipData
					.reduce((prev, curr) => prev + curr.hosts, 0)
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
			</div>
			{#if selectedLayer == 'Scatterplotter'}
				<div>
					Last Picked<br />CIDR: {info ? info.CIDR : 'none'}<br />
					Ip's: {info ? info.hosts : 'none'}<br />
				</div>
			{:else if selectedLayer == 'Grid'}
				<div>
					Total Ip's clicked grid item:<br />
					{info
						? info
								.reduce((prev, curr) => prev + curr.source.hosts, 0)
								.toString()
								.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
						: 'none'}<br />
				</div>
			{/if}
		</div>
	</div>
	<div id="map" />
</main>

<style>
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
	.tab {
		/* box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4); */
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
		/* box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4); */
		pointer-events: all;
		float: right;
		display: block;
		width: 280px;
		height: auto;
		background-color: var(--black-bg);

		padding: 20px;
		border: 1px var(--primary) solid;
	}

	.disableClick {
		pointer-events: none;
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
		/* background-color: #6495ed;
		color: #fff;
		padding: 20px;
		border-radius: 5px;
		border: none;
		cursor: pointer; */
	}
	#map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
		z-index: 0;
	}

	/* h1 {
		position: absolute;
		font-size: 4rem;
		text-align: center;
		z-index: 99;
	} */
</style>
