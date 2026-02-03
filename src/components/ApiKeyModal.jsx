import React, { useState } from 'react'

export default function ApiKeyModal({ onSubmit, onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!apiKey.trim()) {
      setError('Wprowadź klucz API')
      return
    }
    if (!apiKey.startsWith('AI')) {
      setError('Klucz API Gemini powinien zaczynać się od "AI"')
      return
    }
    onSubmit(apiKey.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🏠 3D Room Designer
        </h2>
        <p className="text-gray-600 mb-6">
          Aby korzystać z aplikacji, potrzebujesz klucza API Google Gemini.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              Klucz API Gemini
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setError('')
              }}
              placeholder="AIza..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-gray-800 placeholder:text-gray-400"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Jak uzyskać klucz API?</strong>
              <br />
              1. Wejdź na{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                aistudio.google.com/apikey
              </a>
              <br />
              2. Zaloguj się kontem Google
              <br />
              3. Kliknij "Create API Key"
              <br />
              4. Skopiuj klucz i wklej tutaj
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-colors duration-200"
          >
            Rozpocznij projektowanie
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Klucz jest przechowywany tylko lokalnie w przeglądarce.
        </p>
      </div>
    </div>
  )
}
