// @file frontend/src/components/layout/MainLayout.tsx

'use client'

import { Editor } from '@/components/features/Editor'
import { HelpPanel } from '@/components/features/HelpPanel'
import { OutputPanel } from '@/components/features/OutputPanel'
import { useAppStore } from '@/lib/store'
import { useState } from 'react'

export function MainLayout() {
  const { theme, toggleTheme, language, setLanguage } = useAppStore()
  const [leftPanelWidth] = useState(40)
  const [rightPanelWidth] = useState(30)

  return (
    <div className="h-screen flex flex-col"
         style={{
           backgroundColor: theme.colors.background,
           color: theme.colors.text
         }}>

      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b"
              style={{ borderColor: theme.colors.surface }}>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            MistralCodeMentor
          </h1>
          <div className="text-sm opacity-70">
            AI-Powered Code Learning Platform
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'python' | 'javascript')}
            className="px-3 py-1 rounded-lg text-sm border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surface,
              color: theme.colors.text
            }}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:scale-110 transition-transform"
            style={{ backgroundColor: theme.colors.surface }}
            title="Toggle theme"
          >
            {theme.mode === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content - 3 Panel Layout */}
      <main className="flex-1 flex overflow-hidden">

        {/* Left Panel - Code Editor */}
        <div className="flex-shrink-0 border-r"
             style={{
               width: `${leftPanelWidth}%`,
               borderColor: theme.colors.surface
             }}>
          <Editor className="h-full" />
        </div>

        {/* Center Panel - AI Help */}
        <div className="flex-shrink-0 border-r"
             style={{
               width: `${100 - leftPanelWidth - rightPanelWidth}%`,
               borderColor: theme.colors.surface
             }}>
          <HelpPanel className="h-full" />
        </div>

        {/* Right Panel - Output */}
        <div className="flex-shrink-0"
             style={{ width: `${rightPanelWidth}%` }}>
          <OutputPanel className="h-full" />
        </div>

      </main>

      {/* Footer */}
      <footer className="h-8 px-6 flex items-center justify-between border-t text-xs opacity-50"
              style={{ borderColor: theme.colors.surface }}>
        <div>Ready to code • Secure sandbox environment</div>
        <div>Phase 1: Foundation Complete</div>
      </footer>

    </div>
  )
}