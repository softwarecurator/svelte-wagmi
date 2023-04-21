<script>
	import {
		configureWagmi,
		connected,
		disconnectWagmi,
		signerAddress,
		connection,
		loading,
		chainId,
		web3Modal,
		wagmiLoaded
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

{#if wagmiLoaded}
	<h1>Svelte Wagmi</h1>
	<p>Simple Wagmi wrapper to take use of sveltekit stores</p>
	{#if $loading && !$connected}
		<h1>Loading Data...</h1>
	{:else if $connected && !$loading}
		<p>{$signerAddress}</p>
		<p>chain ID: {$chainId}</p>
		<button on:click={disconnectWagmi}>disconnect</button>
	{:else}
		<p>not connected</p>
		<p>Connect With walletconnect</p>
		<button on:click={async () => $web3Modal.openModal()}>connect</button>

		<p>Connect With InjectedConnector</p>
		<button on:click={async () => await connection(1)}>connect</button>
	{/if}
{:else}
	<h1>Svelte Wagmi Not Configured</h1>
{/if}
