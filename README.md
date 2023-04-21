# Svelte Wagmi

Use the [wagmi/core library](https://wagmi.sh/core/getting-started) as a
collection of [readable Svelte stores](https://svelte.dev/tutorial/readable-stores)
for Svelte or SvelteKit.

## Installation

Add the `svelte-wagmi@latest` package

```bash
pnpm i svelte-wagmi@latest
```

## Usages

```js
import { connected, chainId, signerAddress, web3Modal, loading, wagmiLoaded } from 'svelte-wagmi';
```

- connected: store value is true if a connection has been set up.
- wagmiLoaded: store value is true if Svelte Wagmi is Successfully Configured.
- chainId: store value is the current chainId when connected.
- signerAddress: store value is a shortcut to get eth address when connected.
- loading: store value is true if a connection is being set up.
- web3Modal: store value is a of the walletconnect modal.

```js
import { configureWagmi, wagmiLoaded } from 'svelte-wagmi';
import { onMount } from 'svelte';

const options = {
	walletconnect: false,
	walletconnectProjectID: '',
	alchemyKey: '',
	autoConnect: true
}

onMount(async () => await configureWagmi(options));


{#if $wagmiLoaded}
	<h1>Svelte Wagmi Loaded</h1>
{/if}
```

|         Option         |   Field |
| :--------------------: | ------: |
|     walletconnect      | boolean |
| walletconnectProjectID |  string |
|       alchemyKey       |  string |
|      autoConnect       | boolean |

- configureWagmi should be on the +layout.svelte root folder
- wagmiLoaded should always render the layout html first.

### Note

In a production app, it is not recommended to use a public provider (no alchemy key).

```js
import { connection, web3Modal } from 'svelte-wagmi';

// injected connector (metamask) params: chainId: defaults to 1
<button on:click={async () => await connection(1)}>connect</button>;

// walletconnect
<button on:click={async () => $web3Modal.openModal()}>connect</button>;
```

### Web3Modal

Docs to use the Modal is [here](https://docs.walletconnect.com/2.0/web3modal/html-js/actions#web3modalsetdefaultchain)

### Using the stores

After a connection has been established, you may import the stores
anywhere in your application. Most of the time, you should use the `$`
prefix Svelte notation to access the stores values.

```html
<script>
	import { connected, chainId, signerAddress } from 'svelte-wagmi';
</script>

{#if !$connected}

<p>My application is not yet connected</p>

{:else}

<p>Connected to chain (id {$chainId}) with account ($signerAddress)</p>

{/if}
```

### Using Wagmi/core

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
