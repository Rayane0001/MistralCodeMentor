// @file frontend/src/components/features/Editor.tsx
'use client'

import dynamic from 'next/dynamic'
import { useAppStore } from '@/lib/store'
import { useCallback, useEffect } from 'react'

// Charge Monaco côté client uniquement (évite les erreurs d’hydratation)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface EditorProps {
    className?: string
}

export function Editor({ className = '' }: EditorProps) {
    const {
        content,
        language,
        theme,
        updateCode,
        setCursorPosition,
        setHasErrors,
        setErrors
    } = useAppStore()

    const handleEditorChange = useCallback((value: string | undefined) => {
        if (value !== undefined) updateCode(value)
    }, [updateCode])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditorMount = useCallback((editor: any, monaco: any) => {
        editor.updateOptions({
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineHeight: 20,
            padding: { top: 16, bottom: 16 },
            wordWrap: 'on',
            automaticLayout: true
        })

        editor.onDidChangeCursorPosition((e: any) => setCursorPosition(e.position.lineNumber))

        monaco.editor.onDidChangeMarkers(() => {
            const model = editor.getModel()
            if (!model) return
            const markers = monaco.editor.getModelMarkers({ resource: model.uri })
            const hasErr = markers.some((m: any) => m.severity === monaco.MarkerSeverity.Error)
            setHasErrors(hasErr)
            setErrors(markers.map((m: any) => `${m.message} (line ${m.startLineNumber})`))
        })

        monaco.editor.defineTheme('mistral-dark', {
            base: 'vs-dark', inherit: true,
            rules: [
                { token: 'comment', foreground: '6b7280' },
                { token: 'keyword', foreground: '8b5cf6' },
                { token: 'string', foreground: '10b981' },
                { token: 'number', foreground: 'f59e0b' }
            ],
            colors: { 'editor.background': theme.colors.surface, 'editor.foreground': theme.colors.text }
        })
        monaco.editor.defineTheme('mistral-light', {
            base: 'vs', inherit: true,
            rules: [
                { token: 'comment', foreground: '6b7280' },
                { token: 'keyword', foreground: '8b5cf6' },
                { token: 'string', foreground: '10b981' },
                { token: 'number', foreground: 'f59e0b' }
            ],
            colors: { 'editor.background': theme.colors.surface, 'editor.foreground': theme.colors.text }
        })
        monaco.editor.setTheme(theme.mode === 'dark' ? 'mistral-dark' : 'mistral-light')
    }, [setCursorPosition, setHasErrors, setErrors, theme])

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const monaco = (typeof window !== 'undefined' && (window as any)?.monaco) || null
        if (monaco) monaco.editor.setTheme(theme.mode === 'dark' ? 'mistral-dark' : 'mistral-light')
    }, [theme.mode])

    return (
        <div className={`h-full w-full border rounded-lg overflow-hidden ${className}`}
             style={{ backgroundColor: theme.colors.surface }}>
            <div className="h-8 px-4 flex items-center justify-between text-sm"
                 style={{
                     backgroundColor: theme.colors.background,
                     color: theme.colors.text,
                     borderBottom: `1px solid ${theme.colors.surface}`
                 }}>
        <span className="font-medium">
          {language === 'python' ? 'Python' : 'JavaScript'}
        </span>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                        theme.mode === 'dark' ? 'bg-green-400' : 'bg-green-500'
                    }`} />
                    <span className="text-xs opacity-70">Ready</span>
                </div>
            </div>

            <div className="h-[calc(100%-2rem)]">
                <MonacoEditor
                    height="100%"
                    language={language}
                    value={content}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    theme={theme.mode === 'dark' ? 'mistral-dark' : 'mistral-light'}
                    options={{
                        selectOnLineNumbers: true,
                        matchBrackets: 'always',
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        formatOnPaste: true,
                        formatOnType: true,
                        tabSize: 4,
                        insertSpaces: true
                    }}
                />
            </div>
        </div>
    )
}
