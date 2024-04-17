<script>
	import {
		connected,
		disconnectWagmi,
		signerAddress,
		wagmiConfig,
		configuredConnectors,
		loading,
		chainId,
		web3Modal,
		defaultConfig,
		wagmiLoaded
	} from '$lib/stores/wagmi';
	import { onMount } from 'svelte';
	import { PUBLIC_WALLETCONNECT_ID } from '$env/static/public';
	import { walletConnect, injected } from '@wagmi/connectors';
	import { connect, writeContract } from '@wagmi/core';
	import USDC from '$lib/abi/USDC.json';
	import { sepolia } from 'viem/chains';

	async function write() {
		const args = ['0x000000000000000000000000000000000000dEaD', 100000];
		const tx = await writeContract($wagmiConfig, {
			abi: USDC,
			address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
			functionName: 'transfer',
			args
		});

		console.log(tx);
	}

	onMount(async () => {
		const erckit = defaultConfig({
			appName: 'erc.kit',
			walletConnectProjectId: PUBLIC_WALLETCONNECT_ID,
			chains: [sepolia],
			connectors: [
				injected(),
				walletConnect({
					projectId: PUBLIC_WALLETCONNECT_ID
				})
			]
		});

		await erckit.init();
	});
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
			<button on:click={write}>Contract Write</button>
			<button on:click={disconnectWagmi}>disconnect</button>
		{:else}
			<p>not connected</p>
			<p>Connect With walletconnect</p>
			<button
				on:click={async () => {
					$loading = true;
					await $web3Modal.open();
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
					await connect($wagmiConfig, {
						connector: $configuredConnectors[0]
					});
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
