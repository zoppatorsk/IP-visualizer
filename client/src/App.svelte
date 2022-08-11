<script>
	import maplibregl from 'maplibre-gl';
	import { onMount } from 'svelte';
	import createCircle from './lib/createCircle';

	import SelectionEllipse from 'svelte-material-icons/Crosshairs.svelte';
	import fetchData from './lib/fetchData';

	let map;
	let waitingForData = false; //changes to true when waiting for data to load
	let madeVisible = false;
	let circleDragActivaed = false;

	async function test() {
		let r = await createCircle(map);
		console.log(r);
	}

	function send() {}

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
				customAttribution: 'This product includes GeoLite2 data created by <a href="https://www.maxmind.com">MaxMind</a>',
				compact: true,
			})
		);

		map.on('load', function () {});
	});
</script>

<main>
	<h1>IP Visualizer</h1>
	<div class="button-wrapper">
		<div role="button" class="outline" on:click={test} aria-busy={waitingForData}>
			{#if !waitingForData}<SelectionEllipse color={circleDragActivaed ? 'blue' : ''} /> {/if}
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

		width: 100%;
		z-index: 0;
	}

	@media only screen and (max-width: 450px) {
		h1 {
			font-size: 3em;
		}
	}
</style>
