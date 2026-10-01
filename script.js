fetch("https://opensheet.elk.sh/1RNzKvm9gAEEj9LxWuUl64SuUCnnkclvno62HF6SeVBc/Sheet1")
  .then(res => res.json())
  .then(data => {
    // Array of confessions directly from your spreadsheet!
    console.log(data); 
  });