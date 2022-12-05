import { bech32 } from "bech32";

const {
  isValidChecksumAddress,
  stripHexPrefix,
  toChecksumAddress,
  // eslint-disable-next-line
} = require("crypto-addr-codec");

function makeChecksummedHexDecoder(chainId?: number) {
  return (data: string) => {
    const stripped = stripHexPrefix(data);
    if (
      !isValidChecksumAddress(data, chainId || null) &&
      stripped !== stripped.toLowerCase() &&
      stripped !== stripped.toUpperCase()
    ) {
      throw Error("Invalid address checksum");
    }
    return Buffer.from(stripHexPrefix(data), "hex");
  };
}

function makeChecksummedHexEncoder(chainId?: number) {
  return (data: Buffer) =>
    toChecksumAddress(data.toString("hex"), chainId || null);
}

function makeBech32Decoder(currentPrefix: string) {
  return (data: string) => {
    const { prefix, words } = bech32.decode(data);
    if (prefix !== currentPrefix) {
      throw Error("Unrecognised address format");
    }
    return Buffer.from(bech32.fromWords(words));
  };
}

function makeBech32Encoder(prefix: string) {
  return (data: Buffer) => bech32.encode(prefix, bech32.toWords(data));
}

const hexChecksumChain = (name: string, chainId?: number) => ({
  decoder: makeChecksummedHexDecoder(chainId),
  encoder: makeChecksummedHexEncoder(chainId),
  name,
});

const bech32Chain = (name: string, prefix: string) => ({
  decoder: makeBech32Decoder(prefix),
  encoder: makeBech32Encoder(prefix),
  name,
});

const ETH = hexChecksumChain("ETH");

const SPIDEX = bech32Chain("SPX", "spx");

export const ethToSpx = (ethAddress: string) => {
  const data = ETH.decoder(ethAddress);
  return SPIDEX.encoder(data);
};

export const spxToEth = (spxAddress: string) => {
  const data = SPIDEX.decoder(spxAddress);
  return ETH.encoder(data);
};

export const isValidBech32Address = (bech32Prefix: string, address: string) => {
  try {
    const { prefix } = bech32.decode(address);
    return prefix === bech32Prefix;
  } catch (err) {
    return false;
  }
};
