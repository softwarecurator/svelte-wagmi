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
import {
	arbitrum,
	arbitrumGoerli,
	aurora,
	auroraTestnet,
	avalanche,
	avalancheFuji,
	baseGoerli,
	boba,
	bronos,
	bronosTestnet,
	bsc,
	bscTestnet,
	canto,
	celo,
	celoAlfajores,
	cronos,
	crossbell,
	dfk,
	dogechain,
	evmos,
	evmosTestnet,
	fantom,
	fantomTestnet,
	filecoin,
	filecoinCalibration,
	filecoinHyperspace,
	flare,
	flareTestnet,
	foundry,
	gnosis,
	gnosisChiado,
	goerli,
	hardhat,
	harmonyOne,
	iotex,
	iotexTestnet,
	klaytn,
	localhost,
	mainnet,
	metis,
	metisGoerli,
	moonbaseAlpha,
	moonbeam,
	moonriver,
	nexi,
	okc,
	optimism,
	optimismGoerli,
	polygon,
	polygonMumbai,
	polygonZkEvm,
	polygonZkEvmTestnet,
	scrollTestnet,
	sepolia,
	shardeumSphinx,
	skaleBlockBrawlers,
	skaleCalypso,
	skaleCalypsoTestnet,
	skaleChaosTestnet,
	skaleCryptoBlades,
	skaleCryptoColosseum,
	skaleEuropa,
	skaleEuropaTestnet,
	skaleExorde,
	skaleHumanProtocol,
	skaleNebula,
	skaleNebulaTestnet,
	skaleRazor,
	skaleTitan,
	skaleTitanTestnet,
	songbird,
	songbirdTestnet,
	taraxa,
	taraxaTestnet,
	telos,
	telosTestnet,
	wanchain,
	wanchainTestnet,
	xdc,
	xdcTestnet,
	zhejiang,
	zkSync,
	zkSyncTestnet
} from '@wagmi/core/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
import { EthereumClient } from '@web3modal/ethereum';
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

const chains = [
	mainnet,
	arbitrum,
	arbitrumGoerli,
	avalanche,
	avalancheFuji,
	baseGoerli,
	boba,
	bronos,
	bronosTestnet,
	bsc,
	bscTestnet,
	canto,
	celo,
	celoAlfajores,
	cronos,
	crossbell,
	dfk,
	dogechain,
	evmos,
	evmosTestnet,
	fantom,
	fantomTestnet,
	filecoin,
	filecoinCalibration,
	filecoinHyperspace,
	flare,
	flareTestnet,
	foundry,
	gnosis,
	gnosisChiado,
	goerli,
	hardhat,
	harmonyOne,
	iotex,
	iotexTestnet,
	klaytn,
	localhost,
	metis,
	metisGoerli,
	moonbaseAlpha,
	moonbeam,
	moonriver,
	nexi,
	okc,
	optimism,
	optimismGoerli,
	polygon,
	polygonMumbai,
	polygonZkEvm,
	polygonZkEvmTestnet,
	scrollTestnet,
	sepolia,
	shardeumSphinx,
	skaleBlockBrawlers,
	skaleCalypso,
	skaleCalypsoTestnet,
	skaleChaosTestnet,
	skaleCryptoBlades,
	skaleCryptoColosseum,
	skaleEuropa,
	skaleEuropaTestnet,
	skaleExorde,
	skaleHumanProtocol,
	skaleNebula,
	skaleNebulaTestnet,
	skaleRazor,
	skaleTitan,
	skaleTitanTestnet,
	songbird,
	songbirdTestnet,
	taraxa,
	taraxaTestnet,
	telos,
	telosTestnet,
	wanchain,
	wanchainTestnet,
	xdc,
	xdcTestnet,
	zhejiang,
	zkSync,
	zkSyncTestnet
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

export const connection = async (chainId: number = 1) => {
	const chain: any = chains.filter(({ id }) => {
		return id === chainId;
	});
	await connect({
		chainId: chain.id,
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
