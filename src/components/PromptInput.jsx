import React, { useState } from 'react'

export default function PromptInput({ onSubmit, isLoading, disabled }) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading && !disabled) {
      onSubmit(prompt.trim())
      setPrompt('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Opisz mebel, np. "dodaj szarą kanapę w lewym rogu" lub "czerwone krzesło na środku"'
          disabled={isLoading || disabled}
          rows={2}
          className="w-full px-4 py-3 text-gray-800 bg-white border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:bg-gray-100 disabled:cursor-not-allowed resize-none
                     placeholder:text-gray-400"
        />
      </div>
      <button
        type="submit"
        disabled={!prompt.trim() || isLoading || disabled}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition-colors duration-200 min-w-[100px]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
        ) : (
          'Dodaj'
        )}
      </button>
    </form>
  )
}
