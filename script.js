const SHEET_ID = "1AEc_AqgK8Sz8wFjseqi62ljDHPB9T3Fvm809B5eRVlI";
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/1`;

let rawConfessions = [];
let shuffledDeck = [];
let deckIndex = 0;

async function fetchConfessions() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const keys = Object.keys(data[0]);
      
      const targetColumnKey = keys[0];

      const extracted = data
        .map(row => row[targetColumnKey])
        .filter(text => text && String(text).trim() !== "");

      rawConfessions = [...new Set(extracted)];

      if (shuffledDeck.length === 0 || shuffledDeck.length !== rawConfessions.length) {
        reshuffleDeck();
      }

      console.log(`Loaded ${rawConfessions.length} unique confessions from ${targetColumnKey}:`, rawConfessions);
    }
  } catch (err) {
    console.error("Error fetching sheet data:", err);
  }
}

function reshuffleDeck() {
  const lastShown = shuffledDeck[deckIndex - 1]; 
  shuffledDeck = [...rawConfessions];

  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }

  if (shuffledDeck.length > 1 && shuffledDeck[0] === lastShown) {
    [shuffledDeck[0], shuffledDeck[shuffledDeck.length - 1]] = [shuffledDeck[shuffledDeck.length - 1], shuffledDeck[0]];
  }

  deckIndex = 0;
}

function getNextConfession() {
  if (shuffledDeck.length === 0) return "";

  if (deckIndex >= shuffledDeck.length) {
    reshuffleDeck();
  }

  const confession = shuffledDeck[deckIndex];
  deckIndex++;
  return confession;
}

function showNextConfession() {
  const box = document.getElementById("ConfessionBox") || document.getElementById("confession-box");
  if (!box || rawConfessions.length === 0) return;

  box.classList.add("fade-out");

  setTimeout(() => {
    const nextText = getNextConfession();
    box.textContent = `"${nextText} "`;

    box.classList.remove("fade-out");
  }, 600);
}

async function initLoop() {
  await fetchConfessions();

  const box = document.getElementById("ConfessionBox") || document.getElementById("confession-box");

  if (rawConfessions.length > 0) {
    showNextConfession();
    setInterval(showNextConfession, 9000);
  } else if (box) {
    box.textContent = "No confessions found yet.";
  }

  setInterval(fetchConfessions, 30000);
}

initLoop();