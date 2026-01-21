import { START, StateGraph, END } from "@langchain/langgraph";
import { StateAnnotation } from "./state";
import { architect } from "./architect";
import { toolNode } from "./toolnode";
import { fileNode } from "./file";
import { coder } from "./coder";
import { reviewerNode } from "./reviewer";
import { AIMessage } from "@langchain/core/messages";

const agent = new StateGraph(StateAnnotation)
    .addNode("architect", architect)
    .addNode("file", fileNode)
    .addNode("coder", coder)
    .addNode("reviewer", reviewerNode)
    .addNode("tools", toolNode)


    .addEdge(START, "architect")

    
    .addConditionalEdges("architect", (state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if ((lastMsg as AIMessage)?.tool_calls?.length) return "tools";
        return "file";
    })
    .addConditionalEdges("file", (state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if ((lastMsg as AIMessage)?.tool_calls?.length) return "tools";
        return "coder";
    })
    .addConditionalEdges("coder", (state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if ((lastMsg as AIMessage)?.tool_calls?.length) return "tools";
        return "reviewer"; 
    })
    .addConditionalEdges("reviewer", (state) => {
        if (state.currentPhase === "end") {
            return END;
        }
        const lastMsg = state.messages[state.messages.length - 1] as AIMessage;
        if (lastMsg?.tool_calls?.length) {
            return "tools";
        }
        if (lastMsg.content.toString().toUpperCase().includes("BUILD SUCCESSFUL")) {
            return END;
        }
        return "coder";
    })
    .addConditionalEdges("tools", (state) => {
        if (state.currentPhase === "planning") return "architect";
        if (state.currentPhase === "structure") return "file";
        if (state.currentPhase === "review") return "reviewer";
        return "coder";
    });

export const app = agent.compile();