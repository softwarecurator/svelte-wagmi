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
	Connector,
	type GetAccountResult,
	type GetNetworkResult
} from '@wagmi/core';
import { mainnet, polygon, optimism, arbitrum, type Chain } from '@wagmi/core/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
import { EthereumClient, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { infuraProvider } from '@wagmi/core/providers/infura';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet';

export const connected = writable<boolean>(false);
export const wagmiLoaded = writable<boolean>(false);
export const chainId = writable<number | null | undefined>(null);
export const signerAddress = writable<string | null>(null);
export const configuredConnectors = writable<Connector[]>([]);
export const loading = writable<boolean>(true);
export const web3Modal = writable<Web3Modal>();

interface IOptions {
	walletconnect?: boolean;
	walletconnectProjectID?: string;
	alchemyKey?: string | null;
	autoConnect?: boolean;
}

type DefaultConnectorsProps = {
	chains?: Chain[];
	app: {
		name: string;
		icon?: string;
		description?: string;
		url?: string;
	};
	walletConnectProjectId: string;
	alchemyId: string;
};

type DefaultConfigProps = {
	appName: string;
	appIcon?: string;
	appDescription?: string;
	appUrl?: string;
	autoConnect?: boolean;
	alchemyId: string;
	infuraId?: string;
	chains?: Chain[];
	connectors?: any;
	publicClient?: any;
	webSocketPublicClient?: any;
	enableWebSocketPublicClient?: boolean;
	stallTimeout?: number;
	walletConnectProjectId: string;
};

const defaultChains = [mainnet, polygon, optimism, arbitrum];

const getDefaultConnectors = ({
	chains,
	app,
	walletConnectProjectId,
	alchemyId
}: DefaultConnectorsProps) => {
	const hasAllAppData = app.name && app.icon && app.description && app.url;
	let defaultConnectors: any[] = [];
	defaultConnectors = [
		...defaultConnectors,
		new CoinbaseWalletConnector({
			chains,
			options: {
				appName: app.name,
				headlessMode: false,
				jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${alchemyId}`
			}
		}),
		new WalletConnectConnector({
			chains,
			options: {
				showQrModal: false,
				projectId: walletConnectProjectId,
				metadata: hasAllAppData
					? {
							name: app.name,
							description: app.description!,
							url: app.url!,
							icons: [app.icon!]
					  }
					: undefined
			}
		}),
		new InjectedConnector({
			chains,
			options: {
				name: (detectedName) =>
					`Injected (${typeof detectedName === 'string' ? detectedName : detectedName.join(', ')})`
			}
		})
	];

	configuredConnectors.set(defaultConnectors);
	return defaultConnectors;
};

/** Deprecated **/
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

export const defaultConfig = ({
	autoConnect = true,
	appName = 'Erc.Kit',
	appIcon,
	appDescription,
	appUrl,
	chains = defaultChains,
	alchemyId,
	infuraId,
	connectors,
	publicClient,
	stallTimeout,
	walletConnectProjectId
}: DefaultConfigProps) => {
	const providers = [];
	if (alchemyId) {
		providers.push(alchemyProvider({ apiKey: alchemyId }));
	}
	if (infuraId) {
		providers.push(infuraProvider({ apiKey: infuraId }));
	}
	providers.push(
		jsonRpcProvider({
			rpc: (c) => {
				return { http: c.rpcUrls.default.http[0] };
			}
		})
	);

	providers.push(publicProvider());
	const {
		publicClient: configuredPublicClient,
		chains: configuredChains,
		webSocketPublicClient: configuredWebSocketPublicClient
	} = configureChains(chains, providers, { stallTimeout });

	if (connectors) configuredConnectors.set(connectors);

	const ercClient = createConfig({
		autoConnect,
		publicClient: publicClient ?? configuredPublicClient,
		webSocketPublicClient: configuredWebSocketPublicClient,
		connectors:
			connectors ??
			getDefaultConnectors({
				chains: configuredChains,
				app: {
					name: appName,
					icon: appIcon,
					description: appDescription,
					url: appUrl
				},
				walletConnectProjectId,
				alchemyId
			})
	});

	const ethereumClient = new EthereumClient(ercClient, configuredChains);
	const modal = new Web3Modal({ projectId: walletConnectProjectId }, ethereumClient);

	web3Modal.set(modal);
	wagmiLoaded.set(true);

	return { init };
};

export const init = async () => {
	try {
		setupListeners();
		const account = await waitForConnection();
		if (account.address) {
			const network: GetNetworkResult = getNetwork();
			if (network.chain) chainId.set(network.chain.id);
			connected.set(true);
			signerAddress.set(account.address);
		}
		loading.set(false);
	} catch (err) {
		loading.set(false);
	}
};

const setupListeners = () => {
	watchAccount(handleAccountChange);
	watchNetwork(handleNetworkChange);
};

const handleAccountChange = async (account: GetAccountResult) => {
	if (get(wagmiLoaded) && account.address) {
		const chain: any = getNetwork();
		chainId.set(chain.chain.id);
		connected.set(true);
		loading.set(false);
		signerAddress.set(account.address);
	} else if (account.isDisconnected && get(connected)) {
		loading.set(false);
		await disconnectWagmi();
	}
};

const handleNetworkChange = (network: GetNetworkResult) => {
	if (network.chain) {
		chainId.set(network.chain.id);
	}
};

export const connection = async () => {
	try {
		const connector = getConnectorbyID('injected');
		if (connector !== null) {
			await connect({
				connector
			});
		}
		return { success: true };
	} catch (err) {
		return { success: false };
	}
};

export const WC = async () => {
	try {
		get(web3Modal).openModal();
		await waitForAccount();

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
				setTimeout(attemptToGetAccount, 250);
			} else {
				resolve(account);
			}
		};

		attemptToGetAccount();
	});

export function getConnectorbyID(id: string): Connector | null {
	for (const obj of get(configuredConnectors)) {
		if (obj.id === id) {
			return obj;
		}
	}
	return null;
}
