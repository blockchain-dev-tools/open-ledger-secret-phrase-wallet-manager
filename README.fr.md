[中文](./README.md) · [English](./README.en.md) · [日本語](./README.ja.md) · [한국어](./README.ko.md) · [Español](./README.es.md) · **Français**

# Open Ledger · Secret Phrase Wallet Manager

Transformez une phrase que vous seul retenez en un mnémonique BIP-39 standard de 24 mots, de façon déterministe.

Tout s'exécute dans votre navigateur : pas de backend, aucune requête réseau, aucune télémétrie. Votre saisie n'existe que dans la mémoire de la page courante.

> Projet en phase initiale · Sans audit indépendant · Commencez avec un portefeuille de test jetable.

## Présentation

Saisissez une phrase, un secret et la langue de la liste de mots. L'outil dérive un mnémonique BIP-39 anglais de 24 mots avec le même algorithme Secret Phrase que l'appareil Open Ledger. Vous pouvez ensuite ajouter une passphrase BIP-39 pour dériver les adresses et clés privées ETH / BTC / SOL / TRON / SUI.

- Les mêmes entrées produisent toujours le même mnémonique
- La sortie est un mnémonique BIP-39 standard, importable dans tout portefeuille compatible
- Identique octet pour octet à l'implémentation de l'appareil (voir [Algorithme](#algorithme))
- Phrase, secret, passphrase, mnémonique et clés privées ne vivent qu'en mémoire de page et disparaissent au rechargement

## Modèle de sécurité

- **100 % local** : pas de serveur, pas d'API, pas d'analytique ; le build est constitué de fichiers statiques.
- **Aucune persistance** : aucune saisie n'est écrite dans `localStorage` / `cookie` / `IndexedDB`.
- **Il affiche les clés privées** : c'est volontaire, pour l'export et la vérification croisée. Utilisez-le uniquement sur votre propre machine hors ligne, jamais sur un ordinateur partagé ou non fiable.
- **Les entrées faibles peuvent être forcées** : la robustesse de votre phrase et de votre secret détermine la sécurité du portefeuille. L'indicateur de robustesse est heuristique, pas une garantie.
- **Oublier les entrées, c'est perdre le portefeuille** : la phrase, le secret, la langue de la liste et la passphrase sont tous nécessaires. Cet outil ne peut rien récupérer.

## Démarrage rapide

```bash
pnpm install
pnpm dev        # développement local
pnpm test       # tests unitaires, dont des vecteurs alignés sur l'implémentation Rust
pnpm build      # vérification des types + build de production
```

Version en ligne (GitHub Pages) : <https://blockchain-dev-tools.github.io/open-ledger-secret-phrase-wallet-manager/>

## Algorithme

1. Découpez la phrase selon la langue de liste choisie : chinois simplifié/traditionnel et japonais caractère par caractère ; les autres langues par espaces, en minuscules.
2. Recherchez chaque token dans la liste BIP-39 correspondante (indice 0–2047). Les tokens sans correspondance sont ignorés.
3. Prenez au plus les **48** premiers indices correspondants (la phrase est limitée à 1024 caractères).
4. Encodez chaque indice en 2 octets big-endian et concaténez-les ; `phraseHash = keccak256(indexBytes)`.
5. Avec un secret non vide : `entropy = keccak256(phraseHash ‖ keccak256(secret UTF-8))`. Avec un secret vide : `entropy = keccak256(phraseHash)`.
6. Convertissez les 32 octets d'entropie en un mnémonique BIP-39 **anglais** de 24 mots.

La langue de découpage, l'ordre des correspondances, le contenu du secret et l'encodage des octets influencent tous le résultat. Ne supposez pas qu'il est interchangeable avec d'autres outils « texte vers mnémonique ».

L'implémentation de référence et les vecteurs de test se trouvent dans [open-ledger-app](https://github.com/blockchain-dev-tools/open-ledger-app/blob/main/docs/reference/enigma.md).

## Note de compatibilité

La limite de tokens correspondants est passée de 16 à 48. Pour une phrase comportant plus de 16 correspondances, les anciennes et nouvelles versions dérivent des mnémoniques **différents**. Aucun utilisateur externe ne dépendait de l'ancienne limite ; si vous avez créé un portefeuille avec une version antérieure, vérifiez d'abord la récupération avec cette version.

## Chemins de dérivation

| Chaîne | Chemin | Format de clé privée |
|---|---|---|
| ETH | `m/44'/60'/0'/0/0` | hex 0x |
| BTC | `m/84'/0'/0'/0/0` (P2WPKH) | WIF |
| SOL | `m/44'/501'/0'/0'` (SLIP-10 Ed25519) | base58 · 64B |
| TRON | `m/44'/195'/0'/0/0` | hex |
| SUI | `m/44'/784'/0'/0'/0'` (SLIP-10 Ed25519) | bech32 |

## Stack

Vite · React 19 · TypeScript · `@scure/bip39` · `@scure/bip32` · `@noble/hashes` · `@noble/curves`

## Licence

[MIT](./LICENSE)
