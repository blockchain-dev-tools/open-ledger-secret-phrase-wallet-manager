import { describe, expect, it } from 'vitest';

import { evaluatePasswordStrength } from './strength';

describe('密码强度估算', () => {
  it('空密码不返回强度', () => {
    expect(evaluatePasswordStrength('')).toBeNull();
  });

  it('短数字密码为很弱', () => {
    const result = evaluatePasswordStrength('1234');
    expect(result?.score).toBe(1);
    expect(result?.level).toBe('veryWeak');
  });

  it('纯重复字符被降权', () => {
    const result = evaluatePasswordStrength('aaaaaaaaaaaa');
    expect(result?.score).toBe(1);
    expect(result?.bits).toBeLessThanOrEqual(8);
  });

  it('长数字密码为弱或中等', () => {
    const result = evaluatePasswordStrength('123456789012');
    expect(result?.score).toBeGreaterThanOrEqual(2);
  });

  it('大小写数字符号混合的长密码为强', () => {
    const result = evaluatePasswordStrength('Abcdefgh1234!@');
    expect(result?.score).toBe(4);
    expect(result?.bits).toBeGreaterThanOrEqual(80);
  });

  it('中文密码按较大字符池估算', () => {
    const result = evaluatePasswordStrength('山重水复疑无路');
    expect(result?.score).toBeGreaterThanOrEqual(3);
  });
});
