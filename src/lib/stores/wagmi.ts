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
import { goerli, mainnet } from '@wagmi/core/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
import { EthereumClient, walletConnectProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';

export const connected = writable<boolean>(false);
export const chainId = writable<number | null | undefined>(null);
export const signerAddress = writable<string | null>(null);
export const loading = writable<boolean>(true);
export const web3Modal = writable<Web3Modal>();

interface IOptions {
	walletconnect?: boolean;
	walletconnectProjectID?: string;
	alchemyKey?: string | null;
	autoConnect?: boolean;
}

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

export const configureWagmi = async (options: IOptions = {}) => {
	const chains = [goerli, mainnet];

	const providers: any = [publicProvider({ priority: 1 })];

	if (options.alchemyKey)
		providers.push(alchemyProvider({ apiKey: options.alchemyKey, priority: 0 }));

	if (options.walletconnect && options.walletconnectProjectID)
		providers.push(walletConnectProvider({ projectId: options.walletconnectProjectID }));

	const { provider, webSocketProvider } = configureChains(chains, providers);

	const connectors: any = [new InjectedConnector({ chains })];

	if (options.walletconnect && options.walletconnectProjectID)
		connectors.push(
			new WalletConnectConnector({
				chains,
				options: {
					qrcode: false
				}
			})
		);

	const wagmiClient = createClient({
		autoConnect: options.autoConnect ?? true,
		connectors,
		provider,
		webSocketProvider
	});

	if (options.walletconnect && options.walletconnectProjectID) {
		const ethereumClient = new EthereumClient(wagmiClient, chains);
		const modal = new Web3Modal({ projectId: options.walletconnectProjectID }, ethereumClient);

		web3Modal.set(modal);
	}

	await init();
};

const init = async () => {
	unsubscribers();
	const account: any = getAccount();
	unWatchAccount = watchAccount(async (account) => {
		if (!get(connected) && get(signerAddress) !== account.address && account.address) {
			const chain: any = getNetwork();
			chainId.set(chain.chain.id);
			connected.set(true);
			loading.set(false);
			signerAddress.set(account.address);
		} else if (get(signerAddress) !== account.address && get(connected)) {
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
	});

	await init();
};

export const disconnectWagmi = async () => {
	await disconnect();
	connected.set(false);
	chainId.set(null);
	signerAddress.set(null);
	loading.set(true);
};
