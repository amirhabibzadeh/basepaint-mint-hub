import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeFarcasterSDK } from "./lib/farcaster";

// Initialize Farcaster Mini App SDK
initializeFarcasterSDK().catch((error: unknown) =>
  console.error('Failed to initialize Farcaster Mini App:', error)
);

createRoot(document.getElementById("root")!).render(<App />);
