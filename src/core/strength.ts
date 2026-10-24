/**
 * 密码强度估算（仅用于 UI 提示）。
 *
 * 按使用的字符池大小 × 长度估算暴力枚举难度，并对单一字符重复做降权。
 * 结果只是启发式参考：真正决定安全性的仍是攻击者掌握的先验信息。
 */
export type StrengthLevel = 'veryWeak' | 'weak' | 'fair' | 'strong' | 'veryStrong';

export interface PasswordStrength {
  score: 1 | 2 | 3 | 4;
  level: StrengthLevel;
  bits: number;
}

export function evaluatePasswordStrength(password: string): PasswordStrength | null {
  if (password === '') return null;

  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) {
    pool += /[^\x20-\x7e]/.test(password) ? 200 : 33;
  }
  if (pool === 0) pool = 10;

  let bits = password.length * Math.log2(pool);

  // 纯重复字符（如 aaaaaaaa）实际可选空间极小，直接压低估值
  const unique = new Set(password).size;
  if (unique === 1) bits = Math.min(bits, 8);
  else if (unique <= 2 && password.length >= 8) bits *= 0.5;

  bits = Math.round(bits);

  if (bits < 28) {
    return { score: 1, level: 'veryWeak', bits };
  }
  if (bits < 40) {
    return { score: 2, level: 'weak', bits };
  }
  if (bits < 60) {
    return { score: 3, level: 'fair', bits };
  }
  if (bits < 80) {
    return { score: 4, level: 'strong', bits };
  }
  return { score: 4, level: 'veryStrong', bits };
}
