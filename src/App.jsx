import React, { useState } from 'react'
import Room3D from './components/Room3D'
import PromptInput from './components/PromptInput'
import ApiKeyModal from './components/ApiKeyModal'
import { parsePromptWithGemini } from './services/gemini'

const API_KEY_STORAGE = 'room-designer-api-key'

// Demo prompts dla szybkiego testowania
const DEMO_PROMPTS = [
  { label: '🛋️ Szara kanapa', prompt: 'szara kanapa w lewym rogu' },
  { label: '🪑 Czerwone krzesło', prompt: 'czerwone krzesło na środku' },
  { label: '🛏️ Białe łóżko', prompt: 'białe łóżko przy ścianie' },
  { label: '🪔 Czarna lampa', prompt: 'czarna lampa w prawym rogu' },
  { label: '🗄️ Brązowa szafa', prompt: 'brązowa szafa przy lewej ścianie' },
  { label: '🪵 Drewniany stół', prompt: 'brązowy stół na środku pokoju' },
  { label: '💺 Niebieskie krzesło', prompt: 'niebieskie krzesło obok stołu' },
  { label: '🌸 Różowa kanapa', prompt: 'różowa kanapa przy prawej ścianie' },
]

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  const [showApiModal, setShowApiModal] = useState(!apiKey)
  const [furniture, setFurniture] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const handleApiKeySubmit = (key) => {
    setApiKey(key)
    localStorage.setItem(API_KEY_STORAGE, key)
    setShowApiModal(false)
  }

  const handlePromptSubmit = async (prompt) => {
    setIsLoading(true)
    setError('')

    try {
      const newFurniture = await parsePromptWithGemini(apiKey, prompt)
      setFurniture((prev) => [...prev, newFurniture])
      setHistory((prev) => [...prev, { prompt, furniture: newFurniture }])
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)

      // If API key error, show modal again
      if (err.message.includes('API key') || err.message.includes('401')) {
        localStorage.removeItem(API_KEY_STORAGE)
        setApiKey('')
        setShowApiModal(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearRoom = () => {
    setFurniture([])
    setHistory([])
  }

  const handleRemoveLast = () => {
    if (furniture.length > 0) {
      setFurniture((prev) => prev.slice(0, -1))
      setHistory((prev) => prev.slice(0, -1))
    }
  }

  const handleChangeApiKey = () => {
    setShowApiModal(true)
  }

  // Losowe przyciski demo (4 losowe z listy)
  const getRandomDemoButtons = () => {
    const shuffled = [...DEMO_PROMPTS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 4)
  }

  const [demoButtons] = useState(getRandomDemoButtons)

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* API Key Modal */}
      {showApiModal && (
        <ApiKeyModal
          onSubmit={handleApiKeySubmit}
          onClose={() => apiKey && setShowApiModal(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">
            🏠 3D Room Designer
          </h1>
          <span className="text-sm text-gray-500">
            {furniture.length} {furniture.length === 1 ? 'mebel' : furniture.length < 5 ? 'meble' : 'mebli'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {furniture.length > 0 && (
            <>
              <button
                onClick={handleRemoveLast}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cofnij ostatni
              </button>
              <button
                onClick={handleClearRoom}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Wyczyść pokój
              </button>
            </>
          )}
          <button
            onClick={handleChangeApiKey}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zmień klucz API"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* 3D Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        <Room3D furniture={furniture} />

        {/* Instructions overlay (shown when room is empty) */}
        {furniture.length === 0 && !showApiModal && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-6 py-4 shadow-lg max-w-md text-center">
            <p className="text-gray-700">
              <strong>Jak używać?</strong>
              <br />
              Wpisz opis mebla poniżej lub kliknij przycisk demo.
            </p>
          </div>
        )}

        {/* History panel */}
        {history.length > 0 && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg max-w-xs max-h-[40vh] overflow-y-auto">
            <div className="px-4 py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-700 text-sm">Historia</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {history.map((item, index) => (
                <li key={index} className="px-4 py-2 text-sm">
                  <span className="text-gray-600">{item.prompt}</span>
                  <span className="block text-xs text-gray-400 mt-1">
                    → {item.furniture.type} ({item.furniture.color})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg shadow-lg z-20">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Demo buttons */}
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            {demoButtons.map((demo, index) => (
              <button
                key={index}
                onClick={() => handlePromptSubmit(demo.prompt)}
                disabled={isLoading || !apiKey}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demo.label}
              </button>
            ))}
          </div>

          <PromptInput
            onSubmit={handlePromptSubmit}
            isLoading={isLoading}
            disabled={!apiKey}
          />
          <p className="text-xs text-gray-400 mt-2 text-center">
            Dostępne meble: kanapa, stół, krzesło, lampa, szafa, łóżko
          </p>
        </div>
      </div>
    </div>
  )
}
