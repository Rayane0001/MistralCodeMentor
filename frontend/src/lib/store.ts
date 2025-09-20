// @file frontend/src/lib/store.ts

import { create } from 'zustand'
import { CodeState, HintState, ExecutionResult, Exercise, Theme } from '@/types'

interface AppStore extends CodeState, HintState {
  // Code Editor State
  updateCode: (content: string) => void
  setCursorPosition: (position: number) => void
  setLanguage: (language: 'python' | 'javascript') => void
  setHasErrors: (hasErrors: boolean) => void

  // AI Hints State
  addHint: (hint: { level: 'concept' | 'approach' | 'pseudo-code', content: string }) => void
  setHintsLoading: (loading: boolean) => void
  clearHints: () => void

  // Execution State
  executionResult: ExecutionResult | null
  setExecutionResult: (result: ExecutionResult) => void
  isExecuting: boolean
  setIsExecuting: (executing: boolean) => void

  // Exercise State
  currentExercise: Exercise | null
  setCurrentExercise: (exercise: Exercise | null) => void

  // Theme State
  theme: Theme
  toggleTheme: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial Code State
  content: `# Welcome to MistralCodeMentor
# Write your Python code here and click "Get Help" for AI assistance

def hello_world():
    print("Hello, World!")

hello_world()`,
  language: 'python',
  cursorPosition: 0,
  hasErrors: false,

  // Initial Hints State
  hints: [],
  isLoading: false,
  currentLevel: 'concept',

  // Initial Execution State
  executionResult: null,
  isExecuting: false,

  // Initial Exercise State
  currentExercise: null,

  // Initial Theme
  theme: {
    mode: 'dark',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      accent: '#10b981'
    }
  },

  // Code Actions
  updateCode: (content) => set({ content }),
  setCursorPosition: (position) => set({ cursorPosition: position }),
  setLanguage: (language) => set({
    language,
    content: language === 'python'
      ? `# Python code here\nprint("Hello from Python!")`
      : `// JavaScript code here\nconsole.log("Hello from JavaScript!");`
  }),
  setHasErrors: (hasErrors) => set({ hasErrors }),

  // Hint Actions
  addHint: ({ level, content }) => set(state => ({
    hints: [...state.hints, {
      id: Date.now().toString(),
      level,
      content,
      timestamp: new Date()
    }]
  })),
  setHintsLoading: (loading) => set({ isLoading: loading }),
  clearHints: () => set({ hints: [] }),

  // Execution Actions
  setExecutionResult: (result) => set({ executionResult: result }),
  setIsExecuting: (executing) => set({ isExecuting: executing }),

  // Exercise Actions
  setCurrentExercise: (exercise) => set({ currentExercise: exercise }),

  // Theme Actions
  toggleTheme: () => set(state => ({
    theme: {
      ...state.theme,
      mode: state.theme.mode === 'dark' ? 'light' : 'dark',
      colors: state.theme.mode === 'dark' ? {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        accent: '#10b981'
      } : {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        accent: '#10b981'
      }
    }
  }))
}))