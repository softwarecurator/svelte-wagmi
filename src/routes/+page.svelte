<script>
	import {
		configureWagmi,
		connected,
		disconnectWagmi,
		signerAddress,
		connection,
		chainId,
		web3Modal
	} from '$lib/stores/wagmi';
	import { onMount } from 'svelte';

	onMount(
		async () =>
			await configureWagmi({
				walletconnect: false,
				walletconnectProjectID: '',
				alchemyKey: '',
				autoConnect: true
			})
	);
</script>

<h1>Svelte Wagmi</h1>
<p>Simple Wagmi wrapper to take use of sveltekit stores</p>
{#if $connected}
	<p>{$signerAddress}</p>
	<p>chain ID: {$chainId}</p>
	<button on:click={disconnectWagmi}>disconnect</button>
{:else}
	<p>not connected</p>
	<p>Connect With walletconnect</p>
	<button on:click={async () => $web3Modal.openModal()}>connect</button>

	<p>Connect With InjectedConnector</p>
	<button on:click={async () => await connection()}>connect</button>
{/if}
