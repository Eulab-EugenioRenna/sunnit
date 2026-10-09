# Job: caricamento, aggiornamento e traduzione

I job del sito vengono letti da **Sanity**. I file in `content/jobs/` sono l'archivio locale: modificarli da soli non aggiorna il sito.

Ogni lingua ha un documento distinto (`it`, `en`, `es`). Le versioni dello stesso job devono avere **lo stesso slug**. La lingua del testo e il paese della posizione sono campi diversi: un job in italiano può avere paese `es`.

## 1. Preparazione

Esegui i comandi dalla cartella del progetto:

```bash
cd "/Users/eugeniorenna/Downloads/sunnit-bento-template 4"
npm install
npm run sanity:check
```

Configura in `.env.local`:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`: progetto Sanity.
- `NEXT_PUBLIC_SANITY_DATASET`: dataset da aggiornare.
- `SANITY_WRITE_TOKEN`: token con permessi di scrittura.
- `OLLAMA_URL`: URL del servizio Ollama, predefinito `http://127.0.0.1:11434`.
- `OLLAMA_MODEL`: modello disponibile nel tuo servizio, predefinito `gemma4:31b-cloud`.

Il file deve restare locale, escluso da Git. Gli script leggono prima `.env`, poi `.env.local`, senza sostituire variabili già presenti: evita valori diversi per la stessa variabile nei due file. Le variabili esportate nel terminale hanno precedenza.

`sanity:check` verifica la presenza della configurazione, **non** effettua una richiesta per verificare token e connessione. Beautify e traduzione richiedono Ollama raggiungibile e il modello configurato disponibile; l'importazione può saltare Ollama con `--skip-beautify`.

## 2. Caricare un nuovo job da Studio

1. Avvia il sito con `npm run dev` e apri `http://localhost:3000/studio`, oppure apri `/studio` sul sito pubblicato.
2. Accedi a Sanity, apri **Job** e crea un documento.
3. Compila titolo, lingua, slug, excerpt e corpo Markdown/MDX.
4. Seleziona il paese: **Italia** (`it`) oppure **Spagna** (`es`). Compila dipartimento, sede, modalità di lavoro, contratto, seniority e data.
5. Imposta lo stato **Aperta** (`open`) e premi **Publish**. Una bozza non viene mostrata dal sito.
6. Crea le lingue mancanti con lo script di traduzione descritto sotto, oppure crea manualmente le altre versioni mantenendo lo stesso slug e paese.
7. Verifica il job in `/it/jobs`, `/en/jobs` e `/es/jobs`. La lettura ha una cache con rivalidazione di 60 secondi: l'aggiornamento può non comparire subito.

Per aprire direttamente la posizione usa, per esempio, `/it/jobs?job=cloud-architect`.

## 3. Caricare un nuovo job con lo script

Prepara un file con **solo il corpo Markdown**, per esempio `/tmp/cloud-architect.md`:

```markdown
## Il ruolo
Descrizione della posizione e del progetto.

## Responsabilità
- Prima responsabilità.
- Seconda responsabilità.

## Requisiti
- Primo requisito.
- Secondo requisito.

## Cosa offriamo
Condizioni e opportunità della posizione.
```

Controlla prima i parametri senza scrivere su Sanity e senza chiamare Ollama:

```bash
npm run import:job -- \
  --lang it \
  --title "Cloud Architect" \
  --slug cloud-architect \
  --department "Cloud & DevOps" \
  --country it \
  --location "Milano" \
  --work-mode "Ibrido" \
  --contract "Tempo indeterminato" \
  --seniority "Senior" \
  --status open \
  --text-file /tmp/cloud-architect.md \
  --dry-run
```

Poi esegui lo stesso comando **senza `--dry-run`**. Lo script rifinisce il corpo con Ollama, genera l'excerpt e scrive direttamente il documento pubblicato in Sanity. Non serve un successivo Publish da Studio per questa scrittura.

- Per la Spagna usa `--country es`, anche se il testo è in italiano o inglese.
- Per mantenere il corpo senza rifinitura AI aggiungi `--skip-beautify`; l'excerpt viene ricavato dal testo, oppure puoi specificarlo con `--excerpt "Descrizione breve"`.
- Per inserire il contenuto interattivamente usa `npm run import:job`: rispondi alle domande e termina il testo con una riga contenente solo `EOF`.
- Per controllare tutte le opzioni usa `npm run import:job -- --help`.

## 4. Aggiornare un job esistente

### Da Studio

Apri il job nella lingua corretta, modifica i campi e premi **Publish**. Mantieni lo slug se la posizione è la stessa. Le altre lingue non vengono aggiornate automaticamente.

Per chiudere la posizione imposta **Chiusa** (`closed`) e pubblica **ogni versione linguistica**: lo stato appartiene al singolo documento. Il sito esclude le posizioni chiuse.

### Con lo script di importazione

Per un job creato dagli script, aggiorna il file del corpo e ripeti il comando di importazione con **lo stesso `--slug` e `--lang`**. L'ID è deterministico, per esempio `job.it.cloud-architect`, e lo script usa `createOrReplace`: sostituisce il documento intero. Ripassa quindi tutti i metadati corretti, lo stato e, se vuoi conservarla, la data con `--date YYYY-MM-DD`; senza data viene usata quella odierna.

Un job creato manualmente da Studio può avere un ID diverso. In questo caso aggiorna il documento da Studio: importare lo stesso slug via script potrebbe creare un secondo documento invece di sostituire il primo.

### Rifinire un job già presente con Ollama

Controlla il documento selezionato:

```bash
npm run beautify:job -- --lang it --slug cloud-architect --mode full --dry-run
```

Poi aggiorna corpo ed excerpt:

```bash
npm run beautify:job -- --lang it --slug cloud-architect --mode full
```

Per aggiornare solo l'excerpt:

```bash
npm run beautify:job -- --lang it --slug cloud-architect --excerpt-only
```

Per scegliere dall'elenco:

```bash
npm run beautify:job -- --lang all --scan --mode full
```

Inserisci i numeri separati da virgole, oppure `all`. Senza `--scan`, `--lang all --slug cloud-architect` lavora su tutte le versioni pubblicate di quel job. Beautify aggiorna titolo, excerpt e corpo sul documento esistente; non traduce il testo e non cambia paese o stato. I dry run su Sanity elencano i documenti selezionati, senza generare un'anteprima AI.

## 5. Tradurre i job

Prima controlla le traduzioni mancanti:

```bash
npm run translate:job -- --source it --dry-run
```

Poi creale:

```bash
npm run translate:job -- --source it
```

Lo script considera **tutti i job pubblicati**, anche quelli chiusi, e le lingue presenti in `lang/` (attualmente `it`, `en`, `es`). Raggruppa per slug e crea solo i documenti delle lingue mancanti. Usa l'italiano come sorgente preferita; se manca, usa l'inglese o un'altra versione disponibile.

Non esiste un filtro `--slug` o una modalità `--force` per questo script. Il dry run è utile per sapere quali job verranno coinvolti. Se il testo sorgente è spagnolo puoi usare `--source es`; è una preferenza, non un filtro sui job.

Paese, stato e metadati operativi vengono copiati dalla sorgente. L'AI traduce titolo, excerpt e corpo. Controlla il risultato da Studio e sulle pagine delle singole lingue.

**Se aggiorni un job già tradotto, rieseguire `translate:job` non aggiorna le traduzioni esistenti.** Modifica le versioni `en` ed `es` da Studio, oppure prepara i corpi tradotti e importa ciascuna lingua con lo stesso slug, seguendo le regole sugli ID e sulla sostituzione completa della sezione precedente. Lo script attuale non offre la ritraduzione automatica delle versioni già presenti.

## 6. File MDX locali e archivio storico

Per rifinire un file locale:

```bash
npm run beautify:job -- --file content/jobs/it/cloud-architect.mdx --mode full
```

Questo modifica **solo il file locale**. Per l'archivio storico esiste:

```bash
npm run sanity:import -- --type job --dry-run
npm run sanity:import -- --type job
```

Il secondo comando importa **tutti i job locali di tutte le lingue** con `createOrReplace`. Usalo per la migrazione dell'archivio: può sovrascrivere aggiornamenti fatti su Sanity ai documenti con gli stessi ID. Per la manutenzione di un singolo job usa Studio o `import:job`.

## 7. Candidature e controllo finale

- Italia: `p.dimicco@sunnit.it`.
- Spagna: `administracion@sunnitspain.es`.
- Il routing dipende dal **paese del job**, non dalla lingua del sito. Le eventuali regole `byJobSlug` in `lib/jobs-routing.json` hanno precedenza sul paese.
- Dopo l'invio del CV al referente, il candidato riceve una conferma **sempre in inglese**, con nome e posizione. Le risposte alla conferma sono indirizzate al referente.
- La consegna richiede `RESEND_API_KEY` e `JOBS_FROM_EMAIL` (oppure `RESEND_FROM_EMAIL`) nell'ambiente del sito, con un mittente abilitato in Resend.
- Se la conferma al candidato fallisce, l'errore viene registrato nei log e la candidatura già inviata rimane riuscita.

Prima di considerare concluso il caricamento, controlla titolo, corpo, stato e paese in ogni lingua, quindi verifica che la posizione compaia nella pagina jobs. I contenuti su Sanity non richiedono un commit Git; modifiche al codice o a `lib/jobs-routing.json` richiedono invece il rilascio dell'applicazione per essere attive in produzione.

## Promemoria rapido

```bash
# Creazione guidata su Sanity
npm run import:job

# Rifinitura del testo italiano già pubblicato
npm run beautify:job -- --lang it --slug cloud-architect --mode full

# Solo excerpt
npm run beautify:job -- --lang it --slug cloud-architect --excerpt-only

# Elenco delle traduzioni mancanti
npm run translate:job -- --source it --dry-run

# Creazione delle traduzioni mancanti
npm run translate:job -- --source it
```
