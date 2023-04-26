# Svelte Wagmi

Svelte Wagmi is a package that provides a collection of Svelte stores and functions for interacting with the Ethereum network. It utilizes the [@wagmi/core](https://wagmi.sh/core/getting-started) library for connecting to Ethereum networks and signing transactions.

## Installation

To install the package, run the following command:

```bash
npm install svelte-wagmi
```

## Usages

### connected

The `connected` store indicates whether the application is currently connected to an Ethereum provider. It is a boolean store that is set to true when the application is connected and false otherwise.

Example usage:

```html
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

```html
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

```html
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

```html
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

```html
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

```html
<script>
import { web3Modal } from '@wagmi/svelte-store';
</script>

{#if $web3Modal}
<button on:click={() => $web3Modal.openModal()}>
Connect to Ethereum
</button>
{:else}

  <p>Web3Modal not yet available</p>
{/if}
```

### configureWagmi

The `configureWagmi` function is used to configure the `@wagmi/core` library and initialize the Svelte stores. It takes an optional options object that can be used to configure the behavior of the function.

- `requireSignatureOnLogin` (optional): A boolean that indicates whether the user must sign a message to log in. If this is set to true, the paths option must also be provided.
- `walletconnect` (optional): A boolean that indicates whether to enable WalletConnect support. If this is set to true, the
  walletconnectProjectID option must also be provided.
- `walletconnectProjectID` (optional): A string that contains the Project ID for the WalletConnect service. This is required if walletconnect is set to true.
- `alchemyKey` (optional): A string that contains the API key for the Alchemy service. This is required if you want to use the Alchemy provider.
- `autoConnect` (optional): A boolean that indicates whether to automatically connect to the Ethereum provider on page load.
- `paths` (optional): An object that contains three properties: nonceAPIPath, verificationSignAPIPath, and authAPIPath. These properties contain the URLs and HTTP methods for the API endpoints that are used for message signing and authentication.

Example usage:

```html
<script>
	import { configureWagmi } from 'svelte-wagmi';

	configureWagmi({
		requireSignatureOnLogin: true,
		walletconnect: true,
		walletconnectProjectID: '1234567890',
		alchemyKey: 'abcdefghijklmnopqrstuvwxyz123456',
		autoConnect: true,
		paths: {
			nonceAPIPath: {
				url: 'https://example.com/nonce',
				method: 'GET'
			},
			verificationSignAPIPath: {
				url: 'https://example.com/verify',
				method: 'POST'
			},
			authAPIPath: {
				url: 'https://example.com/auth',
				method: 'POST'
			}
		}
	});
</script>
```

### connection

The `connection` function is used to connect to an Ethereum provider using the InjectedConnector from @wagmi/core. It takes two parameters:

- `chainId` (optional): A number that specifies the chain ID to connect to. The default is 1 (mainnet).
- `statement` (optional): A string that specifies the statement to be signed by the user when logging in. This is required if `requireSignatureOnLogin` is set to true in `configureWagmi`.
  Example usage:

```html
<script>
	import { connection } from '@wagmi/svelte-store';

	async function connectToEthereum() {
		await connection(1, 'Sign in to the app with Ethereum');
	}
</script>

<button on:click="{connectToEthereum}">Connect to Ethereum</button>
```

### WC

The `WC` function is used to connect to an Ethereum provider using WalletConnect. It takes one parameter:

- `statement` (optional): A string that specifies the statement to be signed by the user when logging in. This is required if `requireSignatureOnLogin` is set to true in `configureWagmi`.
  Example usage:

```html
<script>
	import { WC } from '@wagmi/svelte-store';

	async function connectToEthereum() {
		await WC('Sign in to the app with Ethereum');
	}
</script>
<button on:click="{connectToEthereum}">Connect to Ethereum</button>
```

### disconnectWagmi

The `disconnectWagmi` function is used to disconnect from the Ethereum provider and clear the Svelte stores. Example usage:

```html
<script>
	import { disconnectWagmi } from '@wagmi/svelte-store';

	async function disconnectFromEthereum() {
		await disconnectWagmi();
	}
</script>

<button on:click="{disconnectFromEthereum}">Disconnect from Ethereum</button>
```

### Svelte stores

The `svelte-wagmi` library also provides several Svelte stores that can be used to retrieve information about the user's Ethereum connection:

- `connected`: A boolean that indicates whether the user is connected to an Ethereum provider.
- `wagmiLoaded`: A boolean that indicates whether the `@wagmi/core` library has been loaded.
- `chainId`: A number that indicates the chain ID of the user's Ethereum connection.
- `signerAddress`: A string that contains the Ethereum address of the user's account.
- `loading`: A boolean that indicates whether the library is currently loading.
  Example usage:

```html
<script>
	import { connected, chainId, signerAddress } from '@wagmi/svelte-store';

	$: console.log('Connected:', $connected);
	$: console.log('Chain ID:', $chainId);
	$: console.log('Signer address:', $signerAddress);
</script>

<p>Connected: {$connected ? 'Yes' : 'No'}</p>
<p>Chain ID: {$chainId}</p>
<p>Signer address: {$signerAddress}</p>
```

### Using @wagmi/core

You can use any wagmi/core functions

```html
<script>
		import { getAccount, switchNetwork } from '@wagmi/core';

		const account = getAccount();

		const network = await switchNetwork({
	  chainId: 69,
	})
</script>
```

### Note

changing network using `@wagmi/core` will also chage the `svelte-wagmi`: chainId store

`$signerAddress` and `getAccount()` are the same ETH address

## Roadmap

this is a basic package I made for projects and can add more features if people like this.
