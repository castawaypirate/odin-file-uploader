import { Router } from "express";

import {
  getSharedFolderView,
  getSharedFileDetails,
  resolveShareLink,
} from "../controllers/shareController.js";

const shareRouter = Router();

shareRouter.get("/share/:token", resolveShareLink);

shareRouter.get("/share/:token/folders/:id", getSharedFolderView);

shareRouter.get("/share/:token/files/:id", getSharedFileDetails);

export default shareRouter;
