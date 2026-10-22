# Ecosistema Sunnit

Branch: `feat/ecosistema-interattivo`.

Pagina: `/it/ecosystem`, `/es/ecosystem`, `/en/ecosystem`. Accessibile dal menu principale, dal menu mobile e dai collegamenti del footer.

## Contenuti e interazione

I contenuti sono adattati dai documenti «Sunnit_Proposta_Commerciale_Ecosistemi_2026 v ITA.pdf» ed «Ecosistemas y Proyectos Sunnit 2026.pdf». Le nove competenze contengono complessivamente 28 esempi di progetto. Le descrizioni sintetizzano gli ambiti dei progetti; le percentuali commerciali del documento non sono presentate come misure verificate sul sito.

La mappa mantiene il nucleo Sunnit, le nove bolle e le connessioni del riferimento. Rosso, blu, tipografia, header e footer riprendono la UI esistente. Selezionare una competenza ricompone la mappa con un’animazione: il nodo scelto si sposta, gli altri nodi lasciano spazio alla descrizione dell’ambito e a tre o quattro bolle progetto. La stessa interazione funziona su desktop e mobile. Ricliccare il nodo scelto oppure usare «Torna all’ecosistema» ripristina la mappa completa. Il passaggio del mouse evidenzia la connessione.

Le bolle sono pulsanti utilizzabili con Tab e Invio/Spazio; frecce, Home ed End spostano il focus nella mappa iniziale. Le competenze nascoste vengono disabilitate e rimosse dall’albero accessibile durante l’esplorazione. Una regione `aria-live` annuncia l’ambito aperto.

Ogni progetto apre una finestra sospesa, non modale, sulla mappa, con titolo, settore, descrizione e competenze dell’ambito. La finestra si posiziona vicino al progetto mantenendo visibile il nodo principale e restando dentro la mappa. Non blocca la pagina o la navigazione. Il pulsante di chiusura e il tasto Esc chiudono i dettagli e restituiscono il focus al progetto; un altro Esc torna alla mappa completa.

Le animazioni possono essere messe in pausa e rispettano `prefers-reduced-motion`. Su mobile, selezionare una competenza scorre automaticamente alla mappa esplorata; aprire i dettagli scorre alla finestra. Lo scorrimento è immediato se è attiva la riduzione del movimento. Le bolle progetto si dispongono su due colonne e il nodo principale resta presente. Nessuna dipendenza aggiunta.

## File principali

- `app/[lang]/ecosystem/page.tsx`: pagina e metadata localizzati.
- `lib/ecosystem-content.ts`: contenuti editoriali in italiano, spagnolo e inglese.
- `components/ecosystem-explorer.tsx`: interazione e accessibilità.
- `components/ecosystem-explorer.module.css`: layout e animazioni circoscritti alla pagina.

## Verifica locale

- `npx tsc --noEmit`: superato.
- `npm run build`: superato; il blog preesistente richiede accesso al CMS Sanity durante la build.
- Prima versione: test browser a 320, 375, 390, 768, 1024, 1100 e 1440 px su selezione, tastiera, menu e dimensioni dei target.
- Navigazione a due livelli: test browser sulla build di produzione a 320, 390, 768, 1100 e 1440 px. Apertura e ritorno per tutte le nove competenze, apertura e chiusura di tutti i 28 progetti, finestre non modali entro la larghezza disponibile, nodo principale non coperto, autoscroll mobile, nessuna sovrapposizione tra descrizione e bolle progetto, nessun overflow orizzontale o errore JavaScript.
- Verifica italiano, spagnolo e inglese, selezione con animazioni attive e controllo pausa/ripresa.
- Ispezione visiva degli screenshot desktop e mobile.

Avvio: `npm run dev`, poi aprire `/it/ecosystem`. Per la build di produzione: `npm run build` e `npm run start`.

## Preparazione del passaggio a Sanity

Il collegamento è preparato in locale e rimane disattivato finché `ECOSYSTEM_CONTENT_SOURCE` non è impostato a `sanity`. Con il valore predefinito `local` la demo usa i contenuti locali e non legge l’ecosistema dal CMS.

I contenuti canonici di fallback e import sono ora in `content/ecosystem/it.json`, `es.json` ed `en.json`. Ognuna delle tre lingue comprende nove ambiti e 28 progetti. Non esiste una seconda copia da aggiornare nel codice TypeScript.

Studio contiene una sezione **Ecosistema** con tre pagine fisse per Italiano, Español ed English. Lo schema `ecosystemPage` comprende testi pagina, SEO, etichette dell’interfaccia, competenze, tecnologie e progetti. Anche la voce del menu e del footer legge `copy.nav` quando è attiva la sorgente Sanity. Lingua e identità dei nodi sono stabili; icone e posizioni rimangono definite dall’interfaccia. Riordinare gli ambiti in Studio non altera l’associazione fra nodo e icona. I progetti si possono riordinare e ogni ambito ammette da uno a quattro progetti; il contatore totale è calcolato dai contenuti.

Lo script dedicato prepara tre documenti **bozza** con ID `drafts.ecosystemPage.it`, `drafts.ecosystemPage.es` e `drafts.ecosystemPage.en`. Oggetti e progetti hanno chiavi deterministiche. Il comando predefinito è un dry-run, senza connessioni o scritture al CMS:

```sh
npm run sanity:ecosystem -- --dry-run
npm run sanity:ecosystem -- --dry-run --output /tmp/sunnit-ecosystem-drafts.ndjson
npm run test:ecosystem-content
```

Dopo l’approvazione della demo, l’importazione potrà essere eseguita con:

```sh
npm run sanity:ecosystem -- --apply
```

`--apply` crea soltanto bozze mancanti. Se esiste una bozza o una pagina pubblicata per la lingua, la salta. Non pubblica e non sovrascrive documenti. Le mutazioni utilizzano [`createIfNotExists`](https://www.sanity.io/docs/apis-and-sdks/js-client-mutations).

Dopo la revisione e pubblicazione in Studio, impostare `ECOSYSTEM_CONTENT_SOURCE=sanity` nell’ambiente del sito e distribuire la nuova configurazione. La pagina e i metadata usano soltanto i documenti pubblicati e la lettura segue la cache di 60 secondi già usata dal sito. Se il documento manca, contiene un modello incompleto o il CMS non risponde, viene usato l’intero fallback della stessa lingua. Non si mescolano porzioni di contenuto italiano e inglese/spagnolo. Il rollback della sorgente consiste nel riportare il valore a `local`.

Verifiche della preparazione: TypeScript, build, dry-run delle tre lingue e nove test automatizzati superati. I test includono la validazione dei contenuti, l’ordinamento canonico dei nodi, il limite dei progetti, la preparazione delle bozze, la reimportazione con documenti già presenti, la sorgente locale senza fetch, la lettura abilitata e il fallback su CMS assente/incompleto/non disponibile. Le scritture sono testate con un client simulato: nessuna importazione o pubblicazione è stata eseguita nel dataset reale. Il lavoro di preparazione non è incluso nel commit della demo `dd8b30f` già pubblicato.
