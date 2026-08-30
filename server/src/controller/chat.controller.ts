import type { Request, Response } from "express";
import { streamText, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { CHAT_MODEL } from "../lib/ai-config.js";
import { buildChatSystemPrompt, retrieveWorkspaceContext } from "../lib/rag/retrieve.js";
import prisma from "../lib/db.js";

// POST /api/workspaces/:workspaceId/chat
export async function chat(req: Request, res: Response) {
    const { workspaceId } = req.params;
    const { messages, sourceIds } = req.body;
    
    // Get the last user message to query the vector DB
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage?.content || "";
    
    try {
        console.log("Received messages:", JSON.stringify(messages, null, 2));
        
        // Retrieve relevant context, optionally filtered by selected sourceIds
        const chunks = await retrieveWorkspaceContext(workspaceId, query, sourceIds);
        const systemPrompt = buildChatSystemPrompt({ chunks });

        const coreMessages = messages.map((m: any) => {
            let content = m.content;
            if (content === undefined && m.parts && Array.isArray(m.parts)) {
                content = m.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('\n');
            }
            return {
                role: m.role,
                content: content || "",
            };
        });

        // Stream the LLM response back to the client using Vercel AI SDK
        const result = await streamText({
            model: openai(CHAT_MODEL),
            system: systemPrompt,
            messages: coreMessages,
        });

        result.pipeUIMessageStreamToResponse(res);
    } catch (error) {
        console.error("Error in chat controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// POST /api/workspaces/:workspaceId/chat/guide
export async function generateGuide(req: Request, res: Response) {
    const { workspaceId } = req.params;
    const { tool, sourceIds } = req.body;

    if (!sourceIds || sourceIds.length === 0) {
        res.status(400).json({ error: "No sources selected" });
        return;
    }

    // Fetch the full content of the selected sources from Prisma
    const sources = await prisma.source.findMany({
        where: { id: { in: sourceIds }, workspaceId },
        select: { title: true, content: true }
    });

    const context = sources.map(s => `Title: ${s.title}\n${s.content}`).join("\n\n---\n\n");

    const systemPrompt = `You are a helpful educational assistant. Your task is to generate a comprehensive markdown document for the requested tool: ${tool}. 
    Use the following source materials. Do NOT invent facts outside of these sources. Format your output in clean Markdown.`;

    const result = await generateText({
        model: openai(CHAT_MODEL),
        system: systemPrompt,
        prompt: `Please generate a ${tool} based on the provided sources:\n\n${context}`,
    });

    res.json({ text: result.text });
}
