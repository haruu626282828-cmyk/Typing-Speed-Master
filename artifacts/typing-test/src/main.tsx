import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// VITE_API_BASE_URL lets Cloudflare Pages (or any static host) point API
// requests at the separately-deployed backend, e.g.:
//   VITE_API_BASE_URL=https://my-app.replit.app/api
// When unset, requests are relative and rely on the proxy (dev / Replit prod).
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
