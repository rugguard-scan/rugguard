# RugGuard — online zetten met verborgen API-sleutel

Deze map bevat je complete app plus een beveiligd tussenlaagje, zodat je
Helius-sleutel nooit zichtbaar is voor bezoekers.

## Wat zit erin
- `index.html` — de app zelf (praat met /api/rpc, niet met Helius direct)
- `netlify/functions/rpc.js` — het tussenlaagje dat op de server draait en de sleutel toevoegt
- `netlify.toml` — vertelt Netlify hoe alles samenhangt

## De sleutel staat NIET in deze bestanden
Dat is de bedoeling. Je zet de sleutel apart in Netlify (stap 5 hieronder),
waar bezoekers hem niet kunnen zien.

---

## Stappenplan

### 1. Haal je Helius-sleutel op
- Ga naar helius.dev, maak een gratis account.
- Kopieer je API key (een lange reeks tekens). Alleen de sleutel zelf,
  niet het hele adres.

### 2. Zet dit project op GitHub
- Maak een gratis account op github.com als je die nog niet hebt.
- Maak een nieuwe, lege repository (bv. "rugguard").
- Upload de inhoud van deze map. Via de terminal, vanuit deze map:

    git init
    git add .
    git commit -m "RugGuard eerste versie"
    git branch -M main
    git remote add origin https://github.com/JOUW-NAAM/rugguard.git
    git push -u origin main

  (Vervang JOUW-NAAM en de repo-naam door die van jou.)

### 3. Koppel Netlify aan GitHub
- Log in op Netlify → "Add new project" → "Import an existing project".
- Kies GitHub en selecteer je rugguard-repository.
- Netlify herkent netlify.toml automatisch. Klik op deploy.

### 4. (Netlify vindt de function vanzelf)
- Dankzij netlify.toml weet Netlify waar de function staat en maakt het
  het adres /api/rpc automatisch aan. Je hoeft hier niets in te stellen.

### 5. Zet je geheime sleutel in Netlify — DIT is de kern
- Ga in je Netlify-project naar: Site configuration → Environment variables.
- Voeg een nieuwe variabele toe:
    Key:   HELIUS_API_KEY
    Value: (plak hier je Helius-sleutel)
- Sla op en trigger een nieuwe deploy (Deploys → Trigger deploy).

### 6. Test
- Open je site (bv. https://rugguard-scan.netlify.app).
- Scan het voorbeeld-token (USDC staat al ingevuld).
- Nu zouden OOK "mint authority", "freeze authority" en
  "spreiding van de voorraad" moeten werken — want die lopen nu via
  Helius in plaats van de overbelaste publieke server.

### Updaten later
- Wijzig je iets? Push naar GitHub en Netlify werkt de site vanzelf bij.
  Geen slepen meer nodig.
