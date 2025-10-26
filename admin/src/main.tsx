import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import AdminForecastsWrapper from "./PrivateForecasts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminForecastsWrapper />
  </React.StrictMode>
);
