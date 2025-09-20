// @file frontend/src/lib/store.ts
import { create } from 'zustand'
import { CodeState, HintState, ExecutionResult, Exercise, Theme } from '@/types'

const sanitize = (s: string, max = 240) => s.replace(/\s+/g, ' ').trim().slice(0, max)

interface AppStore extends CodeState, HintState {
  updateCode: (content: string) => void
  setCursorPosition: (position: number) => void
  setLanguage: (language: 'python' | 'javascript') => void
  setHasErrors: (hasErrors: boolean) => void
  setErrors: (errors: string[]) => void

  addHint: (hint: { level: 'concept' | 'approach' | 'pseudo-code', content: string }) => void
  setHintsLoading: (loading: boolean) => void
  clearHints: () => void

  executionResult: ExecutionResult | null
  setExecutionResult: (result: ExecutionResult) => void
  isExecuting: boolean
  setIsExecuting: (executing: boolean) => void

  currentExercise: Exercise | null
  setCurrentExercise: (exercise: Exercise | null) => void

  theme: Theme
  toggleTheme: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  content: `# Welcome to MistralCodeMentor
# Write your Python code here and click "Get Help" for AI assistance

def hello_world():
    print("Hello, World!")

hello_world()`,
  language: 'python',
  cursorPosition: 0,
  hasErrors: false,
  errors: [],

  hints: [],
  isLoading: false,
  currentLevel: 'concept',

  executionResult: null,
  isExecuting: false,

  currentExercise: null,

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

  updateCode: (content) => set({ content }),
  setCursorPosition: (position) => set({ cursorPosition: position }),
  setLanguage: (language) => set({
    language,
    content: language === 'python'
        ? `# Python code here\nprint("Hello from Python!")`
        : `// JavaScript code here\nconsole.log("Hello from JavaScript!");`
  }),
  setHasErrors: (hasErrors) => set({ hasErrors }),
  setErrors: (errors) => set({ errors }),

  addHint: ({ level, content }) => set(state => ({
    hints: [...state.hints, { id: Date.now().toString(), level, content: sanitize(content), timestamp: new Date() }]
  })),
  setHintsLoading: (loading) => set({ isLoading: loading }),
  clearHints: () => set({ hints: [] }),

  setExecutionResult: (result) => set({ executionResult: result }),
  setIsExecuting: (executing) => set({ isExecuting: executing }),

  setCurrentExercise: (exercise) => set({ currentExercise: exercise }),

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
