import { writable, get } from 'svelte/store';
import {
	createConfig,
	configureChains,
	getAccount,
	watchAccount,
	disconnect,
	getNetwork,
	connect,
	watchNetwork,
	type GetAccountResult
} from '@wagmi/core';
import {
	arbitrum,
	arbitrumGoerli,
	avalanche,
	avalancheFuji,
	baseGoerli,
	bscTestnet,
	canto,
	goerli,
	mainnet,
	optimism,
	optimismGoerli,
	polygon,
	polygonMumbai,
	polygonZkEvm,
	polygonZkEvmTestnet
} from '@wagmi/core/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
import { EthereumClient, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';

export const connected = writable<boolean>(false);
export const wagmiLoaded = writable<boolean>(false);
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

let unWatchAccount: () => void;
let unWatchNetwork: () => void;

const defaultChains = [
	mainnet,
	goerli,
	arbitrum,
	arbitrumGoerli,
	avalanche,
	avalancheFuji,
	baseGoerli,
	bscTestnet,
	canto,
	optimism,
	optimismGoerli,
	polygon,
	polygonMumbai,
	polygonZkEvm,
	polygonZkEvmTestnet
];

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
	const providers: any = [publicProvider()];
	if (options.alchemyKey) providers.push(alchemyProvider({ apiKey: options.alchemyKey }));

	if (options.walletconnectProjectID)
		providers.push(w3mProvider({ projectId: options.walletconnectProjectID }));

	const { chains, publicClient, webSocketPublicClient } = configureChains(defaultChains, providers);

	const connectors: any = [new InjectedConnector({ chains })];

	if (options.walletconnect && options.walletconnectProjectID)
		connectors.push(
			new WalletConnectConnector({
				chains,
				options: {
					projectId: options.walletconnectProjectID,
					showQrModal: false
				}
			})
		);

	const wagmiClient = createConfig({
		autoConnect: options.autoConnect ?? true,
		webSocketPublicClient,
		publicClient,
		connectors
	});

	if (options.walletconnect && options.walletconnectProjectID) {
		const ethereumClient = new EthereumClient(wagmiClient, chains);
		const modal = new Web3Modal({ projectId: options.walletconnectProjectID }, ethereumClient);

		web3Modal.set(modal);
	}

	wagmiLoaded.set(true);
	await init();
};

export const init = async () => {
	try {
		unsubscribers();
		unWatchAccount = watchAccount(async (account) => {
			if (get(wagmiLoaded) && get(signerAddress) !== account.address && account.address) {
				const chain: any = getNetwork();
				chainId.set(chain.chain.id);
				connected.set(true);
				loading.set(false);
				signerAddress.set(account.address);
			} else if (get(signerAddress) !== account.address && get(connected)) {
				loading.set(false);
				await disconnectWagmi();
			} else if (account.isDisconnected && get(connected)) {
				loading.set(false);
				await disconnectWagmi();
			}
		});

		unWatchNetwork = watchNetwork((network) => {
			if (network.chain) {
				chainId.set(network.chain.id);
			}
		});
		const account = await waitForConnection();
		if (account.address) {
			const chain: any = getNetwork();
			chainId.set(chain.chain.id);
			connected.set(true);
			signerAddress.set(account.address);
		}
		loading.set(false);
	} catch (err) {
		loading.set(false);
	}
};

export const connection = async (chainId: number = 1) => {
	try {
		const chain: any = defaultChains.filter(({ id }) => {
			return id === chainId;
		});
		await connect({
			chainId: chain.id,
			connector: new InjectedConnector()
		});

		setStores();
		return { success: true };
	} catch (err) {
		return { success: false };
	}
};

export const WC = async () => {
	try {
		get(web3Modal).openModal();
		await waitForAccount();
		setStores();

		return { succcess: true };
	} catch (err) {
		return { success: false };
	}
};

export const disconnectWagmi = async () => {
	await disconnect();
	connected.set(false);
	chainId.set(null);
	signerAddress.set(null);
	loading.set(false);
};

const waitForAccount = () => {
	return new Promise((resolve, reject) => {
		const unsub1 = get(web3Modal).subscribeModal((newState) => {
			if (!newState.open) {
				reject('modal closed');
				unsub1();
			}
		});
		const unsub = watchAccount((account) => {
			if (account?.isConnected) {
				// Gottem, resolve the promise w/user's selected & connected Acc.
				resolve(account);
				unsub();
			} else {
				console.warn('🔃 - No Account Connected Yet...');
			}
		});
	});
};

const waitForConnection = (): Promise<GetAccountResult> =>
	new Promise((resolve, reject) => {
		const attemptToGetAccount = () => {
			const account = getAccount();
			if (account.isDisconnected) reject('account is disconnected');
			if (account.isConnecting) {
				// If the account is still connecting, try again after a delay
				setTimeout(attemptToGetAccount, 250); // 1000ms delay, adjust to fit your needs
			} else {
				// If the account is no longer connecting, resolve the promise
				resolve(account);
			}
		};

		attemptToGetAccount();
	});

const setStores = () => {
	const account: any = getAccount();

	if (account.address) {
		const chain: any = getNetwork();
		chainId.set(chain.chain.id);
		connected.set(true);
		signerAddress.set(account.address);
	}
};
