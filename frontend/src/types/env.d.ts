/// <reference types="vite/client" />

/**
 * Type definitions for environment variables
 */

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

