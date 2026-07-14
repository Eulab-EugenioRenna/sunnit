# SUNNIT Bento Next.js Template

Template Next.js App Router ispirato agli screen Ewebot/Bento, con palette SUNNIT e colore primario `#d85b47`.

## Cosa include

- Homepage bento con hero a testi dinamici.
- Pagine: Services, SunnitAI, About, Blog, Contact.
- Header e footer condivisi.
- Animazioni CSS su card, reveal on scroll, hover tilt, blob e marquee.
- Componenti riusabili: PageHero, Reveal, FAQ accordion, HeroDynamicCopy.
- Stile completamente in `app/globals.css`, senza Tailwind obbligatorio.

## Avvio

```bash
npm install
npm run dev
```

Apri `http://localhost:3000`.

## Personalizzazione rapida

- Cambia il primary color in `app/globals.css` alla variabile `--primary`.
- Modifica testi, servizi, articoli, loghi placeholder e clienti in `lib/data.ts`.
- Aggiungi immagini reali in `/public` e sostituisci i blocchi `.visual-*` nelle pagine.

## Note

Il template usa forme, gradienti e placeholder CSS per evitare dipendenze da asset remoti. Puoi sostituirli con immagini vere mantenendo classi e layout.

## Sanity CMS e Studio

Blog, job e portfolio sono letti da Sanity. Lo Studio editoriale è integrato in Next.js e disponibile su `/studio`; il precedente CMS custom e le sue API non fanno più parte dell'applicazione.

1. Copia le variabili di `.env.example` in `.env.local` e valorizza almeno:

   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_WRITE_TOKEN` per import e script editoriali

2. Verifica project, dataset e token di scrittura senza contattare Ollama o modificare contenuti:

   ```bash
   npm run sanity:check
   ```

3. Controlla l'archivio MDX esistente con un dry run e poi importalo:

   ```bash
   npm run sanity:import -- --dry-run
   npm run sanity:import
   ```

L'importatore gestisce esclusivamente `blog`, `job` e `portfolio`, usa ID deterministici e `createOrReplace`, quindi può essere rieseguito senza duplicare i documenti. Le immagini locali o remote vengono caricate negli asset Sanity; `--skip-images` conserva solo il percorso storico.

### Ollama dopo la migrazione

Gli script continuano a lavorare in Markdown/MDX, ma senza `--file` leggono e aggiornano direttamente Sanity:

```bash
npm run beautify -- --type blog --lang it --slug mio-articolo
npm run beautify -- --type portfolio --lang all --scan
npm run translate -- --type all --source it
npm run import -- --type job --lang it --title "Titolo"
```

`beautify --file` resta disponibile per rifinire un file MDX locale. Configura `OLLAMA_URL` e `OLLAMA_MODEL` nel processo che esegue gli script; il token Sanity deve avere permessi di scrittura sul dataset.

## Job Applications Routing

Le candidature ai job possono essere instradate a mail diverse in base al paese o allo specifico job.

Configura il file `lib/jobs-routing.json`:

```json
{
  "defaultEmail": "p.dimicco@sunnit.it",
  "byCountry": {
    "it": "p.dimicco@sunnit.it",
    "es": "jobs.es@sunnit.it"
  },
  "byJobSlug": {
    "senior-backend-developer": "backend-team@sunnit.it"
  }
}
```

Priorità di routing:
1. Per `jobSlug` (se esatto match)
2. Per `country` del job
3. Email di default

`country` viene letto dal documento Sanity del job. La configurazione puo usare codici paese (`it`, `es`) e il resolver normalizza anche nomi localizzati come `Italia`, `Italy`, `Spagna`, `Spain` o `España`.
Il valore canonico salvato nei job e usato per il routing e `country: "it"` o `country: "es"`. Le label visibili nello Studio e nel sito arrivano dalla mappa `lib/job-countries.ts`, per esempio `it -> Italia/Italy/Italien` in base alla lingua.
Durante le traduzioni AI dei job, il campo `country` viene mantenuto/normalizzato dalla stessa mappa e non dalla risposta del modello.

Richieste ambiente:
- `JOBS_FROM_EMAIL`: mittente (es. `jobs@sunnit.it`)
- `RESEND_API_KEY`: key API Resend



## Refinement 02

- Layout portato a piena larghezza: le sezioni usano quasi tutto il viewport con gutter minimo.
- La hero Home ora usa una sola animazione sincronizzata (`components/hero-dynamic-copy.tsx`): parola grande di background, parola evidenziata e sottotitolo cambiano dallo stesso stato, senza marquee duplicato.
- Card e bento tile hanno hover piu tattile, bordo attivo e shadow piu ampia.
