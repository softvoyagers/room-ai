const SYSTEM_PROMPT = `Jesteś projektantem wnętrz i artystą 3D. Użytkownik chce dodać przedmiot do pokoju 8x8 metrów.

WAŻNE: Zwróć WYŁĄCZNIE poprawny JSON, bez tekstu przed ani po.

Schemat odpowiedzi:
{
  "type": "nazwa przedmiotu",
  "position": {"x": number, "z": number},
  "parts": [
    {
      "shape": "box" | "cylinder" | "sphere",
      "position": {"x": number, "y": number, "z": number},
      "size": {"width": number, "height": number, "depth": number},
      "color": "#hex",
      "rotation": {"x": number, "y": number, "z": number}
    }
  ]
}

ZASADY MODELOWANIA 3D:
- Każdy przedmiot składa się z części (parts) - prymitywów 3D
- position w parts to pozycja WZGLĘDEM środka przedmiotu (0,0,0 = środek podstawy)
- Dla cylinder: width=średnica, height=wysokość
- Dla sphere: width=średnica
- rotation w radianach (opcjonalne, domyślnie 0)
- Twórz realistyczne proporcje i kształty

PRZYKŁADY:
- TV: duży płaski box (ekran) + mały box (podstawka)
- Krzesło: box (siedzisko) + box (oparcie) + 4 cylindry (nogi)
- Lampa: cylinder (podstawa) + cylinder (noga) + stożek/sphere (klosz)
- Kwiatek w doniczce: cylinder (doniczka) + sphere/cylinder (roślina)
- Konsola PS: płaski box + małe detale
- Stolik: box (blat) + 4 cylindry (nogi)
- Roślina: cylinder (doniczka) + kilka cylindrów (łodygi) + sphere (liście)

ZASADY ROZMIESZCZANIA W POKOJU:
- Pokój: x i z od -4 do 4, środek to (0,0)
- Ściany: z=-4 (tylna), x=-4 (lewa), x=4 (prawa)
- TV/obrazy: przy tylnej ścianie (z=-3.9), naprzeciwko miejsca siedzącego
- Meble do siedzenia: przy ścianach lub tworzące kącik
- Stoliki: przy kanapach/fotelach lub na środku
- Rośliny: w rogach, przy oknach
- Unikaj kolizji z istniejącymi przedmiotami

KOLORY: czerwony=#dc2626, niebieski=#2563eb, zielony=#16a34a, szary=#808080, biały=#ffffff, czarny=#1f2937, brązowy=#92400e, beżowy=#d4c4a8, drewno=#8B4513`;

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
  orange: '#ea580c', pomarańczowy: '#ea580c',
  pink: '#ec4899', różowy: '#ec4899',
  purple: '#9333ea', fioletowy: '#9333ea',
  wood: '#8B4513', drewno: '#8B4513',
};

function normalizeColor(color) {
  if (!color) return '#808080';
  if (color.startsWith('#')) return color;
  return COLOR_MAP[color.toLowerCase()] || '#808080';
}

function normalizeResponse(item) {
  if (!item.position || typeof item.position !== 'object') {
    item.position = { x: 0, z: 0 };
  }

  // Normalizuj kolory w częściach
  if (item.parts && Array.isArray(item.parts)) {
    item.parts = item.parts.map(part => ({
      shape: part.shape || 'box',
      position: part.position || { x: 0, y: 0, z: 0 },
      size: part.size || { width: 0.5, height: 0.5, depth: 0.5 },
      color: normalizeColor(part.color),
      rotation: part.rotation || { x: 0, y: 0, z: 0 }
    }));
  } else {
    // Fallback - prosty box
    item.parts = [{
      shape: 'box',
      position: { x: 0, y: 0.25, z: 0 },
      size: { width: 0.5, height: 0.5, depth: 0.5 },
      color: '#808080',
      rotation: { x: 0, y: 0, z: 0 }
    }];
  }

  return item;
}

export async function parsePromptWithGemini(apiKey, userPrompt, existingFurniture = []) {
  let roomContext = '';
  if (existingFurniture.length > 0) {
    const furnitureList = existingFurniture.map(f =>
      `- ${f.type} na pozycji (${f.position.x.toFixed(1)}, ${f.position.z.toFixed(1)})`
    ).join('\n');
    roomContext = `\n\nAKTUALNE PRZEDMIOTY W POKOJU:\n${furnitureList}\n\nUstaw nowy przedmiot tak, żeby nie kolidował z istniejącymi.`;
  } else {
    roomContext = '\n\nPokój jest pusty.';
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
            { text: `Stwórz model 3D: ${userPrompt}` }
          ]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 8192,
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
    let item = JSON.parse(jsonStr);

    if (!item.type) {
      item.type = 'przedmiot';
    }

    item = normalizeResponse(item);
    item.id = Date.now().toString();

    return item;
  } catch (e) {
    console.error('JSON parse error:', e, 'Text:', jsonStr);
    throw new Error('Nie udało się zinterpretować odpowiedzi AI');
  }
}
