import './app.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@picocss/pico/css/pico.classless.min.css';
import App from './App.svelte';

const app = new App({
	target: document.getElementById('app'),
});

export default app;
