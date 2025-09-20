// @file frontend/src/components/layout/MainLayout.tsx
'use client'

import dynamic from 'next/dynamic'
import { useAppStore } from '@/lib/store'
import { useState } from 'react'

// Render panels only on client to avoid hydration mismatches
const Editor = dynamic(() => import('@/components/features/Editor').then(m => m.Editor), { ssr: false })
const HelpPanel = dynamic(() => import('@/components/features/HelpPanel').then(m => m.HelpPanel), { ssr: false })
const OutputPanel = dynamic(() => import('@/components/features/OutputPanel').then(m => m.OutputPanel), { ssr: false })

export function MainLayout() {
    const { theme, toggleTheme, language, setLanguage } = useAppStore()
    const [leftPanelWidth] = useState(40)
    const [rightPanelWidth] = useState(30)

    return (
        <div className="h-screen flex flex-col"
             style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}>
            <header className="h-16 px-6 flex items-center justify-between border-b" style={{ borderColor: theme.colors.surface }}>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        MistralCodeMentor
                    </h1>
                    <div className="text-sm opacity-70">AI-Powered Code Learning Platform</div>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'python' | 'javascript')}
                        className="px-3 py-1 rounded-lg text-sm border"
                        style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.surface, color: theme.colors.text }}>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                    </select>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                        style={{ backgroundColor: theme.colors.surface }}
                        title="Toggle theme">
                        {theme.mode === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className="flex-shrink-0 border-r" style={{ width: `${leftPanelWidth}%`, borderColor: theme.colors.surface }}>
                    <Editor className="h-full" />
                </div>
                <div className="flex-shrink-0 border-r" style={{ width: `${100 - leftPanelWidth - rightPanelWidth}%`, borderColor: theme.colors.surface }}>
                    <HelpPanel className="h-full" />
                </div>
                <div className="flex-shrink-0" style={{ width: `${rightPanelWidth}%` }}>
                    <OutputPanel className="h-full" />
                </div>
            </main>

            <footer className="h-8 px-6 flex items-center justify-between border-t text-xs opacity-50"
                    style={{ borderColor: theme.colors.surface }}>
                <div>Ready to code • Secure sandbox environment</div>
                <div>Phases 1–2 complete</div>
            </footer>
        </div>
    )
}
