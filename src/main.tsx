import { Routes } from "@generouted/react-router";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (root == null) throw new Error("Root element not found");

createRoot(root).render(<Routes />);
