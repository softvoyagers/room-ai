// Available GLB models mapping
const AVAILABLE_MODELS = {
  sofa: '/models/sofa.glb',
  kanapa: '/models/sofa.glb',
  couch: '/models/sofa.glb',
  chair: '/models/chair.glb',
  krzesło: '/models/chair.glb',
  krzeslo: '/models/chair.glb',
  fotel: '/models/chair.glb',
  table: '/models/table.glb',
  stół: '/models/table.glb',
  stol: '/models/table.glb',
  stolik: '/models/table.glb',
  bed: '/models/bed.glb',
  łóżko: '/models/bed.glb',
  lozko: '/models/bed.glb',
  lamp: '/models/lamp.glb',
  lampa: '/models/lamp.glb',
  wardrobe: '/models/wardrobe.glb',
  szafa: '/models/wardrobe.glb',
  regał: '/models/wardrobe.glb',
  regal: '/models/wardrobe.glb',
  tv: '/models/tv.glb',
  telewizor: '/models/tv.glb',
  plant: '/models/plant.glb',
  roślina: '/models/plant.glb',
  roslina: '/models/plant.glb',
  kwiat: '/models/plant.glb',
  doniczka: '/models/plant.glb',
};

// Default scales for Kenney models (they are low-poly and small)
const MODEL_SCALES = {
  '/models/sofa.glb': 2.0,
  '/models/chair.glb': 1.8,
  '/models/table.glb': 2.0,
  '/models/bed.glb': 2.2,
  '/models/lamp.glb': 2.0,
  '/models/wardrobe.glb': 2.0,
  '/models/tv.glb': 2.5,
  '/models/plant.glb': 1.5,
};

const SYSTEM_PROMPT = `Jesteś projektantem wnętrz i artystą 3D. Użytkownik chce dodać przedmiot do pokoju 8x8 metrów.

WAŻNE: Zwróć WYŁĄCZNIE poprawny JSON, bez tekstu przed ani po.

DOSTĘPNE GOTOWE MODELE 3D (użyj jeśli pasują):
- sofa/kanapa: /models/sofa.glb
- chair/krzesło/fotel: /models/chair.glb
- table/stół/stolik: /models/table.glb
- bed/łóżko: /models/bed.glb
- lamp/lampa: /models/lamp.glb
- wardrobe/szafa: /models/wardrobe.glb
- tv/telewizor: /models/tv.glb
- plant/roślina/doniczka: /models/plant.glb

SCHEMAT ODPOWIEDZI:

Dla GOTOWEGO MODELU (preferowane dla standardowych mebli):
{
  "type": "nazwa przedmiotu",
  "useModel": true,
  "modelPath": "/models/nazwa.glb",
  "position": {"x": number, "z": number},
  "rotation": {"y": number},
  "scale": number,
  "color": "#hex"
}

Dla PROCEDURALNEGO przedmiotu (dla niestandardowych/fantazyjnych):
{
  "type": "nazwa przedmiotu",
  "useModel": false,
  "position": {"x": number, "z": number},
  "rotation": {"y": number},
  "color": "#hex",
  "parts": [
    {
      "shape": "box" | "cylinder" | "sphere" | "cone" | "torus" | "capsule" | "roundedBox",
      "position": {"x": number, "y": number, "z": number},
      "size": {"width": number, "height": number, "depth": number},
      "color": "#hex",
      "rotation": {"x": number, "y": number, "z": number},
      "material": "wood" | "metal" | "fabric" | "plastic" | "glass"
    }
  ]
}

ZASADY:
1. Dla standardowych mebli (kanapa, krzesło, stół, lampa, szafa, łóżko, TV, roślina) → użyj gotowego modelu (useModel: true)
2. Dla niestandardowych/fantazyjnych przedmiotów → generuj proceduralnie (useModel: false)
3. rotation.y w radianach (0 = przodem do kamery, Math.PI = tyłem)
4. scale: 1.0 = normalny rozmiar, <1 = mniejszy, >1 = większy

ZASADY MODELOWANIA PROCEDURALNEGO:
- Każdy przedmiot składa się z części (parts) - prymitywów 3D
- position w parts to pozycja WZGLĘDEM środka przedmiotu (0,0,0 = środek podstawy)
- Dla cylinder: width=średnica, height=wysokość
- Dla sphere: width=średnica
- material: określ typ materiału dla lepszego wyglądu
- Twórz realistyczne proporcje i kształty
- Używaj zaokrąglonych kształtów (roundedBox) dla mebli

PRZYKŁADY PROCEDURALNYCH:
- Konsola PS5: płaski roundedBox (korpus) + małe cylindry (detale)
- Kwiatek w doniczce: cylinder (doniczka, material: plastic) + sphere (liście, material: fabric)
- Obraz: płaski roundedBox (rama, material: wood) + płaski box (płótno)
- Regał: roundedBox (korpus, material: wood) + poziome box (półki)

ZASADY ROZMIESZCZANIA W POKOJU:
- Pokój: x i z od -4 do 4, środek to (0,0)
- Ściany: z=-4 (tylna), x=-4 (lewa), x=4 (prawa)
- TV/obrazy: przy tylnej ścianie (z=-3.9), rotation.y=0
- Meble do siedzenia: przy ścianach lub tworzące kącik
- Stoliki: przy kanapach/fotelach lub na środku
- Rośliny: w rogach, przy oknach
- Unikaj kolizji z istniejącymi przedmiotami

KOLORY: czerwony=#dc2626, niebieski=#2563eb, zielony=#16a34a, szary=#808080, biały=#ffffff, czarny=#1f2937, brązowy=#92400e, beżowy=#d4c4a8, drewno=#8B4513, różowy=#ec4899, fioletowy=#9333ea, pomarańczowy=#ea580c, żółty=#eab308`;

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
  silver: '#c0c0c0', srebrny: '#c0c0c0',
  gold: '#ffd700', złoty: '#ffd700', zloty: '#ffd700',
};

function normalizeColor(color) {
  if (!color) return '#808080';
  if (color.startsWith('#')) return color;
  return COLOR_MAP[color.toLowerCase()] || '#808080';
}

function findModelPath(type) {
  if (!type) return null;
  const lowerType = type.toLowerCase();

  // Check direct match
  if (AVAILABLE_MODELS[lowerType]) {
    return AVAILABLE_MODELS[lowerType];
  }

  // Check if type contains a known keyword
  for (const [key, path] of Object.entries(AVAILABLE_MODELS)) {
    if (lowerType.includes(key) || key.includes(lowerType)) {
      return path;
    }
  }

  return null;
}

function normalizeResponse(item) {
  if (!item.position || typeof item.position !== 'object') {
    item.position = { x: 0, z: 0 };
  }

  // Normalize rotation
  if (!item.rotation || typeof item.rotation !== 'object') {
    item.rotation = { y: 0 };
  }

  // Normalize scale
  if (typeof item.scale !== 'number') {
    item.scale = 1.0;
  }

  // Normalize color
  item.color = normalizeColor(item.color);

  // Handle model-based furniture
  if (item.useModel) {
    // Validate modelPath exists
    if (!item.modelPath) {
      item.modelPath = findModelPath(item.type);
    }

    // If no model found, fallback to procedural
    if (!item.modelPath) {
      item.useModel = false;
    } else {
      // Apply default scale for known models if not specified
      if (typeof item.scale !== 'number' || item.scale === 1.0) {
        item.scale = MODEL_SCALES[item.modelPath] || 1.5;
      }
    }
  }

  // Handle procedural furniture
  if (!item.useModel) {
    if (item.parts && Array.isArray(item.parts)) {
      item.parts = item.parts.map(part => ({
        shape: part.shape || 'box',
        position: part.position || { x: 0, y: 0, z: 0 },
        size: part.size || { width: 0.5, height: 0.5, depth: 0.5 },
        color: normalizeColor(part.color),
        rotation: part.rotation || { x: 0, y: 0, z: 0 },
        material: part.material || 'default'
      }));
    } else {
      // Fallback - simple box
      item.parts = [{
        shape: 'roundedBox',
        position: { x: 0, y: 0.25, z: 0 },
        size: { width: 0.5, height: 0.5, depth: 0.5 },
        color: item.color || '#808080',
        rotation: { x: 0, y: 0, z: 0 },
        material: 'default'
      }];
    }
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
