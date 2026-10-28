
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { CHAT_MODEL } from "../lib/ai-config.js";
import { findSourcesByWorkspaceId } from "../repository/source.repository.js";
import type { ArtifactRecord } from "../repository/artifact.repository.js";
import { ValidationError } from "../types/app-error.js";

const MAX_CONTEXT_CHARS = 120_000;

const flashcardsSchema = z.object({
    cards: z.array(
        z.object({
            front: z.string(),
            back: z.string(),
        }),
    ).min(3).max(30),
});

const quizSchema = z.object({
    questions: z.array(
        z.object({
            question: z.string(),
            options: z.array(z.string()).min(2).max(5),
            correctIndex: z.number().int().min(0),
            explanation: z.string(),
        }),
    ).min(3).max(15),
});

const mindmapSchema = z.object({
    nodes: z.array(
        z.object({
            id: z.string(),
            label: z.string(),
        }),
    ).min(2).max(40),
    edges: z.array(
        z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
        }),
    ),
});

const takeawaysSchema = z.object({
    items: z.array(z.string()).min(3).max(20),
});

const reportSchema = z.object({
    markdown: z.string(),
    sections: z.array(
        z.object({
            title: z.string(),
            content: z.string(),
        }),
    ),
});

function cleanWebsiteContent(content: string): string {
    const lines = content.split(/\r?\n/);
    const cleaned: string[] = [];

    const unwantedHeadings = [
        "suggested searches",
        "popular searches",
        "related articles",
        "related stories",
        "latest news",
        "recent highlights",
        "explore more",
        "you may also like",
        "recommended articles",
        "follow us",
        "footer",
    ];

    let skipSection = false;
    let skipLevel = 0;

    for (const line of lines) {
        const heading = line.match(/^(#{1,6})\s+(.+)$/);

        if (heading) {
            const level = heading[1]!.length;
            const title = heading[2]!
                .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                .trim()
                .toLowerCase();

            if (skipSection && level <= skipLevel) {
                skipSection = false;
            }

            if (
                unwantedHeadings.some(
                    (unwanted) =>
                        title === unwanted ||
                        title.startsWith(`${unwanted}:`),
                )
            ) {
                skipSection = true;
                skipLevel = level;
                continue;
            }
        }

        if (skipSection) continue;

        if (/^\s*(skip to content|back to top)\s*$/i.test(line)) {
            continue;
        }

        cleaned.push(line);
    }

    return cleaned
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export async function gatherSourceContext(
    workspaceId: string,
    sourceIds?: string[],
) {
    const sources = await findSourcesByWorkspaceId(workspaceId, {
        status: "READY",
    });

    const selected = sourceIds?.length
        ? sources.filter((source) => sourceIds.includes(source.id))
        : sources;

    if (selected.length === 0) {
        throw new ValidationError(
            "No ready sources found. Add and process sources before generating learning tools.",
        );
    }

    const withContent = selected.flatMap((source) => {
        const rawContent = source.content?.trim();

        if (!rawContent) return [];

        const content =
            source.type === "WEBSITE"
                ? cleanWebsiteContent(rawContent)
                : rawContent;

        return content
            ? [{ title: source.title, content }]
            : [];
    });

    if (withContent.length === 0) {
        throw new ValidationError(
            "Selected sources have no extracted content yet.",
        );
    }

    const text = withContent
        .map((source) => `# ${source.title}\n\n${source.content}`)
        .join("\n\n---\n\n")
        .slice(0, MAX_CONTEXT_CHARS);

    return {
        text,
        sourceIds: selected.map((source) => source.id),
    };
}

export async function generateArtifactContent(
    type: ArtifactRecord["type"],
    sourceText: string,
) {
    const system = [
        "You are Chaibook, an expert source-grounded learning assistant.",
        "Use ONLY the provided source content.",
        "Never invent facts, numbers, dates, events, or citations.",
        "Focus on the primary subject of each source.",
        "Ignore website navigation, menus, search suggestions, promotional links, footers, and unrelated recommended articles.",
        "Do not summarize unrelated news merely because it appears in a scraped webpage.",
        "Prefer meaningful explanations over lists of URLs.",
        "If information is missing, explicitly acknowledge the limitation.",
        "For markdown output, use valid Markdown syntax.",
        "Do not escape Markdown headings, bullet markers, or link syntax.",
        "Do not wrap the entire response in a code fence.",
        "Be accurate, concise, educational, and well-structured.",
    ].join("\n");

    switch (type) {
        case "SUMMARY": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                prompt: [
                    "Write a focused Markdown summary of the main subject.",
                    "Start with a short overview.",
                    "Then provide 3-6 meaningful sections covering the most important facts.",
                    "Avoid unrelated topics, navigation links, and recent news unless central to the source.",
                    "End with a brief conclusion.",
                    "Keep the summary approximately 300-500 words when enough information is available.",
                    "",
                    "SOURCE MATERIAL:",
                    sourceText,
                ].join("\n"),
            });

            return { markdown: result.text.trim() };
        }

        case "TAKEAWAYS": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: takeawaysSchema }),
                prompt: [
                    "Extract 5-10 important, distinct takeaways.",
                    "Each takeaway must contain a useful fact or concept.",
                    "Avoid generic observations, promotional content, and unrelated links.",
                    "Use only supported source information.",
                    "",
                    "SOURCE MATERIAL:",
                    sourceText,
                ].join("\n"),
            });

            return result.output;
        }

        case "FLASHCARDS": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: flashcardsSchema }),
                prompt: [
                    "Create useful study flashcards from the main concepts.",
                    "Each front should ask one clear question.",
                    "Each back should give a concise, source-supported answer.",
                    "Avoid duplicate questions and website navigation topics.",
                    "",
                    "SOURCE MATERIAL:",
                    sourceText,
                ].join("\n"),
            });

            return result.output;
        }

        case "QUIZ": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: quizSchema }),
                prompt: [
                    "Create a multiple-choice quiz about the source's main subject.",
                    "Provide one correct answer per question.",
                    "Make distractors plausible but clearly distinguishable.",
                    "Explain each correct answer using supported source facts.",
                    "Avoid unrelated website content.",
                    "",
                    "SOURCE MATERIAL:",
                    sourceText,
                ].join("\n"),
            });

            return result.output;
        }

        case "MINDMAP": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: mindmapSchema }),
                prompt: [
                    "Create a logically structured mind map.",
                    "Use one central topic and meaningful branches.",
                    "Include only concepts relevant to the main subject.",
                    "Every edge must reference valid node IDs.",
                    "",
                    "SOURCE MATERIAL:",
                    sourceText,
                ].join("\n"),
            });

            return result.output;
        }

        case "REPORT": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: reportSchema }),
                prompt: [
                    "Write a structured educational report focused on the source's main subject.",
                    "Include an overview, key findings, supporting details, and conclusion.",
                    "Keep sections distinct and relevant.",
                    "Exclude navigation links, unrelated news, and unsupported claims.",
                    "Return both the complete Markdown report and structured sections.",
                    "",
                    "SOURCE MATERIAL:",
                    sourceText,
                ].join("\n"),
            });

            return result.output;
        }

        default:
            throw new ValidationError(
                `Unsupported artifact type: ${type}`,
            );
    }
}
