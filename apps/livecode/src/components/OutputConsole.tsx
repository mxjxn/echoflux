'use client'

import { useEffect, useRef } from 'react'

interface OutputLine {
  id: number
  text: string
  type: 'output' | 'result' | 'error' | 'info'
  timestamp: Date
}

interface OutputConsoleProps {
  output: OutputLine[]
}

export function OutputConsole({ output }: OutputConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [output])

  const getLineColor = (type: OutputLine['type']) => {
    switch (type) {
      case 'output':
        return 'text-gray-300'
      case 'result':
        return 'text-blue-400'
      case 'error':
        return 'text-red-400'
      case 'info':
        return 'text-green-400'
      default:
        return 'text-gray-300'
    }
  }

  const getLineIcon = (type: OutputLine['type']) => {
    switch (type) {
      case 'result':
        return '→'
      case 'error':
        return '✗'
      case 'info':
        return 'ℹ'
      default:
        return ''
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-code-bg p-4 font-mono text-sm">
      {output.length === 0 ? (
        <div className="text-gray-500 italic">
          Output will appear here...
        </div>
      ) : (
        <div className="space-y-1">
          {output.map((line) => (
            <div key={line.id} className={`flex gap-2 ${getLineColor(line.type)}`}>
              {line.type !== 'output' && (
                <span className="flex-shrink-0 w-4 text-center opacity-60">
                  {getLineIcon(line.type)}
                </span>
              )}
              <span className="flex-1 break-all whitespace-pre-wrap">
                {line.text}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
