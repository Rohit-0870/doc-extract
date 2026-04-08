export {};

declare global {
  interface Window {
    __DOCINTEL_EMBED__?: boolean;
    DocumentIntelUI?: {
      mount: (el: HTMLElement, config?: any) => void;
      unmount: (el: HTMLElement) => void;
    };
  }
}