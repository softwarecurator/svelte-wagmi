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
import { connected, chainId, signerAddress, web3Modal, loading } from 'svelte-wagmi';
```

- connected: store value is true if a connection has been set up.
- chainId: store value is the current chainId when connected.
- signerAddress: store value is a shortcut to get eth address when connected.
- loading: store value is true if a connection is being set up.
- web3Modal: store value is a of the walletconnect modal.

```js
import { configureWagmi } from 'svelte-wagmi';
import { onMount } from 'svelte';

onMount(async () => await configureWagmi(options));
```

|         Option         |   Field |
| :--------------------: | ------: |
|     walletconnect      | boolean |
| walletconnectProjectID |  string |
|       alchemyKey       |  string |
|      autoConnect       | boolean |

- configureWagmi should be on the +layout.svelte root folder

```js
import { connection, web3Modal } from 'svelte-wagmi';

// injected connector (metamask)
<button on:click={async () => await connection()}>connect</button>;

// walletconnect
<button on:click={async () => $web3Modal.openModal()}>connect</button>;
```

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
	import { getAccount } from '@wagmi/core';

	const account = getAccount();
</script>
```

## Roadmap

this is a basic package I made for projects and can add more features if people like this.
