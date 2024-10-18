import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AuthContextProvider } from "./context/AuthContext";
import { SiteDetailsContextProvider } from "./context/SiteDetailsContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  //<React.StrictMode>
  <React.Fragment>
    <AuthContextProvider>
      <SiteDetailsContextProvider>
        <App />
      </SiteDetailsContextProvider>
    </AuthContextProvider>
  </React.Fragment>
  //</React.StrictMode>
);
