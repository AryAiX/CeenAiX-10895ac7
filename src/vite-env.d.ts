/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to "false" to disable the preview PIN screen (e.g. at public launch). */
  readonly VITE_PREVIEW_PIN_GATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
