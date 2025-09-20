// @file frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface APICodeAnalysisRequest {
  content: string
  language: 'python' | 'javascript'
  cursor_position: number
  errors?: string[]
}

export interface APIHint {
  level: 'concept' | 'approach' | 'pseudo-code'
  content: string
  timestamp: string
}

export interface APICodeAnalysisResponse {
  hint: APIHint
  success: boolean
  message?: string
}

export interface APICodeExecutionRequest {
  content: string
  language: 'python' | 'javascript'
}

export interface APIExecutionResult {
  output: string
  errors: string[]
  warnings: string[]
  execution_time: number
  memory_used: number
  cpu_time: number
  status: 'success' | 'error' | 'timeout'
  exit_code?: number
}

export interface APICodeExecutionResponse {
  result: APIExecutionResult
  success: boolean
  message?: string
}

class APIClient {
  private baseURL: string
  constructor() { this.baseURL = `${API_BASE_URL}/api/v1` }

  async analyzeCode(request: APICodeAnalysisRequest): Promise<APICodeAnalysisResponse> {
    const res = await fetch(`${this.baseURL}/analyze`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error((data && (data.detail || data.message)) || `HTTP ${res.status}`)
    return data
  }

  async executeCode(request: APICodeExecutionRequest): Promise<APICodeExecutionResponse | { success: false; result: APIExecutionResult; message?: string }> {
    const res = await fetch(`${this.baseURL}/execute`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) || `HTTP ${res.status}`
      return {
        success: false,
        result: {
          output: '',
          errors: [String(msg)],
          warnings: [],
          execution_time: 0,
          memory_used: 0,
          cpu_time: 0,
          status: 'error',
          exit_code: res.status
        },
        message: String(msg)
      }
    }
    return data
  }
}

export const apiClient = new APIClient()
