/// <reference types="vite/client" />

// Global analytics types
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

declare const gtag: (...args: any[]) => void;
declare const dataLayer: any[];
