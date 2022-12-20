export default {
	name: "Evmos",
	cosmosConfig: {
		chainId: "evmos_9000-4",
		name: "Evmos",
		chainName: "Evmos Testnet",
		rpc: "https://testnet-rpc-router.axelar-dev.workers.dev/chain/evmos",
		rest: "https://rest.bd.evmos.dev:1317",
		stakeCurrency: {
			coinDenom: "EVMOS",
			coinMinimalDenom: "atevmos",
			coinDecimals: 18,
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: {
			bech32PrefixAccAddr: "evmos",
			bech32PrefixAccPub: "evmospub",
			bech32PrefixValAddr: "evmosvaloper",
			bech32PrefixValPub: "evmosvaloperpub",
			bech32PrefixConsAddr: "evmosvalcons",
			bech32PrefixConsPub: "evmosvalconspub",
		},
		currencies: [
			{
				coinDenom: "EVMOS",
				coinDecimals: 18,
				coinMinimalDenom: "atevmos",
			},
		],
		feeCurrencies: [
			{
				coinDenom: "EVMOS",
				coinMinimalDenom: "atevmos",
				coinDecimals: 18,
			},
		],
		features: ["stargate", "no-legacy-stdTx", "ibc-transfer", "ibc-go"],
	},
};
