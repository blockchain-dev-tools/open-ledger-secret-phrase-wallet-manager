import { useEffect, useMemo, useState } from 'react';
import { bytesToHex } from '@noble/hashes/utils.js';

import {
  LANGUAGE_LABELS,
  MAX_INDICES,
  countMatchedTokens,
  deriveEntropy,
  entropyToEnglishMnemonic,
  entropyToMnemonicIn,
  type WordlistLanguage,
} from './core/secretPhrase';
import { deriveAccounts, type ChainId, type DerivedAccount } from './core/derive';
import { evaluatePasswordStrength } from './core/strength';

const LANGUAGE_OPTIONS: Array<{ value: WordlistLanguage; label: string }> = [
  { value: 'zh-Hans', label: '简体中文' },
  { value: 'zh-Hant', label: '繁體中文' },
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
];

type Status = 'idle' | 'working' | 'ready' | 'error';

interface PhraseResult {
  mnemonic: string;
  altMnemonic: string;
  entropyHex: string;
  matched: number;
}

const STATUS_TEXT: Record<Status, string> = {
  idle: '等待输入',
  working: '派生中',
  ready: '已派生 · 仅本地',
  error: '派生失败',
};

export default function App() {
  const [riddle, setRiddle] = useState('');
  const [secret, setSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [lang, setLang] = useState<WordlistLanguage>('zh-Hans');

  const [showSecret, setShowSecret] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showAlt, setShowAlt] = useState(false);

  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [accountsStatus, setAccountsStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const [revealed, setRevealed] = useState<Set<ChainId>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const matchedTokens = useMemo(
    () => countMatchedTokens(riddle, lang),
    [riddle, lang],
  );

  const strength = useMemo(() => evaluatePasswordStrength(secret), [secret]);

  const hasInput = riddle.trim() !== '' || secret !== '';

  // 助记词只由「暗语 + 密码 + 词表语言」决定，与 passphrase 无关。
  const phrase = useMemo<PhraseResult | null>(() => {
    if (!hasInput) return null;
    const entropy = deriveEntropy(riddle, secret, lang);
    return {
      mnemonic: entropyToEnglishMnemonic(entropy),
      altMnemonic: entropyToMnemonicIn(entropy, lang),
      entropyHex: bytesToHex(entropy),
      matched: countMatchedTokens(riddle, lang),
    };
  }, [riddle, secret, lang, hasInput]);

  // 地址与私钥由助记词 + passphrase 决定；passphrase 修改后重新派生。
  useEffect(() => {
    if (!phrase) {
      setAccounts([]);
      setAccountsStatus('idle');
      setError(null);
      return;
    }

    let cancelled = false;
    setAccountsStatus('working');

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const derived = await deriveAccounts(phrase.mnemonic, passphrase);
          if (cancelled) return;
          setAccounts(derived);
          setAccountsStatus('ready');
          setError(null);
        } catch (cause) {
          if (cancelled) return;
          setAccounts([]);
          setAccountsStatus('error');
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      })();
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phrase, passphrase]);

  const status: Status = !phrase
    ? 'idle'
    : accountsStatus === 'error'
      ? 'error'
      : accountsStatus === 'ready'
        ? 'ready'
        : 'working';

  const allRevealed =
    accounts.length > 0 && accounts.every((account) => revealed.has(account.id));

  function toggleAllKeys() {
    setRevealed(
      allRevealed ? new Set() : new Set(accounts.map((account) => account.id)),
    );
  }

  function toggleKey(id: ChainId) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyValue(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement('textarea');
      area.value = value;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setCopied(id);
    window.setTimeout(() => {
      setCopied((current) => (current === id ? null : current));
    }, 1500);
  }

  function resetAll() {
    setRiddle('');
    setSecret('');
    setPassphrase('');
    setRevealed(new Set());
    setShowAlt(false);
  }

  function fillExample() {
    setLang('zh-Hans');
    setRiddle('床前明月光，疑是地上霜。举头望明月，低头思故乡。');
    setSecret('1234');
    setPassphrase('');
  }

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-copy">
          <p className="eyebrow">Open Ledger · Secret Phrase Wallet Manager</p>
          <h1>
            SECRET PHRASE
            <span>暗语钱包生成器</span>
          </h1>
          <p className="lede">
            先用暗语与密钥在本机派生出确定性的 24 词 BIP-39 助记词，再在助记词下方按需加入
            BIP-39 passphrase，派生五条链的地址与私钥。暗语（Secret Phrase）算法与 Open
            Ledger 设备端实现字节级一致。
          </p>
        </div>
        <div className="stamp" aria-hidden="true">
          <span>100%</span>
          <span>LOCAL</span>
          <span>NO NETWORK</span>
        </div>
      </header>

      <div className="workspace">
        <section className="panel form-panel" aria-label="输入">
          <div className="panel-head">
            <span className="panel-index">输入 / INPUT</span>
            <span className={`status status-${status}`}>
              <i aria-hidden="true" />
              {STATUS_TEXT[status]}
            </span>
          </div>

          <div className="field">
            <div className="field-head">
              <label htmlFor="riddle">暗语</label>
              <span className="field-en">SECRET PHRASE · 决定助记词</span>
            </div>
            <textarea
              id="riddle"
              value={riddle}
              onChange={(event) => setRiddle(event.target.value)}
              rows={4}
              spellCheck={false}
              autoComplete="off"
              placeholder="床前明月光，疑是地上霜。"
            />
            <div className="field-meta">
              <span className="field-meta-label">词表语言</span>
              <div className="segmented" role="group" aria-label="暗语词表语言">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={lang === option.value}
                    onClick={() => setLang(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="hint">
              已命中词表 <strong>{matchedTokens}</strong>/{MAX_INDICES} 个 token；
              未命中词表的字符会被忽略，只有前 {MAX_INDICES} 个命中 token 参与熵。
            </p>
          </div>

          <div className="field">
            <div className="field-head">
              <label htmlFor="secret">密码</label>
              <span className="field-en">SECRET KEY · 参与助记词派生</span>
            </div>
            <div className="input-wrap">
              <input
                id="secret"
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder="与暗语一起决定助记词"
              />
              <button
                type="button"
                className="ghost"
                onClick={() => setShowSecret((value) => !value)}
                aria-label={showSecret ? '隐藏密码' : '显示密码'}
              >
                {showSecret ? '隐藏' : '显示'}
              </button>
            </div>

            {strength && (
              <div className="strength" data-score={strength.score}>
                <div
                  className="strength-track"
                  role="img"
                  aria-label={`密码强度：${strength.label}`}
                >
                  {[1, 2, 3, 4].map((level) => (
                    <i key={level} className={level <= strength.score ? 'is-on' : ''} />
                  ))}
                </div>
                <div className="strength-meta">
                  <span className="strength-label">强度：{strength.label}</span>
                  <span className="strength-bits">约 {strength.bits} bit</span>
                </div>
                <p className="hint">{strength.hint}</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-solid" onClick={fillExample}>
              填入示例
            </button>
            <button type="button" className="btn" onClick={resetAll}>
              清空
            </button>
          </div>

          <p className="local-note">
            输入不会写入本地存储，也不会发出任何网络请求；刷新页面即清空。
          </p>
        </section>

        <section className="results" aria-live="polite" aria-busy={status === 'working'}>
          {error && (
            <div className="error-card" role="alert">
              <strong>派生失败</strong>
              <p>{error}</p>
            </div>
          )}

          {!phrase && !error && (
            <div className="empty">
              <div className="empty-mark" aria-hidden="true">
                ⌘
              </div>
              <p>输入暗语与密码后，24 词助记词会先出现在这里。</p>
              <p className="empty-sub">助记词生成后，可在其下方加入 BIP-39 Passphrase 派生地址。</p>
            </div>
          )}

          {phrase && (
            <div className="result-stack">
              <article className="card mnemonic-card">
                <div className="card-head">
                  <div>
                    <span className="card-kicker">01 · 助记词</span>
                    <h2>24 词 · English BIP-39</h2>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => void copyValue('mnemonic', phrase.mnemonic)}
                  >
                    {copied === 'mnemonic' ? '已复制' : '复制助记词'}
                  </button>
                </div>

                <ol className="word-grid">
                  {phrase.mnemonic.split(' ').map((word, index) => (
                    <li className="word" key={`${word}-${index}`}>
                      <span className="word-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="word-text">{word}</span>
                    </li>
                  ))}
                </ol>

                <div className="passphrase-panel">
                  <div className="field-head">
                    <label htmlFor="passphrase">BIP-39 Passphrase</label>
                    <span className="field-en">可选 · 只影响地址与私钥</span>
                  </div>
                  <div className="input-wrap">
                    <input
                      id="passphrase"
                      type={showPassphrase ? 'text' : 'password'}
                      value={passphrase}
                      onChange={(event) => setPassphrase(event.target.value)}
                      spellCheck={false}
                      autoComplete="off"
                      placeholder="留空表示不使用"
                    />
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setShowPassphrase((value) => !value)}
                      aria-label={showPassphrase ? '隐藏 passphrase' : '显示 passphrase'}
                    >
                      {showPassphrase ? '隐藏' : '显示'}
                    </button>
                  </div>
                  <p className="hint">
                    助记词保持不变；填入或修改后，下方五链地址与私钥会重新派生。
                  </p>
                </div>

                <div className="card-foot">
                  <span>
                    命中 {phrase.matched}/{MAX_INDICES} · 暗语词表 {LANGUAGE_LABELS[lang]}
                  </span>
                  {lang !== 'en' && (
                    <button
                      type="button"
                      className="link"
                      onClick={() => setShowAlt((value) => !value)}
                    >
                      {showAlt ? '隐藏同熵展示' : `以${LANGUAGE_LABELS[lang]}词表展示`}
                    </button>
                  )}
                </div>

                {showAlt && lang !== 'en' && (
                  <div className="alt-mnemonic">
                    <span>同一份熵 · {LANGUAGE_LABELS[lang]}词表 · 仅用于展示</span>
                    <ol className="word-grid alt">
                      {phrase.altMnemonic.split(' ').map((word, index) => (
                        <li className="word" key={`alt-${word}-${index}`}>
                          <span className="word-index">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="word-text">{word}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>

              <article className="card accounts-card">
                <div className="card-head">
                  <div>
                    <span className="card-kicker">02 · 账户</span>
                    <h2>地址与私钥 · 五条链</h2>
                    <p className="card-sub">随上方 BIP-39 Passphrase 变化实时重算</p>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={toggleAllKeys}
                    disabled={accounts.length === 0}
                  >
                    {allRevealed ? '隐藏全部私钥' : '显示全部私钥'}
                  </button>
                </div>

                {accounts.length === 0 ? (
                  <p className="derive-placeholder">
                    {accountsStatus === 'error' ? '派生失败' : '正在派生五条链地址…'}
                  </p>
                ) : (
                  <div
                    className={`chain-grid${accountsStatus === 'working' ? ' is-updating' : ''}`}
                  >
                    {accounts.map((account) => (
                      <ChainCard
                        key={account.id}
                        account={account}
                        revealed={revealed.has(account.id)}
                        copied={copied}
                        onToggle={() => toggleKey(account.id)}
                        onCopy={copyValue}
                      />
                    ))}
                  </div>
                )}
              </article>

              <details className="card details-card">
                <summary>派生详情</summary>
                <dl>
                  <div>
                    <dt>暗语熵</dt>
                    <dd>
                      <code>{phrase.entropyHex}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>算法</dt>
                    <dd>
                      keccak256(keccak256(索引字节) ‖ keccak256(密码)) → 24 词英文 BIP-39
                    </dd>
                  </div>
                  <div>
                    <dt>Passphrase</dt>
                    <dd>{passphrase ? '已启用（影响种子与地址）' : '未使用'}</dd>
                  </div>
                </dl>
              </details>

              <aside className="notice">
                <h3>使用须知</h3>
                <ul>
                  <li>暗语、密码、passphrase 与私钥都只存在于当前页面内存，刷新即消失。</li>
                  <li>
                    暗语与密码的强度决定钱包安全：弱输入可被暴力枚举，本工具只提供启发式提示。
                  </li>
                  <li>助记词与私钥等同资产所有权，请勿截图、联网粘贴或发送给任何人。</li>
                  <li>在设备端恢复时，需要同时提供暗语、密码、词表语言与 passphrase。</li>
                </ul>
              </aside>
            </div>
          )}
        </section>
      </div>

      <footer className="foot">
        <span>Open Ledger · Secret Phrase Wallet Manager</span>
        <span>算法与设备端暗语实现字节级一致</span>
      </footer>
    </div>
  );
}

interface ChainCardProps {
  account: DerivedAccount;
  revealed: boolean;
  copied: string | null;
  onToggle: () => void;
  onCopy: (id: string, value: string) => Promise<void>;
}

function ChainCard({ account, revealed, copied, onToggle, onCopy }: ChainCardProps) {
  const addressCopyId = `${account.id}-address`;
  const keyCopyId = `${account.id}-key`;

  return (
    <div className="chain-card">
      <div className="chain-head">
        <span className="chain-mark" aria-hidden="true">
          {account.mark}
        </span>
        <div className="chain-title">
          <strong>{account.symbol}</strong>
          <span>{account.name}</span>
        </div>
      </div>

      <p className="path">{account.path}</p>

      <div className="kv">
        <div className="kv-head">
          <span>地址</span>
          <button
            type="button"
            className="mini"
            onClick={() => void onCopy(addressCopyId, account.address)}
          >
            {copied === addressCopyId ? '已复制' : '复制'}
          </button>
        </div>
        <code className="kv-value">{account.address}</code>
      </div>

      <div className="kv">
        <div className="kv-head">
          <span>
            私钥 <em>{account.privateKeyLabel}</em>
          </span>
          <div className="kv-actions">
            <button type="button" className="mini" onClick={onToggle} aria-pressed={revealed}>
              {revealed ? '隐藏' : '显示'}
            </button>
            <button
              type="button"
              className="mini"
              onClick={() => void onCopy(keyCopyId, account.privateKey)}
            >
              {copied === keyCopyId ? '已复制' : '复制'}
            </button>
          </div>
        </div>
        <code className={`kv-value secret${revealed ? '' : ' is-masked'}`}>
          {revealed ? account.privateKey : '••••••••••••••••••••••••'}
        </code>
      </div>
    </div>
  );
}
