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
		WC,
		wagmiLoaded
	} from '$lib/stores/wagmi';
	import { onMount } from 'svelte';

	onMount(
		async () =>
			await configureWagmi({
				walletconnect: true,
				requireSignatureOnLogin: true,
				paths: {
					nonceAPIPath: {
						url: '/api/nonce',
						method: 'GET'
					},
					verficationSignAPIPath: {
						url: '/api/verify',
						method: 'POST'
					},
					authAPIPath: {
						url: '/api/auth',
						method: 'GET'
					}
				},
				walletconnectProjectID: '486e094d6af4cddb32c96a1d0017a8d3',
				alchemyKey: 'e84qQeKVPNR68eFa3MiimM6Csgg8RLw6',
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
		<button on:click={async () => await WC()}>connect</button>

		<p>Connect With InjectedConnector</p>
		<button on:click={async () => await connection()}>connect</button>
	{/if}
{:else}
	<h1>Svelte Wagmi Not Configured</h1>
{/if}
