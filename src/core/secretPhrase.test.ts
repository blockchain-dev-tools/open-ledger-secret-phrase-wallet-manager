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

  it('命中词数上限为 1024（同时受 1024 字符截断）', () => {
    const english = Array.from({ length: 60 }, () => 'abandon').join(' ');
    expect(countMatchedTokens(english, 'en')).toBe(60);
    expect(countMatchedTokens('床'.repeat(1100), 'zh-Hans')).toBe(1024);
  });

  it('超过 48 个命中词时，前 1024 个全部参与熵', () => {
    const riddle =
      '君不见黄河之水天上来，奔流到海不复回。君不见高堂明镜悲白发，朝如青丝暮成雪。人生得意须尽欢，莫使金樽空对月。天生我材必有用，千金散尽还复来。烹羊宰牛且为乐，会须一饮三百杯。岑夫子，丹丘生，将进酒，杯莫停。与君歌一曲，请君为我倾耳听。钟鼓馔玉不足贵，但愿长醉不复醒。古来圣贤皆寂寞，惟有饮者留其名。陈王昔时宴平乐，斗酒十千恣欢谑。主人何为言少钱，径须沽取对君酌。五花马，千金裘，呼儿将出换美酒，与尔同销万古愁。';

    const tokens = matchTokens(riddle, 'zh-Hans');
    expect(tokens).toHaveLength(159);

    const full = deriveEntropy(riddle, '1234', 'zh-Hans');
    expect(bytesToHex(full)).toBe(
      '5dd9a7bb11f2a10f355b69774a17278a056e4a0aa8590aa0ffb5aa0b991bc8ce',
    );
    expect(entropyToEnglishMnemonic(full)).toBe(
      'fruit snake uphold catalog claw maple step honey jar expose size beef finger celery click arctic apple among uniform favorite ridge mistake case soda',
    );

    // 第 49 个命中词起也参与熵，因此与只取前 48 个的结果不同
    const first48 = deriveEntropy(tokens.slice(0, 48).join(''), '1234', 'zh-Hans');
    expect(bytesToHex(first48)).not.toBe(bytesToHex(full));

    // 前 48 个索引与历史上限版本的向量一致（前缀不变）
    expect(tokensToIndices(tokens, 'zh-Hans').slice(0, 48)).toEqual([
      1135, 4, 228, 511, 550, 65, 76, 116, 13, 21, 1464, 216, 25, 275, 4, 390, 253, 1135, 4,
      228, 78, 1017, 143, 1341, 1506, 313, 37, 577, 75, 412, 708, 33, 1085, 8, 24, 61, 166,
      393, 662, 819, 1298, 95, 283, 354, 32, 168, 116, 24,
    ]);
  });
});
