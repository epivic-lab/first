# Borgo — Una piccola città viva

Diorama 3D interattivo ispirato alla clinica isometrica del riferimento: interni a vista, giardini, ambulanza e dieci personaggi. Realizzato con Three.js e Vite. Tutti i modelli e i suoni sono generati nel browser, i font sono inclusi nel sito: nessun servizio esterno necessario durante il gioco.

## Sviluppo

Node.js 22 o successivo.

```sh
npm ci
npm run dev
```

Clic sul terreno per raggiungere un punto aggirando gli ostacoli; un nuovo clic cambia destinazione. Frecce o WASD per camminare manualmente e interrompere il percorso, Shift per correre. Il vicino con la giacca corallo è il personaggio controllato. Su telefono sono disponibili pulsanti touch. Rotella o +/− per lo zoom; pulsante per alternare giorno e tramonto. Il movimento è relativo allo schermo, con collisioni su edifici e arredi.

```sh
npm run build
npm run preview
```

## Test funzionali

```sh
npx playwright install chromium
npm test
```

Per usare Chromium già installato: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`. I test verificano scena, movimento, collisioni, reset, cambio luce, aiuto, controlli touch e arrivo alla destinazione con il mouse. I test del percorso verificano deviazioni intorno agli ostacoli e destinazioni irraggiungibili. Il server di sviluppo viene avviato automaticamente dai test browser.

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/pages.yml` compila e pubblica automaticamente a ogni push su `main` oppure con avvio manuale.

1. In GitHub, aprire **Settings → Pages** del repository e scegliere **GitHub Actions** come sorgente.
2. Caricare i file sul branch `main`.
3. Attendere il completamento di **Actions → Publish Borgo to GitHub Pages**. L'indirizzo effettivo compare nel deployment `github-pages`.

La configurazione `base: './'` supporta anche la pubblicazione sotto il percorso del repository, senza un dominio personalizzato. La cartella statica finale è `dist/`.
