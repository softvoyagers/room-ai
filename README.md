# 3D Room Designer

Webowa aplikacja do wizualizacji pokoju 3D z możliwością dodawania mebli przez prompty tekstowe (np. "dodaj szarą kanapę w rogu").

## Stack technologiczny

- **Frontend**: React 18 + Vite
- **3D**: React Three Fiber (wrapper na Three.js)
- **UI**: Tailwind CSS
- **AI**: Google Gemini 3 Flash API

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz http://localhost:5173

## Jak używać

1. Wpisz klucz API Gemini (uzyskasz go na [aistudio.google.com/apikey](https://aistudio.google.com/apikey))
2. Wpisz opis mebla, np.:
   - "dodaj szarą kanapę w lewym rogu"
   - "czerwone krzesło na środku"
   - "biała lampa przy ścianie"
3. Obracaj widok myszką (OrbitControls)

## Dostępne meble

- kanapa (sofa)
- stół (table)
- krzesło (chair)
- lampa (lamp)
- szafa (wardrobe)
- łóżko (bed)
