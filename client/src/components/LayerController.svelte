<script>
	import ArrowLeft from 'svelte-material-icons/ArrowLeft.svelte';
	import ArrowRight from 'svelte-material-icons/ArrowRight.svelte';
	import { layerSettings, waitingForData } from '../lib/stores/';

	import { MapboxLayer } from '@deck.gl/mapbox';
	import { GridLayer, HeatmapLayer, HexagonLayer } from '@deck.gl/aggregation-layers';
	import { ScatterplotLayer } from '@deck.gl/layers';

	export let ipData;
	export let map;
	export let mapIsLoaded = false;

	let availableLayers = ['Heatmap', 'Hexagon', 'Scatterplotter', 'Grid'];
	let hideController = false;
	let selectedLayer;
	let layer;
	let layerInfo;
	$: selectedLayer && mapIsLoaded && changeLayer(); //will run changeLayer function when map is loaded and layer is selected
	$: ipData && layer && updateLayerData(); //will run when data changes
	$: $layerSettings[selectedLayer] && layer && layer.setProps($layerSettings[selectedLayer]); //will run when layer settings change and update the layer props

	function setLayerInfo(info) {
		layerInfo = info;
	}

	function updateLayerData() {
		layer.setProps({
			data: ipData,
		});
	}

	function changeLayer() {
		if (!mapIsLoaded) return; //prevent function from running when map is not loaded

		//Remove existing layer if exists
		availableLayers.forEach((l) => {
			if (typeof map.getLayer(l) !== 'undefined') map.removeLayer(l);
		});
		layer = createLayer(selectedLayer);
		if (layer) map.addLayer(layer);
		layerInfo = null;
	}

	function createLayer(selectedLayer) {
		let layer;
		let layerOptions;
		switch (selectedLayer) {
			case 'Heatmap':
				console.log('heatmap case');
				//static layeroptions, ie thise ones will not change
				layerOptions = {
					type: HeatmapLayer,
					id: selectedLayer,
					data: ipData,
					getPosition: (d) => d.coordinates,
					getWeight: (d) => d.hosts,
					radiusMinPixels: 1,
					radiusMaxPixels: 100,
				};
				//add the dynamic options from the store
				Object.entries($layerSettings[selectedLayer]).forEach(([key, value]) => {
					layerOptions[key] = value;
				});
				break;

			case 'Grid':
				console.log('grid case');
				layerOptions = {
					type: GridLayer,
					id: selectedLayer,
					data: ipData,
					extruded: true,
					getPosition: (d) => d.coordinates,
					getElevationWeight: (d) => d.hosts,
					pickable: true,
					onClick: (info) => info.object && setLayerInfo(info.object.points),
				};
				Object.entries($layerSettings[selectedLayer]).forEach(([key, value]) => {
					layerOptions[key] = value;
				});

				break;

			case 'Scatterplotter':
				layerOptions = {
					type: ScatterplotLayer,
					id: selectedLayer,
					data: ipData,
					stroked: true,
					filled: true,
					radiusMinPixels: 1,
					radiusMaxPixels: 10,
					getRadius: (d) => d.hosts / 10,
					getPosition: (d) => d.coordinates,
					getFillColor: (d) => colorByHosts(d.hosts),
					pickable: true,
					onClick: (info) => info.object && setLayerInfo(info.object),
				};
				Object.entries($layerSettings[selectedLayer]).forEach(([key, value]) => {
					layerOptions[key] = value;
				});
				break;

			case 'Hexagon':
				layerOptions = {
					type: HexagonLayer,
					id: selectedLayer,
					data: ipData,
					pickable: true,
					extruded: true,
					getElevationWeight: (d) => d.hosts,
					elevationRange: [0, 10000],
					elevationScale: 250,
					getPosition: (d) => d.coordinates,
					onClick: (info) => info.object && setLayerInfo(info.object.points),
				};
				Object.entries($layerSettings[selectedLayer]).forEach(([key, value]) => {
					layerOptions[key] = value;
				});
				break;
		}
		function colorByHosts(hosts) {
			if (hosts >= 50000) return [132, 94, 194];
			if (hosts >= 10000) return [214, 93, 177];
			if (hosts >= 5000) return [255, 150, 113];
			if (hosts > 1024) return [255, 150, 113];
			if (hosts >= 512) return [255, 199, 95];
			if (hosts > 0) return [249, 248, 113];
		}
		layer = new MapboxLayer(layerOptions);
		return layer;
	}
</script>

<div class="controller" class:hide-controller={hideController}>
	<div class="tab" on:click={() => (hideController = !hideController)}>
		{#if hideController}<ArrowLeft />{:else}<ArrowRight />{/if}
	</div>
	<div class="layer-controll" class:disableClick={$waitingForData}>
		<label for="layertype">Layer type</label>
		<select name="layertype" id="layertype" bind:value={selectedLayer}>
			{#each availableLayers as value}<option {value}>{value}</option>{/each}
		</select>

		<div class="layerControl">
			{#if selectedLayer === 'Heatmap'}
				<label for="radiusPixels">Radius Pixels: {$layerSettings[selectedLayer].radiusPixels}</label>
				<input type="range" name="radiusPixels" min="0" max="100" bind:value={$layerSettings[selectedLayer].radiusPixels} />
				<label for="intensity">Intensity: {$layerSettings[selectedLayer].intensity}</label>
				<input type="range" name="intensity" min="1" max="100" bind:value={$layerSettings[selectedLayer].intensity} />
			{:else if selectedLayer === 'Grid'}
				<label for="cellSize">Cell Size: {$layerSettings[selectedLayer].cellSize}</label>
				<input type="range" name="cellSize" min="0" max="5000" bind:value={$layerSettings[selectedLayer].cellSize} />
				<label for="elevationScale">Elevation Scale: {$layerSettings[selectedLayer].elevationScale}</label>
				<input type="range" name="elevationScale" min="1" max="100" bind:value={$layerSettings[selectedLayer].elevationScale} />
			{:else if selectedLayer === 'Scatterplotter'}
				<label for="radiusScale">Radius Scale: {$layerSettings[selectedLayer].radiusScale}</label>
				<input type="range" name="radiusScale" min="1" max="20" bind:value={$layerSettings[selectedLayer].radiusScale} />
				<label for="lineWidthMinPixels">Min Pixel Width: {$layerSettings[selectedLayer].lineWidthMinPixels}</label>
				<input type="range" name="lineWidthMinPixels" min="1" max="5" bind:value={$layerSettings[selectedLayer].lineWidthMinPixels} />
			{:else if selectedLayer === 'Hexagon'}
				<label for="radius">Radius: {$layerSettings[selectedLayer].radius}</label>
				<input type="range" name="radiusScale" min="100" max="10000" step="100" bind:value={$layerSettings[selectedLayer].radius} />
				<label for="coverage">Coverage: {$layerSettings[selectedLayer].coverage}</label>
				<input type="range" name="coverage" min="0.1" max="1" step="0.1" bind:value={$layerSettings[selectedLayer].coverage} />
				<label for="upperPrecentile">Upper Percentile: {$layerSettings[selectedLayer].upperPercentile}</label>
				<input type="range" name="upperPrecentile" min="90" max="100" step="1" bind:value={$layerSettings[selectedLayer].upperPercentile} />
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
				Clicked item:<br />CIDR: <span class="bold">{layerInfo ? layerInfo.CIDR : 'none'}</span><br />
				IP's: <span class="bold">{layerInfo ? layerInfo.hosts : 'none'}</span>
			</div>
		{:else if selectedLayer == 'Grid' || selectedLayer == 'Hexagon'}
			<div>
				Total IP's clicked item:<br /><span class="bold">
					{layerInfo
						? layerInfo
								.reduce((prev, curr) => prev + curr.source.hosts, 0)
								.toString()
								.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
						: 'none'}</span
				>
			</div>
		{/if}
	</div>
</div>

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
</style>
