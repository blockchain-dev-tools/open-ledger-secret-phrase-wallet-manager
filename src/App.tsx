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
import { evaluatePasswordStrength, type StrengthLevel } from './core/strength';
import {
  UI_LANGS,
  createTranslator,
  detectLang,
  type DictKey,
  type TFunction,
  type UiLang,
} from './i18n';

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
}

const STRENGTH_LABELS: Record<StrengthLevel, DictKey> = {
  veryWeak: 'strengthVeryWeak',
  weak: 'strengthWeak',
  fair: 'strengthFair',
  strong: 'strengthStrong',
  veryStrong: 'strengthVeryStrong',
};

const STRENGTH_HINTS: Record<StrengthLevel, DictKey> = {
  veryWeak: 'strengthHintVeryWeak',
  weak: 'strengthHintWeak',
  fair: 'strengthHintFair',
  strong: 'strengthHintStrong',
  veryStrong: 'strengthHintVeryStrong',
};

const STATUS_KEYS: Record<Status, DictKey> = {
  idle: 'statusIdle',
  working: 'statusWorking',
  ready: 'statusReady',
  error: 'statusError',
};

export default function App() {
  const [riddle, setRiddle] = useState('');
  const [secret, setSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [lang, setLang] = useState<WordlistLanguage>('zh-Hans');
  const [uiLang, setUiLang] = useState<UiLang>(detectLang);
  const t = useMemo(() => createTranslator(uiLang), [uiLang]);

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

  useEffect(() => {
    document.documentElement.lang = uiLang;
    document.title = t('title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('description'));
  }, [uiLang, t]);

  const hasInput = riddle.trim() !== '' || secret !== '';

  // 助记词只由「暗语 + 密码 + 词表语言」决定，与 passphrase 无关。
  const phrase = useMemo<PhraseResult | null>(() => {
    if (!hasInput) return null;
    const entropy = deriveEntropy(riddle, secret, lang);
    return {
      mnemonic: entropyToEnglishMnemonic(entropy),
      altMnemonic: entropyToMnemonicIn(entropy, lang),
      entropyHex: bytesToHex(entropy),
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
      <div className="lang-bar">
        <div className="segmented" role="group" aria-label={t('uiLang')}>
          {UI_LANGS.map((option) => (
            <button
              key={option.code}
              type="button"
              aria-pressed={uiLang === option.code}
              onClick={() => setUiLang(option.code)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <header className="masthead">
        <div className="masthead-copy">
          <p className="eyebrow">Open Ledger · Secret Phrase Wallet Manager</p>
          <h1>
            SECRET PHRASE
            <span>{t('subtitle')}</span>
          </h1>
          <p className="lede">{t('lede')}</p>
        </div>
        <div className="stamp" aria-hidden="true">
          <span>100%</span>
          <span>LOCAL</span>
          <span>NO NETWORK</span>
        </div>
      </header>

      <div className="workspace">
        <section className="panel form-panel" aria-label={t('inputLabel')}>
          <div className="panel-head">
            <span className="panel-index">{t('inputLabel')}</span>
            <span className={`status status-${status}`}>
              <i aria-hidden="true" />
              {t(STATUS_KEYS[status])}
            </span>
          </div>

          <div className="field">
            <div className="field-head">
              <label htmlFor="riddle">{t('phraseLabel')}</label>
              <span className="field-en">{t('phraseFieldEn')}</span>
            </div>
            <textarea
              id="riddle"
              value={riddle}
              onChange={(event) => setRiddle(event.target.value)}
              rows={4}
              spellCheck={false}
              autoComplete="off"
              placeholder={t('phrasePlaceholder')}
            />
            <div className="field-meta">
              <span className="field-meta-label">{t('wordlistLanguage')}</span>
              <div className="segmented" role="group" aria-label={t('ariaWordlistLanguage')}>
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
            <p className="hint">{t('matchedHint', { matched: matchedTokens, max: MAX_INDICES })}</p>
          </div>

          <div className="field">
            <div className="field-head">
              <label htmlFor="secret">{t('secretLabel')}</label>
              <span className="field-en">{t('secretFieldEn')}</span>
            </div>
            <div className="input-wrap">
              <input
                id="secret"
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder={t('secretPlaceholder')}
              />
              <button
                type="button"
                className="ghost"
                onClick={() => setShowSecret((value) => !value)}
                aria-label={t(showSecret ? 'ariaHideSecret' : 'ariaShowSecret')}
              >
                {t(showSecret ? 'hide' : 'show')}
              </button>
            </div>

            {strength && (
              <div className="strength" data-score={strength.score}>
                <div
                  className="strength-track"
                  role="img"
                  aria-label={t('ariaPasswordStrength', { label: t(STRENGTH_LABELS[strength.level]) })}
                >
                  {[1, 2, 3, 4].map((level) => (
                    <i key={level} className={level <= strength.score ? 'is-on' : ''} />
                  ))}
                </div>
                <div className="strength-meta">
                  <span className="strength-label">
                    {t('strengthLabel', { label: t(STRENGTH_LABELS[strength.level]) })}
                  </span>
                  <span className="strength-bits">{t('strengthBits', { bits: strength.bits })}</span>
                </div>
                <p className="hint">{t(STRENGTH_HINTS[strength.level])}</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-solid" onClick={fillExample}>
              {t('fillExample')}
            </button>
            <button type="button" className="btn" onClick={resetAll}>
              {t('clear')}
            </button>
          </div>

          <p className="local-note">{t('localNote')}</p>
        </section>

        <section className="results" aria-live="polite" aria-busy={status === 'working'}>
          {error && (
            <div className="error-card" role="alert">
              <strong>{t('derivationFailed')}</strong>
              <p>{error}</p>
            </div>
          )}

          {!phrase && !error && (
            <div className="empty">
              <div className="empty-mark" aria-hidden="true">
                ⌘
              </div>
              <p>{t('emptyTitle')}</p>
              <p className="empty-sub">{t('emptySub')}</p>
            </div>
          )}

          {phrase && (
            <div className="result-stack">
              <article className="card mnemonic-card">
                <div className="card-head">
                  <div>
                    <span className="card-kicker">{t('mnemonicKicker')}</span>
                    <h2>{t('mnemonicTitle')}</h2>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => void copyValue('mnemonic', phrase.mnemonic)}
                  >
                    {t(copied === 'mnemonic' ? 'copied' : 'copyMnemonic')}
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
                    <label htmlFor="passphrase">{t('passphraseLabel')}</label>
                    <span className="field-en">{t('passphraseFieldEn')}</span>
                  </div>
                  <div className="input-wrap">
                    <input
                      id="passphrase"
                      type={showPassphrase ? 'text' : 'password'}
                      value={passphrase}
                      onChange={(event) => setPassphrase(event.target.value)}
                      spellCheck={false}
                      autoComplete="off"
                      placeholder={t('passphrasePlaceholder')}
                    />
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setShowPassphrase((value) => !value)}
                      aria-label={t(showPassphrase ? 'ariaHidePassphrase' : 'ariaShowPassphrase')}
                    >
                      {t(showPassphrase ? 'hide' : 'show')}
                    </button>
                  </div>
                  <p className="hint">{t('passphraseHint')}</p>
                </div>

                {lang !== 'en' && (
                  <div className="card-foot">
                    <button
                      type="button"
                      className="link"
                      onClick={() => setShowAlt((value) => !value)}
                    >
                      {showAlt ? t('hideAlt') : t('showAlt', { lang: LANGUAGE_LABELS[lang] })}
                    </button>
                  </div>
                )}

                {showAlt && lang !== 'en' && (
                  <div className="alt-mnemonic">
                    <span>{t('altNote', { lang: LANGUAGE_LABELS[lang] })}</span>
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
                    <span className="card-kicker">{t('accountsKicker')}</span>
                    <h2>{t('accountsTitle')}</h2>
                    <p className="card-sub">{t('accountsSub')}</p>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={toggleAllKeys}
                    disabled={accounts.length === 0}
                  >
                    {t(allRevealed ? 'hideAllKeys' : 'showAllKeys')}
                  </button>
                </div>

                {accounts.length === 0 ? (
                  <p className="derive-placeholder">
                    {t(accountsStatus === 'error' ? 'derivationFailed' : 'derivingAccounts')}
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
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </article>

              <details className="card details-card">
                <summary>{t('detailsSummary')}</summary>
                <dl>
                  <div>
                    <dt>{t('entropyLabel')}</dt>
                    <dd>
                      <code>{phrase.entropyHex}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>{t('algorithmLabel')}</dt>
                    <dd>{t('algorithmNote')}</dd>
                  </div>
                  <div>
                    <dt>{t('passphraseStateLabel')}</dt>
                    <dd>{t(passphrase ? 'passphraseEnabled' : 'passphraseDisabled')}</dd>
                  </div>
                </dl>
              </details>

              <aside className="notice">
                <h3>{t('noticeTitle')}</h3>
                <ul>
                  <li>{t('notice1')}</li>
                  <li>{t('notice2')}</li>
                  <li>{t('notice3')}</li>
                  <li>{t('notice4')}</li>
                </ul>
              </aside>
            </div>
          )}
        </section>
      </div>

      <footer className="foot">
        <span>Open Ledger · Secret Phrase Wallet Manager</span>
        <span>{t('footerRight')}</span>
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
  t: TFunction;
}

function ChainCard({ account, revealed, copied, onToggle, onCopy, t }: ChainCardProps) {
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
          <span>{t('address')}</span>
          <button
            type="button"
            className="mini"
            onClick={() => void onCopy(addressCopyId, account.address)}
          >
            {t(copied === addressCopyId ? 'copied' : 'copy')}
          </button>
        </div>
        <code className="kv-value">{account.address}</code>
      </div>

      <div className="kv">
        <div className="kv-head">
          <span>
            {t('privateKey')} <em>{account.privateKeyLabel}</em>
          </span>
          <div className="kv-actions">
            <button type="button" className="mini" onClick={onToggle} aria-pressed={revealed}>
              {t(revealed ? 'hide' : 'show')}
            </button>
            <button
              type="button"
              className="mini"
              onClick={() => void onCopy(keyCopyId, account.privateKey)}
            >
              {t(copied === keyCopyId ? 'copied' : 'copy')}
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
