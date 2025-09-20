// @file frontend/src/types/index.ts
export interface CodeState {
  content: string
  language: 'python' | 'javascript'
  cursorPosition: number
  hasErrors: boolean
  errors: string[]            // added
}

export interface HintState {
  hints: AIHint[]
  isLoading: boolean
  currentLevel: 'concept' | 'approach' | 'pseudo-code'
}

export interface AIHint {
  id: string
  level: 'concept' | 'approach' | 'pseudo-code'
  content: string
  timestamp: Date
}

export interface ExecutionResult {
  output: string
  errors: string[]
  warnings?: string[]
  executionTime: number
  memoryUsed?: number
  cpuTime?: number
  status: 'success' | 'error' | 'timeout'
  exitCode?: number
}

export interface Exercise {
  id: string
  title: string
  description: string
  starterCode: string
  language: 'python' | 'javascript'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tests: ExerciseTest[]
}

export interface ExerciseTest {
  input: unknown
  expectedOutput: unknown
  description: string
}

export interface Theme {
  mode: 'light' | 'dark'
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    accent: string
  }
}
