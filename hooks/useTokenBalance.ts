import type Decimal from "decimal.js";
import { useEffect, useState } from "react";

import { DecimalUtil } from "./../utils/decimal";

import { useMaxContract } from "./../hooks/useContract";

export function useTokenBalance(
  tokenAddress: string,
  owner?: string | null
): Decimal | null {
  const contract = useMaxContract(tokenAddress, false);

  const [balance, setBalance] = useState<Decimal | null>(null);

  useEffect(() => {
    if (!owner || !contract) {
      return;
    }
    Promise.all([contract.decimals(), contract.balanceOf(owner)]).then(
      ([decimals, res]) => {
        setBalance(DecimalUtil.fromString(res.toString(), decimals));
      }
    );
  }, [contract, owner]);

  return balance;
}
