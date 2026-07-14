// Diese Datei würde später bei Netlify unter: netlify/functions/chat.js liegen

exports.handler = async function (event) {

  // Nur POST-Anfragen erlauben (also nur "Nachricht senden", kein anderer Zugriff)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Die Frage des Nutzers aus der Anfrage auslesen
  const { frage } = JSON.parse(event.body);

  // Die gleiche "Jobbeschreibung" wie in unserem Chat-Widget
  const systemPrompt = `Du bist der freundliche Assistent von Café Kernig.
  Beantworte NUR Fragen zu: Öffnungszeiten (Mo-Fr 08-18 Uhr, Sa 09-16 Uhr, So geschlossen),
  Adresse (Musterstraße 12, 80331 München), Telefon (089 12345678),
  und Angebot (Kaffee, hausgemachter Kuchen, täglich frisch).
  Antworte kurz und freundlich auf Deutsch. Bei anderen Themen sag höflich,
  dass du nur zu Café-Fragen helfen kannst.`;

  try {
    // Hier passiert der eigentliche Aufruf an Anthropic
    // WICHTIG: process.env.ANTHROPIC_API_KEY liest den Schlüssel aus den
    // sicheren Umgebungsvariablen von Netlify - er steht NIRGENDS im Code
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: frage }]
      })
    });

    const daten = await response.json();
    const antwortText = daten.content.map(teil => teil.text || "").join("");

    // Antwort zurück an das Chat-Widget im Browser schicken
    return {
      statusCode: 200,
      body: JSON.stringify({ antwort: antwortText })
    };

  } catch (fehler) {
    return {
      statusCode: 500,
      body: JSON.stringify({ antwort: "Entschuldigung, da ist etwas schiefgelaufen." })
    };
  }
};
