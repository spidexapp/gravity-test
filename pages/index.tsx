import {
	Box,
	Flex,
	Select,
	Image,
	Heading,
	Input,
	Text,
	Button,
	HStack,
	Stack,
	Skeleton,
	Icon,
	useToast,
	Link,
	SlideFade,
} from "@chakra-ui/react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { IoMdArrowForward } from "react-icons/io";
import { CgArrowsExchangeV } from "react-icons/cg";
import { useEffect, useState, useCallback } from "react";

import axios from "axios";
import React from "react";
import eth from "./../config/chains/ethereum";

export default function Home() {
	const toast = useToast();

	const [fromChain, setFromChain] = useState<any>(eth);
	const [address, setAddress] = useState<string>();
	const [loaing, setLoading] = useState<boolean>(false);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const transfer = () => {};

	useEffect(() => {
		transfer();
	}, [transfer]);

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
						<Box
							bg="spxGray.200"
							h="70px"
							borderRadius="lg"
							cursor="pointer"
							p={4}
							mt={10}
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
										value={fromChain.chainName}
										fontSize="sm"
										onChange={(e) => setAddress(e.target.value)}
									>
										<option value="option1">Ethereum</option>
										<option value="option2">Osmosis</option>
									</Select>
								</HStack>

								<Button>Connect</Button>
							</Flex>
						</Box>
						<Flex justifyContent="center">
						<Box
							bg="spxGray.300"
							borderRadius={20}
							w="40px"
							h="40px"
							mt={6}
							justifyContent="center"
							display="flex"
							alignItems="center"
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
								<HStack>
									<Text fontSize="md">TO</Text>
									<Select
										borderRadius={3}
										size="xs"
										variant="unstyled"
										fontWeight="semibold"
										p={2}
										ml={4}
										value={fromChain.chainName}
										fontSize="sm"
										onChange={(e) => setAddress(e.target.value)}
									>
										<option value="option1">Ethereum</option>
										<option value="option2">Osmosis</option>
									</Select>
								</HStack>

								<Button>Connect</Button>
							</Flex>
						</Box>

						<Box mt={6}>
							<Button
								variant="whitePrimary"
								rounded="md"
								boxShadow="lg"
								disabled={!address}
								onClick={transfer}
								isLoading={loaing}
								loadingText="Getting"
							>
								<HStack>
									<Text>Transfer</Text>
									<Icon as={IoMdArrowForward} boxSize={5} />
								</HStack>
							</Button>
						</Box>
					</Flex>
				</Flex>
			</Box>
		</Box>
	);
}
