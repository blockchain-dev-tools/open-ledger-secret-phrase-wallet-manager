/**
 * 密码强度估算（仅用于 UI 提示）。
 *
 * 按使用的字符池大小 × 长度估算暴力枚举难度，并对单一字符重复做降权。
 * 结果只是启发式参考：真正决定安全性的仍是攻击者掌握的先验信息。
 */
export interface PasswordStrength {
  score: 1 | 2 | 3 | 4;
  label: string;
  hint: string;
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
    return {
      score: 1,
      label: '很弱',
      hint: '太短或太单一，容易被离线枚举。建议至少 12 位并混合大小写、数字与符号。',
      bits,
    };
  }
  if (bits < 40) {
    return {
      score: 2,
      label: '弱',
      hint: '仍然偏弱；增加长度通常比堆特殊符号更有效。',
      bits,
    };
  }
  if (bits < 60) {
    return {
      score: 3,
      label: '中等',
      hint: '可用，但建议再增加几位，以抵抗离线暴力枚举。',
      bits,
    };
  }
  if (bits < 80) {
    return {
      score: 4,
      label: '强',
      hint: '强度良好；请确保你能稳定记住它，且不会与其他密码复用。',
      bits,
    };
  }
  return {
    score: 4,
    label: '极强',
    hint: '强度很高；请确保你能稳定记住它，且不会与其他密码复用。',
    bits,
  };
}
