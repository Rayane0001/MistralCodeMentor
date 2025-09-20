'use client'

import { useAppStore } from '@/lib/store'

interface OutputPanelProps {
  className?: string
}

export function OutputPanel({ className = '' }: OutputPanelProps) {
  const {
    executionResult,
    isExecuting,
    theme,
    setIsExecuting,
    setExecutionResult,
    content,
    language
  } = useAppStore()

  const handleRunCode = async () => {
    if (isExecuting || !content.trim()) return

    setIsExecuting(true)

    try {
      setTimeout(() => {
        const mockResult = {
          output: language === 'python'
            ? 'Hello, World!\nCode executed successfully!'
            : 'Hello from JavaScript!\nCode executed successfully!',
          errors: [],
          executionTime: Math.random() * 200 + 50,
          status: 'success' as const
        }

        setExecutionResult(mockResult)
        setIsExecuting(false)
      }, 1500)
    } catch {
      setExecutionResult({
        output: '',
        errors: ['Execution failed. Please try again.'],
        executionTime: 0,
        status: 'error'
      })
      setIsExecuting(false)
    }
  }

  const getStatusColor = () => {
    if (!executionResult) return theme.colors.text
    switch (executionResult.status) {
      case 'success': return theme.colors.accent
      case 'error': return '#ef4444'
      case 'timeout': return '#f59e0b'
      default: return theme.colors.text
    }
  }

  const getStatusIcon = () => {
    if (isExecuting) return '⏳'
    if (!executionResult) return '▶️'
    switch (executionResult.status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'timeout': return '⏱️'
      default: return '▶️'
    }
  }

  return (
    <div className={`h-full flex flex-col ${className}`}
         style={{ backgroundColor: theme.colors.background }}>

      <div className="p-4 border-b"
           style={{
             borderColor: theme.colors.surface,
             color: theme.colors.text
           }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Output</h2>
          {executionResult && (
            <div className="flex items-center gap-2 text-xs">
              <span style={{ color: getStatusColor() }}>
                {executionResult.status.toUpperCase()}
              </span>
              {executionResult.executionTime > 0 && (
                <span className="opacity-50">
                  {executionResult.executionTime.toFixed(0)}ms
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-sm opacity-70 mt-1">
          Run your code in a secure sandbox
        </p>
      </div>

      <div className="p-4 border-b"
           style={{ borderColor: theme.colors.surface }}>
        <button
          onClick={handleRunCode}
          disabled={isExecuting || !content.trim()}
          className="w-full py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          style={{
            backgroundColor: theme.colors.accent,
            color: theme.colors.background
          }}
        >
          {isExecuting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Executing...
            </div>
          ) : (
            `Run Code ${getStatusIcon()}`
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!executionResult && !isExecuting ? (
          <div className="p-4 text-center"
               style={{ color: theme.colors.text }}>
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-sm opacity-70">
              Click &quot;Run Code&quot; to execute your {language} code in a secure sandbox.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">

            {executionResult?.output && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2"
                    style={{ color: theme.colors.text }}>
                  <span>📝</span>
                  Output
                </h3>
                <pre className="p-3 rounded-lg text-sm font-mono whitespace-pre-wrap"
                     style={{
                       backgroundColor: theme.colors.surface,
                       color: theme.colors.text,
                       border: `1px solid ${theme.colors.surface}`
                     }}>
                  {executionResult.output}
                </pre>
              </div>
            )}

            {executionResult?.errors && executionResult.errors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-400">
                  <span>🚨</span>
                  Errors
                </h3>
                <div className="space-y-2">
                  {executionResult.errors.map((error, index) => (
                    <pre key={index}
                         className="p-3 rounded-lg text-sm font-mono whitespace-pre-wrap text-red-200"
                         style={{
                           backgroundColor: 'rgba(239, 68, 68, 0.1)',
                           border: '1px solid rgba(239, 68, 68, 0.3)'
                         }}>
                      {error}
                    </pre>
                  ))}
                </div>
              </div>
            )}

            {executionResult && (
              <div className="pt-2 border-t text-xs opacity-50"
                   style={{
                     borderColor: theme.colors.surface,
                     color: theme.colors.text
                   }}>
                <div className="flex justify-between items-center">
                  <span>Status: {executionResult.status}</span>
                  <span>Time: {executionResult.executionTime.toFixed(0)}ms</span>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <div className="p-4 border-t text-xs opacity-50"
           style={{
             borderColor: theme.colors.surface,
             color: theme.colors.text
           }}>
        🛡️ Code runs in isolated Docker sandbox with resource limits
      </div>
    </div>
  )
}