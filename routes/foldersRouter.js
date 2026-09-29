import { Router } from "express";

import {
  createFolder,
  getFolderForm,
  getFolderView,
} from "../controllers/folderController.js";

const foldersRouter = Router();

foldersRouter.get("/folders/new", getFolderForm);

foldersRouter.post("/folders/new", createFolder);

foldersRouter.get("/folders/:id", getFolderView);

export default foldersRouter;
