import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ProjectState } from "./state";
import { tools } from "./toolnode";
import { ChatMistralAI } from "@langchain/mistralai";

const llm = new ChatMistralAI({
  model: "mistral-large-latest",
  temperature: 0,
  maxRetries: 2,
}).bindTools(tools);

export const coder = async (state: ProjectState) => {
  console.log("--- Coder Node Started ---");
  
  const systemPrompt = `
    You are a Senior React Developer with 10 years of experience.
    
    Current Phase: CODING
    
    Your Task:
    1. Read 'plan.md' (if you haven't already) to understand the architecture.
    2. You must implement the ACTUAL LOGIC for every file mentioned in the plan.
    3. The file structure and placeholder files have already been created by the previous agent.
    4. Use 'Write_file' to overwrite the placeholder files with the complete, working code.
    5. Ensure you use Tailwind CSS as requested.
    6.Dont change any tailwind file you are not allowed to change the tailwind.config.js at any cost.
    7. Start with utility/hook files (dependencies), then components, then App.jsx.
    8. Once every file in the plan has valid code (no placeholders left), stop calling tools.
  `;


  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
    new HumanMessage("The file structure is ready. Please implement the logic for all files now.")
  ]);

  return {
    messages: [response],
    currentPhase: "coding"
  };
};