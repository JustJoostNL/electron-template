import { app } from "../preload";

export {};

declare global {
  interface Window {
    app: typeof app;
  }
}
