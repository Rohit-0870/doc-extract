import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Mark embed mode
(window as any).__DOCINTEL_EMBED__ = true;

const roots = new Map<HTMLElement, ReactDOM.Root>();

let globalConfig: any = {};

function render(root: ReactDOM.Root) {
  root.render(<App config={globalConfig} />);
}

window.DocumentIntelUI = {
  mount(el: HTMLElement, config: any = {}) {
    if (!el) return;

    globalConfig = config;

    const root = ReactDOM.createRoot(el);

    render(root);

    roots.set(el, root);
  },

  updateConfig(newConfig: any) {
    globalConfig = { ...globalConfig, ...newConfig };

    roots.forEach((root) => render(root));
  },

  unmount(el: HTMLElement) {
    const root = roots.get(el);
    if (root) {
      root.unmount();
      roots.delete(el);
    }
  },
};