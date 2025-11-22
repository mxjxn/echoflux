'use client'

import { useEffect, useRef } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  disabled?: boolean
}

export function CodeEditor({ value, onChange, onExecute, disabled }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor

    // Register custom language for syntax highlighting
    monaco.languages.register({ id: 'echoflux' })

    monaco.languages.setMonarchTokensProvider('echoflux', {
      tokenizer: {
        root: [
          // Comments
          [/;.*$/, 'comment'],

          // Keywords
          [/\b(def|defn|let|if|do|fn|print|note|chord|scale|midi->freq|bpm|play-note|sleep)\b/, 'keyword'],

          // Special forms
          [/\b(true|false|nil)\b/, 'constant.language'],

          // Numbers
          [/-?\d+\.?\d*/, 'number'],

          // Strings
          [/"([^"\\]|\\.)*"/, 'string'],

          // Keywords (Clojure-style)
          [/:[a-zA-Z_\-+*/<>=!?][a-zA-Z0-9_\-+*/<>=!?]*/, 'type'],

          // Symbols
          [/[a-zA-Z_\-+*/<>=!?][a-zA-Z0-9_\-+*/<>=!?]*/, 'variable'],

          // Brackets
          [/[()[\]{}]/, 'delimiter.bracket'],
        ],
      },
    })

    // Define theme colors
    monaco.editor.defineTheme('echoflux-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'constant.language', foreground: '569CD6' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'delimiter.bracket', foreground: 'FFD700' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorCursor.foreground': '#ffffff',
        'editor.selectionBackground': '#264f78',
      },
    })

    monaco.editor.setTheme('echoflux-dark')

    // Add keyboard shortcut for execution
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!disabled) {
        onExecute()
      }
    })

    // Focus the editor
    editor.focus()
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        language="echoflux"
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          readOnly: disabled,
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </div>
  )
}
