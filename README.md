# Svelte Wagmi

## Installation

Add the `svelte-wagmi@latest` package

```bash
pnpm i svelte-wagmi@latest
```

## Usages

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

## Roadmap

this is a basic package I made for projects and can add more features if people like this.
