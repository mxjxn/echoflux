'use client'

interface ToolbarProps {
  onExecute: () => void
  onPlayStop: () => void
  onClearOutput: () => void
  isPlaying: boolean
  disabled?: boolean
}

export function Toolbar({
  onExecute,
  onPlayStop,
  onClearOutput,
  isPlaying,
  disabled
}: ToolbarProps) {
  return (
    <div className="bg-code-sidebar border-b border-gray-700 px-4 py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onExecute}
          disabled={disabled}
          className="px-4 py-2 bg-code-accent hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center gap-2"
          title="Execute code (Cmd/Ctrl+Enter)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Execute
        </button>

        <button
          onClick={onPlayStop}
          disabled={disabled}
          className={`px-4 py-2 ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          } disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center gap-2`}
          title={isPlaying ? 'Stop' : 'Play'}
        >
          {isPlaying ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </>
          )}
        </button>

        <div className="flex-1" />

        <button
          onClick={onClearOutput}
          disabled={disabled}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center gap-2"
          title="Clear output"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>
    </div>
  )
}
