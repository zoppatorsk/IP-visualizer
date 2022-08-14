<script>
	import { createEventDispatcher } from 'svelte';
	import { modal } from '../lib/stores/';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');

	const handle_keydown = (e) => {
		if (e.key === 'Escape') return close();
	};
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
