[中文](./README.md) · **English** · [日本語](./README.ja.md) · [한국어](./README.ko.md) · [Español](./README.es.md) · [Français](./README.fr.md)

# Open Ledger · Secret Phrase Wallet Manager

Turn a phrase only you remember into a standard 24-word BIP-39 mnemonic, deterministically.

Runs entirely in your browser: no backend, no network requests, no telemetry. Your input exists only in the memory of the current page.

> Early-stage project · Not independently audited · Start with a throwaway test wallet.

## What it is

Enter a phrase, a secret and a wordlist language. The tool derives a 24-word English BIP-39 mnemonic with the same Secret Phrase algorithm used on the Open Ledger device. You can then optionally add a BIP-39 passphrase to derive addresses and private keys for ETH / BTC / SOL / TRON / SUI.

- The same inputs always produce the same mnemonic
- The output is a standard BIP-39 mnemonic and imports into any compatible wallet
- Byte-for-byte identical to the device implementation (see [Algorithm](#algorithm))
- Phrase, secret, passphrase, mnemonic and private keys live only in page memory and are cleared on refresh

## Security model

- **100% local**: no server, no API, no analytics; the build output is static files.
- **No persistence**: no input is written to `localStorage` / `cookie` / `IndexedDB`.
- **It displays private keys**: that is intentional, for export and cross-checking. Use it only on your own offline machine, never on a shared or untrusted computer.
- **Weak inputs can be brute-forced**: the strength of your phrase and secret determines wallet security. The strength meter is a heuristic, not a guarantee.
- **Forgetting the inputs means losing the wallet**: phrase, secret, wordlist language and passphrase are all required. This tool cannot recover anything.

## Quick start

```bash
pnpm install
pnpm dev        # local development
pnpm test       # unit tests, including vectors aligned with the Rust implementation
pnpm build      # type-check + production build
```

Online version (GitHub Pages): <https://blockchain-dev-tools.github.io/open-ledger-secret-phrase-wallet-manager/>

## Algorithm

1. Tokenize the phrase by the selected wordlist language: Simplified/Traditional Chinese and Japanese split by character; other languages split on whitespace and lowercase.
2. Look up each token in the corresponding BIP-39 wordlist (index 0–2047). Unmatched tokens are ignored.
3. Take at most the first **48** matched indices (the phrase is capped at 1024 characters).
4. Encode each index as 2 bytes big-endian and concatenate them; `phraseHash = keccak256(indexBytes)`.
5. With a non-empty secret: `entropy = keccak256(phraseHash ‖ keccak256(secret UTF-8))`. With an empty secret: `entropy = keccak256(phraseHash)`.
6. Convert the 32-byte entropy into a 24-word **English** BIP-39 mnemonic.

Tokenization language, match order, secret content and byte encoding all affect the result. Do not assume it is interchangeable with other "text-to-mnemonic" tools.

The authoritative implementation and test vectors live in [open-ledger-app](https://github.com/blockchain-dev-tools/open-ledger-app/blob/main/docs/reference/enigma.md).

## Compatibility note

The cap on matched tokens was raised from 16 to 48. For a phrase with more than 16 matched tokens, older and current versions derive **different** mnemonics. No external users relied on the old cap; if you created a wallet with an older version, verify recovery with that version first.

## Derivation paths

| Chain | Path | Private key format |
|---|---|---|
| ETH | `m/44'/60'/0'/0/0` | 0x hex |
| BTC | `m/84'/0'/0'/0/0` (P2WPKH) | WIF |
| SOL | `m/44'/501'/0'/0'` (SLIP-10 Ed25519) | base58 · 64B |
| TRON | `m/44'/195'/0'/0/0` | hex |
| SUI | `m/44'/784'/0'/0'/0'` (SLIP-10 Ed25519) | bech32 |

## Stack

Vite · React 19 · TypeScript · `@scure/bip39` · `@scure/bip32` · `@noble/hashes` · `@noble/curves`

## License

[MIT](./LICENSE)
