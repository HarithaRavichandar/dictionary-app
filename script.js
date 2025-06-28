async function getMeaning() {
  const word = document.getElementById('wordInput').value.trim();
  const resultDiv = document.getElementById('result');

  if (!word) {
    resultDiv.innerHTML = "<p>Please enter a word.</p>";
    return;
  }

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  resultDiv.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.title === "No Definitions Found") {
      resultDiv.innerHTML = `<p>No definition found for <b>${word}</b>.</p>`;
    } else {
      const meaning = data[0].meanings[0].definitions[0].definition;

      // Look through all definitions for an example
      let example = "No example available.";
      for (let meaningObj of data[0].meanings) {
        for (let def of meaningObj.definitions) {
          if (def.example) {
            example = def.example;
            break;
          }
        }
        if (example !== "No example available.") break;
      }

      // Get pronunciation and audio
      let pronunciationText = "Not available";
      let audioUrl = null;

      if (data[0].phonetics && data[0].phonetics.length > 0) {
        for (let phonetic of data[0].phonetics) {
          if (phonetic.text && pronunciationText === "Not available") {
            pronunciationText = phonetic.text;
          }
          if (phonetic.audio) {
            audioUrl = phonetic.audio;
            break;
          }
        }
      }

      resultDiv.innerHTML = `
        <h2>${word}</h2>
        <p><strong>Pronunciation:</strong> ${pronunciationText}</p>
        <p><strong>Meaning:</strong> ${meaning}</p>
        ${example !== "No example available." ? `<p><strong>Example:</strong> ${example}</p>` : ""}
        ${audioUrl ? `<button onclick="playAudio('${audioUrl}')">🔊 Listen</button>` : ""}
      `;
    }
  } catch (error) {
    resultDiv.innerHTML = "<p>There was an error fetching the meaning.</p>";
    console.error(error);
  }
}

function playAudio(audioUrl) {
  const audio = new Audio(audioUrl);
  audio.play();
}

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onstart = function () {
    alert("🎤 Speak now...");
  };

  recognition.onresult = function (event) {
    const spokenWord = event.results[0][0].transcript;
    document.getElementById('wordInput').value = spokenWord;
    getMeaning();
  };

  recognition.onerror = function (event) {
    alert("Voice recognition error: " + event.error);
  };

  recognition.start();
}
