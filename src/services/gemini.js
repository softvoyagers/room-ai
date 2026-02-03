const SYSTEM_PROMPT = `Jesteś projektantem wnętrz. Użytkownik chce dodać mebel do pokoju 8x8 metrów.

WAŻNE: Zwróć WYŁĄCZNIE poprawny JSON, bez tekstu przed ani po, bez markdown.

Schemat odpowiedzi:
{"type":"...","position":{"x":number,"z":number},"color":"#hex","size":{"width":number,"depth":number,"height":number},"legs":"high|low|none"}

Typy mebli: sofa, table, chair, lamp, wardrobe, bed

ZASADY ROZMIESZCZANIA:
- Pokój ma wymiary od -4 do 4 (środek to 0,0)
- Ściany są na: z=-4 (tylna), x=-4 (lewa), x=4 (prawa)
- Kanapy i łóżka stawiaj przy ścianach (z=-3.5 lub x=±3.5)
- Szafy stawiaj pod ścianami
- Stoły mogą być na środku lub lekko przesunięte
- Krzesła stawiaj przy stołach lub w rogach
- Lampy stawiaj w rogach lub przy kanapach
- NIE stawiaj mebli na sobie - sprawdź listę istniejących mebli
- Zostaw przejścia między meblami (min 0.5m)
- Twórz estetyczne kompozycje - meble powinny tworzyć spójną aranżację

Kolory HEX:
czerwony=#dc2626, niebieski=#2563eb, zielony=#16a34a, szary=#808080, biały=#ffffff, czarny=#1f2937, brązowy=#92400e, beżowy=#d4c4a8, żółty=#eab308, różowy=#ec4899

Domyślne rozmiary (metry):
- sofa: 2×0.9×0.8
- table: 1.2×0.8×0.75
- chair: 0.45×0.45×0.9
- lamp: 0.3×0.3×1.5
- wardrobe: 1.5×0.6×2.2
- bed: 1.6×2×0.5`;

const COLOR_MAP = {
  red: '#dc2626', czerwony: '#dc2626',
  blue: '#2563eb', niebieski: '#2563eb',
  green: '#16a34a', zielony: '#16a34a',
  gray: '#808080', grey: '#808080', szary: '#808080',
  white: '#ffffff', biały: '#ffffff', bialy: '#ffffff',
  black: '#1f2937', czarny: '#1f2937',
  brown: '#92400e', brązowy: '#92400e', brazowy: '#92400e',
  beige: '#d4c4a8', beżowy: '#d4c4a8', bezowy: '#d4c4a8',
  yellow: '#eab308', żółty: '#eab308', zolty: '#eab308',
  orange: '#ea580c', pomarańczowy: '#ea580c', pomaranczowy: '#ea580c',
  pink: '#ec4899', różowy: '#ec4899', rozowy: '#ec4899',
  purple: '#9333ea', fioletowy: '#9333ea',
};

function normalizeResponse(furniture) {
  if (furniture.color && !furniture.color.startsWith('#')) {
    furniture.color = COLOR_MAP[furniture.color.toLowerCase()] || '#808080';
  }

  if (typeof furniture.legs === 'number') {
    furniture.legs = furniture.legs > 0 ? 'high' : 'none';
  } else if (!['high', 'low', 'none'].includes(furniture.legs)) {
    furniture.legs = 'low';
  }

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

  if (!furniture.position || typeof furniture.position !== 'object') {
    furniture.position = { x: 0, z: 0 };
  }

  return furniture;
}

export async function parsePromptWithGemini(apiKey, userPrompt, existingFurniture = []) {
  // Przygotuj opis aktualnych mebli w pokoju
  let roomContext = '';
  if (existingFurniture.length > 0) {
    const furnitureList = existingFurniture.map(f =>
      `- ${f.type} na pozycji (${f.position.x.toFixed(1)}, ${f.position.z.toFixed(1)})`
    ).join('\n');
    roomContext = `\n\nAKTUALNE MEBLE W POKOJU:\n${furnitureList}\n\nUstaw nowy mebel tak, żeby nie kolidował z istniejącymi i tworzył estetyczną kompozycję.`;
  } else {
    roomContext = '\n\nPokój jest pusty. Ustaw mebel w sensownym miejscu (np. kanapę przy ścianie, stół bliżej środka).';
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: SYSTEM_PROMPT + roomContext },
            { text: `Dodaj mebel: ${userPrompt}` }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
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

  console.log('Gemini response:', text);

  if (!text) {
    throw new Error('Brak odpowiedzi od Gemini');
  }

  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  }

  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    let furniture = JSON.parse(jsonStr);

    const validTypes = ['sofa', 'table', 'chair', 'lamp', 'wardrobe', 'bed'];
    if (!furniture.type || !validTypes.includes(furniture.type)) {
      throw new Error('Nieznany typ mebla');
    }

    furniture = normalizeResponse(furniture);
    furniture.id = Date.now().toString();

    return furniture;
  } catch (e) {
    console.error('JSON parse error:', e, 'Text:', jsonStr);
    throw new Error('Nie udało się zinterpretować odpowiedzi AI');
  }
}
