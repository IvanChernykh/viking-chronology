/// <reference types="vite/client" />

declare global {
  interface Window {
    __vikingBootComplete?: () => void;
  }
}

export {};
