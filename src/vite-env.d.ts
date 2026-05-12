/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** HuggingFace embedding model ID. See src/lib/modelConfig.ts for the fallback. */
  readonly HF_EMBEDDING_MODEL?: string;
  /** HuggingFace chat / output-generation model ID. */
  readonly HF_CHAT_MODEL?: string;
  /** HuggingFace prompt-optimizer model ID. */
  readonly HF_OPTIMIZER_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
