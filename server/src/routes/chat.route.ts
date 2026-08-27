import { Router } from "express";
import { chat, generateGuide } from "../controller/chat.controller.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const chatRoutes = Router({ mergeParams: true });

chatRoutes.use(requireAuth);
chatRoutes.post("/", asyncHandler(chat));
chatRoutes.post("/guide", asyncHandler(generateGuide));
