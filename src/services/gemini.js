const SYSTEM_PROMPT = `Jesteś asystentem do projektowania wnętrz. Użytkownik opisuje mebel do dodania w pokoju.

WAŻNE: Zwróć WYŁĄCZNIE poprawny JSON, bez żadnego tekstu przed ani po, bez markdown.

Przykład poprawnej odpowiedzi:
{"type":"chair","position":{"x":0,"z":0},"color":"#dc2626","size":{"width":0.45,"depth":0.45,"height":0.9},"legs":"high"}

Schemat:
- type: jeden z: "sofa", "table", "chair", "lamp", "wardrobe", "bed"
- position: {"x": liczba od -3.5 do 3.5, "z": liczba od -3.5 do 3.5}
- color: kolor w formacie HEX (np. "#dc2626"), NIE nazwa koloru
- size: {"width": metry, "depth": metry, "height": metry}
- legs: jeden z: "high", "low", "none"

Mapowanie pozycji:
- "na środku" = x:0, z:0
- "w lewym rogu" = x:-3, z:-3
- "w prawym rogu" = x:3, z:-3
- "przy ścianie" = z:-3.5 lub x:3.5/-3.5

Mapowanie kolorów na HEX:
- czerwony = #dc2626
- niebieski = #2563eb
- zielony = #16a34a
- szary = #808080
- biały = #ffffff
- czarny = #1f2937
- brązowy = #92400e
- beżowy = #d4c4a8
- żółty = #eab308
- pomarańczowy = #ea580c
- różowy = #ec4899
- fioletowy = #9333ea

Domyślne rozmiary:
- sofa: 2×0.9×0.8m
- table: 1.2×0.8×0.75m
- chair: 0.45×0.45×0.9m
- lamp: 0.3×0.3×1.5m
- wardrobe: 1.5×0.6×2.2m
- bed: 1.6×2×0.5m`;

// Mapowanie nazw kolorów na HEX (fallback)
const COLOR_MAP = {
  red: '#dc2626',
  czerwony: '#dc2626',
  blue: '#2563eb',
  niebieski: '#2563eb',
  green: '#16a34a',
  zielony: '#16a34a',
  gray: '#808080',
  grey: '#808080',
  szary: '#808080',
  white: '#ffffff',
  biały: '#ffffff',
  bialy: '#ffffff',
  black: '#1f2937',
  czarny: '#1f2937',
  brown: '#92400e',
  brązowy: '#92400e',
  brazowy: '#92400e',
  beige: '#d4c4a8',
  beżowy: '#d4c4a8',
  bezowy: '#d4c4a8',
  yellow: '#eab308',
  żółty: '#eab308',
  zolty: '#eab308',
  orange: '#ea580c',
  pomarańczowy: '#ea580c',
  pomaranczowy: '#ea580c',
  pink: '#ec4899',
  różowy: '#ec4899',
  rozowy: '#ec4899',
  purple: '#9333ea',
  fioletowy: '#9333ea',
};

// Normalizacja odpowiedzi AI
function normalizeResponse(furniture) {
  // Normalizuj kolor
  if (furniture.color && !furniture.color.startsWith('#')) {
    const colorLower = furniture.color.toLowerCase();
    furniture.color = COLOR_MAP[colorLower] || '#808080';
  }

  // Normalizuj legs
  if (typeof furniture.legs === 'number') {
    furniture.legs = furniture.legs > 0 ? 'high' : 'none';
  } else if (!['high', 'low', 'none'].includes(furniture.legs)) {
    furniture.legs = 'low';
  }

  // Domyślne rozmiary jeśli brak
  const defaultSizes = {
    sofa: { width: 2, depth: 0.9, height: 0.8 },
    table: { width: 1.2, depth: 0.8, height: 0.75 },
    chair: { width: 0.45, depth: 0.45, height: 0.9 },
    lamp: { width: 0.3, depth: 0.3, height: 1.5 },
    wardrobe: { width: 1.5, depth: 0.6, height: 2.2 },
    bed: { width: 1.6, depth: 2, height: 0.5 },
  };

  if (!furniture.size || typeof furniture.size !== 'object') {
    furniture.size = defaultSizes[furniture.type] || defaultSizes.chair;
  }

  // Domyślna pozycja jeśli brak
  if (!furniture.position || typeof furniture.position !== 'object') {
    furniture.position = { x: 0, z: 0 };
  }

  return furniture;
}

export async function parsePromptWithGemini(apiKey, userPrompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { text: `Dodaj mebel: ${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Błąd API Gemini');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Brak odpowiedzi od Gemini');
  }

  // Parse JSON from response
  let jsonStr = text.trim();

  // Usuń markdown code blocks jeśli są
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  }

  // Znajdź JSON w odpowiedzi (pierwszy { do ostatniego })
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    let furniture = JSON.parse(jsonStr);

    // Walidacja typu
    const validTypes = ['sofa', 'table', 'chair', 'lamp', 'wardrobe', 'bed'];
    if (!furniture.type || !validTypes.includes(furniture.type)) {
      throw new Error('Nieznany typ mebla');
    }

    // Normalizuj odpowiedź
    furniture = normalizeResponse(furniture);

    // Dodaj unikalne ID
    furniture.id = Date.now().toString();

    return furniture;
  } catch (e) {
    console.error('JSON parse error:', e, 'Text:', jsonStr);
    throw new Error('Nie udało się zinterpretować odpowiedzi AI');
  }
}
