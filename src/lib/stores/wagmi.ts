import { writable, get } from 'svelte/store';
import {
	createClient,
	configureChains,
	getAccount,
	watchAccount,
	disconnect,
	getNetwork,
	connect,
	watchNetwork,
	signMessage
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
import { EthereumClient } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { SiweMessage } from 'siwe';

export const connected = writable<boolean>(false);
export const wagmiLoaded = writable<boolean>(false);
export const chainId = writable<number | null | undefined>(null);
export const signerAddress = writable<string | null>(null);
export const loading = writable<boolean>(true);
export const web3Modal = writable<Web3Modal>();

let requireSignatureOnLogin = false;
let paths: paths | null = null;

interface paths {
	nonceAPIPath: {
		url: string;
		method: string;
	};
	verficationSignAPIPath: {
		url: string;
		method: string;
	};
	authAPIPath: {
		url: string;
		method: string;
	}
}

interface IOptions {
	requireSignatureOnLogin?: boolean;
	walletconnect?: boolean;
	walletconnectProjectID?: string;
	alchemyKey?: string | null;
	autoConnect?: boolean;
	paths?: paths;
}

let unWatchAccount: any;
let unWatchNetwork: any;

const chains = [
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
	const providers: any = [publicProvider({ priority: 1 })];
	if (options.requireSignatureOnLogin && options.paths) {
		paths = options.paths;
		requireSignatureOnLogin = true;
	}
	if (options.alchemyKey)
		providers.push(alchemyProvider({ apiKey: options.alchemyKey, priority: 0 }));

	const { provider, webSocketProvider } = configureChains(chains, providers);

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
	wagmiLoaded.set(true);
	await init();
};

export const init = async () => {
	unsubscribers();
	const account: any = getAccount();
	unWatchAccount = watchAccount(async (account) => {
		if (
			get(wagmiLoaded) &&
			get(signerAddress) !== account.address &&
			account.address &&
			!requireSignatureOnLogin
		) {
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
	if (paths && requireSignatureOnLogin && account.address) {
		const response = await fetch(paths.authAPIPath.url, {
			method: paths.authAPIPath.method
		});
		if (response.ok) {
			const chain: any = getNetwork();
			chainId.set(chain.chain.id);
			connected.set(true);
			signerAddress.set(account.address);
		}
		loading.set(false);
	} else {

		if (account.address) {
			const chain: any = getNetwork();
			chainId.set(chain.chain.id);
			connected.set(true);
			signerAddress.set(account.address);
		}
		loading.set(false);
	}
};

export const connection = async (
	chainId: number = 1,
	statement = 'Sign in with Ethereum to the app.'
) => {
	const chain: any = chains.filter(({ id }) => {
		return id === chainId;
	});
	await connect({
		chainId: chain.id,
		connector: new InjectedConnector()
	});

	if (requireSignatureOnLogin && paths) {
		const account: any = getAccount();
		const chain: any = getNetwork();
		const results = await fetch(paths.nonceAPIPath.url, {
			method: paths.nonceAPIPath.method
		});

		const nonce = await results.json();
		const message = new SiweMessage({
			domain: window.location.host,
			address: account.address,
			statement,
			uri: window.location.origin,
			version: '1',
			chainId: chain.chain.id,
			nonce
		});
		const signature = await signMessage({
			message: message.prepareMessage()
		});
		const results2 = await fetch(paths.verficationSignAPIPath.url, {
			method: paths.verficationSignAPIPath.method,
			body: JSON.stringify({ signature, message })
		});

		const verifed = await results2.json();

		if (verifed) {
			await init();
		}
	} else {
		await init();
	}
};

export const WC = async (statement = 'Sign in with Ethereum to the app.') => {
	get(web3Modal).openModal();
	const account: any = await waitForAccount();

	if (requireSignatureOnLogin && paths) {
		const chain: any = getNetwork();

		const results = await fetch(paths.nonceAPIPath.url, {
			method: paths.nonceAPIPath.method
		});

		const nonce = await results.json();
		const message = new SiweMessage({
			domain: window.location.host,
			address: account.address,
			statement,
			uri: window.location.origin,
			version: '1',
			chainId: chain.chain.id,
			nonce
		});
		const signature = await signMessage({
			message: message.prepareMessage()
		});
		const results2 = await fetch(paths.verficationSignAPIPath.url, {
			method: paths.verficationSignAPIPath.method,
			body: JSON.stringify({ signature, message })
		});

		const verifed = await results2.json();

		if (verifed) {
			await init();
		}
	} else {
		await init();
	}
};

export const disconnectWagmi = async () => {
	await disconnect();
	connected.set(false);
	chainId.set(null);
	signerAddress.set(null);
	loading.set(false);
};

function waitForAccount() {
	return new Promise((resolve, reject) => {
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
}
