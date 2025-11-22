'use client'

import { useState, useEffect, useRef } from 'react'
import { CodeEditor } from './CodeEditor'
import { OutputConsole } from './OutputConsole'
import { Toolbar } from './Toolbar'
import { useMusicRuntime } from '@/hooks/useMusicRuntime'

export function LiveCodeIDE() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState<OutputLine[]>([])
  const { runtime, engine, isReady } = useMusicRuntime()

  const executeCode = () => {
    if (!runtime) {
      addOutput('Error: Runtime not initialized', 'error')
      return
    }

    try {
      const result = runtime.eval(code)

      if (result.success) {
        if (result.output && result.output.length > 0) {
          result.output.forEach(line => addOutput(line, 'output'))
        }

        if (result.value && result.value.type !== 'nil') {
          addOutput(`=> ${runtime.formatValue(result.value)}`, 'result')
        }
      } else {
        addOutput(`Error: ${result.error}`, 'error')
      }
    } catch (error) {
      addOutput(`Error: ${error}`, 'error')
    }
  }

  const addOutput = (text: string, type: 'output' | 'result' | 'error' | 'info') => {
    setOutput(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text,
        type,
        timestamp: new Date(),
      },
    ])
  }

  const clearOutput = () => {
    setOutput([])
  }

  const handlePlayStop = () => {
    if (!engine) return

    if (engine.isCurrentlyPlaying()) {
      engine.stop()
      addOutput('Stopped playback', 'info')
    } else {
      executeCode()
    }
  }

  useEffect(() => {
    if (isReady) {
      addOutput('🎵 EchoFlux LiveCode ready!', 'info')
      addOutput('Type some code and press Cmd/Ctrl+Enter to evaluate', 'info')
    }
  }, [isReady])

  return (
    <div className="flex flex-col h-screen bg-code-bg text-gray-100">
      {/* Header */}
      <header className="bg-code-sidebar border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">EchoFlux LiveCode</h1>
            <p className="text-sm text-gray-400">Music programming with Lisp</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {isReady ? 'Ready' : 'Initializing...'}
            </span>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        onExecute={executeCode}
        onPlayStop={handlePlayStop}
        onClearOutput={clearOutput}
        isPlaying={engine?.isCurrentlyPlaying() ?? false}
        disabled={!isReady}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-code-sidebar px-4 py-2 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-300">Editor</h2>
          </div>
          <CodeEditor
            value={code}
            onChange={setCode}
            onExecute={executeCode}
            disabled={!isReady}
          />
        </div>

        {/* Output Console */}
        <div className="w-96 flex flex-col border-l border-gray-700">
          <div className="bg-code-sidebar px-4 py-2 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-300">Output</h2>
          </div>
          <OutputConsole output={output} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-code-sidebar border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            Press <kbd className="px-2 py-1 bg-gray-700 rounded">Cmd/Ctrl+Enter</kbd> to execute
          </div>
          <div>
            Powered by SuperSonic × SuperCollider
          </div>
        </div>
      </footer>
    </div>
  )
}

interface OutputLine {
  id: number
  text: string
  type: 'output' | 'result' | 'error' | 'info'
  timestamp: Date
}

const DEFAULT_CODE = `; Welcome to EchoFlux LiveCode!
; A Lisp-inspired language for music

; Try these examples:

; Basic arithmetic
(+ 1 2 3)

; Define a variable
(def freq 440)

; Music theory helpers
(note :C4)
(chord :C4 :maj7)
(scale :C4 :major)

; Convert MIDI to frequency
(midi->freq 60)

; Print output
(print "Hello, music!")

; Define a function
(defn double [x] (* x 2))
(double 21)
`
