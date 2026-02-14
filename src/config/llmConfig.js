const DEFAULT_TIMEOUT_MS = 30_000

export const llmConfig = {
  provider: (import.meta.env.VITE_LLM_PROVIDER || 'gemini').toLowerCase(),
  apiKey: import.meta.env.VITE_LLM_API_KEY || '',
  model: import.meta.env.VITE_LLM_MODEL || 'gemini-2.0-flash',
  timeoutMs: DEFAULT_TIMEOUT_MS,
  maxRetries: 3,
  openAiEndpoint: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions'
}

export const isLLMConfigured = () => Boolean(llmConfig.apiKey)
