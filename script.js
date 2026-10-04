let savedSheetId = localStorage.getItem("user_sheet_id");

if (!savedSheetId) {
  const userInput = prompt("Enter your Google Sheet URL below. (NOTE: Please ensure cell A1 contains a title, such as 'Confessions', and that the access to the sheet is public. :3)");
  
  if (userInput) {
    savedSheetId = userInput.includes("/d/")
      ? userInput.split("/d/")[1].split("/")[0]
      : userInput.trim();

    localStorage.setItem("user_sheet_id", savedSheetId);
  }
}

const SHEET_ID = savedSheetId;
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/1`;

let rawConfessions = [];
let shuffledDeck = [];
let deckIndex = 0;

async function fetchConfessions() {
  if (!SHEET_ID) {
    console.warn("No Google Sheet ID provided!");
    return;
  }

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const columnHeader = Object.keys(data[0])[0];

      const extracted = data
        .map(row => row[columnHeader])
        .filter(text => text && String(text).trim() !== "");

      rawConfessions = [...new Set(extracted)];

      if (shuffledDeck.length === 0 || shuffledDeck.length !== rawConfessions.length) {
        reshuffleDeck();
      }

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
    [shuffledDeck[0], shuffledDeck[shuffledDeck.length - 1]] = [
      shuffledDeck[shuffledDeck.length - 1],
      shuffledDeck[0]
    ];
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
  const box = document.getElementById("confession-box") || document.getElementById("ConfessionBox");
  if (!box || rawConfessions.length === 0) return;

  box.classList.add("fade-out");

  setTimeout(() => {
    const nextText = getNextConfession();
    box.textContent = `"${nextText}"`;

    box.classList.remove("fade-out");
  }, 600);
}

async function initLoop() {
  const box = document.getElementById("confession-box") || document.getElementById("ConfessionBox");

  if (!SHEET_ID) {
    if (box) box.textContent = "Please refresh to enter a valid Google Sheet ID.";
    return;
  }

  await fetchConfessions();

  if (rawConfessions.length > 0) {
    showNextConfession();
    setInterval(showNextConfession, 9000);
  } else if (box) {
    box.textContent = "No confessions found yet.";
  }

  setInterval(fetchConfessions, 30000);
}

initLoop();