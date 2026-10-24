/**
 * Secret Phrase 暗语派生（与 open-ledger-app 的 Rust 实现字节级一致）
 *
 * 暗语文本按所选 BIP-39 词表语言切分 → 逐 token 查词表索引（最多 1024 个）
 * → 每个索引 2 字节大端拼接 → keccak256(熵字节) 与 keccak256(密钥) 再哈希
 * → 32 字节熵 → 24 词英文 BIP-39 助记词。
 *
 * 权威实现：open-ledger-app 的 Rust 派生模块（命中词上限与本工具一致）。
 */
import { entropyToMnemonic } from '@scure/bip39';
import { wordlist as EN } from '@scure/bip39/wordlists/english.js';
import { wordlist as ZH_HANS } from '@scure/bip39/wordlists/simplified-chinese.js';
import { wordlist as ZH_HANT } from '@scure/bip39/wordlists/traditional-chinese.js';
import { wordlist as JA } from '@scure/bip39/wordlists/japanese.js';
import { keccak_256 } from '@noble/hashes/sha3.js';

export type WordlistLanguage = 'en' | 'zh-Hans' | 'zh-Hant' | 'ja';

export const WORDLISTS: Record<WordlistLanguage, string[]> = {
  en: EN,
  'zh-Hans': ZH_HANS,
  'zh-Hant': ZH_HANT,
  ja: JA,
};

export const LANGUAGE_LABELS: Record<WordlistLanguage, string> = {
  en: 'English',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  ja: '日本語',
};

/** CJK 词表按单字切分暗语，其余按空白切分。 */
const CJK_LANGUAGES = new Set<WordlistLanguage>(['zh-Hans', 'zh-Hant', 'ja']);

/** 每个索引固定 2 字节（u16 大端）。 */
const BYTES_PER_WORD = 2;
/** 最多参与熵的命中词数（与 Rust MAX_INDICES 一致）。 */
export const MAX_INDICES = 1024;
/** 暗语长度上限（字符数），超出部分忽略。 */
export const MAX_RIDDLE_CHARS = 1024;

const wordIndexCache = new Map<WordlistLanguage, Map<string, number>>();

function getWordIndex(lang: WordlistLanguage): Map<string, number> {
  let cache = wordIndexCache.get(lang);
  if (!cache) {
    cache = new Map(WORDLISTS[lang].map((word, index) => [word, index]));
    wordIndexCache.set(lang, cache);
  }
  return cache;
}

/** 按词表语言把暗语切分为 token。 */
export function tokenize(text: string, lang: WordlistLanguage): string[] {
  if (CJK_LANGUAGES.has(lang)) {
    return Array.from(text).filter((char) => char.trim() !== '');
  }
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/** 步骤 1：暗语 → 命中词表的 token 数组（未命中的 token 不贡献熵）。 */
export function matchTokens(text: string, lang: WordlistLanguage): string[] {
  const truncated = Array.from(text).slice(0, MAX_RIDDLE_CHARS).join('');
  const wordIndex = getWordIndex(lang);
  const matched: string[] = [];
  for (const token of tokenize(truncated, lang)) {
    if (matched.length >= MAX_INDICES) break;
    if (wordIndex.has(token)) matched.push(token);
  }
  return matched;
}

/** 步骤 2：token 数组 → 词表索引数组。 */
export function tokensToIndices(tokens: string[], lang: WordlistLanguage): number[] {
  const wordIndex = getWordIndex(lang);
  const indices: number[] = [];
  for (const token of tokens) {
    if (indices.length >= MAX_INDICES) break;
    const index = wordIndex.get(token);
    if (index !== undefined) indices.push(index);
  }
  return indices;
}

/** 步骤 3：索引数组 → 字节序列（每词 2 字节大端顺序拼接，不补零）。 */
export function indicesToBytes(indices: number[]): Uint8Array {
  const count = Math.min(indices.length, MAX_INDICES);
  const bytes = new Uint8Array(count * BYTES_PER_WORD);
  for (let i = 0; i < count; i++) {
    bytes[i * BYTES_PER_WORD] = (indices[i] >> 8) & 0xff;
    bytes[i * BYTES_PER_WORD + 1] = indices[i] & 0xff;
  }
  return bytes;
}

/** 步骤 4：熵字节 + 密钥 → 最终 32 字节熵。密钥为空时省略盐哈希。 */
export function finalizeEntropy(entropyBytes: Uint8Array, secret: string): Uint8Array {
  const entropyHash = keccak_256(entropyBytes);
  if (secret === '') return keccak_256(entropyHash);

  const secretHash = keccak_256(new TextEncoder().encode(secret));
  const combined = new Uint8Array(entropyHash.length + secretHash.length);
  combined.set(entropyHash, 0);
  combined.set(secretHash, entropyHash.length);
  return keccak_256(combined);
}

/** 暗语 + 密钥 + 词表语言 → 32 字节熵。 */
export function deriveEntropy(
  riddle: string,
  secret: string,
  lang: WordlistLanguage,
): Uint8Array {
  const tokens = matchTokens(riddle, lang);
  const indices = tokensToIndices(tokens, lang);
  return finalizeEntropy(indicesToBytes(indices), secret);
}

/** 熵 → 24 词助记词（设备端固定输出英文词表）。 */
export function entropyToEnglishMnemonic(entropy: Uint8Array): string {
  return entropyToMnemonic(entropy, EN);
}

/** 同一份熵以指定词表展示（仅用于展示，不改变钱包）。 */
export function entropyToMnemonicIn(entropy: Uint8Array, lang: WordlistLanguage): string {
  return entropyToMnemonic(entropy, WORDLISTS[lang]);
}

/** 统计暗语中实际命中词表的 token 数（用于 UI 提示）。 */
export function countMatchedTokens(text: string, lang: WordlistLanguage): number {
  return matchTokens(text, lang).length;
}
