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

## CMS AI in produzione (Vercel)

Le route CMS AI girano lato server. In produzione, `localhost` o `127.0.0.1` puntano al server Vercel, non al browser dell'utente.

Configura quindi variabili ambiente server:

- `OLLAMA_URL`: URL completo e raggiungibile del tuo endpoint Ollama (es. `https://ollama.example.com`)
- `OLLAMA_MODEL`: opzionale, default `gemma4:31b-cloud`

Se `OLLAMA_URL` manca in produzione, oppure usa `localhost`, la route AI risponde con errore esplicito.

Nota: convertire la route a Edge runtime non risolve questo problema di rete; serve un endpoint Ollama esposto/raggiungibile dal runtime server.

## Refinement 02

- Layout portato a piena larghezza: le sezioni usano quasi tutto il viewport con gutter minimo.
- La hero Home ora usa una sola animazione sincronizzata (`components/hero-dynamic-copy.tsx`): parola grande di background, parola evidenziata e sottotitolo cambiano dallo stesso stato, senza marquee duplicato.
- Card e bento tile hanno hover piu tattile, bordo attivo e shadow piu ampia.
