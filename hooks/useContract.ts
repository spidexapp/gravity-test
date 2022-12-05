import type { Contract } from "@ethersproject/contracts";
import { useWeb3React } from "@web3-react/core";
import { useMemo } from "react";

import GRAVITY_ABI from "../abi/gravity";

import { getContract } from "../utils/contract";

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account, chainId } = useWeb3React();

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null;
    const address =
      typeof addressOrAddressMap === "string"
        ? addressOrAddressMap
        : addressOrAddressMap[chainId];

    if (!address) return null;

    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      return null;
    }
  }, [
    addressOrAddressMap,
    ABI,
    library,
    chainId,
    withSignerIfPossible,
    account,
  ]) as T;
}

export function useMaxContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
) {
  return useContract(tokenAddress, GRAVITY_ABI, withSignerIfPossible);
}
