import { Router } from "express";

import {
  resolveShareLink,
  getSharedFolderView,
  getSharedFileDetails,
  downloadSharedFile,
} from "../controllers/shareController.js";

const shareRouter = Router();

shareRouter.get("/share/:token", resolveShareLink);

shareRouter.get("/share/:token/folders/:id", getSharedFolderView);

shareRouter.get("/share/:token/files/:id", getSharedFileDetails);

shareRouter.get("/share/:token/download/:id", downloadSharedFile);

export default shareRouter;
