import React, { useState } from 'react'

// Icon components
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const UndoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
)

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

function ToolbarButton({ icon, label, onClick, disabled, danger, primary }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const baseClasses = `
    relative flex items-center justify-center
    w-10 h-10 rounded-xl
    transition-all duration-200 ease-out
    disabled:opacity-40 disabled:cursor-not-allowed
  `

  const colorClasses = danger
    ? 'text-red-500 hover:bg-red-50 hover:text-red-600 active:bg-red-100'
    : primary
    ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-md'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200'

  return (
    <button
      className={`${baseClasses} ${colorClasses}`}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {icon}
      {showTooltip && label && (
        <div className="absolute bottom-full mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md whitespace-nowrap z-50">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </button>
  )
}

export default function Toolbar({
  furnitureCount,
  selectedId,
  onUndo,
  onClear,
  onDelete,
  onScreenshot,
  onSettings,
  onAddClick,
  isLoading
}) {
  return (
    <>
      {/* Top toolbar - branding */}
      <div className="absolute top-4 left-4 z-20">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50">
          <HomeIcon />
          <div>
            <h1 className="text-sm font-semibold text-gray-800">Room Designer</h1>
            <p className="text-xs text-gray-500">
              {furnitureCount} {furnitureCount === 1 ? 'element' : furnitureCount < 5 ? 'elementy' : 'elementów'}
            </p>
          </div>
        </div>
      </div>

      {/* Settings button */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
          <ToolbarButton
            icon={<SettingsIcon />}
            label="Ustawienia"
            onClick={onSettings}
          />
        </div>
      </div>

      {/* Bottom floating toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50">
          {/* Action buttons */}
          <ToolbarButton
            icon={<CameraIcon />}
            label="Zrób screenshot"
            onClick={onScreenshot}
          />

          <ToolbarButton
            icon={<UndoIcon />}
            label="Cofnij"
            onClick={onUndo}
            disabled={furnitureCount === 0}
          />

          {selectedId && (
            <ToolbarButton
              icon={<TrashIcon />}
              label="Usuń zaznaczony"
              onClick={onDelete}
              danger
            />
          )}

          <ToolbarButton
            icon={<TrashIcon />}
            label="Wyczyść wszystko"
            onClick={onClear}
            disabled={furnitureCount === 0}
            danger
          />

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Add button */}
          <button
            className={`
              flex items-center gap-2 px-4 py-2
              bg-blue-500 text-white text-sm font-medium
              rounded-xl shadow-md
              hover:bg-blue-600 active:bg-blue-700
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            onClick={onAddClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Dodawanie...</span>
              </>
            ) : (
              <>
                <PlusIcon />
                <span>Dodaj mebel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
