## 1. Image-Preloader erweitern

- [x] 1.1 In `game-web/src/lib/imageLoaderV2.ts` die drei fehlenden Bildnamen nach `'Perlenkarte5.png'` einfügen: `'Perlenkarte3-neu.png'`, `'Perlenkarte4-neu.png'`, `'Perlenkarte5-neu.png'`

## 2. gameRender.ts korrigieren

- [x] 2.1 In `game-web/src/lib/gameRender.ts` beide Stellen mit `pearlImg`-Ableitung auf wertbasierte Logik umstellen: `[3,4,5].includes(card.value) ? \`Perlenkarte${card.value}-neu.png\` : \`Perlenkarte${card.value}.png\`` (statt `hasRefreshSymbol`-Prüfung)

## 3. DiscardCardsDialog korrigieren

- [x] 3.1 In `game-web/src/components/DiscardCardsDialog.tsx`: `getImageSrc` auf wertbasierte Logik umstellen: `[3,4,5].includes(card.value) ? \`/assets/Perlenkarte${card.value}-neu.png\` : \`/assets/Perlenkarte${card.value}.png\``

## 4. CharacterActivationDialog korrigieren

- [x] 4.1 In `game-web/src/components/CharacterActivationDialog.tsx`: dieselbe `getImageSrc`-Korrektur wie in 3.1
