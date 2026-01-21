import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ProjectState } from "./state";
import { ChatMistralAI } from "@langchain/mistralai";
import { tools } from "./toolnode";

const llm = new ChatMistralAI({
    model: "mistral-large-latest",
    temperature: 0,
    maxRetries: 2,
}).bindTools(tools);

export const fileNode = async (state: ProjectState) => {
    console.log("--- File/Structure Node Started ---");

    const systemPrompt = `
    You are a Structural Engineer agent. 
    
    GOAL: Create the directory structure and EMPTY placeholder files based on 'plan.md'.
    
    ROOT DIRECTORY: /home/user/app

    RULES:
    1. Read 'plan.md' to understand the folder structure.

    2. Use 'Make_dir' to create all necessary folders (src/components, src/hooks, etc.).
    3. Use 'Write_file' to create *NEW* files (e.g., Board.jsx, useTicTacToe.js).
    4. **CRITICAL SAFETY**: Do NOT overwrite 'vite.config.js', 'package.json', 'src/main.jsx', 'index.html', or 'src/App.jsx' if they already exist.
    5. For new files, write ONLY a comment: "// Placeholder content".
    6. Do NOT write the actual implementation logic yet.
    `;

    const triggerMessage = new HumanMessage("The plan is created. Please execute the file structure creation now.");

    const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        ...state.messages,
        triggerMessage 
    ]);

    return {
        messages: [response],
        currentPhase: "structure",
    };
};