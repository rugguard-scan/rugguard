// netlify/functions/rpc.js
//
// Beveiligd tussenlaagje tussen de browser en Helius.
// De browser praat met /api/rpc en kent de geheime sleutel NIET.
// Deze functie draait op de server, voegt de sleutel toe (uit een
// omgevingsvariabele) en stuurt het verzoek door naar Helius.
//
// De sleutel staat in de Netlify-omgevingsvariabele HELIUS_API_KEY,
// niet in de code. Bezoekers kunnen hem daardoor niet zien.

exports.handler = async function (event) {
  // Alleen POST toestaan; de app stuurt JSON-RPC via POST.
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const key = process.env.HELIUS_API_KEY;
  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is nog niet geconfigureerd (geen API-sleutel ingesteld)." }),
    };
  }

  const HELIUS = "https://mainnet.helius-rpc.com/?api-key=" + key;

  try {
    const upstream = await fetch(HELIUS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body, // stuur het JSON-RPC verzoek 1-op-1 door
    });

    const text = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: { "Content-Type": "application/json" },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Kon de blockchain-server niet bereiken.", detail: String(err) }),
    };
  }
};
