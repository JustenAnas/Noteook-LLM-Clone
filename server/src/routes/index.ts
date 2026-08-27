import type { Express } from "express";
import { workspaceRoutes } from "./workspace.routes.js";
import { sourceRoutes } from "./source.route.js";
import { chatRoutes } from "./chat.route.js";

export function registerRoutes(app:Express):void{
    workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
    workspaceRoutes.use("/:workspaceId/chat", chatRoutes);
    app.use("/api/workspaces" , workspaceRoutes)
}