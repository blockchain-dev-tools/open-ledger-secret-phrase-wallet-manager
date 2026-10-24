**中文** · [English](./README.en.md) · [日本語](./README.ja.md) · [한국어](./README.ko.md) · [Español](./README.es.md) · [Français](./README.fr.md)

# Open Ledger · Secret Phrase Wallet Manager

用一句只有你记得的暗语，确定性地生成一组标准 24 词 BIP-39 助记词。

纯浏览器本地运行：无后端、无网络请求、无遥测，输入只存在于当前页面内存。

> 早期项目 · 未经独立审计 · 请先用可丢弃的测试钱包验证。

## 这是什么

输入「暗语 + 密码 + 词表语言」，本工具按 Open Ledger 设备端的 Secret Phrase 算法派生出 24 词英文 BIP-39 助记词；在此之上可选加入 BIP-39 passphrase，派生 ETH / BTC / SOL / TRON / SUI 五条链的地址与私钥。

- 同一组输入，永远得到同一组助记词
- 输出是标准 BIP-39 助记词，可导入任何兼容钱包
- 算法与设备端实现字节级一致（见 [算法](#算法)）
- 暗语、密码、passphrase、助记词与私钥都只在本页内存中，刷新即清空

## 安全模型

- **100% 本地**：没有服务器、没有 API、没有 analytics；构建产物是静态文件。
- **不持久化**：不使用 `localStorage` / `cookie` / `IndexedDB` 保存任何输入。
- **会显示私钥**：这是为了导出与交叉验证。请只在自己的离线设备上使用，不要在公共或不受信任的电脑上打开。
- **弱输入可被穷举**：暗语与密码的强度决定钱包安全。工具里的强度条只是启发式提示，不构成保证。
- **忘记输入 = 丢失钱包**：暗语、密码、词表语言与 passphrase 缺一不可，本工具无法恢复任何东西。

## 快速开始

```bash
pnpm install
pnpm dev        # 本地开发
pnpm test       # 单元测试（含与 Rust 实现对齐的测试向量）
pnpm build      # 类型检查 + 生产构建
```

在线版本（GitHub Pages）：<https://blockchain-dev-tools.github.io/open-ledger-secret-phrase-wallet-manager/>

## 算法

1. 按所选词表语言切分暗语：简中 / 繁中 / 日文逐字切分，其余按空白切词并小写。
2. 每个 token 查对应 BIP-39 词表索引（0–2047），未命中的 token 被忽略。
3. 最多取前 **48** 个命中索引（暗语原文最多 1024 字符）。
4. 每个索引编码为 2 字节大端并拼接；`phraseHash = keccak256(索引字节)`。
5. 密码非空时 `entropy = keccak256(phraseHash ‖ keccak256(密码 UTF-8))`，密码为空时 `entropy = keccak256(phraseHash)`。
6. 32 字节熵 → 24 词**英文** BIP-39 助记词。

切分语言、命中顺序、密码内容与字节编码都会影响结果；不要假设它与其他「文字生成助记词」工具可互换。

权威实现与测试向量在 [open-ledger-app](https://github.com/blockchain-dev-tools/open-ledger-app/blob/main/docs/reference/enigma.md)。

## 兼容性说明

本仓库曾把参与熵的命中词上限从 16 提高到 48。若某个暗语的命中词超过 16 个，旧版本与当前版本会派生出**不同的**助记词。没有外部用户依赖旧上限；如果你在旧版本中创建过钱包，请先用原始输入在旧版本中验证恢复。

## 派生路径

| 链 | 路径 | 私钥格式 |
|---|---|---|
| ETH | `m/44'/60'/0'/0/0` | 0x hex |
| BTC | `m/84'/0'/0'/0/0`（P2WPKH） | WIF |
| SOL | `m/44'/501'/0'/0'`（SLIP-10 Ed25519） | base58 · 64B |
| TRON | `m/44'/195'/0'/0/0` | hex |
| SUI | `m/44'/784'/0'/0'/0'`（SLIP-10 Ed25519） | bech32 |

## 技术栈

Vite · React 19 · TypeScript · `@scure/bip39` · `@scure/bip32` · `@noble/hashes` · `@noble/curves`

## 许可

[MIT](./LICENSE)
