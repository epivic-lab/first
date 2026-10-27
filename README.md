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

## Esplorazione degli ambienti

La clinica comprende piano terra e primo piano. La destinazione si sceglie direttamente nella scena: un clic sul pavimento del primo piano avvia il tragitto attraverso ingresso e scala; un clic su un vialetto esterno fa scendere e uscire il personaggio. Non ci sono pulsanti per entrare, salire o selezionare i piani. Anche sulla scala un nuovo clic può cambiare direzione senza teletrasporti. Quando si entra, la vista in sezione nasconde il piano superiore per rendere leggibile la reception. Il personaggio sale e scende i gradini senza teletrasporto.

I punti numerati su PC, letto e libreria sono selezionabili anche dall’esterno. Il personaggio raggiunge prima la posizione di visita al primo piano; soltanto all’arrivo si apre la scheda a tutto schermo. Le schede contengono per ora testo Lorem ipsum e illustrazioni dedicate. Si chiudono con X, Esc oppure “Torna a esplorare”. Il contatore di scoperta è mantenuto durante la sessione.

I dati degli oggetti, le posizioni di avvicinamento, le collisioni dei piani e i collegamenti della scala sono in `src/exploration.js`. I testi del pannello sono in `index.html`; le illustrazioni sono SVG locali generati da `exhibitArtwork` in `src/main.js`. Non sono richieste credenziali o servizi aggiuntivi.
