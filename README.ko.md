[中文](./README.md) · [English](./README.en.md) · [日本語](./README.ja.md) · **한국어** · [Español](./README.es.md) · [Français](./README.fr.md)

# Open Ledger · Secret Phrase Wallet Manager

나만 기억하는 문구로 표준 24단어 BIP-39 니모닉을 결정론적으로 생성합니다.

전부 브라우저에서 실행됩니다. 백엔드도, 네트워크 요청도, 텔레메트리도 없습니다. 입력값은 현재 페이지 메모리에만 존재합니다.

> 초기 단계 프로젝트 · 독립 감사 미실시 · 먼저 버려도 되는 테스트 지갑으로 시험하세요.

## 무엇인가

문구, 비밀값, 단어장 언어를 입력하면 Open Ledger 기기와 동일한 Secret Phrase 알고리즘으로 24단어 영어 BIP-39 니모닉을 유도합니다. 여기에 선택적으로 BIP-39 passphrase를 추가하면 ETH / BTC / SOL / TRON / SUI 주소와 개인키를 유도합니다.

- 같은 입력은 언제나 같은 니모닉을 생성합니다
- 출력은 표준 BIP-39 니모닉이며 호환 지갑에 그대로 가져올 수 있습니다
- 기기 구현과 바이트 단위로 일치합니다 ([알고리즘](#알고리즘) 참고)
- 문구, 비밀값, passphrase, 니모닉, 개인키는 페이지 메모리에만 존재하며 새로고침하면 사라집니다

## 보안 모델

- **100% 로컬**: 서버, API, 분석 도구가 없습니다. 빌드 결과물은 정적 파일입니다.
- **저장하지 않음**: 입력값을 `localStorage` / `cookie` / `IndexedDB`에 쓰지 않습니다.
- **개인키를 표시합니다**: 내보내기와 교차 검증을 위한 의도적 설계입니다. 본인의 오프라인 기기에서만 사용하고, 공용이거나 신뢰할 수 없는 컴퓨터에서는 열지 마세요.
- **약한 입력은 무차별 대입될 수 있습니다**: 문구와 비밀값의 강도가 지갑 보안을 결정합니다. 강도 표시는 참고용 휴리스틱일 뿐 보장이 아닙니다.
- **입력을 잊으면 지갑을 잃습니다**: 문구, 비밀값, 단어장 언어, passphrase가 모두 필요합니다. 이 도구는 아무것도 복구할 수 없습니다.

## 빠른 시작

```bash
pnpm install
pnpm dev        # 로컬 개발
pnpm test       # 단위 테스트 (Rust 구현과 정렬된 벡터 포함)
pnpm build      # 타입 검사 + 프로덕션 빌드
```

온라인 버전(GitHub Pages): <https://blockchain-dev-tools.github.io/open-ledger-secret-phrase-wallet-manager/>

## 알고리즘

1. 선택한 단어장 언어로 문구를 나눕니다. 간체/번체 중국어와 일본어는 글자 단위, 그 외 언어는 공백 단위로 나누고 소문자로 바꿉니다.
2. 각 토큰을 해당 BIP-39 단어장에서 찾습니다(인덱스 0–2047). 일치하지 않는 토큰은 무시됩니다.
3. 일치한 인덱스 중 앞에서부터 최대 **48**개를 사용합니다(문구는 최대 1024자).
4. 각 인덱스를 2바이트 빅엔디언으로 인코딩해 이어 붙이고 `phraseHash = keccak256(indexBytes)`를 계산합니다.
5. 비밀값이 비어 있지 않으면 `entropy = keccak256(phraseHash ‖ keccak256(secret UTF-8))`, 비어 있으면 `entropy = keccak256(phraseHash)`입니다.
6. 32바이트 엔트로피를 24단어 **영어** BIP-39 니모닉으로 변환합니다.

분할 언어, 일치 순서, 비밀값 내용, 바이트 인코딩이 모두 결과에 영향을 줍니다. 다른 "텍스트→니모닉" 도구와 호환된다고 가정하지 마세요.

권위 있는 구현과 테스트 벡터는 [open-ledger-app](https://github.com/blockchain-dev-tools/open-ledger-app/blob/main/docs/reference/enigma.md)에 있습니다.

## 호환성 안내

일치 토큰 상한을 16에서 48로 올렸습니다. 일치 토큰이 16개를 넘는 문구는 구버전과 현버전이 **서로 다른** 니모닉을 생성합니다. 구 상한에 의존한 외부 사용자는 없습니다. 구버전에서 지갑을 만들었다면 먼저 그 버전으로 복구를 확인하세요.

## 파생 경로

| 체인 | 경로 | 개인키 형식 |
|---|---|---|
| ETH | `m/44'/60'/0'/0/0` | 0x hex |
| BTC | `m/84'/0'/0'/0/0` (P2WPKH) | WIF |
| SOL | `m/44'/501'/0'/0'` (SLIP-10 Ed25519) | base58 · 64B |
| TRON | `m/44'/195'/0'/0/0` | hex |
| SUI | `m/44'/784'/0'/0'/0'` (SLIP-10 Ed25519) | bech32 |

## 기술 스택

Vite · React 19 · TypeScript · `@scure/bip39` · `@scure/bip32` · `@noble/hashes` · `@noble/curves`

## 라이선스

[MIT](./LICENSE)
