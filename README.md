# Da Parola a Frase — versione con backend (Firebase)

Il sito è diviso in due pagine:

- **`index.html`** — frontend pubblico. Mostra la parola attiva e il ticker
  con le frasi di tutti, e permette a chiunque di aggiungerne una.
- **`admin.html`** — backend riservato. Da qui, dopo il login, imposti la
  parola attiva e cancelli le frasi non adatte.

I dati (parola attiva + frasi inviate) vivono su **Firebase Firestore**, un
database in tempo reale gratuito: appena qualcuno invia una frase, compare
nel ticker di tutti gli altri visitatori senza bisogno di ricaricare la pagina.

## File del progetto

```
word-to-phrase/
├── index.html          → frontend pubblico
├── admin.html           → backend (protetto da login)
├── styles.css           → design tokens, layout, animazioni (condiviso)
├── app.js                → logica frontend (legge/scrive su Firestore)
├── admin.js              → logica backend (login, modifica parola, moderazione)
└── firebase-config.js   → le chiavi del TUO progetto Firebase (da compilare)
```

---

## Parte 1 — Creare il progetto Firebase

1. Vai su **console.firebase.google.com** → *Aggiungi progetto* → dagli un
   nome (es. `parola-a-frase`) → segui i passaggi (puoi disattivare Google
   Analytics, non serve) → *Crea progetto*.

2. Nel progetto, clicca l'icona **`</>`** ("Aggiungi un'app web") →
   dai un nome all'app → *Registra app*. Comparirà un blocco di codice con
   un oggetto `firebaseConfig` che contiene `apiKey`, `authDomain`, ecc.
   **Copialo**: ti servirà tra poco.

3. Nel menu a sinistra vai su **Build → Firestore Database** → *Crea
   database* → scegli una location (una europea, es. `eur3`) → parti in
   **modalità di produzione** (le regole le sistemiamo al punto 5).

4. Nel menu a sinistra vai su **Build → Authentication** → *Get started* →
   nella scheda *Sign-in method* attiva il provider **Email/Password**.

5. Sempre in Authentication, scheda **Users** → *Add user* → inserisci
   la tua email e una password: questo è l'account con cui accederai al
   backend (`admin.html`).

---

## Parte 2 — Regole di sicurezza di Firestore

Questo è il punto che rende il sistema sicuro: **chiunque può leggere e
aggiungere frasi**, ma **solo tu (autenticato) puoi cambiare la parola
attiva o cancellare frasi**.

In Firestore Database → scheda **Regole**, sostituisci il contenuto con:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /config/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /phrases/{docId} {
      allow read: if true;
      allow create: if request.resource.data.text is string
                    && request.resource.data.text.size() > 0
                    && request.resource.data.text.size() < 140;
      allow update, delete: if request.auth != null;
    }
  }
}
```

Clicca **Pubblica**.

---

## Parte 3 — Collegare i file al tuo progetto

1. Apri `firebase-config.js` e incolla i valori copiati al punto 1.2,
   sostituendo i segnaposto `INSERISCI_...`.

2. (Facoltativo ma consigliato) La prima volta, imposta manualmente la
   parola attiva: in Firestore Database → *Avvia raccolta* → nome raccolta
   `config` → ID documento `current` → aggiungi il campo `word` (tipo
   *string*) con il valore che vuoi, es. `Domani` → *Salva*.
   In alternativa puoi farlo direttamente da `admin.html` una volta loggato.

---

## Parte 4 — Pubblicare su GitHub Pages

1. Crea un nuovo repository su GitHub (es. `word-to-phrase`), **Public**.
2. Carica tutti i file della cartella (**Add file → Upload files**),
   compreso `firebase-config.js` già compilato → *Commit changes*.
   *(`firebase-config.js` contiene solo identificatori pubblici del
   progetto Firebase — non è un segreto, è normale che sia nel repo: la
   vera protezione è nelle regole di Firestore del punto 2, non nel
   nascondere questo file.)*
3. Vai su **Settings → Pages** → *Source*: **Deploy from a branch** →
   *Branch*: `main`, cartella **/ (root)** → *Save*.
4. Dopo 1-2 minuti il sito sarà su
   `https://<tuo-utente>.github.io/word-to-phrase/`
   e il backend su
   `https://<tuo-utente>.github.io/word-to-phrase/admin.html`

5. Nella console Firebase, in **Authentication → Settings → Authorized
   domains**, aggiungi il dominio `<tuo-utente>.github.io` (Firebase
   blocca per sicurezza i login da domini non autorizzati).

---

## Uso quotidiano

- **Tu (backend)**: vai su `admin.html`, accedi con l'email/password creata
  al punto 1.5, cambi la parola quando vuoi e cancelli le frasi
  inopportune. Le modifiche sono live all'istante.
- **I visitatori (frontend)**: vanno su `index.html`, vedono la parola
  del momento e il ticker con tutte le frasi, e possono aggiungerne una
  propria dal form a sinistra.

## Limiti da conoscere

- Il piano gratuito di Firestore ("Spark") copre ampiamente un progetto
  personale/creativo: 50.000 letture e 20.000 scritture al giorno.
- Non c'è moderazione automatica dei contenuti: chiunque può scrivere
  qualsiasi testo (fino a 140 caratteri). La cancellazione dal backend è
  l'unico filtro — controlla la lista periodicamente.
- `admin.html` non è indicizzata (`<meta name="robots" content="noindex">`)
  ma resta un URL pubblico raggiungibile da chiunque lo conosca; la vera
  barriera è il login, non la segretezza dell'indirizzo.
