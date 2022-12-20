export default {
	name: "Osmosis",
	cosmosConfig: {
		chainId: "osmo-test-4",
		name: "Osmosis",
		chainName: "Osmosis Testnet 4",
		rpc: "https://rpc-test.osmosis.zone",
		rest: "https://lcd-test.osmosis.zone",
		stakeCurrency: {
			coinDenom: "OSMO",
			coinMinimalDenom: "uosmo",
			coinDecimals: 6,
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: {
			bech32PrefixAccAddr: "osmo",
			bech32PrefixAccPub: "osmopub",
			bech32PrefixValAddr: "osmovaloper",
			bech32PrefixValPub: "osmovaloperpub",
			bech32PrefixConsAddr: "osmovalcons",
			bech32PrefixConsPub: "osmovalconspub",
		},
		currencies: [
			{
				coinDenom: "OSMO",
				coinDecimals: 6,
				coinMinimalDenom: "uosmo",
			},
			{
				coinDenom: "SPX",
				coinDecimals: 18,
				coinMinimalDenom: "aspx",
			},
		],
		feeCurrencies: [
			{
				coinDenom: "OSMO",
				coinMinimalDenom: "uosmo",
				coinDecimals: 6,
			},
		],
		features: ["stargate", "no-legacy-stdTx", "ibc-transfer", "ibc-go"],
	},
};
