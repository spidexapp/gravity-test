import Web3 from "web3";

export const toShortAddress = (address: string, maxLength = 16) => {
	if (!address) {
		address = "";
	}
	const tmpArr = address.split(".");
	const halfLength = Math.floor(maxLength / 2);
	const realAccount = tmpArr[0];
	if (realAccount.length <= maxLength) {
		return address;
	}
	return `${realAccount.substr(0, halfLength)}...${realAccount.substr(
		-halfLength
	)}${tmpArr[1] ? `.${tmpArr[1]}` : ""}`;
};

export function beautify(str = "", trim = true): string {
  const reg =
    str.indexOf(".") > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
  str = str.replace(reg, "$1,");
  return trim ? str.replace(/(\.[0-9]*[1-9]+)(0)*/, "$1") : str;
}

export const connect = async () => {
	const { ethereum }: any = window;
	return await ethereum.request({ method: "eth_requestAccounts" });
};

export const getMetamaskCurrentChainId = async () => {
	const { ethereum }: any = window;
	await ethereum.request({ method: "eth_chainId" });
};

export const getMetamaskBalance = async (address) => {
	const { ethereum }: any = window;
	await ethereum.request({
		method: "eth_getBalance",
		params: [address, "latest"],
	});
};

export const metaMaskAddChain = async (chain) => {
	const { ethereum }: any = window;
	console.log(chain);
	await ethereum.request({
		method: "wallet_addEthereumChain",
		params: [chain.config],
	});
};

export const metaMaskSwitch = async (chain) => {
	const { ethereum }: any = window;
	await ethereum.request({
		method: "wallet_switchEthereumChain",
		params: [chain.config.chainId],
	});
};
