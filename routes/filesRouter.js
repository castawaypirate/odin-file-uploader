import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import {
  uploadFile,
  downloadFile,
  deleteFile,
  getFileDetails,
} from "../controllers/fileController.js";

const filesRouter = Router();

filesRouter.post("/upload", upload.single("file"), uploadFile);

filesRouter.use((err, req, res, next) => {
  if (err.code) {
    if (err.code === "LIMIT_FILE_TYPE") {
      req.flash("error", err.message);
    } else if (err.code === "LIMIT_FILE_SIZE") {
      req.flash("error", "File too large");
    } else {
      req.flash("error", "Upload failed");
    }
    console.error(err);
    if (req.query.context === "root") {
      return res.redirect("/dashboard");
    } else {
      return res.redirect(`/folders/${req.query.context}`);
    }
  }

  if (!req.file) {
    req.flash("error", "Please select a file to upload");
    if (req.query.context === "root") {
      return res.redirect("/dashboard");
    } else {
      return res.redirect(`/folders/${req.query.context}`);
    }
  }

  next(err);
});

filesRouter.get("/download/:id", downloadFile);

filesRouter.get("/files/:id", getFileDetails);

filesRouter.delete("/files/:id", deleteFile);

export default filesRouter;
