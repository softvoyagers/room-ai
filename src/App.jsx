import React, { useState, useRef, useCallback } from 'react'
import Room3D from './components/Room3D'
import Toolbar from './components/Toolbar'
import ApiKeyModal from './components/ApiKeyModal'
import { parsePromptWithGemini } from './services/gemini'

const API_KEY_STORAGE = 'room-designer-api-key'

// Demo prompts for quick testing
const DEMO_PROMPTS = [
  { label: 'Kanapa', prompt: 'szara kanapa naprzeciwko telewizora', icon: '🛋️' },
  { label: 'Telewizor', prompt: 'duży telewizor na ścianie', icon: '📺' },
  { label: 'Stolik', prompt: 'niski stolik kawowy przed kanapą', icon: '☕' },
  { label: 'Lampa', prompt: 'nowoczesna lampa stojąca przy kanapie', icon: '💡' },
  { label: 'Roślina', prompt: 'zielona roślina w doniczce w rogu', icon: '🪴' },
  { label: 'Szafa', prompt: 'duża szafa przy ścianie', icon: '🚪' },
  { label: 'Krzesło', prompt: 'nowoczesne krzesło przy biurku', icon: '🪑' },
  { label: 'Łóżko', prompt: 'duże łóżko z poduszkami', icon: '🛏️' },
]

// Add furniture modal component
function AddFurnitureModal({ onClose, onSubmit, isLoading, demoPrompts }) {
  const [prompt, setPrompt] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim()) {
      onSubmit(prompt.trim())
    }
  }

  const handleDemoClick = (demoPrompt) => {
    onSubmit(demoPrompt)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Dodaj mebel</h2>
          <p className="text-sm text-gray-500 mt-1">
            Opisz co chcesz dodać lub wybierz z sugestii
          </p>
        </div>

        {/* Quick suggestions */}
        <div className="px-6 py-4 bg-gray-50/50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Szybkie dodawanie
          </p>
          <div className="flex flex-wrap gap-2">
            {demoPrompts.map((demo, index) => (
              <button
                key={index}
                onClick={() => handleDemoClick(demo.prompt)}
                disabled={isLoading}
                className="
                  flex items-center gap-2 px-3 py-2
                  bg-white border border-gray-200 rounded-xl
                  text-sm text-gray-700
                  hover:bg-gray-50 hover:border-gray-300
                  active:bg-gray-100
                  transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <span>{demo.icon}</span>
                <span>{demo.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Lub opisz własnymi słowami
          </p>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="np. czerwona kanapa, nowoczesna lampa..."
              disabled={isLoading}
              className="
                flex-1 px-4 py-3
                bg-gray-50 border border-gray-200 rounded-xl
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50
                transition-all duration-150
              "
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="
                px-6 py-3
                bg-blue-500 text-white font-medium rounded-xl
                hover:bg-blue-600 active:bg-blue-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
                flex items-center gap-2
              "
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tworzę...</span>
                </>
              ) : (
                <span>Dodaj</span>
              )}
            </button>
          </div>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// History panel component
function HistoryPanel({ history, onItemClick }) {
  if (history.length === 0) return null

  return (
    <div className="absolute top-20 right-4 z-10 w-72">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Historia ({history.length})</h3>
        </div>
        <div className="max-h-[40vh] overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={index}
              className="px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onItemClick?.(item.furniture.id)}
            >
              <p className="text-sm text-gray-800 font-medium">{item.furniture.type}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{item.prompt}</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: item.furniture.color }}
                />
                <span className="text-xs text-gray-400">
                  {item.furniture.useModel ? 'Model 3D' : 'Proceduralny'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Empty state component
function EmptyState() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">Twój pokój jest pusty</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Kliknij "Dodaj mebel" aby zacząć projektowanie swojego wnętrza
      </p>
    </div>
  )
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  const [showApiModal, setShowApiModal] = useState(!apiKey)
  const [showAddModal, setShowAddModal] = useState(false)
  const [furniture, setFurniture] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const canvasRef = useRef(null)

  // Randomize demo prompts on mount
  const [demoPrompts] = useState(() => {
    const shuffled = [...DEMO_PROMPTS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 6)
  })

  const handleApiKeySubmit = (key) => {
    setApiKey(key)
    localStorage.setItem(API_KEY_STORAGE, key)
    setShowApiModal(false)
  }

  const handlePromptSubmit = async (prompt) => {
    setIsLoading(true)
    setError('')

    try {
      const newFurniture = await parsePromptWithGemini(apiKey, prompt, furniture)
      setFurniture((prev) => [...prev, newFurniture])
      setHistory((prev) => [...prev, { prompt, furniture: newFurniture }])
      setShowAddModal(false)
      setSelectedId(newFurniture.id)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)

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
    if (furniture.length > 0 && window.confirm('Czy na pewno chcesz usunąć wszystkie meble?')) {
      setFurniture([])
      setHistory([])
      setSelectedId(null)
    }
  }

  const handleRemoveLast = () => {
    if (furniture.length > 0) {
      setFurniture((prev) => prev.slice(0, -1))
      setHistory((prev) => prev.slice(0, -1))
      setSelectedId(null)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedId) {
      setFurniture((prev) => prev.filter((f) => f.id !== selectedId))
      setHistory((prev) => prev.filter((h) => h.furniture.id !== selectedId))
      setSelectedId(null)
    }
  }

  const handleFurnitureClick = useCallback((id) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleScreenshot = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.querySelector('canvas')
      if (canvas) {
        const link = document.createElement('a')
        link.download = `room-design-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
    }
  }, [])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedId) {
        handleDeleteSelected()
      }
      if (e.key === 'Escape') {
        setSelectedId(null)
        setShowAddModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId])

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* API Key Modal */}
      {showApiModal && (
        <ApiKeyModal
          onSubmit={handleApiKeySubmit}
          onClose={() => apiKey && setShowApiModal(false)}
        />
      )}

      {/* Add Furniture Modal */}
      {showAddModal && (
        <AddFurnitureModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          demoPrompts={demoPrompts}
        />
      )}

      {/* Main 3D Canvas - Full screen */}
      <div ref={canvasRef} className="relative flex-1">
        <Room3D
          furniture={furniture}
          onFurnitureClick={handleFurnitureClick}
          selectedId={selectedId}
        />

        {/* Empty state */}
        {furniture.length === 0 && !showApiModal && !showAddModal && (
          <EmptyState />
        )}

        {/* History panel */}
        <HistoryPanel
          history={history}
          onItemClick={handleFurnitureClick}
        />

        {/* Floating toolbar */}
        <Toolbar
          furnitureCount={furniture.length}
          selectedId={selectedId}
          onUndo={handleRemoveLast}
          onClear={handleClearRoom}
          onDelete={handleDeleteSelected}
          onScreenshot={handleScreenshot}
          onSettings={() => setShowApiModal(true)}
          onAddClick={() => setShowAddModal(true)}
          isLoading={isLoading}
        />

        {/* Error toast */}
        {error && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
            <div className="px-4 py-3 bg-red-500 text-white rounded-xl shadow-lg flex items-center gap-3 animate-slide-up">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-2 hover:bg-red-600 rounded-full p-1 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Selected item info */}
        {selectedId && (
          <div className="absolute bottom-24 left-4 z-20">
            <div className="px-4 py-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Zaznaczono</p>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {furniture.find((f) => f.id === selectedId)?.type || 'Mebel'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Naciśnij Delete aby usunąć
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
