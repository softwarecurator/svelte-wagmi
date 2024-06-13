# Svelte Wagmi

Svelte Wagmi is a package that provides a collection of Svelte stores and functions for interacting with the Ethereum network. It utilizes the [@wagmi/core](https://wagmi.sh/core/getting-started) library for connecting to Ethereum networks and signing transactions.

## Installation

To install the package and its peer dependencies, run the following command:

```bash
npm install svelte-wagmi viem @wagmi/core @wagmi/connectors
```

## Usages

### connected

The `connected` store indicates whether the application is currently connected to an Ethereum provider. It is a boolean store that is set to true when the application is connected and false otherwise.

Example usage:

```svelte
<script>
	import { connected } from 'svelte-wagmi';
</script>

{#if $connected}
	<p>Connected to Ethereum</p>
{:else}
	<p>Not connected to Ethereum</p>
{/if}
```

### wagmiLoaded

The `wagmiLoaded` store indicates whether the @wagmi/core library has been loaded and initialized. It is a boolean store that is set to true when the library is loaded and false otherwise.

Example usage:

```svelte
<script>
	import { wagmiLoaded } from 'svelte-wagmi';
</script>

{#if $wagmiLoaded}
	<p>@wagmi/core is loaded and initialized</p>
{:else}
	<p>@wagmi/core is not yet loaded</p>
{/if}
```

### chainId

The `chainId` store contains the current chain ID of the connected Ethereum provider. It is a number store that is set to null if the provider is not connected or if the chain ID is unknown.

Example usage:

```svelte
<script>
	import { chainId } from 'svelte-wagmi';
</script>

{#if $chainId}
	<p>Current chain ID: {$chainId}</p>
{:else}
	<p>Chain ID not yet available</p>
{/if}
```

### signerAddress

The `signerAddress` store contains the current signer address of the connected Ethereum provider. It is a string store that is set to null if the provider is not connected or if the signer address is unknown.

Example usage:

```svelte
<script>
	import { signerAddress } from 'svelte-wagmi';
</script>

{#if $signerAddress}
	<p>Current signer address: {$signerAddress}</p>
{:else}
	<p>Signer address not yet available</p>
{/if}
```

### loading

The `loading` store indicates whether the application is currently loading data from the Ethereum provider. It is a boolean store that is set to `true` when the application is loading and `false` otherwise.

Example usage:

```svelte
<script>
	import { loading } from 'svelte-wagmi';
</script>

{#if $loading}
	<p>Loading data...</p>
{:else}
	<p>Data loaded</p>
{/if}
```

### web3Modal

The `web3Modal` store contains an instance of the `Web3Modal` class from the `@web3modal/html` package. It is used to display a modal for connecting to an Ethereum provider using WalletConnect or other methods.
Example usage:

```svelte
<script>
	import { web3Modal } from 'svelte-wagmi';
</script>

{#if $web3Modal}
	<button on:click={() => $web3Modal.open()}> Connect to Ethereum</button>
{:else}
	<p>Web3Modal not yet available</p>
{/if}
```

### defaultConfig

The `defaultConfig` function is used to configure the `@wagmi/core` library and initialize the Svelte stores. It takes an optional options object that can be used to configure the behavior of the function.

- `autoConnect` (boolean, default: `true`): Specifies whether the Ethereum client should automatically connect to a provider upon initialization. If set to `true`, the client will attempt to connect automatically.
- `appName` (string, default: `'Erc.Kit'`): Specifies the name of the application using the Ethereum client.
- `chains` (array, default: `defaultChains`): An array of chain configurations to connect with. If not provided, the function will use default chain configurations.
- `alchemyId` (optional) (string): The API key for the Alchemy provider, used for connecting to the Alchemy service.
- `connectors` (object): An object containing customized connector configurations for the Ethereum client.
- `walletConnectProjectId` (string): The project ID used for the WalletConnect integration.

### Return Value:

The `defaultConfig` function returns an object with the following properties:

- `init`: A function that can be called to initialize the Ethereum client and set up the connections based on the provided configurations.

Example usage:

```svelte
<script>
	import { defaultConfig } from 'svelte-wagmi';
	import { onMount } from 'svelte';
	import { PUBLIC_WALLETCONNECT_ID, PUBLIC_ALCHEMY_ID } from '$env/static/public';
	import { injected } from '@wagmi/connectors';

	onMount(async () => {
		const erckit = defaultConfig({
			appName: 'erc.kit',
			walletConnectProjectId: PUBLIC_WALLETCONNECT_ID,
			alchemyId: PUBLIC_ALCHEMY_ID,
			connectors: [injected()]
		});
	});

	await erckit.init();
</script>
```

### configuredConnectors

The `configuredConnectors` are store value array

Example usage:

```svelte
<script>
	import { configuredConnectors } from 'svelte-wagmi';

	for (const connector of $configuredConnectors) {
		console.log(connector);
	}
</script>

<button on:click={connectToEthereum}>Connect to Ethereum</button>
```

### WC

The `WC` function is used to connect to an Ethereum provider using WalletConnect. It takes one parameter:

- `statement` (optional): A string that specifies the statement to be signed by the user when logging in.

  Example usage:

```svelte
<script>
	import { WC } from 'svelte-wagmi';

	async function connectToEthereum() {
		await WC('Sign in to the app with Ethereum');
	}
</script>

<button on:click={connectToEthereum}>Connect to Ethereum</button>
```

### disconnectWagmi

The `disconnectWagmi` function is used to disconnect from the Ethereum provider and clear the Svelte stores. Example usage:

```svelte
<script>
	import { disconnectWagmi } from 'svelte-wagmi';

	async function disconnectFromEthereum() {
		await disconnectWagmi();
	}
</script>

<button on:click={disconnectFromEthereum}>Disconnect from Ethereum</button>
```

### Svelte stores

The `svelte-wagmi` library also provides several Svelte stores that can be used to retrieve information about the user's Ethereum connection:

- `connected`: A boolean that indicates whether the user is connected to an Ethereum provider.
- `wagmiLoaded`: A boolean that indicates whether the `@wagmi/core` library has been loaded.
- `chainId`: A number that indicates the chain ID of the user's Ethereum connection.
- `signerAddress`: A string that contains the Ethereum address of the user's account.
- `loading`: A boolean that indicates whether the library is currently loading.
  Example usage:

```svelte
<script>
	import { connected, chainId, signerAddress } from 'svelte-wagmi';

	$: console.log('Connected:', $connected);
	$: console.log('Chain ID:', $chainId);
	$: console.log('Signer address:', $signerAddress);
</script>

<p>Connected: {$connected ? 'Yes' : 'No'}</p>
<p>Chain ID: {$chainId}</p>
<p>Signer address: {$signerAddress}</p>
```

### Using @wagmi/core

You can use any wagmi/core functions by passing $wagmiConfig from svelte-wagmi

```svelte
<script>
	import { getAccount, switchNetwork } from '@wagmi/core';
	import { wagmiConfig } from 'svelte-wagmi';

	const account = getAccount($wagmiConfig);

	const network = await switchNetwork($wagmiConfig, {
		chainId: 69
	});
</script>
```

### Note

changing network using `@wagmi/core` will also chage the `svelte-wagmi`: chainId store

`$signerAddress` and `getAccount()` are the same ETH address.

If you experience an error from @Web3Modal/connectors that "process is not defined", a workaround is to defined process.env explicitly in your vite.config.ts

```ts
export default defineConfig({
	// ... rest of your config
	define: {
		'process.env': {}
	}
});
```

## Roadmap

this is a basic package I made for projects and can add more features if people like this.
