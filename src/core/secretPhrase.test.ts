import { describe, expect, it } from 'vitest';
import { bytesToHex } from '@noble/hashes/utils.js';

import {
  countMatchedTokens,
  deriveEntropy,
  entropyToEnglishMnemonic,
  entropyToMnemonicIn,
  finalizeEntropy,
  indicesToBytes,
  matchTokens,
  tokenize,
  tokensToIndices,
} from './secretPhrase';

describe('Secret Phrase 暗语派生（与设备端 Rust 测试向量一致）', () => {
  it('英文切分：按空白分词并转小写', () => {
    expect(tokenize('ABANDON  ability', 'en')).toEqual(['abandon', 'ability']);
  });

  it('中文切分：逐字切分，忽略空白', () => {
    expect(tokenize('床前 明月光', 'zh-Hans')).toEqual(['床', '前', '明', '月', '光']);
  });

  it('步骤 1：只保留命中词表的 token', () => {
    expect(matchTokens('abandon zzz about', 'en')).toEqual(['abandon', 'about']);
  });

  it('步骤 1：中文命中词', () => {
    expect(matchTokens('床前明月光', 'zh-Hans')).toEqual(['床', '前', '明', '月', '光']);
  });

  it('步骤 2：词 → 索引', () => {
    expect(tokensToIndices(['abandon', 'ability', 'about'], 'en')).toEqual([0, 1, 3]);
    expect(tokensToIndices(['床', '前', '明', '月', '光'], 'zh-Hans')).toEqual([
      1051, 114, 143, 168, 263,
    ]);
  });

  it('步骤 3：索引 → u16 大端字节', () => {
    expect(bytesToHex(indicesToBytes([0, 1, 3]))).toBe('000000010003');
    expect(bytesToHex(indicesToBytes([1051, 114, 143, 168, 263]))).toBe(
      '041b0072008f00a80107',
    );
  });

  it('步骤 4：熵字节 + 密钥 → 32 字节熵', () => {
    expect(bytesToHex(finalizeEntropy(indicesToBytes([0, 1, 3]), 'test'))).toBe(
      '2c62100bfb996b03f3379a5e0d796e6ed62a9f7657649780fb08fc3fde72cecb',
    );
    expect(
      bytesToHex(finalizeEntropy(indicesToBytes([1051, 114, 143, 168, 263]), '1234')),
    ).toBe('d8b3a4adf26bcbdac6500e1d253dafaa096836a1d565c5a70986831091afe95e');
  });

  it('全链路英文向量', () => {
    const entropy = deriveEntropy('abandon ability about', 'test', 'en');
    expect(bytesToHex(entropy)).toBe(
      '2c62100bfb996b03f3379a5e0d796e6ed62a9f7657649780fb08fc3fde72cecb',
    );
    expect(entropyToEnglishMnemonic(entropy)).toBe(
      'cluster awesome actual warm note limit smoke viable fun hint fortune tank glance exile sun uncle nurse amazing season wear worth defense depth idea',
    );
  });

  it('全链路中文向量（输出始终为英文助记词）', () => {
    const entropy = deriveEntropy('床前明月光', '1234', 'zh-Hans');
    expect(bytesToHex(entropy)).toBe(
      'd8b3a4adf26bcbdac6500e1d253dafaa096836a1d565c5a70986831091afe95e',
    );
    expect(entropyToEnglishMnemonic(entropy)).toBe(
      'suffer outdoor clock tooth royal uniform bone achieve brush clarify hip favorite notable brave mansion protect shield debate giant alert animal subject pistol seat',
    );
  });

  it('长中文暗语：标点与未命中字被跳过，命中字全部参与', () => {
    const riddle = '床前明月光，疑是地上霜。举头望明月，低头思故乡。';
    const tokens = matchTokens(riddle, 'zh-Hans');
    expect(tokens).toHaveLength(19);
    expect(tokens.join('')).toBe('床前明月光疑是地上举头望明月低头思故乡');

    const entropy = deriveEntropy(riddle, '1234', 'zh-Hans');
    expect(bytesToHex(entropy)).toBe(
      '852be79f9f24282c0ec602efc0080625d088f09c3da2dc86b0c538ea4bc0f5ca',
    );
    expect(entropyToEnglishMnemonic(entropy)).toBe(
      'lunch game tree dinner dream bid deposit scare used able account entry ancient joke ill reform symptom culture course impact pigeon there strong expect',
    );
  });

  it('相同输入确定性、不同密钥结果不同', () => {
    const a = deriveEntropy('test riddle', 'secret A', 'en');
    const b = deriveEntropy('test riddle', 'secret A', 'en');
    const c = deriveEntropy('test riddle', 'secret B', 'en');
    expect(bytesToHex(a)).toBe(bytesToHex(b));
    expect(bytesToHex(a)).not.toBe(bytesToHex(c));
  });

  it('空密钥时省略盐哈希', () => {
    const entropy = deriveEntropy('abandon', '', 'en');
    expect(bytesToHex(entropy)).toBe(
      bytesToHex(finalizeEntropy(indicesToBytes([0]), '')),
    );
  });

  it('同一份熵可用其他词表展示', () => {
    const entropy = deriveEntropy('床前明月光', '1234', 'zh-Hans');
    const english = entropyToEnglishMnemonic(entropy);
    const chinese = entropyToMnemonicIn(entropy, 'zh-Hans');
    expect(chinese.split(' ')).toHaveLength(24);
    expect(chinese).not.toBe(english);
  });

  it('命中词数统计不超过 48', () => {
    const riddle = Array.from({ length: 60 }, () => 'abandon').join(' ');
    expect(countMatchedTokens(riddle, 'en')).toBe(48);
  });
});
