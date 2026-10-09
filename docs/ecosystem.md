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
