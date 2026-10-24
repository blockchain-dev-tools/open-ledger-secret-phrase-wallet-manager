import { describe, expect, it } from 'vitest';

import { deriveAccounts } from './derive';

const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

describe('五链地址与私钥派生', () => {
  it('标准测试助记词派生已知 ETH 地址（m/44\'/60\'/0\'/0/0）', async () => {
    const [eth] = await deriveAccounts(TEST_MNEMONIC);
    expect(eth.address).toBe('0x9858EfFD232B4033E47d90003D41EC34EcaEda94');
  });

  it('地址格式符合各链约定', async () => {
    const accounts = await deriveAccounts(TEST_MNEMONIC);
    const byId = Object.fromEntries(accounts.map((account) => [account.id, account]));

    expect(byId.eth.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(byId.btc.address).toMatch(/^bc1q[02-9ac-hj-np-z]{38,58}$/);
    expect(byId.sol.address).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
    expect(byId.tron.address).toMatch(/^T[1-9A-HJ-NP-Za-km-z]{33}$/);
    expect(byId.sui.address).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('私钥使用各链常见导出格式', async () => {
    const accounts = await deriveAccounts(TEST_MNEMONIC);
    const byId = Object.fromEntries(accounts.map((account) => [account.id, account]));

    expect(byId.eth.privateKey).toMatch(/^0x[0-9a-f]{64}$/);
    expect(byId.btc.privateKey).toMatch(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/);
    expect(byId.sol.privateKey).toMatch(/^[1-9A-HJ-NP-Za-km-z]{80,90}$/);
    expect(byId.tron.privateKey).toMatch(/^[0-9a-f]{64}$/);
    expect(byId.sui.privateKey).toMatch(/^suiprivkey1[02-9ac-hj-np-z]+$/);
  });

  it('助记词相同、passphrase 不同 → 地址全部不同', async () => {
    const withoutPassphrase = await deriveAccounts(TEST_MNEMONIC, '');
    const withPassphrase = await deriveAccounts(TEST_MNEMONIC, 'extra-pass');

    withoutPassphrase.forEach((account, index) => {
      expect(account.address).not.toBe(withPassphrase[index].address);
      expect(account.privateKey).not.toBe(withPassphrase[index].privateKey);
    });
  });

  it('相同输入结果确定', async () => {
    const a = await deriveAccounts(TEST_MNEMONIC, 'pass');
    const b = await deriveAccounts(TEST_MNEMONIC, 'pass');
    expect(a).toEqual(b);
  });
});
