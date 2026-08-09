// ---------------------------------------------------------
// BACKEND / ADMIN
// Login con Firebase Auth (email + password). Da autenticato:
// aggiorna la "parola attiva" e modera (cancella) le frasi
// inviate dagli utenti.
// ---------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, collection, query,
  orderBy, limit, onSnapshot, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMsg = document.getElementById("loginMsg");
const logoutBtn = document.getElementById("logoutBtn");

const wordForm = document.getElementById("wordForm");
const wordInput = document.getElementById("wordInput");
const wordMsg = document.getElementById("wordMsg");

const phraseList = document.getElementById("phraseList");

let unsubscribePhrases = null;

// --- stato di autenticazione -----------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginPanel.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    await loadCurrentWord();
    listenPhrases();
  } else {
    adminPanel.classList.add("hidden");
    loginPanel.classList.remove("hidden");
    if (unsubscribePhrases) unsubscribePhrases();
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "Accesso in corso…";
  loginMsg.removeAttribute("data-state");
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value.trim(), loginPassword.value);
    loginMsg.textContent = "";
  } catch (err) {
    console.error(err);
    loginMsg.textContent = "Email o password non corrette.";
    loginMsg.setAttribute("data-state", "error");
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

// --- parola attiva -----------------------------------------------------
async function loadCurrentWord() {
  const snap = await getDoc(doc(db, "config", "current"));
  wordInput.value = snap.exists() ? (snap.data().word || "") : "";
}

wordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  wordMsg.textContent = "Salvataggio…";
  wordMsg.removeAttribute("data-state");
  try {
    await setDoc(doc(db, "config", "current"), { word: wordInput.value.trim() });
    wordMsg.textContent = "Parola aggiornata sul sito.";
    wordMsg.setAttribute("data-state", "ok");
  } catch (err) {
    console.error(err);
    wordMsg.textContent = "Errore nel salvataggio.";
    wordMsg.setAttribute("data-state", "error");
  }
});

// --- lista frasi + moderazione -----------------------------------------
function listenPhrases() {
  const q = query(collection(db, "phrases"), orderBy("createdAt", "desc"), limit(100));
  unsubscribePhrases = onSnapshot(q, (snap) => {
    if (snap.empty) {
      phraseList.innerHTML = `<li class="phrase-list__empty">Nessuna frase ancora.</li>`;
      return;
    }
    phraseList.innerHTML = "";
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.className = "phrase-list__item";
      li.innerHTML = `<span></span><button class="btn btn--danger" type="button">Elimina</button>`;
      li.querySelector("span").textContent = data.text || "";
      li.querySelector("button").addEventListener("click", async () => {
        await deleteDoc(doc(db, "phrases", docSnap.id));
      });
      phraseList.appendChild(li);
    });
  });
}
