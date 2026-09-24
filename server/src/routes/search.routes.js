import { Router } from "express";
import { validateSearchRequest } from "../middleware/validateSearchRequest.js";
import { searchMeetings } from "../controllers/search.controller.js";

const router = Router();

router.post("/search", validateSearchRequest, searchMeetings);

export default router;
