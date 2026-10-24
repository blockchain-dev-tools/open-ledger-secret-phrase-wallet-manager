# Security Policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately through GitHub Security Advisories on this repository. Do not open a public issue for anything that could put funds at risk.

Include the version/commit, browser and OS, exact input needed to reproduce, and the observed vs expected result. We will acknowledge reports as quickly as possible and coordinate disclosure after a fix is available.

## Scope

This repository is a static, client-side tool. It has no server, no account system, and makes no network requests at runtime.

In scope:

- derivation output diverging from the authoritative Rust implementation in [open-ledger-app](https://github.com/blockchain-dev-tools/open-ledger-app)
- any code path that writes inputs or derived secrets to storage, logs, or the network
- address / private-key encoding errors for ETH, BTC, SOL, TRON or SUI
- dependency or build-chain issues that leak inputs

Out of scope:

- weak riddles or passwords being enumerable (this is a property of the chosen input, not a defect)
- loss of funds caused by forgetting the riddle, password, language or passphrase
- users pasting secrets into untrusted environments, screenshots, or cloud-synced notes

## Known limitations

- The project is early and has not been independently audited.
- The page intentionally displays private keys; use it only on a trusted, offline machine.
- Deterministic derivation does not create entropy that is absent from human-chosen inputs.

## Compatibility note

The cap on matched tokens was raised from 16 to 48. Riddles with more than 16 matched tokens derive a different mnemonic than earlier versions. Verify recovery with the original version before relying on it.
