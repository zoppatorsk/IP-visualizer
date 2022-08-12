<script>
	import maplibregl from 'maplibre-gl';
	import { onMount } from 'svelte';
	import SelectionEllipse from 'svelte-material-icons/Crosshairs.svelte';
	import createCircle from './lib/createCircle';
	import fetchData from './lib/fetchData';
	import { waitingForData } from './lib/stores/';
	import LayerController from './components/LayerController.svelte';

	let map;
	let mapIsLoaded = false;
	let ipData = [];
	let madeVisible = false;
	let circleDragActive = false;

	onMount(() => {
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
				customAttribution: 'This product includes GeoLite2 data created by <a href="https://www.maxmind.com">MaxMind</a>',
				compact: true,
			})
		);

		map.on('load', function () {
			mapIsLoaded = true;
		});
	});

	async function visualizeIp() {
		if (circleDragActive == true) return; //prevent function from running when already pressed button
		circleDragActive = true;
		let circleData = await createCircle(map);
		circleDragActive = false;
		if (!circleData) return;
		$waitingForData = true;
		ipData = await fetchData(circleData);
		$waitingForData = false;
	}
</script>

<main>
	<h1>IP Visualizer</h1>
	{#if map}
		<div class="button-wrapper">
			<!-- {circleDragActive}disabled={circleDragActive} -->
			<div role="button" class="outline" class:disabled={!mapIsLoaded || $waitingForData || circleDragActive} on:click={visualizeIp} aria-busy={$waitingForData}>
				{#if !$waitingForData}<SelectionEllipse /> {/if}
			</div>
		</div>

		<LayerController {map} {ipData} {mapIsLoaded} />
	{/if}
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
		user-select: none;
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
		bottom: 50px;
		left: 0;
		width: 100%;
		z-index: 999;
	}

	.button-wrapper div {
		margin: 0 auto;
		width: 120px;
		height: 80px;
		font-size: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--black-bg);
	}
	.disabled {
		opacity: 0.5;
		pointer-events: none;
		cursor: unset;
	}
	#map {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;

		width: 100%;
		z-index: 0;
	}

	@media only screen and (max-width: 450px) {
		h1 {
			font-size: 3em;
		}
	}
</style>
