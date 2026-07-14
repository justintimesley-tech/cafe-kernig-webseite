exports.handler = async function (event) {

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { frage } = JSON.parse(event.body);

  const systemPrompt = `Du bist der freundliche Assistent von Café Kernig.
  Beantworte NUR Fragen zu folgenden Themen:
  - Öffnungszeiten (Mo-Fr 08-18 Uhr, Sa 09-16 Uhr, So geschlossen)
  - Adresse (Musterstraße 12, 80331 München), Telefon (089 12345678)
  - Angebot (Kaffee, hausgemachter Kuchen, täglich frisch, saisonal wechselnd)
  - Vegane & allergenfreundliche Optionen: Es gibt täglich mindestens einen
    veganen Kuchen sowie glutenfreie Alternativen auf Anfrage
  - WLAN: kostenloses WLAN vorhanden, das Café eignet sich gut zum Arbeiten
    (ruhige Ecken vorhanden, keine Steckdosen-Garantie)
  - Sitzplätze: gemütliche Plätze drinnen sowie eine kleine Terrasse im Sommer,
    Hunde sind an der Leine willkommen
  Antworte kurz und freundlich auf Deutsch. Bei anderen Themen sag höflich,
  dass du nur zu Café-Fragen helfen kannst.`;

  try {
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

    if (!response.ok) {
      console.error("Anthropic hat einen Fehler zurückgegeben:", JSON.stringify(daten));
    }

    const antwortText = daten.content.map(teil => teil.text || "").join("");

    return {
      statusCode: 200,
      body: JSON.stringify({ antwort: antwortText })
    };

  } catch (fehler) {
    console.error("Fehler beim Aufruf der Anthropic-API:", fehler.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ antwort: "Entschuldigung, da ist etwas schiefgelaufen." })
    };
  }
};
