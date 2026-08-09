// ---------------------------------------------------------
// FRONTEND PUBBLICO
// Legge in tempo reale la "parola attiva" e le frasi inviate
// dagli utenti, le anima nel ticker, e permette a chiunque
// di aggiungerne una nuova.
// ---------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, onSnapshot, collection, query,
  orderBy, limit, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const wordFixed = document.getElementById("wordFixed");
const wordPreview = document.getElementById("wordPreview");
const trackFront = document.getElementById("trackFront");
const trackAccent = document.getElementById("trackAccent");
const trackSoft = document.getElementById("trackSoft");
const stageCaption = document.getElementById("stageCaption");

const submitForm = document.getElementById("submitForm");
const phraseInput = document.getElementById("phraseInput");
const charCount = document.getElementById("charCount");
const formMsg = document.getElementById("formMsg");
const submitBtn = document.getElementById("submitBtn");

const FALLBACK_PHRASES = [
  "porta con sé qualcosa di nuovo",
  "non promette, ma apre una porta",
  "è dove tutto ricomincia",
  "può ancora sorprendere"
];

let currentWord = "Domani";

// --- parola attiva, in tempo reale --------------------------------
onSnapshot(doc(db, "config", "current"), (snap) => {
  currentWord = (snap.exists() && snap.data().word) ? snap.data().word : "Domani";
  wordFixed.textContent = currentWord;
  wordPreview.textContent = currentWord;
  rebuildTicker();
});

// --- frasi inviate dagli utenti, in tempo reale --------------------
let latestPhrases = [];
const phrasesQuery = query(collection(db, "phrases"), orderBy("createdAt", "desc"), limit(60));

onSnapshot(phrasesQuery, (snap) => {
  latestPhrases = snap.docs.map((d) => d.data().text).filter(Boolean);
  rebuildTicker();
});

// --- render ticker ---------------------------------------------------
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillTrack(el, lines) {
  const doubled = [...lines, ...lines];
  el.innerHTML = doubled.map((l) => `<span>${escapeHtml(l)}</span>`).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function rebuildTicker() {
  const pool = latestPhrases.length ? latestPhrases : FALLBACK_PHRASES;
  const lines = pool.map((p) => `${currentWord} ${p}`);

  fillTrack(trackFront, lines);
  fillTrack(trackAccent, shuffled(lines));
  fillTrack(trackSoft, shuffled(lines));

  stageCaption.textContent = latestPhrases.length
    ? `${latestPhrases.length} frasi aggiunte finora dai visitatori.`
    : "Ancora nessuna frase inviata — sii il primo.";
}

// --- invio nuova frase -----------------------------------------------
phraseInput.addEventListener("input", () => {
  charCount.textContent = phraseInput.value.length;
});

submitForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = phraseInput.value.trim();
  if (!text) return;

  submitBtn.disabled = true;
  formMsg.textContent = "Invio in corso…";
  formMsg.removeAttribute("data-state");

  try {
    await addDoc(collection(db, "phrases"), {
      text,
      createdAt: serverTimestamp()
    });
    phraseInput.value = "";
    charCount.textContent = "0";
    formMsg.textContent = "Fatto — la tua frase è nel ticker.";
    formMsg.setAttribute("data-state", "ok");
  } catch (err) {
    console.error(err);
    formMsg.textContent = "Non è stato possibile inviare la frase. Riprova.";
    formMsg.setAttribute("data-state", "error");
  } finally {
    submitBtn.disabled = false;
  }
});
