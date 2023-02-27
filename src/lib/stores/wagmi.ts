import { writable, get } from 'svelte/store';
import {
	createClient,
	configureChains,
	getAccount,
	watchAccount,
	disconnect,
    getNetwork,
    connect,
	watchNetwork
} from '@wagmi/core';
import type {  } from '@wagmi/core'
import { goerli, mainnet } from '@wagmi/core/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
 
export const connected = writable<boolean>(false);
export const chainId = writable<number | null | undefined>(null);
export const signerAddress = writable<string | null>(null);
export const loading = writable<boolean>(true);

let unWatchAccount: any;
let unWatchNetwork: any;

const unsubscribers = () => {
	if (unWatchAccount && unWatchNetwork) {
		unWatchAccount();
		unWatchNetwork();
	}
	connected.set(false);
	chainId.set(null);
	signerAddress.set(null);
};

export const configureWagmi = async (alchemyKey: string | null = null) => {
	const chains = [goerli, mainnet];

    const providers: any = [
		publicProvider({ priority: 1 })
    ];

    if (alchemyKey) providers.push(alchemyProvider({ apiKey: alchemyKey, priority: 0 }));

	const { provider, webSocketProvider } = configureChains(chains, providers);

	createClient({
		autoConnect: true,
		connectors: [new InjectedConnector({ chains })],
		provider,
		webSocketProvider
	});

    await init();
};

 const init = async () => {
	unsubscribers();
	const account: any = getAccount();
	unWatchAccount = watchAccount(async (account) => {
		if (get(signerAddress) !== account.address && get(connected)) {
			await disconnectWagmi();
		} else if (account.isDisconnected && get(connected)) {
			await disconnectWagmi();
		}
	});

	unWatchNetwork = watchNetwork((network) => {
		if (network.chain) {
			chainId.set(network.chain.id);
		}
	});
	if (account.address) {
        const chain: any = getNetwork();
        chainId.set(chain.chain.id);
        connected.set(true);
		loading.set(false);
		signerAddress.set(account.address);
	}
};

export const connection = async () => {
    await connect({
        connector: new InjectedConnector()
    })
    await init();
}

export const disconnectWagmi = async () => {
	await disconnect();
	connected.set(false);
	chainId.set(null);
	signerAddress.set(null);
	loading.set(true);
};

