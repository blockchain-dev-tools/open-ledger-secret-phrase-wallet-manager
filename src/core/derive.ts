/**
 * 助记词 + BIP-39 passphrase → 五链地址与私钥。
 *
 * 派生路径与 open-ledger-app / open-ledger-website 的默认值保持一致：
 *   ETH  m/44'/60'/0'/0/0
 *   BTC  m/84'/0'/0'/0/0      (P2WPKH, bc1q…)
 *   SOL  m/44'/501'/0'/0'     (SLIP-10 Ed25519)
 *   TRON m/44'/195'/0'/0/0
 *   SUI  m/44'/784'/0'/0'/0'  (SLIP-10 Ed25519)
 */
import { HDKey } from '@scure/bip32';
import { mnemonicToSeed } from '@scure/bip39';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256, sha512 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { blake2b } from '@noble/hashes/blake2.js';
import { bytesToHex, concatBytes } from '@noble/hashes/utils.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import { base58, bech32 } from '@scure/base';

export type ChainId = 'eth' | 'btc' | 'sol' | 'tron' | 'sui';

export interface DerivedAccount {
  id: ChainId;
  name: string;
  symbol: string;
  mark: string;
  path: string;
  address: string;
  privateKey: string;
  privateKeyLabel: string;
}

const PATHS: Record<ChainId, string> = {
  eth: "m/44'/60'/0'/0/0",
  btc: "m/84'/0'/0'/0/0",
  sol: "m/44'/501'/0'/0'",
  tron: "m/44'/195'/0'/0/0",
  sui: "m/44'/784'/0'/0'/0'",
};

const CHAIN_META: Record<ChainId, { name: string; symbol: string; mark: string }> = {
  eth: { name: 'Ethereum', symbol: 'ETH', mark: 'Ξ' },
  btc: { name: 'Bitcoin', symbol: 'BTC', mark: '₿' },
  sol: { name: 'Solana', symbol: 'SOL', mark: '◎' },
  tron: { name: 'Tron', symbol: 'TRON', mark: 'T' },
  sui: { name: 'Sui', symbol: 'SUI', mark: 'S' },
};

function parsePath(path: string): number[] {
  return path
    .split('/')
    .slice(1)
    .map((segment) => {
      const hardened = segment.endsWith("'");
      const index = Number.parseInt(hardened ? segment.slice(0, -1) : segment, 10);
      return hardened ? (0x80000000 | index) >>> 0 : index;
    });
}

function pathToString(components: number[]): string {
  return (
    'm/' +
    components
      .map((component) => {
        const hardened = (component & 0x80000000) !== 0;
        const index = component & 0x7fffffff;
        return hardened ? `${index}'` : `${index}`;
      })
      .join('/')
  );
}

/** BIP-32 secp256k1（ETH / BTC / TRON 共用）。 */
function deriveSecp256k1PrivateKey(seed: Uint8Array, path: string): Uint8Array {
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(path);
  if (!child.privateKey) throw new Error('BIP-32 派生失败：未得到私钥');
  return child.privateKey;
}

/** SLIP-10 Ed25519（SOL / SUI 共用，路径必须全硬化）。 */
function deriveEd25519PrivateKey(seed: Uint8Array, components: number[]): Uint8Array {
  const master = hmac(sha512, new TextEncoder().encode('ed25519 seed'), seed);
  let key = master.slice(0, 32);
  let chainCode = master.slice(32);

  for (const component of components) {
    if ((component & 0x80000000) === 0) {
      throw new Error('SLIP-10 Ed25519 要求全硬化路径');
    }
    const index = component >>> 0;
    const data = new Uint8Array(37);
    data[0] = 0x00;
    data.set(key, 1);
    data[33] = (index >>> 24) & 0xff;
    data[34] = (index >>> 16) & 0xff;
    data[35] = (index >>> 8) & 0xff;
    data[36] = index & 0xff;

    const child = hmac(sha512, chainCode, data);
    key = child.slice(0, 32);
    chainCode = child.slice(32);
  }

  return key;
}

function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

function sha256d(data: Uint8Array): Uint8Array {
  return sha256(sha256(data));
}

function base58check(payload: Uint8Array): string {
  return base58.encode(concatBytes(payload, sha256d(payload).slice(0, 4)));
}

/** EIP-55 混合大小写校验和。 */
function toEip55Address(rawLowerHex: string): string {
  const hash = bytesToHex(keccak_256(new TextEncoder().encode(rawLowerHex)));
  return rawLowerHex
    .split('')
    .map((char, index) => (Number.parseInt(hash[index], 16) >= 8 ? char.toUpperCase() : char))
    .join('');
}

function ethAddress(privKey: Uint8Array): string {
  const publicKey = secp256k1.getPublicKey(privKey, false);
  const hash = keccak_256(publicKey.slice(1));
  return '0x' + toEip55Address(bytesToHex(hash.slice(12)));
}

function btcAddress(privKey: Uint8Array): string {
  const publicKey = secp256k1.getPublicKey(privKey, true);
  return bech32.encode('bc', [0, ...bech32.toWords(hash160(publicKey))]);
}

function btcWif(privKey: Uint8Array): string {
  return base58check(concatBytes(new Uint8Array([0x80]), privKey, new Uint8Array([0x01])));
}

function tronAddress(privKey: Uint8Array): string {
  const publicKey = secp256k1.getPublicKey(privKey, false);
  const hash = keccak_256(publicKey.slice(1));
  return base58check(concatBytes(new Uint8Array([0x41]), hash.slice(12)));
}

function solanaAddress(privKey: Uint8Array): string {
  return base58.encode(ed25519.getPublicKey(privKey));
}

function solanaSecretKey(privKey: Uint8Array): string {
  // Phantom / Solflare 导出的 64 字节 secret key = 32 字节种子 + 32 字节公钥
  return base58.encode(concatBytes(privKey, ed25519.getPublicKey(privKey)));
}

function suiAddress(privKey: Uint8Array): string {
  const publicKey = ed25519.getPublicKey(privKey);
  const payload = concatBytes(new Uint8Array([0x00]), publicKey);
  return '0x' + bytesToHex(blake2b(payload, { dkLen: 32 }));
}

function suiSecretKey(privKey: Uint8Array): string {
  // Sui CLI 的 bech32 私钥：flag 0x00 (ed25519) + 32 字节私钥
  const payload = concatBytes(new Uint8Array([0x00]), privKey);
  return bech32.encode('suiprivkey', bech32.toWords(payload));
}

/** 由助记词与 passphrase 派生五条链的地址与私钥。 */
export async function deriveAccounts(
  mnemonic: string,
  passphrase = '',
): Promise<DerivedAccount[]> {
  const seed = await mnemonicToSeed(mnemonic.trim(), passphrase);

  const ethPriv = deriveSecp256k1PrivateKey(seed, PATHS.eth);
  const btcPriv = deriveSecp256k1PrivateKey(seed, PATHS.btc);
  const tronPriv = deriveSecp256k1PrivateKey(seed, PATHS.tron);
  const solPriv = deriveEd25519PrivateKey(seed, parsePath(PATHS.sol));
  const suiPriv = deriveEd25519PrivateKey(seed, parsePath(PATHS.sui));

  const accounts: DerivedAccount[] = [
    {
      id: 'eth',
      ...CHAIN_META.eth,
      path: pathToString(parsePath(PATHS.eth)),
      address: ethAddress(ethPriv),
      privateKey: '0x' + bytesToHex(ethPriv),
      privateKeyLabel: '0x hex',
    },
    {
      id: 'btc',
      ...CHAIN_META.btc,
      path: pathToString(parsePath(PATHS.btc)),
      address: btcAddress(btcPriv),
      privateKey: btcWif(btcPriv),
      privateKeyLabel: 'WIF',
    },
    {
      id: 'sol',
      ...CHAIN_META.sol,
      path: pathToString(parsePath(PATHS.sol)),
      address: solanaAddress(solPriv),
      privateKey: solanaSecretKey(solPriv),
      privateKeyLabel: 'base58 · 64B',
    },
    {
      id: 'tron',
      ...CHAIN_META.tron,
      path: pathToString(parsePath(PATHS.tron)),
      address: tronAddress(tronPriv),
      privateKey: bytesToHex(tronPriv),
      privateKeyLabel: 'hex',
    },
    {
      id: 'sui',
      ...CHAIN_META.sui,
      path: pathToString(parsePath(PATHS.sui)),
      address: suiAddress(suiPriv),
      privateKey: suiSecretKey(suiPriv),
      privateKeyLabel: 'bech32',
    },
  ];

  return accounts;
}
