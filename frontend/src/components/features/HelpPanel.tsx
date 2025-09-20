'use client'

import { useAppStore } from '@/lib/store'
import { AIHint } from '@/types'

interface HelpPanelProps {
  className?: string
}

export function HelpPanel({ className = '' }: HelpPanelProps) {
  const {
    hints,
    isLoading,
    theme,
    addHint,
    setHintsLoading,
    clearHints,
    content,
    language,
    cursorPosition
  } = useAppStore()

  const handleGetHelp = async () => {
    if (isLoading) return

    setHintsLoading(true)

    try {
      setTimeout(() => {
        addHint({
          level: 'concept',
          content: `I can see you're working with ${language}. ${
            content.trim()
              ? 'Your code looks interesting! In Phase 2, I will provide contextual hints based on your code and cursor position.'
              : 'Start writing some code and I will help you understand concepts, suggest approaches, and provide guidance.'
          }`
        })
        setHintsLoading(false)
      }, 1000)
    } catch {
      setHintsLoading(false)
      addHint({
        level: 'concept',
        content: 'Sorry, I encountered an error. Please try again.'
      })
    }
  }

  const getHintIcon = (level: AIHint['level']) => {
    switch (level) {
      case 'concept': return '💡'
      case 'approach': return '🎯'
      case 'pseudo-code': return '📝'
      default: return '💬'
    }
  }

  const getHintColor = (level: AIHint['level']) => {
    switch (level) {
      case 'concept': return theme.colors.accent
      case 'approach': return theme.colors.primary
      case 'pseudo-code': return theme.colors.secondary
      default: return theme.colors.text
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
          <h2 className="text-lg font-semibold">AI Mentor</h2>
          <button
            onClick={clearHints}
            className="text-xs px-2 py-1 rounded opacity-70 hover:opacity-100 transition-opacity"
            style={{
              backgroundColor: theme.colors.surface,
              color: theme.colors.text
            }}
          >
            Clear
          </button>
        </div>
        <p className="text-sm opacity-70 mt-1">
          Get progressive hints and guidance
        </p>
      </div>

      <div className="p-4 border-b"
           style={{ borderColor: theme.colors.surface }}>
        <button
          onClick={handleGetHelp}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.background
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </div>
          ) : (
            'Get Help 🤖'
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {hints.length === 0 ? (
          <div className="p-4 text-center"
               style={{ color: theme.colors.text }}>
            <div className="text-4xl mb-2">🧠</div>
            <p className="text-sm opacity-70">
              Click &quot;Get Help&quot; to receive AI-powered hints and guidance for your code.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {hints.map((hint) => (
              <div
                key={hint.id}
                className="p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderLeftColor: getHintColor(hint.level)
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getHintIcon(hint.level)}</span>
                  <span className="text-sm font-medium capitalize"
                        style={{ color: getHintColor(hint.level) }}>
                    {hint.level.replace('-', ' ')}
                  </span>
                  <span className="text-xs opacity-50 ml-auto"
                        style={{ color: theme.colors.text }}>
                    {hint.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed"
                   style={{ color: theme.colors.text }}>
                  {hint.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t text-xs opacity-50"
           style={{
             borderColor: theme.colors.surface,
             color: theme.colors.text
           }}>
        Language: {language.toUpperCase()} | Cursor: Line {cursorPosition}
      </div>
    </div>
  )
}