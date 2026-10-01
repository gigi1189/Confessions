//DEBUG
// fetch("https://opensheet.elk.sh/1RNzKvm9gAEEj9LxWuUl64SuUCnnkclvno62HF6SeVBc/Form Responses 1")
//   .then(res => res.json())
//   .then(data => {
//     console.log(data); 
//   });
  
const SHEET_ID = "1hCAgccyM-YNTppvaUAKmVtNcN8BOyOs-z71IYx7nx70";
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/1`;

let confessions = [];
let lastIndex = -1; 

async function fetchConfessions() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const keys = Object.keys(data[0]);
      const targetColumnKey = keys.length > 1 ? keys[1] : keys[0];

      confessions = data
        .map(row => row[targetColumnKey])
        .filter(text => text && text.trim() !== "");

      console.log("Loaded confessions array:", confessions);
    }
  } catch (err) {
    console.error("Error fetching sheet data:", err);
  }
}

function getRandomIndex() {
  if (confessions.length <= 1) return 0;

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * confessions.length);
  } while (randomIndex === lastIndex);

  return randomIndex;
}

function showNextConfession() {
  const box = document.getElementById("confession-box");
  if (!box || confessions.length === 0) return;

  box.classList.add("fade-out");

  setTimeout(() => {
    const randomIndex = getRandomIndex();
    lastIndex = randomIndex; 
    
    box.textContent = `"${confessions[randomIndex]} "`;

    box.classList.remove("fade-out");
  }, 600);
}

async function initLoop() {
  await fetchConfessions();

  const box = document.getElementById("confession-box");

  if (confessions.length > 0) {
    showNextConfession();
    setInterval(showNextConfession, 10000);
  } else if (box) {
    box.textContent = "No confessions found yet.";
  }

  setInterval(fetchConfessions, 30000);
}

initLoop();