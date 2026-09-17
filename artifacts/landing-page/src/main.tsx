import { createRoot } from "react-dom/client";
import App from "./App";
import Admin from "./pages/Admin";
import "./index.css";

const isAdmin = new URLSearchParams(window.location.search).has("admin");

createRoot(document.getElementById("root")!).render(isAdmin ? <Admin /> : <App />);
