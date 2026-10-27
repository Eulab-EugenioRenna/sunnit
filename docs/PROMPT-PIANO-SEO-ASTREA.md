# Piano SEO Astrea per agente

Copia tutto il testo dalla sezione seguente nel contesto dell'agente che lavora nella repository Astrea. Il brief è autonomo: include fonti, dati e verifiche iniziali. Le tempistiche editoriali e le scelte commerciali restano proposte da confermare con il referente Astrea.

## Obiettivo e perimetro

Lavora sulla repository Astrea per rendere il sito marketing leggibile senza JavaScript, tecnicamente indicizzabile e misurabile, mantenendo Sanity e i contratti applicativi esistenti. Separa il sito pubblico dall'applicazione con login e documenti dei clienti.

Prima aggiorna la diagnosi sul codice attuale, poi implementa per fasi le correzioni locali P0 e P1 applicabili, con controlli ripetibili. Non limitarti a creare sitemap o aggiungere meta tag a un contenitore vuoto. Non applicare automaticamente gli esempi Next.js del PDF: il framework Astrea deve essere identificato dalla sua repo.

Consegna il piano aggiornato e le modifiche verificabili. Prepara migrazione e rilascio con configurazioni e rollback; operazioni esterne quali DNS, cambio dominio, deploy, mutazioni del dataset, invio di messaggi e attivazione di campagne richiedono autorizzazione specifica se non già presente nella tua sessione. Continua il lavoro locale indipendente da tali operazioni.

## Fonti da leggere

Le copie sono nella cartella `/Users/eugeniorenna/Downloads/` di questa macchina:

1. `Analisi-SEO_SEM_AstreaAI.pdf`: 18 pagine; scenario commerciale, audit, network SUNNIT e marketing.
2. `Doc-Tecnico-SEO_AstreaAI.pdf`: 18 pagine; requisiti tecnici e collaudi. Usalo come riferimento operativo, verificando le versioni delle API.
3. `Google-Suggested-Keywords-IT-ottobre2026.xlsx`: fogli `Google Keywords Suggest` e `Keywords verticali`.
4. `Keywords-positioning-competitors-IT-ottobre2026.xlsx`: fogli Astrea AI, Lexroom AI, One Legale, Wolters Kluwer, Legora, App Legora, Aptus AI, Simpliciter AI, Logicc.com, Normo AI.

Se i file non sono disponibili nell'ambiente dell'agente, usa i dati di questo brief e segnala quali approfondimenti delle fonti rimangono da verificare. Non inventare il contenuto dei file. Leggi le istruzioni AGENTS della repo e registra branch, commit e modifiche preesistenti prima di intervenire.

## Baseline pubblica del 27 ottobre 2026

Questi risultati sono richieste GET al sito pubblico, non un'ispezione della repository Astrea o un test funzionale con login. Ripeti i controlli all'avvio perché il deploy può essere cambiato.

| URL | Risultato |
| --- | --- |
| `https://astrea.sunnit.ai/` | HTTP 200, title “Astrea — assistenza legale con AI per studi legali”; nel sorgente c'è `<div id="root"></div>` vuoto, nessun H1 e nessun link canonical rilevato. |
| `https://astrea.sunnit.ai/seo-url-inesistente-20261027` | HTTP 200 e medesimo HTML della home: soft 404 confermata nel campione. |
| `https://astrea.sunnit.ai/robots.txt` | HTTP 200, `text/plain`, generato da `scripts/generate-seo-files.mjs`; rimanda alla sitemap. Non ricrearlo senza esaminare il generatore. |
| `https://astrea.sunnit.ai/sitemap.xml` | HTTP 200, `application/xml`; 14 URL, fra cui prodotto, soluzioni, prezzi, fiducia, FAQ e contatti. Verificare ciascuna route: la presenza nel file non dimostra contenuto indicizzabile. |

Nell'HTML attuale `<body>` esiste e il noscript iframe GTM si trova nel body. Non trattare l'assenza del body o l'iframe nel head descritti nel primo audit come difetti ancora confermati. La presenza di asset `/assets/index-*.css` e del root vuoto è compatibile con un frontend client, ma non identifica da sola il framework.

La sitemap esistente usa un registro indicato nei commenti come `site-route-tree` e il generatore SEO. Cercali e riusali prima di introdurre una seconda fonte delle route. Robots contiene già riferimenti anche ad alias inglesi: accertare se siano traduzioni, redirect o percorsi gestiti nel client.

## Interpretazione delle keyword

Il file Google contiene 437 keyword distinte; le 13 verticali sono già comprese. Le serie storiche mostrate coprono settembre 2025–agosto 2026: non sono volumi live di ottobre. I valori sono stime, non utenti o lead garantiti. Non sommare varianti, duplicati o righe dei competitor.

| Cluster iniziale | Query nel foglio `Keywords verticali` | Media mensile Google | Riga | Trattamento |
| --- | --- | ---: | ---: | --- |
| Prodotto legale | intelligenza artificiale per avvocati | 590 | 7 | Query principale candidata per la landing prodotto |
| Prodotto legale | intelligenza artificiale avvocati | 480 | 6 | Variante dello stesso cluster |
| Prodotto legale | ai avvocati | 210 | 2 | Variante dello stesso cluster |
| Ricerca e fonti | intelligenza artificiale giuridica | 170 | 10 | Pagina pertinente alla funzione, se confermata |
| Ricerca e fonti | intelligenza artificiale giurisprudenza | 30 | 11 | Supporto al cluster ricerca |
| Software professionale | applicazioni per avvocati | 10 | 3 | Intento da verificare prima di creare una landing |
| Commercialisti | ai per commercialisti | 210 | 12 | Solo se pubblico e funzionalità sono realmente serviti |
| Consulenti del lavoro | intelligenza artificiale consulenti del lavoro | 20 | 14 | Segmento successivo, subordinato all'offerta |

“Avvocato AI” (90, riga 4) può includere persone che cercano un sostituto del professionista: non promettere tale servizio. “Giurimatrix” (720, riga 9) è una query di brand esterno da trattare separatamente, non il primo obiettivo organico. La query “intelligenza artificiale” (301.000 nel foglio generale, riga 2) è troppo ampia per guidare le prime landing o le campagne.

Il file competitor ha 18.942 righe e include duplicati per query/URL. Nel foglio Astrea AI non ci sono righe dati: è assenza nell'export, non prova attuale di zero indicizzazione. Per “intelligenza artificiale per avvocati”, Lexroom è in posizione 2 con la home e Aptus in posizione 3 con una guida (rispettive righe 7 e 5). Il volume di quel file è 170 contro 590 del Google: mantieni distinti i due strumenti.

Simpliciter ha 14.716 righe, di cui 10.503 verso giurisprudenza pubblica e 2.882 verso percorsi `/ricerca/sentenze/`: non replicare un archivio massivo per inseguire il suo numero di keyword. Richiederebbe diritti di pubblicazione, contenuti e manutenzione. Nel foglio Normo il presidio commercialisti è utile per un eventuale secondo mercato, non per allargare automaticamente il posizionamento Astrea.

## Fase A Diagnosi e contratti da preservare

1. Identifica framework, router, versioni installate, hosting/rewrite, build, modalità di rendering, client Sanity, schemi e origine dei testi. Verifica se frontend e app riservata condividono deployment o routing.
2. Inventaria le route dal registro esistente, dal CMS pubblicato e dalla sitemap. Per ogni URL annota lingua, template, stato HTTP, contenuto iniziale, canonical, indicizzabilità e CTA. Verifica almeno home, prodotto, soluzioni, articolo/risorsa, FAQ, prezzi e fiducia se esistenti.
3. Rileva head e body dal sorgente, non solo dal DOM ricostruito. Confronta HTML, pagina con JS e pagina senza JS; raccogli screenshot e baseline mobile per template.
4. Verifica 404 reali, errori CMS, URL alias, parametri, slash, www/non-www e `/index.html`. Non cambiare host o slug prima di avere la mappa URL.
5. Crea un backlog corto, con file, dipendenze, responsabile proposto e prova di accettazione. Classifica ogni rilievo come confermato, già corretto o da verificare; includi i rilievi dei due PDF senza riprodurre i falsi positivi.

Mantieni login, autorizzazioni, documenti, dati cliente, form e contratti API. Non pubblicare dati riservati per creare nuove pagine SEO. Prima di una migrazione dati prepara export leggibile, inventario ID/slug e ripristino; preferisci estensioni additive.

## Fase B P0 Rendering e risposte HTTP

1. Rendi l'HTML di tutte le pagine marketing completo di titolo visibile, H1, testo principale, link e contenuti FAQ. Il contenuto non deve dipendere da consenso, useEffect, canvas o click.
2. Scegli un'unica strategia adeguata allo stack: prerender/SSG con aggiornamento dei contenuti oppure SSR e cache gestita. Confronta il costo di adattare lo stack esistente con quello di una migrazione; non riscrivere tutta l'applicazione solo perché il PDF mostra Next.js.
3. Sposta le letture dei contenuti necessarie all'indicizzazione sul server o al build. Mantieni come interattivi form, animazioni e componenti che ne hanno bisogno.
4. Correggi i fallback hosting che trasformano URL inesistenti nella home 200, senza rompere le route dell'app privata. URL valide 200, inesistenti 404, rimosse senza equivalente 404/410; errori reali 5xx o ultima versione valida in cache.
5. Controlla il caso CMS non disponibile: una pagina vuota o “contenuto non trovato” non può passare come 200 pubblicabile. Verifica anche il codice effettivo dopo streaming.

Accettazione P0: HTML completo senza JS su ogni template marketing essenziale; URL casuale 404; nessun errore CMS mascherato da pagina valida; navigazione e flussi applicativi preservati. Se esistono dipendenze non risolvibili localmente, prosegui le attività indipendenti e documenta la dipendenza concreta.

## Fase C P1 URL e dominio autonomo

Il PDF descrive Astrea come società e prodotto autonomi. Verifica con i dati aziendali disponibili identità, titolarità dei marchi e relazione con SUNNIT prima di scrivere descrizioni e schema societario. Non assumere che `astrea.ai` sia disponibile o controllato.

Predisponi una configurazione unica del dominio canonico, inizialmente valida anche per `astrea.sunnit.ai`, per sbloccare il lavoro tecnico mentre viene definito il dominio finale. Deriva URL, link, canonical, OG, sitemap e ID schema dallo stesso resolver e dal registro di route già esistente, non dall'host arbitrario della richiesta.

Prepara una matrice vecchio→nuovo che includa tutte le pagine e gli asset rilevanti. Per il cambio dominio: destinazioni pronte e collaudate, 301/308 uno a uno, aggiornamento link SUNNIT e profili pertinenti, proprietà GSC vecchia e nuova, sitemap e monitoraggio. Conservare il vecchio dominio e i redirect almeno un anno. Usare Cambio di indirizzo solo quando applicabile e disponibile.

Non reindirizzare login, API o dati applicativi verso pagine marketing. Verifica sessioni, cookie, callback, CORS e URL delle email prima di migrare un host condiviso. Il rollback deve considerare i redirect permanenti memorizzati dai client.

## Fase D P1 Metadati e contenuti Sanity

1. Genera metadati unici per route: title, description, canonical assoluto, robots, Open Graph e social card. Il canonical di una pagina distinta punta alla pagina, non sempre alla home. Verifica metadati leggibili dai destinatari reali anche in presenza di streaming.
2. Riusa il modello dati esistente. Aggiungi un oggetto SEO con fallback controllati, autore/revisore quando pertinente, fonti, date reali, riferimenti fra contenuti e traduzioni. Non rendere immediatamente invalidi i documenti storici.
3. Se il corpo è Portable Text, implementa tutti i blocchi editoriali supportati nel renderer server. Se è Markdown/MDX o un altro formato adeguato, mantienilo senza introdurre un secondo sistema parallelo. Tabelle, liste, link, immagini con alt, citazioni e FAQ devono comparire nell'HTML.
4. La validazione segue le route effettive: collisioni tra tipi solo se condividono lo stesso spazio URL. Un cambio slug deve produrre redirect e invalidazione vecchio/nuovo. Copri anche import e mutazioni API, non solo Studio.
5. Mantieni il pubblico su `perspective: published`, escludi bozze e pubblicazioni future secondo la policy scelta. Preview autenticata, token solo server, cache privata e nessuna bozza in HTML pubblico, schema o sitemap.
6. Conserva il generatore robots/sitemap esistente, correggendolo dove necessario. Includi solo pagine canoniche, pubblicate, indicizzabili e realmente servite. `lastmod` da modifiche sostanziali; non usare priority/changefreq come leve di ranking.
7. Definisci una strategia di aggiornamento coerente: pubblicazione, modifica autore, cambio slug e rimozione devono aggiornare pagina, metadati, schema, liste e sitemap. Soglia operativa proposta 5 minuti. Se usi webhook, firma, validazione payload, idempotenza e diagnostica; collauda anche firma errata e cancellazione.

## Fase E P1 Identità e architettura editoriale

Conferma le funzioni prima di scriverne vantaggi, dati trattati, limiti o certificazioni. Non importare automaticamente i profili SUNNIT in `sameAs` di Astrea. La home spiega a chi serve il prodotto; la pagina prodotto approfondisce il cluster AI per avvocati, evitando copie concorrenti per ciascuna variante lessicale.

| Superficie | Intento e contenuto | CTA |
| --- | --- | --- |
| Home | Identità, pubblico, proposta verificata e percorsi di approfondimento | Prodotto o demo/prova esistente |
| Prodotto | Funzioni e condizioni d'uso per avvocati e studi legali | Demo o prova, secondo disponibilità reale |
| Soluzioni/casi d'uso | Ricerca con fonti, analisi documenti, redazione assistita solo se confermate | Approfondimento funzione e contatto |
| Fiducia | Responsabilità, trattamento dati, sicurezza e limiti verificati | Chiarimenti commerciali |
| FAQ | Dubbi reali su adozione, fonti, verifiche e uso professionale | Prodotto o contatto pertinente |
| Risorse | Guide con autore competente, eventuale revisore, fonti e aggiornamento | Pagina pertinente al bisogno |
| Prezzi | Offerte e condizioni effettive | Acquisto/prova/contatto secondo il funnel reale |

Mantieni gli URL attuali utili, salvo migrazione motivata e mappata. Una nuova pagina serve un intento distinto; evitare pagine sottili per sinonimi. Collegamenti reciproci fra guida, funzione e FAQ devono essere normali link HTML.

Genera JSON-LD da dati verificati: Organization, WebSite, WebApplication/SoftwareApplication dove pertinente, BreadcrumbList, Article/BlogPosting e Person. Nessun prezzo, rating, revisore o certificazione inventato per soddisfare un rich result. FAQ utili al lettore senza prometterne il rich result.

Per le lingue pubblica solo traduzioni reali con URL stabili, canonical proprio e hreflang reciproci. Il mercato italiano è la priorità iniziale del brief; non generare EN automaticamente solo perché esistono alias inglesi nel router.

## Fase F P1 Performance e misurazione

Rileva baseline mobile e desktop per home, prodotto e risorsa. I valori 28/50 del PDF sono storici: non sono il risultato del codice attuale. Ottimizza le cause misurate, inclusi immagine/video LCP, font, bundle, componenti motion, hydration e script terzi. Non rimuovere arbitrariamente GTM o CSS inline per inseguire una checklist.

Usa come obiettivi LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 al p75, distinguendo laboratorio e dati reali. Se i dati CrUX non esistono, segnala il limite. Lighthouse >90 è un obiettivo di progetto, non una garanzia SEO.

Traccia demo/prova/contatto confermati dal sistema, separandoli dai click. Riusa il tracking esistente; il sorgente pubblico mostra già GTM. Evita doppi container ed eventi duplicati. Niente email, nomi, contenuti legali o documenti negli eventi. Verifica il consenso e il passaggio fra sito marketing e applicazione.

Prepara report GSC su indicizzazione, canonical scelto, query brand/non brand e pagine prioritarie. Misura lead qualificati e opportunità commerciali con definizioni concordate. Non usare `site:` come conteggio completo e non promettere filtri AI non disponibili nell'account.

Per ricerca AI: accessibilità del contenuto pubblico, snippet consentiti e policy crawler verificata sulle documentazioni ufficiali correnti. Separare accesso per ricerca e training, senza modificare una policy aziendale non definita. Test con user agent simulato non prova accesso di bot autentici: servono anche policy CDN e log. `llms.txt` è un eventuale esperimento P2, mai un prerequisito del rilascio.

## Fase G Programma marketing di quattro mesi

Questo è un programma proposto per il referente marketing, non un ordine di attivare campagne o pubblicare contenuti dall'agente.

| Periodo dall'avvio | Tecnica e prodotto | Contenuti e acquisizione |
| --- | --- | --- |
| Settimana 1 | Audit aggiornato, registro route, baseline e scelta rendering | Conferma pubblico, funzioni, CTA e responsabilità editoriale |
| Settimane 2–4 | P0, metadati, risorse SEO e prime pagine commerciali | Revisione messaggi e prima guida utile |
| Mese 2 | CMS, cache, schema, funnel; migrazione soltanto con requisiti pronti | Avvio pilota Search dopo collaudo landing e conversioni |
| Mesi 3–4 | Ottimizzazioni performance/CRO e correzioni su dati | Risorse, casi autorizzati, distribuzione social e review |

Il documento commerciale prevede una news al mese e due post a settimana per ciascuno dei tre canali LinkedIn, Instagram e Facebook. Organizza due contenuti principali settimanali adattati ai canali, distinguendo 2 temi da 6 pubblicazioni. La produzione delle pagine commerciali è un lavoro ulteriore.

Per i primi quattro mesi proponi: una guida alla valutazione dell'AI per uno studio; un approfondimento sulla verifica delle fonti; un caso o esempio dimostrativo autorizzato con limiti espliciti; una guida al processo di analisi/redazione realmente supportato. Revisione da persona competente prima di pubblicare contenuti giuridici.

Il budget indicato è 500 €/mese complessivi, circa 16,67 €/giorno su 30 giorni; non è chiaro se includa gestione e creatività. Chiarire prima dell'attivazione. Proposta: se sono 500 € di media, partire con un solo test Google Search per il cluster avvocati ad alta pertinenza, anziché frammentarlo fra tre social e Google. LinkedIn organico sostiene la distribuzione. Rivalutare Social Ads in una fase successiva con obiettivo e budget espliciti.

Usare corrispondenze controllate, geografia e lingua pertinenti, landing specifica e ricerca dei termini effettivi. Negative iniziali candidate: lavoro, corsi, scuola, immagini, download e gratis se non è coerente con l'offerta; non escludere termini utili alla prova reale. Le fasce bid Google per “intelligenza artificiale per avvocati” sono 1,39–5,59 nel file (valuta non esplicitata), non CPC futuri garantiti. Nessuna previsione di lead ricavata automaticamente da queste fasce.

Scegli soglie di stop e revisione in funzione di lead qualificati e unit economics reali. Verifica conversioni e coerenza dei termini prima di aumentare la spesa. Nessuna garanzia di ranking, citazioni AI, numero di lead o costo di acquisizione.

Profili Astrea autonomi e link dal network SUNNIT devono descrivere la relazione effettiva fra le aziende. Non trasferire o rinominare automaticamente presidi SUNNIT. Partnership, eventi e stampa si valutano su audience e risultati commerciali, non sul mero acquisto di backlink.

## Accettazione e consegna all utente

- Fornisci un audit aggiornato con URL, status, sorgente HTML, screenshot, data e build, distinguendo controlli locali e pubblici.
- Verifica tutte le pagine commerciali essenziali e almeno una pagina per ogni template con e senza JS. H1 e contenuti principali devono essere leggibili senza interazione.
- Prova URL inesistente, slug rimosso, CMS non disponibile, alias e redirect: status effettivi corretti, nessun loop o fallback alla home 200.
- Valida sitemap, canonical, hreflang, metadati e JSON-LD. Controlla tutte le destinazioni della sitemap, non solo la validità dell'XML.
- In ambiente di test verifica creazione, aggiornamento, cambio slug, data futura e rimozione dei contenuti, più isolamento di bozze/preview. Non eseguire mutazioni di produzione come collaudo.
- Esegui build, typecheck e controlli effettivamente previsti dalla repo; aggiungi test mirati sui contratti SEO e routing, senza introdurre suite ridondanti.
- Verifica flusso demo/contatto e consenso con strumenti di test o dati autorizzati. Una richiesta accettata dal backend non equivale ancora a lead qualificato.
- Consegna guida editoriale, strategia cache, matrice redirect, rollback, risultati prima/dopo e piano marketing. Aggiorna il piano rispetto ai file realmente modificati.
- Riporta ciò che richiede accesso esterno: proprietà GSC, bot autentici nei log, DNS, deploy e migrazione. Non chiamare completata la produzione sulla sola base di build o test locali. Chiudi con `git status --short` e un riepilogo delle modifiche.

## Riferimenti ufficiali

Usa le versioni della documentazione pertinenti allo stack installato; gli esempi del PDF non sono codice da incollare senza adattamento.

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google canonical e duplicati](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google versioni linguistiche](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google migrazioni](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features)
- [Google policy sui link](https://developers.google.com/search/docs/essentials/spam-policies)
- [Sanity validation](https://www.sanity.io/docs/studio/validation)
