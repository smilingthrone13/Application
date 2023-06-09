import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider>
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
