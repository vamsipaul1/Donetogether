import * as ReactDOMClient from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 App mounting starting...");
try {
    const rootElement = document.getElementById("app-root");
    if (!rootElement) {
        console.error("❌ Root element (app-root) not found!");
    } else {
        // Force cleanup
        rootElement.innerHTML = '';

        // Create root and render
        const root = ReactDOMClient.createRoot(rootElement);
        root.render(<App />);
        console.log("✅ Render called successfully");
    }
} catch (error) {
    console.error("💥 Fatal mount error:", error);
}

