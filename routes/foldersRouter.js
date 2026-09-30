import { Router } from "express";

import {
  getFolderCreateForm,
  createFolder,
  getFolderEditForm,
  editFolder,
  getFolderView,
  deleteFolder,
} from "../controllers/folderController.js";

const foldersRouter = Router();

foldersRouter.get("/folders/new", getFolderCreateForm);

foldersRouter.post("/folders/new", createFolder);

foldersRouter.get("/folders/edit/:id", getFolderEditForm);

foldersRouter.put("/folders/edit/:id", editFolder);

foldersRouter.get("/folders/:id", getFolderView);

foldersRouter.delete("/folders/:id", deleteFolder);

export default foldersRouter;
