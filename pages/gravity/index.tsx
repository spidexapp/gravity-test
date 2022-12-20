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
import { ethToSpx, spxToEth } from "../../utils/converter";
import { getMetamaskBalance, metaMaskSwitch } from "../../utils/common";
import { DecimalUtil } from "../../utils/decimal";
import GRAVITY_ABI from "../../abi/gravity";
import ERC20_ABI from "../../abi/erc20";
import {
	assertIsDeliverTxSuccess,
	SigningStargateClient,
} from "@cosmjs/stargate";

import { ethereum, spidex, gravity, osmosis } from "../../config/chains";

export default function Home() {
	const [web3, setWeb3] = useState<any>();
	const [fromChain, setFromChain] = useState<any>(spidex);
	const [toChain, setToChain] = useState<any>(ethereum);
	const [fromAddress, setFromAddress] = useState<string>();
	const [toAddress, setToAddress] = useState<string>();
	const [fromBalance, setFromBalance] = useState<string>();
	const [client, setClient] = useState<any>();

	console.log("address:", fromAddress);
	useEffect(() => {
		const { ethereum }: any = window;

		console.log("ethereum:", ethereum)
		const web3pro = new Web3(
			new Web3.providers.HttpProvider(fromChain.config.rpcUrls[0])
		);

		if (fromChain.name === "Spidex") {
			connectKeplr()
		} else {
			ethereum.enable();
			setFromAddress(ethereum.selectedAddress);
		}

		setWeb3(web3pro as any);
	}, [fromChain]);

	useEffect(() => {
		if (fromAddress) {
			getBalance();
		}
	}, [fromAddress]);

	const swap = () => {
		const tmpChain = toChain;
		setToChain(fromChain);
		setFromChain(tmpChain);
	};

	const transfer = async () => {
		const BN = web3.utils.BN;
		const gravityBridge = "0x7580bFE88Dd3d07947908FAE12d95872a260F2D8";
		const erc20 = "0x0412C7c846bb6b7DC462CF6B453f76D8440b2609";
		const destination = toAddress
			? toAddress
			: "0x37F028927e8b0Ed6D6B4e3632936C07BEDBAb73d";
		const amount = new BN(String(100 * 1e18)).toString();

		await approve(erc20, gravityBridge, amount);
		await sendToCosmos(erc20, gravityBridge, destination, amount);
	};

	const convert = async () => {};

	const approve = async (erc20, gravityBridge, amount) => {
		const { ethereum }: any = window;
		const erc20Contract = new web3.eth.Contract(ERC20_ABI as any, erc20);

		const approve = erc20Contract.methods
			.approve(gravityBridge, amount)
			.encodeABI();

		const approveTransactionParameters = {
			to: erc20,
			from: fromAddress,
			value: "0x0",
			gasPrice: web3.utils.toHex(7 * 1e9),
			gasLimit: web3.utils.toHex(300000),
			data: approve,
		};

		const approveTxHash = await ethereum.request({
			method: "eth_sendTransaction",
			params: [approveTransactionParameters],
		});

		const allowance = await erc20Contract.methods
			.allowance(fromAddress, gravityBridge)
			.call();
		console.log("approveTxHash:", approveTxHash, "allowance:", allowance);
	};

	const sendToCosmos = async (erc20, gravityBridge, destination, amount) => {
		const { ethereum }: any = window;
		const gravityContract = new web3.eth.Contract(
			GRAVITY_ABI as any,
			gravityBridge
		);

		console.log(ethToSpx(destination), spxToEth(ethToSpx(destination)));

		const sendCosmos = gravityContract.methods
			.sendToCosmos(erc20, ethToSpx(destination), amount)
			.encodeABI();

		const sendTransactionParameters = {
			to: gravityBridge,
			from: fromAddress,
			value: "0x00",
			data: sendCosmos,
		};

		const txHash = await ethereum.request({
			method: "eth_sendTransaction",
			params: [sendTransactionParameters],
		});

		console.log(txHash);
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

		const offlineSigner = window.getOfflineSigner?.(fromChain.cosmosConfig.chainId);
		const accounts = await offlineSigner?.getAccounts();
		const client = await SigningStargateClient.connectWithSigner(
			fromChain.cosmosConfig.rpc,
			offlineSigner
		);
		// console.log(client);
		setFromAddress(accounts[0].address);
		setClient(client);
	};

	const approveToSpidex = async () => {
		const { ethereum }: any = window;
		const BN = web3.utils.BN;
		const erc20 = "0x4bdD769577d3bb38fa1148480B68f0Dea1683D8F";
		const erc20Contract = new web3.eth.Contract(ERC20_ABI as any, erc20);
		const toAddress = "0xB6747CFE9cB3d23Fd15CE56576C3C693200cdf81";
		const amount = new BN(5 * 1e6).toString();
		const approve = erc20Contract.methods
			.approve(toAddress, amount)
			.encodeABI();

		// 请用接受者身份来执行
		const transferFrom = erc20Contract.methods
			.transferFrom(fromAddress, toAddress, amount)
			.encodeABI();

		const approveTransactionParameters = {
			to: erc20,
			from: fromAddress,
			value: "0x0",
			gasPrice: web3.utils.toHex(7 * 1e9),
			gasLimit: web3.utils.toHex(300000),
			data: transferFrom,
		};

		const approveTxHash = await ethereum.request({
			method: "eth_sendTransaction",
			params: [approveTransactionParameters],
		});

		const result = await erc20Contract.methods.allowance(
			fromAddress,
			toAddress
		);

		console.log(approveTxHash, result);
	};

	return (
		<Box className={styles.container}>
			<Head>
				<title>Gravity Test</title>
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
							Gravity Test
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
										value={fromChain.name}
										fontSize="sm"
										onChange={(e) => setFromChain(e.target.value)}
									>
										<option value="Ethereum">Ethereum</option>
										<option value="Spidex">Spidex</option>
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
										{toChain.name}
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
								disabled={!fromAddress}
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
