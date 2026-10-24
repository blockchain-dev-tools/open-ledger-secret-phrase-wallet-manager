/**
 * UI 文案（6 种语言）。默认按浏览器语言匹配，匹配不到时回退英语。
 *
 * 派生算法相关的词表语言名（简体中文 / English 等）始终使用各自的原生写法，
 * 不随 UI 语言变化。
 */
export type UiLang = 'zh' | 'en' | 'ja' | 'ko' | 'es' | 'fr';

export const UI_LANGS: Array<{ code: UiLang; label: string }> = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
];

const zh = {
  title: 'Secret Phrase · 暗语钱包生成器',
  description:
    'Open Ledger Secret Phrase 暗语钱包生成器：在本机离线由暗语与密钥派生 24 词助记词，并查看 ETH / BTC / SOL / TRON / SUI 地址与私钥。',
  subtitle: '暗语钱包生成器',
  lede: '先用暗语与密钥在本机派生出确定性的 24 词 BIP-39 助记词，再在助记词下方按需加入 BIP-39 passphrase，派生五条链的地址与私钥。暗语（Secret Phrase）算法与 Open Ledger 设备端实现字节级一致。',
  uiLang: '界面语言',

  inputLabel: '输入 / INPUT',
  statusIdle: '等待输入',
  statusWorking: '派生中',
  statusReady: '已派生 · 仅本地',
  statusError: '派生失败',

  phraseLabel: '暗语',
  phraseFieldEn: 'SECRET PHRASE · 决定助记词',
  wordlistLanguage: '词表语言',
  ariaWordlistLanguage: '暗语词表语言',
  matchedHint:
    '已命中词表 {matched}/{max} 个 token；未命中词表的字符会被忽略，只有前 {max} 个命中 token 参与熵。',
  phrasePlaceholder: '床前明月光，疑是地上霜。',

  secretLabel: '密码',
  secretFieldEn: 'SECRET KEY · 参与助记词派生',
  secretPlaceholder: '与暗语一起决定助记词',
  show: '显示',
  hide: '隐藏',
  ariaShowSecret: '显示密码',
  ariaHideSecret: '隐藏密码',

  strengthLabel: '强度：{label}',
  strengthBits: '约 {bits} bit',
  ariaPasswordStrength: '密码强度：{label}',
  strengthVeryWeak: '很弱',
  strengthWeak: '弱',
  strengthFair: '中等',
  strengthStrong: '强',
  strengthVeryStrong: '极强',
  strengthHintVeryWeak:
    '太短或太单一，容易被离线枚举。建议至少 12 位并混合大小写、数字与符号。',
  strengthHintWeak: '仍然偏弱；增加长度通常比堆特殊符号更有效。',
  strengthHintFair: '可用，但建议再增加几位，以抵抗离线暴力枚举。',
  strengthHintStrong: '强度良好；请确保你能稳定记住它，且不会与其他密码复用。',
  strengthHintVeryStrong: '强度很高；请确保你能稳定记住它，且不会与其他密码复用。',

  fillExample: '填入示例',
  clear: '清空',
  localNote: '输入不会写入本地存储，也不会发出任何网络请求；刷新页面即清空。',

  emptyTitle: '输入暗语与密码后，24 词助记词会先出现在这里。',
  emptySub: '助记词生成后，可在其下方加入 BIP-39 Passphrase 派生地址。',
  derivationFailed: '派生失败',

  mnemonicKicker: '01 · 助记词',
  mnemonicTitle: '24 词 · English BIP-39',
  copyMnemonic: '复制助记词',
  copied: '已复制',

  passphraseLabel: 'BIP-39 Passphrase',
  passphraseFieldEn: '可选 · 只影响地址与私钥',
  passphrasePlaceholder: '留空表示不使用',
  ariaShowPassphrase: '显示 passphrase',
  ariaHidePassphrase: '隐藏 passphrase',
  passphraseHint: '助记词保持不变；填入或修改后，下方五链地址与私钥会重新派生。',

  hideAlt: '隐藏同熵展示',
  showAlt: '以{lang}词表展示',
  altNote: '同一份熵 · {lang}词表 · 仅用于展示',

  accountsKicker: '02 · 账户',
  accountsTitle: '地址与私钥 · 五条链',
  accountsSub: '随上方 BIP-39 Passphrase 变化实时重算',
  showAllKeys: '显示全部私钥',
  hideAllKeys: '隐藏全部私钥',
  derivingAccounts: '正在派生五条链地址…',
  address: '地址',
  copy: '复制',
  privateKey: '私钥',

  detailsSummary: '派生详情',
  entropyLabel: '暗语熵',
  algorithmLabel: '算法',
  algorithmNote: 'keccak256(keccak256(索引字节) ‖ keccak256(密码)) → 24 词英文 BIP-39',
  passphraseStateLabel: 'Passphrase',
  passphraseEnabled: '已启用（影响种子与地址）',
  passphraseDisabled: '未使用',

  noticeTitle: '使用须知',
  notice1: '暗语、密码、passphrase 与私钥都只存在于当前页面内存，刷新即消失。',
  notice2: '暗语与密码的强度决定钱包安全：弱输入可被暴力枚举，本工具只提供启发式提示。',
  notice3: '助记词与私钥等同资产所有权，请勿截图、联网粘贴或发送给任何人。',
  notice4: '在设备端恢复时，需要同时提供暗语、密码、词表语言与 passphrase。',

  footerRight: '算法与设备端暗语实现字节级一致',
};

type Dict = { [K in keyof typeof zh]: string };

const en: Dict = {
  title: 'Secret Phrase · Wallet Generator',
  description:
    'Open Ledger Secret Phrase wallet generator: derive a 24-word mnemonic offline from a phrase and secret, and inspect ETH / BTC / SOL / TRON / SUI addresses and private keys.',
  subtitle: 'Wallet generator',
  lede: 'Derive a deterministic 24-word BIP-39 mnemonic locally from a phrase and secret, then optionally add a BIP-39 passphrase to derive addresses and private keys for five chains. The Secret Phrase algorithm is byte-for-byte identical to the Open Ledger device implementation.',
  uiLang: 'Interface language',

  inputLabel: 'INPUT',
  statusIdle: 'Waiting for input',
  statusWorking: 'Deriving',
  statusReady: 'Derived · local only',
  statusError: 'Derivation failed',

  phraseLabel: 'Secret phrase',
  phraseFieldEn: 'SECRET PHRASE · determines mnemonic',
  wordlistLanguage: 'Wordlist language',
  ariaWordlistLanguage: 'Phrase wordlist language',
  matchedHint:
    '{matched}/{max} tokens matched. Characters outside the wordlist are ignored; only the first {max} matched tokens contribute entropy.',
  phrasePlaceholder: 'A line only you remember.',

  secretLabel: 'Secret',
  secretFieldEn: 'SECRET KEY · participates in derivation',
  secretPlaceholder: 'Combined with the phrase',
  show: 'Show',
  hide: 'Hide',
  ariaShowSecret: 'Show secret',
  ariaHideSecret: 'Hide secret',

  strengthLabel: 'Strength: {label}',
  strengthBits: '~{bits} bit',
  ariaPasswordStrength: 'Password strength: {label}',
  strengthVeryWeak: 'Very weak',
  strengthWeak: 'Weak',
  strengthFair: 'Fair',
  strengthStrong: 'Strong',
  strengthVeryStrong: 'Very strong',
  strengthHintVeryWeak:
    'Too short or too uniform; it can be enumerated offline. Use at least 12 characters mixing case, digits and symbols.',
  strengthHintWeak: 'Still weak; adding length usually helps more than adding symbols.',
  strengthHintFair: 'Usable, but consider a few more characters to resist offline brute force.',
  strengthHintStrong: 'Good strength. Make sure you can recall it reliably and never reuse it.',
  strengthHintVeryStrong: 'Very strong. Make sure you can recall it reliably and never reuse it.',

  fillExample: 'Fill example',
  clear: 'Clear',
  localNote: 'Input is never written to local storage and triggers no network requests; refreshing clears everything.',

  emptyTitle: 'Enter a phrase and secret; the 24-word mnemonic appears here first.',
  emptySub: 'After it is derived, you can add a BIP-39 passphrase below to derive addresses.',
  derivationFailed: 'Derivation failed',

  mnemonicKicker: '01 · MNEMONIC',
  mnemonicTitle: '24 words · English BIP-39',
  copyMnemonic: 'Copy mnemonic',
  copied: 'Copied',

  passphraseLabel: 'BIP-39 Passphrase',
  passphraseFieldEn: 'Optional · affects addresses only',
  passphrasePlaceholder: 'Leave empty to skip',
  ariaShowPassphrase: 'Show passphrase',
  ariaHidePassphrase: 'Hide passphrase',
  passphraseHint: 'The mnemonic stays the same; adding or changing it re-derives the addresses and keys below.',

  hideAlt: 'Hide same-entropy view',
  showAlt: 'Show in {lang} wordlist',
  altNote: 'Same entropy · {lang} wordlist · display only',

  accountsKicker: '02 · ACCOUNTS',
  accountsTitle: 'Addresses & keys · five chains',
  accountsSub: 'Recomputed whenever the BIP-39 passphrase above changes',
  showAllKeys: 'Show all private keys',
  hideAllKeys: 'Hide all private keys',
  derivingAccounts: 'Deriving addresses for five chains…',
  address: 'Address',
  copy: 'Copy',
  privateKey: 'Private key',

  detailsSummary: 'Derivation details',
  entropyLabel: 'Phrase entropy',
  algorithmLabel: 'Algorithm',
  algorithmNote: 'keccak256(keccak256(index bytes) ‖ keccak256(secret)) → 24-word English BIP-39',
  passphraseStateLabel: 'Passphrase',
  passphraseEnabled: 'Enabled (affects seed and addresses)',
  passphraseDisabled: 'Not used',

  noticeTitle: 'Before you use it',
  notice1: 'Phrase, secret, passphrase and private keys exist only in page memory and vanish on refresh.',
  notice2: 'Input strength decides wallet security: weak inputs can be brute-forced; the meter is only a heuristic.',
  notice3: 'The mnemonic and private keys are ownership of funds. Never screenshot, paste online or share them.',
  notice4: 'Restoring on the device requires the phrase, secret, wordlist language and passphrase.',

  footerRight: 'Algorithm is byte-for-byte identical to the device implementation',
};

const ja: Dict = {
  title: 'Secret Phrase · ウォレット生成ツール',
  description:
    'Open Ledger Secret Phrase ウォレット生成ツール。フレーズとシークレットから 24 ワードのニーモニックをオフラインで派生し、ETH / BTC / SOL / TRON / SUI のアドレスと秘密鍵を確認できます。',
  subtitle: 'ウォレット生成ツール',
  lede: 'フレーズとシークレットから、決定論的な 24 ワード BIP-39 ニーモニックをローカルで派生します。必要に応じて BIP-39 passphrase を加えると、5 チェーンのアドレスと秘密鍵を派生します。Secret Phrase アルゴリズムは Open Ledger デバイスの実装とバイト単位で一致します。',
  uiLang: '表示言語',

  inputLabel: '入力 / INPUT',
  statusIdle: '入力待ち',
  statusWorking: '派生中',
  statusReady: '派生済み · ローカルのみ',
  statusError: '派生失敗',

  phraseLabel: 'フレーズ',
  phraseFieldEn: 'SECRET PHRASE · ニーモニックを決定',
  wordlistLanguage: 'ワードリスト言語',
  ariaWordlistLanguage: 'フレーズのワードリスト言語',
  matchedHint:
    'ワードリストに {matched}/{max} トークン一致。一致しない文字は無視され、先頭 {max} 個の一致トークンのみがエントロピーに使われます。',
  phrasePlaceholder: '自分だけが覚えている一文。',

  secretLabel: 'シークレット',
  secretFieldEn: 'SECRET KEY · 派生に参加',
  secretPlaceholder: 'フレーズと組み合わせる',
  show: '表示',
  hide: '隠す',
  ariaShowSecret: 'シークレットを表示',
  ariaHideSecret: 'シークレットを隠す',

  strengthLabel: '強度：{label}',
  strengthBits: '約 {bits} bit',
  ariaPasswordStrength: 'パスワード強度：{label}',
  strengthVeryWeak: '非常に弱い',
  strengthWeak: '弱い',
  strengthFair: '普通',
  strengthStrong: '強い',
  strengthVeryStrong: '非常に強い',
  strengthHintVeryWeak:
    '短すぎるか単調で、オフラインで総当たりされます。12 文字以上で大文字・小文字・数字・記号を混ぜてください。',
  strengthHintWeak: 'まだ弱いです。記号を増やすより長さを増やす方が有効です。',
  strengthHintFair: '使えますが、オフライン総当たりに備えて数文字追加してください。',
  strengthHintStrong: '良好です。確実に覚えられ、他のパスワードと再利用しないことを確認してください。',
  strengthHintVeryStrong: '非常に強いです。確実に覚えられ、他のパスワードと再利用しないことを確認してください。',

  fillExample: '例を入力',
  clear: 'クリア',
  localNote: '入力はローカルストレージに保存されず、ネットワークリクエストも発生しません。再読み込みで消えます。',

  emptyTitle: 'フレーズとシークレットを入力すると、24 ワードのニーモニックがここに表示されます。',
  emptySub: '派生後、下に BIP-39 passphrase を加えるとアドレスを派生できます。',
  derivationFailed: '派生に失敗しました',

  mnemonicKicker: '01 · ニーモニック',
  mnemonicTitle: '24 ワード · English BIP-39',
  copyMnemonic: 'ニーモニックをコピー',
  copied: 'コピー済み',

  passphraseLabel: 'BIP-39 Passphrase',
  passphraseFieldEn: '任意 · アドレスにのみ影響',
  passphrasePlaceholder: '空欄なら未使用',
  ariaShowPassphrase: 'passphrase を表示',
  ariaHidePassphrase: 'passphrase を隠す',
  passphraseHint: 'ニーモニックは変わらず、入力・変更すると下の 5 チェーンのアドレスと秘密鍵が再派生されます。',

  hideAlt: '同エントロピー表示を隠す',
  showAlt: '{lang} ワードリストで表示',
  altNote: '同一のエントロピー · {lang} ワードリスト · 表示専用',

  accountsKicker: '02 · アカウント',
  accountsTitle: 'アドレスと秘密鍵 · 5 チェーン',
  accountsSub: '上の BIP-39 Passphrase の変更に応じて再計算',
  showAllKeys: 'すべての秘密鍵を表示',
  hideAllKeys: 'すべての秘密鍵を隠す',
  derivingAccounts: '5 チェーンのアドレスを派生中…',
  address: 'アドレス',
  copy: 'コピー',
  privateKey: '秘密鍵',

  detailsSummary: '派生の詳細',
  entropyLabel: 'フレーズのエントロピー',
  algorithmLabel: 'アルゴリズム',
  algorithmNote: 'keccak256(keccak256(インデックスバイト) ‖ keccak256(シークレット)) → 24 ワード英語 BIP-39',
  passphraseStateLabel: 'Passphrase',
  passphraseEnabled: '有効（シードとアドレスに影響）',
  passphraseDisabled: '未使用',

  noticeTitle: '使用上の注意',
  notice1: 'フレーズ・シークレット・passphrase・秘密鍵はページメモリにのみ存在し、再読み込みで消えます。',
  notice2: '入力の強度がウォレットの安全を決めます。弱い入力は総当たり可能で、強度表示は目安にすぎません。',
  notice3: 'ニーモニックと秘密鍵は資産の所有権そのものです。スクリーンショット、オンラインへの貼り付け、共有はしないでください。',
  notice4: 'デバイスで復元するには、フレーズ・シークレット・ワードリスト言語・passphrase がすべて必要です。',

  footerRight: 'アルゴリズムはデバイス実装とバイト単位で一致',
};

const ko: Dict = {
  title: 'Secret Phrase · 지갑 생성기',
  description:
    'Open Ledger Secret Phrase 지갑 생성기: 문구와 비밀값으로 24단어 니모닉을 오프라인에서 유도하고 ETH / BTC / SOL / TRON / SUI 주소와 개인키를 확인합니다.',
  subtitle: '지갑 생성기',
  lede: '문구와 비밀값으로 결정론적인 24단어 BIP-39 니모닉을 로컬에서 유도한 뒤, 필요하면 BIP-39 passphrase를 더해 다섯 체인의 주소와 개인키를 유도합니다. Secret Phrase 알고리즘은 Open Ledger 기기 구현과 바이트 단위로 일치합니다.',
  uiLang: '인터페이스 언어',

  inputLabel: '입력 / INPUT',
  statusIdle: '입력 대기',
  statusWorking: '유도 중',
  statusReady: '유도 완료 · 로컬 전용',
  statusError: '유도 실패',

  phraseLabel: '문구',
  phraseFieldEn: 'SECRET PHRASE · 니모닉 결정',
  wordlistLanguage: '단어장 언어',
  ariaWordlistLanguage: '문구 단어장 언어',
  matchedHint:
    '단어장에 {matched}/{max}개 토큰이 일치했습니다. 일치하지 않는 문자는 무시되며, 앞의 {max}개 일치 토큰만 엔트로피에 사용됩니다.',
  phrasePlaceholder: '나만 기억하는 한 문장.',

  secretLabel: '비밀값',
  secretFieldEn: 'SECRET KEY · 유도에 참여',
  secretPlaceholder: '문구와 함께 사용',
  show: '표시',
  hide: '숨기기',
  ariaShowSecret: '비밀값 표시',
  ariaHideSecret: '비밀값 숨기기',

  strengthLabel: '강도: {label}',
  strengthBits: '약 {bits} bit',
  ariaPasswordStrength: '비밀번호 강도: {label}',
  strengthVeryWeak: '매우 약함',
  strengthWeak: '약함',
  strengthFair: '보통',
  strengthStrong: '강함',
  strengthVeryStrong: '매우 강함',
  strengthHintVeryWeak:
    '너무 짧거나 단조로워 오프라인에서 무차별 대입될 수 있습니다. 12자 이상으로 대소문자·숫자·기호를 섞으세요.',
  strengthHintWeak: '여전히 약합니다. 기호를 늘리기보다 길이를 늘리는 편이 효과적입니다.',
  strengthHintFair: '사용할 수 있지만 오프라인 대입에 대비해 몇 자 더 늘리세요.',
  strengthHintStrong: '좋습니다. 안정적으로 기억할 수 있고 다른 비밀번호와 재사용하지 않는지 확인하세요.',
  strengthHintVeryStrong: '매우 강합니다. 안정적으로 기억할 수 있고 다른 비밀번호와 재사용하지 않는지 확인하세요.',

  fillExample: '예시 채우기',
  clear: '지우기',
  localNote: '입력값은 로컬 저장소에 기록되지 않고 네트워크 요청도 발생하지 않습니다. 새로고침하면 사라집니다.',

  emptyTitle: '문구와 비밀값을 입력하면 24단어 니모닉이 여기에 먼저 표시됩니다.',
  emptySub: '유도 후 아래에서 BIP-39 passphrase를 더하면 주소를 유도할 수 있습니다.',
  derivationFailed: '유도에 실패했습니다',

  mnemonicKicker: '01 · 니모닉',
  mnemonicTitle: '24단어 · English BIP-39',
  copyMnemonic: '니모닉 복사',
  copied: '복사됨',

  passphraseLabel: 'BIP-39 Passphrase',
  passphraseFieldEn: '선택 · 주소에만 영향',
  passphrasePlaceholder: '비워 두면 사용 안 함',
  ariaShowPassphrase: 'passphrase 표시',
  ariaHidePassphrase: 'passphrase 숨기기',
  passphraseHint: '니모닉은 그대로이며, 입력하거나 바꾸면 아래 다섯 체인의 주소와 개인키가 다시 유도됩니다.',

  hideAlt: '동일 엔트로피 보기 숨기기',
  showAlt: '{lang} 단어장으로 표시',
  altNote: '동일한 엔트로피 · {lang} 단어장 · 표시 전용',

  accountsKicker: '02 · 계정',
  accountsTitle: '주소와 개인키 · 다섯 체인',
  accountsSub: '위 BIP-39 Passphrase 변경 시 다시 계산',
  showAllKeys: '모든 개인키 표시',
  hideAllKeys: '모든 개인키 숨기기',
  derivingAccounts: '다섯 체인 주소를 유도하는 중…',
  address: '주소',
  copy: '복사',
  privateKey: '개인키',

  detailsSummary: '유도 상세',
  entropyLabel: '문구 엔트로피',
  algorithmLabel: '알고리즘',
  algorithmNote: 'keccak256(keccak256(인덱스 바이트) ‖ keccak256(비밀값)) → 24단어 영어 BIP-39',
  passphraseStateLabel: 'Passphrase',
  passphraseEnabled: '사용 중 (시드와 주소에 영향)',
  passphraseDisabled: '사용 안 함',

  noticeTitle: '사용 전 확인',
  notice1: '문구·비밀값·passphrase·개인키는 페이지 메모리에만 존재하며 새로고침하면 사라집니다.',
  notice2: '입력 강도가 지갑 보안을 결정합니다. 약한 입력은 무차별 대입될 수 있고, 강도 표시는 참고용입니다.',
  notice3: '니모닉과 개인키는 자산 소유권입니다. 스크린샷, 온라인 붙여넣기, 공유를 하지 마세요.',
  notice4: '기기에서 복원하려면 문구·비밀값·단어장 언어·passphrase가 모두 필요합니다.',

  footerRight: '알고리즘은 기기 구현과 바이트 단위로 일치',
};

const es: Dict = {
  title: 'Secret Phrase · Generador de carteras',
  description:
    'Generador de carteras Open Ledger Secret Phrase: deriva sin conexión un mnemónico de 24 palabras a partir de una frase y un secreto, y consulta direcciones y claves privadas de ETH / BTC / SOL / TRON / SUI.',
  subtitle: 'Generador de carteras',
  lede: 'Deriva localmente un mnemónico BIP-39 determinista de 24 palabras a partir de una frase y un secreto; después puedes añadir una passphrase BIP-39 para derivar las direcciones y claves privadas de cinco cadenas. El algoritmo Secret Phrase es idéntico byte a byte al de la implementación del dispositivo Open Ledger.',
  uiLang: 'Idioma de la interfaz',

  inputLabel: 'ENTRADA / INPUT',
  statusIdle: 'Esperando entrada',
  statusWorking: 'Derivando',
  statusReady: 'Derivado · solo local',
  statusError: 'Error de derivación',

  phraseLabel: 'Frase secreta',
  phraseFieldEn: 'SECRET PHRASE · determina el mnemónico',
  wordlistLanguage: 'Idioma de la lista',
  ariaWordlistLanguage: 'Idioma de la lista de palabras',
  matchedHint:
    '{matched}/{max} tokens coinciden. Los caracteres fuera de la lista se ignoran; solo los primeros {max} tokens coincidentes aportan entropía.',
  phrasePlaceholder: 'Una frase que solo tú recuerdas.',

  secretLabel: 'Secreto',
  secretFieldEn: 'SECRET KEY · participa en la derivación',
  secretPlaceholder: 'Se combina con la frase',
  show: 'Mostrar',
  hide: 'Ocultar',
  ariaShowSecret: 'Mostrar secreto',
  ariaHideSecret: 'Ocultar secreto',

  strengthLabel: 'Fortaleza: {label}',
  strengthBits: '~{bits} bit',
  ariaPasswordStrength: 'Fortaleza de la contraseña: {label}',
  strengthVeryWeak: 'Muy débil',
  strengthWeak: 'Débil',
  strengthFair: 'Media',
  strengthStrong: 'Fuerte',
  strengthVeryStrong: 'Muy fuerte',
  strengthHintVeryWeak:
    'Demasiado corta o uniforme; se puede enumerar sin conexión. Usa al menos 12 caracteres mezclando mayúsculas, minúsculas, dígitos y símbolos.',
  strengthHintWeak: 'Aún es débil; aumentar la longitud suele servir más que añadir símbolos.',
  strengthHintFair: 'Utilizable, pero añade algunos caracteres para resistir la fuerza bruta sin conexión.',
  strengthHintStrong: 'Buena fortaleza. Asegúrate de recordarla con estabilidad y no reutilizarla.',
  strengthHintVeryStrong: 'Fortaleza muy alta. Asegúrate de recordarla con estabilidad y no reutilizarla.',

  fillExample: 'Rellenar ejemplo',
  clear: 'Limpiar',
  localNote: 'La entrada nunca se guarda en el almacenamiento local y no genera peticiones de red; al recargar se borra todo.',

  emptyTitle: 'Introduce una frase y un secreto; el mnemónico de 24 palabras aparecerá aquí primero.',
  emptySub: 'Después puedes añadir una passphrase BIP-39 debajo para derivar direcciones.',
  derivationFailed: 'Error de derivación',

  mnemonicKicker: '01 · MNEMÓNICO',
  mnemonicTitle: '24 palabras · English BIP-39',
  copyMnemonic: 'Copiar mnemónico',
  copied: 'Copiado',

  passphraseLabel: 'BIP-39 Passphrase',
  passphraseFieldEn: 'Opcional · solo afecta a las direcciones',
  passphrasePlaceholder: 'Vacío para no usar',
  ariaShowPassphrase: 'Mostrar passphrase',
  ariaHidePassphrase: 'Ocultar passphrase',
  passphraseHint: 'El mnemónico no cambia; al añadirla o modificarla se vuelven a derivar las direcciones y claves de abajo.',

  hideAlt: 'Ocultar vista de misma entropía',
  showAlt: 'Mostrar con lista {lang}',
  altNote: 'Misma entropía · lista {lang} · solo visualización',

  accountsKicker: '02 · CUENTAS',
  accountsTitle: 'Direcciones y claves · cinco cadenas',
  accountsSub: 'Se recalculan al cambiar la passphrase BIP-39 de arriba',
  showAllKeys: 'Mostrar todas las claves privadas',
  hideAllKeys: 'Ocultar todas las claves privadas',
  derivingAccounts: 'Derivando direcciones de cinco cadenas…',
  address: 'Dirección',
  copy: 'Copiar',
  privateKey: 'Clave privada',

  detailsSummary: 'Detalles de derivación',
  entropyLabel: 'Entropía de la frase',
  algorithmLabel: 'Algoritmo',
  algorithmNote: 'keccak256(keccak256(bytes de índices) ‖ keccak256(secreto)) → BIP-39 inglés de 24 palabras',
  passphraseStateLabel: 'Passphrase',
  passphraseEnabled: 'Activada (afecta a semilla y direcciones)',
  passphraseDisabled: 'No usada',

  noticeTitle: 'Antes de usarlo',
  notice1: 'Frase, secreto, passphrase y claves privadas solo existen en la memoria de la página y desaparecen al recargar.',
  notice2: 'La fortaleza de la entrada decide la seguridad: las entradas débiles se pueden forzar; el medidor es solo heurístico.',
  notice3: 'El mnemónico y las claves privadas son la propiedad de los fondos. No hagas capturas, no los pegues en línea ni los compartas.',
  notice4: 'Para restaurar en el dispositivo necesitas la frase, el secreto, el idioma de la lista y la passphrase.',

  footerRight: 'El algoritmo es idéntico byte a byte al del dispositivo',
};

const fr: Dict = {
  title: 'Secret Phrase · Générateur de portefeuille',
  description:
    'Générateur de portefeuille Open Ledger Secret Phrase : dérivez hors ligne un mnémonique de 24 mots à partir d’une phrase et d’un secret, et consultez les adresses et clés privées ETH / BTC / SOL / TRON / SUI.',
  subtitle: 'Générateur de portefeuille',
  lede: 'Dérivez localement un mnémonique BIP-39 déterministe de 24 mots à partir d’une phrase et d’un secret, puis ajoutez éventuellement une passphrase BIP-39 pour dériver les adresses et clés privées de cinq chaînes. L’algorithme Secret Phrase est identique octet pour octet à l’implémentation de l’appareil Open Ledger.',
  uiLang: 'Langue de l’interface',

  inputLabel: 'SAISIE / INPUT',
  statusIdle: 'En attente de saisie',
  statusWorking: 'Dérivation',
  statusReady: 'Dérivé · local uniquement',
  statusError: 'Échec de la dérivation',

  phraseLabel: 'Phrase secrète',
  phraseFieldEn: 'SECRET PHRASE · détermine le mnémonique',
  wordlistLanguage: 'Langue de la liste',
  ariaWordlistLanguage: 'Langue de la liste de mots',
  matchedHint:
    '{matched}/{max} tokens correspondent. Les caractères hors liste sont ignorés ; seuls les {max} premiers tokens correspondants alimentent l’entropie.',
  phrasePlaceholder: 'Une phrase que vous seul retenez.',

  secretLabel: 'Secret',
  secretFieldEn: 'SECRET KEY · participe à la dérivation',
  secretPlaceholder: 'Combiné à la phrase',
  show: 'Afficher',
  hide: 'Masquer',
  ariaShowSecret: 'Afficher le secret',
  ariaHideSecret: 'Masquer le secret',

  strengthLabel: 'Robustesse : {label}',
  strengthBits: '~{bits} bit',
  ariaPasswordStrength: 'Robustesse du mot de passe : {label}',
  strengthVeryWeak: 'Très faible',
  strengthWeak: 'Faible',
  strengthFair: 'Moyenne',
  strengthStrong: 'Forte',
  strengthVeryStrong: 'Très forte',
  strengthHintVeryWeak:
    'Trop court ou trop uniforme ; il peut être énuméré hors ligne. Utilisez au moins 12 caractères en mélangeant majuscules, minuscules, chiffres et symboles.',
  strengthHintWeak: 'Encore faible ; allonger la longueur aide généralement plus que d’ajouter des symboles.',
  strengthHintFair: 'Utilisable, mais ajoutez quelques caractères pour résister à la force brute hors ligne.',
  strengthHintStrong: 'Bonne robustesse. Assurez-vous de le retenir durablement et de ne jamais le réutiliser.',
  strengthHintVeryStrong: 'Très bonne robustesse. Assurez-vous de le retenir durablement et de ne jamais le réutiliser.',

  fillExample: 'Remplir un exemple',
  clear: 'Effacer',
  localNote: 'La saisie n’est jamais écrite dans le stockage local et ne déclenche aucune requête réseau ; un rechargement efface tout.',

  emptyTitle: 'Saisissez une phrase et un secret ; le mnémonique de 24 mots apparaîtra d’abord ici.',
  emptySub: 'Vous pourrez ensuite ajouter une passphrase BIP-39 en dessous pour dériver les adresses.',
  derivationFailed: 'Échec de la dérivation',

  mnemonicKicker: '01 · MNÉMONIQUE',
  mnemonicTitle: '24 mots · English BIP-39',
  copyMnemonic: 'Copier le mnémonique',
  copied: 'Copié',

  passphraseLabel: 'BIP-39 Passphrase',
  passphraseFieldEn: 'Facultatif · affecte seulement les adresses',
  passphrasePlaceholder: 'Vide pour ne pas l’utiliser',
  ariaShowPassphrase: 'Afficher la passphrase',
  ariaHidePassphrase: 'Masquer la passphrase',
  passphraseHint: 'Le mnémonique reste identique ; la saisir ou la modifier redérive les adresses et clés ci-dessous.',

  hideAlt: 'Masquer la vue même entropie',
  showAlt: 'Afficher avec la liste {lang}',
  altNote: 'Même entropie · liste {lang} · affichage uniquement',

  accountsKicker: '02 · COMPTES',
  accountsTitle: 'Adresses et clés · cinq chaînes',
  accountsSub: 'Recalculées à chaque changement de la passphrase BIP-39 ci-dessus',
  showAllKeys: 'Afficher toutes les clés privées',
  hideAllKeys: 'Masquer toutes les clés privées',
  derivingAccounts: 'Dérivation des adresses de cinq chaînes…',
  address: 'Adresse',
  copy: 'Copier',
  privateKey: 'Clé privée',

  detailsSummary: 'Détails de la dérivation',
  entropyLabel: 'Entropie de la phrase',
  algorithmLabel: 'Algorithme',
  algorithmNote: 'keccak256(keccak256(octets d’index) ‖ keccak256(secret)) → BIP-39 anglais de 24 mots',
  passphraseStateLabel: 'Passphrase',
  passphraseEnabled: 'Activée (affecte la graine et les adresses)',
  passphraseDisabled: 'Non utilisée',

  noticeTitle: 'Avant utilisation',
  notice1: 'Phrase, secret, passphrase et clés privées n’existent que dans la mémoire de la page et disparaissent au rechargement.',
  notice2: 'La robustesse de la saisie détermine la sécurité : les saisies faibles peuvent être forcées ; l’indicateur est heuristique.',
  notice3: 'Le mnémonique et les clés privées représentent la propriété des fonds. Ni capture d’écran, ni collage en ligne, ni partage.',
  notice4: 'Pour restaurer sur l’appareil, il faut la phrase, le secret, la langue de la liste et la passphrase.',

  footerRight: 'L’algorithme est identique octet pour octet à celui de l’appareil',
};

const DICTS: Record<UiLang, Dict> = { zh, en, ja, ko, es, fr };

export function detectLang(): UiLang {
  const tags = typeof navigator === 'undefined'
    ? []
    : navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
  for (const tag of tags) {
    const base = tag.toLowerCase().split('-')[0];
    if (base === 'zh') return 'zh';
    if (base in DICTS) return base as UiLang;
  }
  return 'en';
}

export type DictKey = keyof typeof zh;

export type TFunction = (key: DictKey, vars?: Record<string, string | number>) => string;

export function createTranslator(lang: UiLang): TFunction {
  const dict = DICTS[lang];
  return (key, vars) => {
    const template = dict[key];
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (match, name) =>
      name in vars ? String(vars[name]) : match,
    );
  };
}
