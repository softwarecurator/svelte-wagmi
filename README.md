# Svelte Wagmi

## Installation

Add the `svelte-wagmi@latest` package

```bash
pnpm i svelte-wagmi@latest
```

# Usages

```js
import { configureWagmi } from '$lib/stores/wagmi';
import { onMount } from 'svelte';

onMount(async () => await configureWagmi());
```

- configureWagmi: function that allows connection via injected connectors (ex: metamask).

```js
import { connection } from '$lib/stores/wagmi';

<button on:click={async () => await connection()}>connect</button>;
```

# Roadmap

this is a basic package I made for projects and can add more features if people like this.
