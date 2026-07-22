import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { LeagueProvider } from "./context/LeagueContext";
import { ToastProvider } from "./context/ToastContext";

import "./styles/tokens.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/pages.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <LeagueProvider>
            <App />
          </LeagueProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
