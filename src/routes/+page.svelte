<script>
	import {
		configureWagmi,
		connected,
		disconnectWagmi,
		signerAddress,
		connection,
		chainId
	} from '$lib/stores/wagmi';
	import { onMount } from 'svelte';

	onMount(async () => await configureWagmi());
</script>

<h1>Svelte Wagmi</h1>
<p>Simple Wagmi wrapper to take use of sveltekit stores</p>
{#if $connected}
	<p>{$signerAddress}</p>
	<p>chain ID: {$chainId}</p>
	<button on:click={disconnectWagmi}>disconnect</button>
{:else}
	<p>not connected</p>
	<button on:click={async () => await connection()}>connect</button>
{/if}
