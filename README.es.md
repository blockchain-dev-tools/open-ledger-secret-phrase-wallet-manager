[中文](./README.md) · [English](./README.en.md) · [日本語](./README.ja.md) · [한국어](./README.ko.md) · **Español** · [Français](./README.fr.md)

# Open Ledger · Secret Phrase Wallet Manager

Convierte una frase que solo tú recuerdas en un mnemónico BIP-39 estándar de 24 palabras, de forma determinista.

Se ejecuta por completo en tu navegador: sin backend, sin peticiones de red, sin telemetría. Tu entrada solo existe en la memoria de la página actual.

> Proyecto en fase inicial · Sin auditoría independiente · Empieza con una cartera de prueba desechable.

## Qué es

Introduce una frase, un secreto y el idioma de la lista de palabras. La herramienta deriva un mnemónico BIP-39 en inglés de 24 palabras con el mismo algoritmo Secret Phrase que usa el dispositivo Open Ledger. Después puedes añadir opcionalmente una passphrase BIP-39 para derivar direcciones y claves privadas de ETH / BTC / SOL / TRON / SUI.

- Las mismas entradas siempre producen el mismo mnemónico
- La salida es un mnemónico BIP-39 estándar, importable en cualquier cartera compatible
- Idéntico byte a byte a la implementación del dispositivo (ver [Algoritmo](#algoritmo))
- Frase, secreto, passphrase, mnemónico y claves privadas solo viven en la memoria de la página y se borran al recargar

## Modelo de seguridad

- **100 % local**: sin servidor, sin API, sin analítica; la salida de compilación son archivos estáticos.
- **Sin persistencia**: ninguna entrada se escribe en `localStorage` / `cookie` / `IndexedDB`.
- **Muestra claves privadas**: es intencional, para exportar y verificar. Úsalo solo en tu propio equipo sin conexión, nunca en un ordenador compartido o no confiable.
- **Las entradas débiles se pueden fuerza bruta**: la fortaleza de tu frase y secreto determina la seguridad de la cartera. El medidor de fortaleza es una heurística, no una garantía.
- **Olvidar las entradas significa perder la cartera**: se necesitan la frase, el secreto, el idioma de la lista y la passphrase. Esta herramienta no puede recuperar nada.

## Inicio rápido

```bash
pnpm install
pnpm dev        # desarrollo local
pnpm test       # pruebas unitarias, incluidos vectores alineados con Rust
pnpm build      # comprobación de tipos + build de producción
```

Versión en línea (GitHub Pages): <https://blockchain-dev-tools.github.io/open-ledger-secret-phrase-wallet-manager/>

## Algoritmo

1. Divide la frase según el idioma de lista elegido: chino simplificado/tradicional y japonés por carácter; los demás idiomas por espacios y en minúsculas.
2. Busca cada token en la lista BIP-39 correspondiente (índice 0–2047). Los tokens sin coincidencia se ignoran.
3. Toma como máximo los primeros **48** índices coincidentes (la frase se limita a 1024 caracteres).
4. Codifica cada índice como 2 bytes big-endian y concaténalos; `phraseHash = keccak256(indexBytes)`.
5. Con secreto no vacío: `entropy = keccak256(phraseHash ‖ keccak256(secret UTF-8))`. Con secreto vacío: `entropy = keccak256(phraseHash)`.
6. Convierte los 32 bytes de entropía en un mnemónico BIP-39 **en inglés** de 24 palabras.

El idioma de segmentación, el orden de coincidencia, el contenido del secreto y la codificación de bytes afectan al resultado. No asumas que es intercambiable con otras herramientas de «texto a mnemónico».

La implementación autoritativa y los vectores de prueba están en [open-ledger-app](https://github.com/blockchain-dev-tools/open-ledger-app/blob/main/docs/reference/enigma.md).

## Nota de compatibilidad

El límite de tokens coincidentes se elevó de 16 a 48. Para frases con más de 16 coincidencias, las versiones antigua y actual derivan mnemónicos **distintos**. Ningún usuario externo dependía del límite antiguo; si creaste una cartera con una versión anterior, verifica la recuperación con esa versión primero.

## Rutas de derivación

| Cadena | Ruta | Formato de clave privada |
|---|---|---|
| ETH | `m/44'/60'/0'/0/0` | hex 0x |
| BTC | `m/84'/0'/0'/0/0` (P2WPKH) | WIF |
| SOL | `m/44'/501'/0'/0'` (SLIP-10 Ed25519) | base58 · 64B |
| TRON | `m/44'/195'/0'/0/0` | hex |
| SUI | `m/44'/784'/0'/0'/0'` (SLIP-10 Ed25519) | bech32 |

## Stack

Vite · React 19 · TypeScript · `@scure/bip39` · `@scure/bip32` · `@noble/hashes` · `@noble/curves`

## Licencia

[MIT](./LICENSE)
