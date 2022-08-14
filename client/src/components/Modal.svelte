<script>
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { modal } from '../lib/stores/';

	// let body = document.querySelector('body');
	// body.style.overflow = 'hidden';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');

	const handle_keydown = (e) => {
		if (e.key === 'Escape') return close();
	};
	onDestroy(() => {
		// body.style.overflow = 'auto';
	});
</script>

<svelte:window on:keydown|once={handle_keydown} />

<dialog open on:click|self|preventDefault={close}>
	<article>
		<h3>{$modal.title}</h3>
		<p>
			{$modal.message}
		</p>
		<footer>
			<button on:click|once={close}>OK</button>
		</footer>
	</article>
</dialog>
