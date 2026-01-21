import { HumanMessage } from "@langchain/core/messages";
import { app } from "./graph"; // or "./graph" depending on your export
import 'dotenv/config';
import { Sandbox } from '@e2b/code-interpreter';

async function main() {
    console.log("🚀 Starting the Agent...");

    // 1. Create Sandbox
    const sbx = await Sandbox.create('sathwik-dev');
    const sandboxId = sbx.sandboxId;
    console.log(`📦 Sandbox Created: ${sandboxId}`);
    await sbx.files.write('/home/user/app/vite.config.js', `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true
  }
})
`)

    // 2. Prepare Config & State
    const config = {
        configurable: {
            sandboxId: sandboxId,
            threadId: "tic-tac-toe-session-1"
        },
        recursionLimit: 250
    };

    const initialState = {
        messages: [new HumanMessage("Create a functional trello board just mvp using with great frontend and design dont use any external libraries and use only tailwind  ")],
        sandbox: {
            id: sandboxId,
            rootDir: "/home/user/app",
            previewUrl: "",
            isDevServerRunning: false
        },
        // Initialize other state fields as needed...
        directories: ["node_modules", "public", "src", "src/assets"],
        fileSystem: [
            { path: "package.json", type: "file" },
            { path: "vite.config.js", type: "file" },
            { path: "src/App.jsx", type: "file" }
        ],
        iterationCount: 0,
        currentPhase: "planning"
    };

    try {
        // 3. Run the Agent
        // The reviewer node will update 'previewUrl' in the state when done
        const result = await app.invoke(initialState, config);

        console.log("\n--- 🏁 Execution Complete ---");

        // 4. Extract URL from Final State
        if (result.sandbox.previewUrl) {
            console.log("\n===========================================");
            console.log("🎉 SUCCESS! Your App is Live:");
            console.log(`👉 ${result.sandbox.previewUrl}`);
            console.log("===========================================\n");
        } else {
            console.log("⚠️ Agent finished, but no URL was returned.");
        }

        // 5. List Generated Files (Verification)
        const files = await sbx.files.list('/home/user/app/src/components');
        console.log("📂 Generated Components:", files.map(f => f.path));

        // Keep process alive briefly if you want to inspect immediately, 
        // or just let it exit. The Sandbox stays alive for 5 mins by default.

    } catch (error) {
        console.error("❌ Graph Execution Error:", error);
    }
}

main();