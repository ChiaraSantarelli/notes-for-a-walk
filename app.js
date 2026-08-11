// Dati iniziali predefiniti
const DEFAULT_DATA = {
  words: [
    {
      id: "tomorrow",
      term: "Tomorrow",
      sentences: [
        "makes it even better",
        "calls for adaptation",
        "an opportunity opens",
        "confronts injustice",
        "is a fresh start",
        "brings disappointment",
        "makes the difference",
        "Happens™",
        "brings the unexpected",
        "history is written",
        "doesn't always go to plan",
        "builds on the work of today",
        "brings uncertainty"
      ]
    },
    {
      id: "walk",
      term: "Walk",
      sentences: [
        "measures time with footsteps",
        "leaves echoes on the asphalt",
        "creates space where silence was",
        "reveals hidden paths in the city"
      ]
    },
    {
      id: "silence",
      term: "Silence",
      sentences: [
        "is the sound between steps",
        "resonates in empty alleys",
        "speaks louder than words"
      ]
    }
  ]
};

function getAppData() {
  const saved = localStorage.getItem('notes_for_a_walk_data');
  return saved ? JSON.parse(saved) : DEFAULT_DATA;
}

function saveAppData(data) {
  localStorage.setItem('notes_for_a_walk_data', JSON.stringify(data));
}

let appData = getAppData();
let currentWordIdx = 0;
let rotationTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'home') {
    initHomeLayout();
  } else if (page === 'words') {
    initWordsPage();
  }
});

function initHomeLayout() {
  const wordMenu = document.getElementById('wordMenu');
  const activeWordTitle = document.getElementById('activeWordTitle');
  const streamContainer = document.getElementById('sentencesStream');

  if (!wordMenu || !appData.words.length) return;

  function renderMenu() {
    wordMenu.innerHTML = '';
    appData.words.forEach((w, idx) => {
      const item = document.createElement('div');
      item.className = `word-menu-item ${idx === currentWordIdx ? 'active' : ''}`;
      item.innerHTML = `<span>${w.term}</span> <span>+</span>`;
      item.addEventListener('click', () => selectWord(idx));
      wordMenu.appendChild(item);
    });
  }

  function selectWord(idx) {
    currentWordIdx = idx;
    renderMenu();

    const currentObj = appData.words[currentWordIdx];
    activeWordTitle.textContent = currentObj.term;

    renderStream(currentObj.sentences);
  }

  function renderStream(sentences) {
    streamContainer.innerHTML = '';
    if (!sentences || sentences.length === 0) return;

    sentences.forEach((sentence, sIdx) => {
      const div = document.createElement('div');
      div.className = `sentence-stream-item ${sIdx === Math.floor(sentences.length / 2) ? 'highlight' : ''}`;
      div.textContent = sentence;
      streamContainer.appendChild(div);
    });

    startAutoRotation();
  }

  function startAutoRotation() {
    if (rotationTimer) clearInterval(rotationTimer);

    rotationTimer = setInterval(() => {
      const first = streamContainer.firstElementChild;
      if (first) {
        streamContainer.appendChild(first);
        
        const children = streamContainer.children;
        const midIndex = Math.floor(children.length / 2);
        Array.from(children).forEach((child, i) => {
          child.classList.toggle('highlight', i === midIndex);
        });
      }
    }, 2200);
  }

  selectWord(0);
}

function initWordsPage() {
  const container = document.getElementById('wordsListContainer');
  const addWordForm = document.getElementById('addWordForm');

  function renderList() {
    container.innerHTML = '';
    appData.words.forEach((wordObj, wIdx) => {
      const card = document.createElement('div');
      card.className = 'word-item-card';

      let sentencesHtml = wordObj.sentences.map((s, sIdx) => `
        <li>
          <span>${s}</span>
          <button class="btn" onclick="deleteSentence(${wIdx}, ${sIdx})" style="padding:2px 5px; font-size:0.7rem;">x</button>
        </li>
      `).join('');

      card.innerHTML = `
        <h3 class="serif-text" style="font-size:1.4rem;">${wordObj.term}</h3>
        <ul class="sentence-list">${sentencesHtml || '<li>Nessuna frase.</li>'}</ul>
        <div style="display:flex; gap:6px; margin-top:10px;">
          <input type="text" id="newSentence_${wIdx}" placeholder="Nuova frase...">
          <button class="btn" onclick="addSentence(${wIdx})">+</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  window.addSentence = function(wordIdx) {
    const input = document.getElementById(`newSentence_${wordIdx}`);
    if (input && input.value.trim() !== '') {
      appData.words[wordIdx].sentences.push(input.value.trim());
      saveAppData(appData);
      renderList();
    }
  };

  window.deleteSentence = function(wordIdx, sentenceIdx) {
    appData.words[wordIdx].sentences.splice(sentenceIdx, 1);
    saveAppData(appData);
    renderList();
  };

  if (addWordForm) {
    addWordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newWordInput');
      if (input && input.value.trim() !== '') {
        appData.words.push({
          id: input.value.trim().toLowerCase(),
          term: input.value.trim(),
          sentences: []
        });
        saveAppData(appData);
        input.value = '';
        renderList();
      }
    });
  }

  renderList();
}
