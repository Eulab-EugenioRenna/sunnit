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


## Refinement 02

- Layout portato a piena larghezza: le sezioni usano quasi tutto il viewport con gutter minimo.
- La hero Home ora usa una sola animazione sincronizzata (`components/hero-dynamic-copy.tsx`): parola grande di background, parola evidenziata e sottotitolo cambiano dallo stesso stato, senza marquee duplicato.
- Card e bento tile hanno hover piu tattile, bordo attivo e shadow piu ampia.
