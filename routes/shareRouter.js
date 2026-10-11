import { Router } from "express";

import { getSharedFolderView } from "../controllers/shareController.js";

const shareRouter = Router();

shareRouter.get("/share/:token", getSharedFolderView);

export default shareRouter;
