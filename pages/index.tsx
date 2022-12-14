import {
	Box,
	Flex,
	Select,
	Image,
	Heading,
	Text,
	Button,
	HStack,
	Icon,
	Input,
} from "@chakra-ui/react";
import React from "react";
import Web3 from "web3";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { IoMdArrowForward } from "react-icons/io";
import { CgArrowsExchangeV } from "react-icons/cg";
import { useEffect, useState, useCallback } from "react";
import { ethToSpx, spxToEth } from "../utils/converter";
import { getMetamaskBalance, metaMaskSwitch } from "../utils/common";
import { DecimalUtil } from "../utils/decimal";
import GRAVITY_ABI from "../abi/gravity";
import ERC20_ABI from "../abi/erc20";
import {
	assertIsDeliverTxSuccess,
	SigningStargateClient,
} from "@cosmjs/stargate";
import { coin, coins } from "@cosmjs/proto-signing";

import { ethereum, osmosis, axelar } from "../config/chains";

import {
	AxelarAssetTransfer,
	Environment,
	AxelarQueryAPI,
	CHAINS,
} from "@axelar-network/axelarjs-sdk";

export default function Home() {
	const [web3, setWeb3] = useState<any>();
	const [loading, setLoading] = useState<boolean>(false);
	const [fromChain, setFromChain] = useState<any>(axelar);
	const [toChain, setToChain] = useState<any>(ethereum);
	const [depositAddress, setDepositAddess] = useState<string>();
	const [fromAddress, setFromAddress] = useState<string>();
	const [toAddress, setToAddress] = useState<string>();
	const [fromBalance, setFromBalance] = useState<string>();
	const [client, setClient] = useState<any>();

	console.log("address:", fromAddress);
	useEffect(() => {
		const { ethereum }: any = window;

		const web3pro = new Web3(ethereum);

		if (fromChain.name === "Ethereum") {
			ethereum.enable();
			setFromAddress(ethereum.selectedAddress);
		} else {
			connectKeplr();
		}

		setWeb3(web3pro as any);
	}, [fromChain]);

	const transfer = async () => {
		setLoading(true);
		if (fromChain.name === "Ethereum") {
			await evmToCosmos();
		} else {
			await cosmosToEvm();
		}

		setLoading(false);
	};

	const cosmosToEvm = async () => {
		const convertAmount = 1.2 * 1e6;
		const destination = toAddress
			? toAddress
			: "0x1eb6169BD471ef45A1805f34A135eBd38EdF98eC";

		const sdk = new AxelarAssetTransfer({
			environment: Environment.TESTNET,
		});

		const depositAddress = await sdk.getDepositAddress(
			CHAINS.TESTNET.AXELAR, // source chain
			CHAINS.TESTNET.ETHEREUM, // destination chain
			destination, // destination address
			"uausdc" // denom of asset. See note (2) below
		);

		console.log("depositAddress", depositAddress);
		const amount = {
			denom: "uausdc",
			amount: convertAmount.toString(),
		};
		const fee = {
			amount: [
				{
					denom: fromChain.cosmosConfig.stakeCurrency.coinMinimalDenom,
					amount: fromChain.cosmosConfig.gasPriceStep.average,
				},
			],
			gas: "200000",
		};

		try {
			const result = await client.sendTokens(
				fromAddress,
				depositAddress,
				[amount],
				fee,
				""
			);
			assertIsDeliverTxSuccess(result);
			alert("????????????! " + result?.transactionHash);
			console.log(result);
		} catch (error: any) {
			alert("??????! " + error.toString());
			console.error(error);
		}
	};

	const evmToCosmos = async () => {
		const { ethereum }: any = window;
		const erc20 = "0x254d06f33bDc5b8ee05b2ea472107E300226659A";
		const destination = toAddress
			? toAddress
			: "osmo1x5f9fcw5jdv9epg48j38rp9w67rdrrpz4c6sff";
		const amount = 1.2 * 1e6;
		const sdk = new AxelarAssetTransfer({
			environment: Environment.TESTNET,
		});

		const depositAddress = await sdk.getDepositAddress(
			CHAINS.TESTNET.ETHEREUM, // source chain
			CHAINS.TESTNET.AXELAR, // destination chain
			destination, // destination address
			"uausdc" // denom of asset. See note (2) below
		);

		const axelarQuery = new AxelarQueryAPI({
			environment: Environment.TESTNET,
		});

		const fee: any = await axelarQuery.getTransferFee(
			CHAINS.TESTNET.ETHEREUM,
			CHAINS.TESTNET.AXELAR,
			"uausdc",
			amount
		);

		const feeDenom = fee.fee.amount / 1e6 + "ausdc";

		console.log("depositAddress", depositAddress, feeDenom);

		const erc20Contract = new web3.eth.Contract(ERC20_ABI as any, erc20);

		const approveTransactionParameters = {
			to: erc20,
			from: fromAddress,
			value: "0x0",
			gasPrice: web3.utils.toHex(7 * 1e9),
			gasLimit: web3.utils.toHex(300000),
			data: erc20Contract.methods.transfer(depositAddress, amount).encodeABI(),
		};

		const approveTxHash = await ethereum.request({
			method: "eth_sendTransaction",
			params: [approveTransactionParameters],
		});

		console.log("approveTxHash:", approveTxHash);
	};

	// useEffect(() => {
	// 	if (fromAddress) {
	// 		getBalance();
	// 	}
	// }, [fromAddress]);

	const swap = () => {
		const tmpChain = toChain;
		setToChain(fromChain);
		setFromChain(tmpChain);
	};

	const getBalance = async () => {
		let balance = await web3.eth.getBalance(fromAddress);
		setFromBalance(
			DecimalUtil.beautify(
				DecimalUtil.fromString(
					balance,
					fromChain.config.nativeCurrency.decimals
				)
			)
		);
	};

	const connectKeplr = async () => {
		// init keplr wallet
		if (!window.keplr || !window.getOfflineSigner) {
			return;
		}

		// add your chain to keplr
		await window.keplr.experimentalSuggestChain(fromChain.cosmosConfig);
		await window.keplr.enable(fromChain.cosmosConfig.chainId);

		const offlineSigner = window.getOfflineSigner?.(
			fromChain.cosmosConfig.chainId
		);
		const accounts = await offlineSigner?.getAccounts();
		const client = await SigningStargateClient.connectWithSigner(
			fromChain.cosmosConfig.rpc,
			offlineSigner
		);
		// console.log(client);
		setFromAddress(accounts[0].address);
		setClient(client);
	};

	return (
		<Box className={styles.container}>
			<Head>
				<title>axelar Test</title>
				<meta name="description" content="Spidex testnet faucet" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Box mt={4}>
				<Flex flexDir="column" alignItems="center" mb={5}>
					<Flex alignItems="center" mt={4} pt={2}>
						<Image src="/images/spidex.png" h={9} alt="" />
						<Heading as="h2" size="xl" ml={5} whiteSpace="nowrap">
							Axelar Test
						</Heading>
					</Flex>

					<Flex flexDir="column" w="500px">
						<Text mt={10} ml={2} fontWeight="semibold" fontSize="sm">
							balance: {fromBalance}
						</Text>
						<Box
							bg="spxGray.200"
							h="70px"
							borderRadius="lg"
							cursor="pointer"
							p={4}
							mt={2}
							pb={6}
						>
							<Flex
								justifyContent="space-between"
								alignItems="center"
								ml={4}
								fontWeight="semibold"
							>
								<HStack>
									<Text fontSize="md">FROM</Text>
									<Select
										borderRadius={3}
										size="xs"
										variant="unstyled"
										fontWeight="semibold"
										p={2}
										ml={4}
										value={fromChain?.name}
										fontSize="sm"
										onChange={(e) => setFromChain(e.target.value)}
									>
										<option value="Ethereum">Ethereum</option>
										<option value="Evmos">Evmos</option>
										<option value="Axelar">Axelar</option>
									</Select>
								</HStack>

								<Button>{fromAddress ? "Disconnect" : "Connect"}</Button>
							</Flex>
						</Box>
						<Flex justifyContent="center" cursor="pointer">
							<Box
								bg="spxGray.300"
								borderRadius={20}
								w="40px"
								h="40px"
								mt={6}
								justifyContent="center"
								display="flex"
								alignItems="center"
								onClick={swap}
							>
								<Icon as={CgArrowsExchangeV} boxSize={8} />
							</Box>
						</Flex>

						<Box
							bg="spxGray.200"
							h="70px"
							borderRadius="lg"
							cursor="pointer"
							w="500px"
							p={4}
							mt={6}
							pb={6}
						>
							<Flex
								justifyContent="space-between"
								alignItems="center"
								ml={4}
								fontWeight="semibold"
							>
								<HStack w="full">
									<Text fontSize="md">TO</Text>
									<Text fontSize="md" pl={6}>
										{toChain?.name}
									</Text>
									<Input
										borderRadius={0}
										size="xs"
										variant="unstyled"
										p={2}
										pl={2}
										mt={6}
										ml={4}
										w="full"
										fontSize="sm"
										placeholder="Enter Target Address"
										value={toAddress}
										onChange={(e) => setToAddress(e.target.value)}
									/>
								</HStack>
							</Flex>
						</Box>

						<Box mt={6}>
							<Button
								variant="whitePrimary"
								rounded="md"
								boxShadow="lg"
								// disabled={!fromAddress}
								isLoading={loading}
								onClick={transfer}
								loadingText="Getting"
							>
								<HStack>
									<Text>Transfer</Text>
									<Icon as={IoMdArrowForward} boxSize={5} />
								</HStack>
							</Button>

							{/* <Button
								variant="whitePrimary"
								rounded="md"
								boxShadow="lg"
								ml={5}
								disabled={!fromAddress}
								onClick={toSpidex}
								loadingText="Getting"
							>
								<HStack>
									<Text>Transfer Spidex</Text>
									<Icon as={IoMdArrowForward} boxSize={5} />
								</HStack>
							</Button> */}
						</Box>
					</Flex>
				</Flex>
			</Box>
		</Box>
	);
}
