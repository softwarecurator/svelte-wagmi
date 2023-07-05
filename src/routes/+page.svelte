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
	import { PUBLIC_WALLETCONNECT_ID } from '$env/static/public';

	onMount(
		async () =>
			await configureWagmi({
				walletconnect: true,
				walletconnectProjectID: PUBLIC_WALLETCONNECT_ID,
				alchemyKey: '',
				autoConnect: true
			})
	);
</script>

<div class="container">
	{#if wagmiLoaded}
		<h1>Svelte Wagmi</h1>
		<p>
			Svelte Wagmi is a package that provides a collection of Svelte stores and functions for
			interacting with the Ethereum network. It utilizes the @wagmi/core library for connecting to
			Ethereum networks and signing transactions.
		</p>
		{#if $loading}
			<div>
				<span class="loader" />Waiting...
			</div>
		{:else if $connected}
			<p>{$signerAddress}</p>
			<p>chain ID: {$chainId}</p>
			<button on:click={disconnectWagmi}>disconnect</button>
		{:else}
			<p>not connected</p>
			<p>Connect With walletconnect</p>
			<button
				on:click={async () => {
					$loading = true;
					await $web3Modal.openModal();
					$loading = false;
				}}
			>
				{#if $loading}
					<span class="loader" />Connecting...
				{:else}
					connect
				{/if}
			</button>

			<p>Connect With InjectedConnector</p>
			<button
				on:click={async () => {
					$loading = true;
					await connection();
					$loading = false;
				}}
			>
				{#if $loading}
					<span class="loader" />Connecting...
				{:else}
					connect
				{/if}
			</button>
		{/if}
	{:else}
		<h1>Svelte Wagmi Not Configured</h1>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background-color: #f5f5f5;
	}
	h1 {
		font-size: 2rem;
		color: #333;
		text-align: center;
		margin-bottom: 1rem;
	}
	p {
		font-size: 1rem;
		color: #555;
		text-align: center;
		margin-bottom: 0.5rem;
	}
	button {
		font-size: 1rem;
		color: #fff;
		background-color: #007bff;
		border: none;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}
	button:hover {
		background-color: #0069d9;
	}

	.loader {
		border: 4px solid #f3f3f3;
		border-top: 4px solid #3498db;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		animation: spin 2s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
