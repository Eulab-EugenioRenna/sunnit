# Piano SEO SUNNIT

Data: 27 ottobre 2026. Repository analizzato al commit `dd50567`. Documento di pianificazione: nessuna modifica applicativa o pubblicazione eseguita.

SUNNIT deve prima correggere le risorse di scansione e definire quali domini rappresentano ciascun mercato. Successivamente deve rendere servizi, casi e contenuti accessibili attraverso URL e metadati coerenti. Astrea richiede un percorso autonomo, descritto nel [piano da copiare nel suo agente](PROMPT-PIANO-SEO-ASTREA.md).

## Analisi delle quattro fonti

Le copie lette sono in `/Users/eugeniorenna/Downloads/`:

- `Analisi-SEO_SEM_AstreaAI.pdf`, 18 pagine: audit Astrea, network SUNNIT e proposta marketing.
- `Doc-Tecnico-SEO_AstreaAI.pdf`, 18 pagine: requisiti tecnici e criteri di accettazione; la sezione 18 riguarda il network SUNNIT.
- `Google-Suggested-Keywords-IT-ottobre2026.xlsx`: 437 righe keyword nel foglio `Google Keywords Suggest`; le 13 del foglio `Keywords verticali` sono un sottoinsieme delle stesse 437.
- `Keywords-positioning-competitors-IT-ottobre2026.xlsx`: 18.942 righe di posizionamento in 10 fogli. Una keyword può comparire più volte, per URL diversi e competitor diversi.

### Cosa confermare e cosa correggere nell audit

Il documento tecnico è la base operativa più solida: richiede verifica del framework, separa le priorità e corregge diverse generalizzazioni del primo PDF. I rilievi originari devono essere verificati sul sito attuale.

| Indicazione delle fonti | Valutazione operativa |
| --- | --- |
| Rendering, URL reali e status corretti | Priorità immediata; confermati problemi differenti nei due siti, descritti sotto. |
| Sostituire Sanity | Non necessario: mantenere il CMS e correggere il frontend. |
| Rapporto testo/HTML minimo del 10% | Non usarlo come requisito SEO o criterio di rilascio. Controllare il contenuto realmente accessibile. |
| Iframe, CSS inline, HTTP/3 e HSTS preload | Valutare contesto e impatto. Non sono automaticamente blocchi di indicizzazione; non abilitare preload/includeSubDomains alla cieca. |
| Dimensione dei competitor e follower | Dati del documento, non un censimento attuale o un obiettivo di crescita. I conteggi pagine senza metodo non dimensionano il backlog. |
| Lighthouse SEO 100 | Nel PDF convive con HTML povero di contenuti: il punteggio non prova indicizzazione, ranking o conversioni. I 28/50 di performance sono misure storiche di Astrea, non di SUNNIT. |
| Link building e publiredazionali | Privilegiare citazioni editoriali pertinenti. Per inserzioni pagate qualificare i link; non comprare link per trasferire ranking. |
| AI visibility e llms.txt | Prima HTML, indicizzabilità e contenuti verificabili. File AI e markup aggiuntivi non sono un requisito delle AI features Google. |

Riferimenti verificati: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [policy sui link](https://developers.google.com/search/docs/essentials/spam-policies).

### Dati keyword e loro utilizzo

Il nome dei file indica ottobre 2026; le colonne storiche Google coprono settembre 2025–agosto 2026. Sono stime dei rispettivi strumenti, non ricerche o conversioni misurate su questi siti. `Competition` nel file Google riguarda la pubblicità, non la difficoltà organica. I bid non sono CPC effettivi; la valuta non è esplicitata nelle intestazioni lette.

| Destinazione | Keyword | Media mensile nel file Google | Riferimento |
| --- | --- | ---: | --- |
| Astrea | intelligenza artificiale per avvocati | 590 | `Keywords verticali!A7:H7` |
| Astrea | intelligenza artificiale avvocati | 480 | `Keywords verticali!A6:H6` |
| Astrea | ai avvocati | 210 | `Keywords verticali!A2:H2` |
| Astrea | intelligenza artificiale giuridica | 170 | `Keywords verticali!A10:H10` |
| SUNNIT | intelligenza artificiale per aziende | 140 | `Google Keywords Suggest!A80:H80` |
| SUNNIT | azienda intelligenza artificiale | 110 | `Google Keywords Suggest!A90:H90` |
| SUNNIT | intelligenza artificiale in azienda | 50 | `Google Keywords Suggest!A157:H157` |
| SUNNIT | intelligenza artificiale processi aziendali | 10 | `Google Keywords Suggest!A374:H374` |

Non sommare varianti lessicali come se descrivessero pubblici indipendenti. Il foglio competitor attribuisce alla query “intelligenza artificiale per avvocati” volume 170, mentre il file Google indica 590: conservare fonte e periodo, senza mediare i valori. La query generica “intelligenza artificiale” ha volume 301.000 (`Google Keywords Suggest!A2:B2`), ma un intento troppo ampio per essere il primo target commerciale.

Per SUNNIT i file coprono soprattutto AI: serve una ricerca aggiuntiva per software, cloud, dati e DevOps prima di assegnare volumi o budget a questi cluster. Le query proposte sotto per tali servizi sono ipotesi editoriali coerenti con l'offerta della repo.

### Cosa insegna il confronto competitor

| Foglio | Righe dati | Keyword distinte nel foglio |
| --- | ---: | ---: |
| Astrea AI | 0 | 0 |
| Lexroom AI | 442 | 428 |
| One Legale | 3.464 | 3.453 |
| Wolters Kluwer | 66 | 63 |
| Legora | 66 | 64 |
| App Legora | 0 | 0 |
| Aptus AI | 162 | 142 |
| Simpliciter AI | 14.716 | 10.980 |
| Logicc.com | 4 | 4 |
| Normo AI | 22 | 20 |

Il foglio vuoto Astrea documenta l'assenza di posizionamenti nell'export, non dimostra che oggi nessuna pagina sia indicizzata. Gli export non sono un confronto completo dei domini internazionali.

Lexroom risulta in posizione 1 per “ai avvocati” e 2 per “intelligenza artificiale per avvocati”, entrambe verso la home (righe 3 e 7). Aptus intercetta la seconda query con una guida in posizione 3 (riga 5): opportunità per pagine commerciali e approfondimenti, ciascuno con intento distinto.

Simpliciter pesa 14.716 delle 18.942 righe: 10.503 rimandano a `/app/search/public/giurisprudenza/`, altre 2.882 a `/ricerca/sentenze/`. Il suo modello comprende un grande archivio pubblico. Replicarlo richiederebbe diritti sulle fonti, manutenzione e revisione: non è un backlog da importare automaticamente in Astrea. Normo è un riferimento per il pubblico commercialisti, da affrontare solo se quel segmento è realmente servito.

## Stato verificato di SUNNIT

### Controlli sul sito pubblico

Richieste GET effettuate il 27 ottobre 2026 su `sunnit.it`, `sunnit.eu`, `sunnit.co.uk`, `sunnitspain.es`. Il campione e i risultati sono nel [registro HTTP](seo/evidenze-http-2026-10-27.json).

| Controllo | Risultato |
| --- | --- |
| `/robots.txt`, tutti e quattro i domini | HTTP 200, `text/html`, pagina SUNNIT con `html lang="robots.txt"`. |
| `/sitemap.xml`, tutti e quattro i domini | HTTP 200, `text/html`, pagina SUNNIT con `html lang="sitemap.xml"`. |
| Home `/it` e `/en`, tutti e quattro i domini | HTTP 200; title `SUNNIT`, nessun canonical/hreflang rilevato nei tag HTML. |
| Radice `/` | Porta rispettivamente a `/it`, `/en`, `/en`, `/es`. |
| `/zz` | Porta alla home nella lingua del dominio: comportamento da rendere esplicito nella policy delle lingue non supportate. |
| `/it/seo-url-inesistente-20261027` | HTTP 404 sui quattro domini: questo controllo è già corretto. |

L'assenza di robots valido non implica da sola un blocco totale della scansione; la sitemap attuale non offre però un elenco XML utilizzabile. L'HTML SUNNIT contiene già un H1: il problema del root vuoto osservato su Astrea non va attribuito a SUNNIT.

### Riscontri nel codice

| Area | Evidenza | Intervento |
| --- | --- | --- |
| Stack | App Router; Next installato `15.5.18`, range package `^15.3.0` | Usare API compatibili con questa versione, senza introdurre un upgrade maggiore per il lavoro SEO. |
| Routing | `middleware.ts` salta i percorsi con estensione; `[lang]` accetta il segmento, mentre `getDictionary()` torna all'italiano | Creare risorse dedicate e validare `lang` prima del rendering. |
| Domini | `lib/i18n.ts` seleziona la lingua, ma non assegna una destinazione canonica alle copie | Configurazione esplicita dominio/mercato/lingua e redirect. |
| Metadati | `app/[lang]/layout.tsx` ha default e OG italiani, OG URL fisso alla home | Metadati per route e lingua; origine configurata, non host arbitrario. |
| Eccezione utile | `ecosystem/page.tsx` ha già canonical e alternative IT/ES/EN | Riutilizzare il comportamento, correggendone la destinazione secondo la scelta dei domini. |
| Blog | Lettura Sanity server e rendering MDX server già presenti | Conservare; aggiungere canonical, traduzioni collegate, autore, aggiornamento e schema. |
| Contenuti Sanity | `body` è Markdown/MDX testuale, non Portable Text | Estendere gli schemi esistenti; Portable Text solo con un'esigenza concreta e una migrazione separata. |
| Lingue | `lib/sanity/content.ts` ripiega su IT per liste e dettagli esteri mancanti | Non pubblicare quel fallback come traduzione EN/ES; mostrare solo alternative reali. |
| Date | Le query non escludono esplicitamente `publishedAt` futuro | Definire pubblicazione programmata e filtri coerenti in pagine, liste e sitemap. |
| Cache | `perspective: published`, revalidate 60 secondi e API CDN in produzione | Conservare il filtro published; misurare propagazione e gestire invalidazione coerente. |
| Ecosistema | I progetti sono renderizzati dopo selezione; pannello inizialmente chiuso | Aggiungere un indice testuale server con link ai contenuti utili. |
| Portfolio | Corpo MDX compilato nel client dopo selezione del progetto | Route di dettaglio renderizzate server, mantenendo le modali come interazione. |
| Contatto | `contact-mailto-form.tsx` apre `mailto:` | Misurabile come apertura del client email, non come richiesta ricevuta. |
| Semantica | Jobs contiene il titolo H1 di `PageHero` e un secondo H1 | Normalizzare la gerarchia come convenzione del progetto. |
| Studio | Il layout ha già `robots: {index:false, follow:false}` | Conservare; verificare accesso e preview senza confondere noindex con autenticazione. |

`use client` non significa automaticamente contenuto assente nell'HTML: verificare l'output iniziale dei componenti. Il problema concreto è il testo condizionato a interazioni o caricamenti successivi.

## Scelta dei domini

La proposta consigliata conserva il mercato spagnolo, che dispone già nella repo di contatti, indirizzo e materiali dedicati. Il censimento deve confermare il perimetro commerciale prima dei redirect.

| Dominio | Ruolo proposto | Gestione |
| --- | --- | --- |
| `sunnit.it` | Corporate italiano e inglese internazionale | Canonici `/it/...` e `/en/...`. |
| `sunnitspain.es` | Mercato spagnolo | Canonici `/es/...`, contenuti e contatti locali; copie ES su altri host verso le equivalenti spagnole. |
| `sunnit.eu` | Dominio di presidio del brand | 301/308 pagina per pagina verso il dominio scelto per ciascuna lingua. |
| `sunnit.co.uk` | Presidio, salvo offerta UK effettiva | Consolidare su `.it/en/...`; mantenerlo autonomo soltanto con una proposta UK reale e sostenibile. |
| Dominio Astrea | Marketing e identità di Astrea | Autonomo; destinazione da confermare, nessuna disponibilità di `astrea.ai` presunta. |

Esempi proposti: `.eu/en/services` → `.it/en/services`; `.eu/it/about` → `.it/it/about`; `.it/es/contact` → `sunnitspain.es/es/contact`. Anche le copie IT/EN sul dominio spagnolo devono avere una destinazione coerente. Se non esiste una pagina equivalente, decidere fra sostituto pertinente e 404/410, evitando redirect indiscriminati alla home.

Ogni pagina finale ha canonical alla propria URL. Collegare con hreflang reciproci soltanto le versioni equivalenti effettivamente pubblicate, anche su host differenti. Usare `en-GB` solo per una versione britannica mantenuta; evitare `en-UK` ed `en-EU`. Le pagine con contenuto commerciale diverso non vanno accoppiate forzatamente come traduzioni.

Sui domini dismessi mantenere TLS e redirect; gestire separatamente robots e la sitemap temporanea delle vecchie URL per la migrazione. Le nuove sitemap contengono solo le destinazioni canoniche. Riferimenti: [consolidamento](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [versioni linguistiche](https://developers.google.com/search/docs/specialty/international/localized-versions), [migrazione](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

## Backlog tecnico

P0 = errore da correggere subito. P1 = fondamenta SEO e conversione. P2 = sviluppo guidato dai dati. Le stime sono indicative, in giornate di lavoro, da rivedere con baseline CMS e numero di URL.

| ID | Priorità e attività | File e superficie | Dipendenza | Responsabile e stima | Accettazione |
| --- | --- | --- | --- | --- | --- |
| S01 | P0 Inventario e baseline | Domini, route, CMS, GSC se disponibile | Nessuna | Sviluppo + SEO, 1–2 g | Registro URL, template, lingue, redirect e stato iniziale; export CMS prima di mutazioni. |
| S02 | P0 Robots, sitemap, lingue valide | Nuovi `app/robots.ts`, `app/sitemap.ts` o route equivalenti; middleware e layout | S01 | Sviluppo, 1–2 g | GET robots testuale e XML parsabile; mai interpretati come lingua. `/xx/...` e slug inesistenti seguono status documentati, senza pagine italiane 200 sotto lingue arbitrarie. |
| S03 | P1 Contratto URL e domini | Resolver SEO condiviso, `lib/i18n.ts`, middleware/config hosting | S01 e scelta domini | Sviluppo + referente commerciale, 2–3 g | Una destinazione per contenuto; matrice vecchio→nuovo, assenza di loop, destinazioni 200 e rollback. |
| S04 | P1 Metadati localizzati | Layout, home, services, sunnitai, about, contact, jobs, blog, ecosystem | S03 | Sviluppo + SEO, 2–3 g | Title/description per lingua e intento; canonical assoluto, OG URL della pagina, hreflang reali e reciproci. |
| S05 | P1 Contenuti, lingue e pubblicazione | `lib/sanity/content.ts`, schemi condivisi e blog, script di import | S01, S03 | Sviluppo CMS, 2–3 g | Esclusi draft e date future; fallback linguistico esplicito; campi SEO/autore/data aggiornamento additivi; import validati. |
| S06 | P1 Rendering e link | Portfolio, ecosistema, servizi, navigazione e nuovi dettagli | S03, contenuti validati | Sviluppo + editor, 3–5 g | Testo essenziale e link presenti senza JS; URL di dettaglio con contenuto proprio; nessuna pagina satellite vuota. |
| S07 | P1 Schema e identità | Layout, articoli e breadcrumb | S04, S05 | Sviluppo + editor, 1–2 g | JSON-LD valido e coerente: Organization, WebSite, BreadcrumbList, BlogPosting/Article; solo dati verificati. |
| S08 | P1 Cache e rimozioni | Client Sanity, invalidazione e sitemap | S02, S05 | Sviluppo, 1–2 g | Pubblicazione, cambio slug e rimozione aggiornano tutte le superfici entro soglia concordata, proposta 5 minuti. Webhook firmato solo se necessario alla strategia scelta. |
| S09 | P1 Conversioni e consenso | Form contatto, analytics e backend pertinente | S01, percorso commerciale | Sviluppo + marketing, 1–3 g | Eventi distinguono click email, invio accettato e lead qualificato; niente dati personali negli eventi. |
| S10 | P1 Performance e rilascio | Hero/video, animazioni, immagini, layout con ricerca globale | S04–S09 | Sviluppo + QA, 2–3 g | Baseline e confronto per template; smoke HTTP su deployment, controlli senza JS e nessuna regressione nei flussi esistenti. |
| S11 | P2 Piano editoriale e CRO | Sanity, contenuti, report | P0 e destinazioni stabili | Marketing + specialisti, continuativo | Contenuti con intento, autore, fonti, CTA e metriche commerciali; revisione mensile. |

Per S02 la sitemap deve usare lo stesso resolver URL del frontend e un elenco di contenuti pubblicati: solo URL 200, canoniche, indicizzabili, senza filtri, parametri, bozze o fallback spacciati per traduzioni. `lastmod` deriva da un aggiornamento reale. Nel periodo precedente alla scelta domini, evitare di generare automaticamente quattro copie indicizzabili: prima baseline e configurazione esplicita del dominio che pubblica la sitemap.

Per S05 mantenere ID, slug e contenuti esistenti. Aggiungere `seo`, autore e `contentUpdatedAt` con fallback compatibili e un controllo dei documenti storici. Non rendere improvvisamente non pubblicabili tutti i documenti preesistenti. L'unicità dello slug deve seguire lo spazio URL effettivo: tipi con prefissi diversi possono condividere lo stesso slug. Le validazioni Studio non sostituiscono quelle degli import/API ([Sanity](https://www.sanity.io/docs/studio/validation)).

Per S06 preservare l'esperienza interattiva dell'ecosistema e il fallback locale della stessa lingua. L'attivazione CMS resta un'attività distinta: i dettagli preparati per SEO non richiedono di cambiare la sorgente runtime. Preservare inoltre i destinatari e i contratti delle candidature.

Per S09 il modulo `mailto:` attuale non offre una conferma backend. Se serve misurare richieste ricevute, introdurre un invio server usando il provider già adottato dal progetto ove adatto, con validazione, limiti antiabuso e messaggi chiari. Non riutilizzare l'endpoint candidature per contatti commerciali.

## Architettura dei contenuti SUNNIT

| Cluster | Pagina principale proposta | Contenuti di supporto | Conversione |
| --- | --- | --- | --- |
| AI aziendale | Potenziare `/it/sunnitai` come destinazione iniziale | Document intelligence, conoscenza aziendale e casi confermati | Richiesta consulenza/demo pertinente |
| Software su misura | `/it/services/software-su-misura` | Progetti, integrazioni, modalità di lavoro | Brief progetto |
| Cloud | `/it/services/cloud` | Migrazioni e architetture con esempi verificati | Contatto tecnico |
| Dati e analytics | `/it/services/data-analytics` | Qualità dati, integrazione e reporting | Valutazione del caso |
| DevOps | `/it/services/devops` | Delivery, piattaforme e automazione | Consulenza |
| Referenze | `/it/portfolio/[slug]` | Problema, ruolo SUNNIT, soluzione e risultati documentabili | Progetto simile |

Sono proposte di route, da collegare ai contenuti già esistenti. Conservare `/services` come pagina hub; mantenere funzionanti le ancore già utilizzate. Aggiungere landing solo quando esistono contenuto specifico e capacità di manutenzione. Non creare cinque pagine quasi uguali per varianti di “AI aziende”. Cybersecurity e altri ambiti entrano nel piano commerciale solo con un'offerta confermata.

SUNNIT presidia servizi e AI per imprese; Astrea presidia il prodotto per professionisti legali. Il sito SUNNIT può spiegare la relazione e collegare Astrea con testo utile, senza duplicarne le landing o attribuirgli automaticamente società, contatti e profili social SUNNIT. La formula societaria va validata dal referente aziendale.

## Sequenza e calendario

Le settimane decorrono dall'avvio e richiedono disponibilità di un referente tecnico e uno editoriale. Il programma iniziale di quattro mesi riprende l'orizzonte del documento tecnico, senza promettere ranking entro quel termine.

| Periodo | Risultato principale | Dipendenze |
| --- | --- | --- |
| Settimana 1 | Baseline, inventario, correzione risorse SEO e lingue | Accesso repo; lettura GSC se disponibile |
| Settimane 2–3 | Domini, resolver URL, redirect preparati, metadati e traduzioni | Scelta mercati/domini; revisione matrice URL |
| Settimane 3–5 | Modelli additivi, rendering dettagli, schema e pubblicazione coerente | Dati CMS e contenuti verificati |
| Settimane 5–6 | Conversioni, performance, collaudo e rilascio tecnico | Tracking e destinazioni commerciali definite |
| Mesi 2–4 | Pagine servizio prioritarie, casi, contenuti e miglioramenti | Fondamenta stabili; specialisti disponibili |
| Ogni mese | Review di indicizzazione, query, lead e prossime correzioni | Dati sufficienti e tempi di osservazione |

Cadenza iniziale SUNNIT proposta: una risorsa tecnica o un caso al mese e due contenuti settimanali su LinkedIn. Selezionare gli altri canali in base al pubblico e alla capacità editoriale; non applicare automaticamente al corporate il piano Astrea su tre social.

Prime risorse proposte: come selezionare un caso AI aziendale; document intelligence con dati e limiti confermati; caso cloud/software autorizzato; guida alle integrazioni fra sistemi. Non usare volumi o percentuali di risparmio inventati per promuoverle.

## Misure e criteri di completamento

| Misura | Come leggerla | Frequenza |
| --- | --- | --- |
| Risorse e route | 100% degli URL in sitemap con status/destinazione corretti nel crawl; zero canonical verso errori o redirect | Ogni rilascio |
| Indicizzazione | GSC: pagine prioritarie, esclusioni e canonical scelto da Google, separati per proprietà | Settimanale iniziale |
| Visibilità | Impression/click brand e non brand, query per servizio e pagina; confronto con baseline e periodo omogeneo | Mensile |
| Conversioni | Richieste accettate, contatti qualificati e opportunità commerciali; click email separati | Mensile |
| Performance | Laboratorio separato da dati reali; obiettivi LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 al p75 dove misurabile | Baseline e dopo rilascio |
| Presenza AI | Campione stabile di domande, motore, data, lingua, menzione e URL citata | Mensile, esplorativo |

Lighthouse >90 può essere un obiettivo tecnico, non una prova di visibilità. Se mancano dati CrUX non presentarne di laboratorio come equivalenti. Definire target di crescita e costo per lead dopo baseline: questi file non consentono una previsione affidabile.

Il budget 500 €/mese nel PDF si riferisce ad Astrea; non è un budget SUNNIT. Per il corporate occorre un investimento distinto, da dimensionare dopo ricerca dei servizi e misurazione del funnel.

Checklist di consegna: build e typecheck compatibili con gli script reali; test mirati su resolver e routing; GET su tutte le destinazioni della sitemap; confronto HTML con JS disabilitato; anteprime social; validazione schema; verifica cambi contenuto in ambiente di test; smoke sui domini pubblicati; registro redirect e rollback. Una build locale non chiude la verifica del deploy e la sitemap inviata non prova indicizzazione.

## Primo intervento eseguibile

Aprire un'attività circoscritta a S01–S02: registrare la baseline, creare robots/sitemap validi e impedire che segmenti arbitrari diventino lingue HTML. Preparare contestualmente la configurazione dei domini per S03. Le decisioni commerciali sui mercati non devono ritardare la correzione del routing.

Il lavoro successivo usa il backlog sopra. Questo documento non autorizza di per sé migrazioni DNS, scritture nel dataset, attivazioni CMS, campagne o pubblicazioni esterne.
