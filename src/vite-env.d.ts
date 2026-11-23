/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public API origin or base path; never put credentials or secrets here. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
