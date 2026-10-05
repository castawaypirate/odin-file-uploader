import { matchedData, validationResult } from "express-validator";
import { format } from "date-fns";
import * as mod from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { formatBytes } from "../lib/utils.js";
import {
  sanitizeContextQuery,
  validateFileParams,
} from "../middlewares/validator.js";

export const uploadFile = [
  sanitizeContextQuery,
  async (req, res) => {
    const context = matchedData(req).context;
    let folder;
    if (context === "root") {
      folder = await prisma.folder.findFirst({
        where: {
          name: "/",
          parentFolderId: null,
          userId: req.user.id,
        },
      });
    } else {
      folder = await prisma.folder.findFirst({
        where: {
          id: context,
          userId: req.user.id,
        },
      });
    }

    if (!folder) {
      return res.status(404).render("errorView", {
        errors: [
          {
            msg: "The folder you are trying to upload to does not exist or may have been deleted.",
          },
        ],
      });
    }

    await prisma.file.create({
      data: {
        filename: req.file.originalname,
        path: req.file.path.replace("public", ""),
        size: req.file.size,
        folderId: folder.id,
        userId: req.user.id,
      },
    });

    if (context === "root") {
      return res.redirect("/dashboard");
    }

    return res.redirect(`/folders/${folder.id}`);
  },
];

export const downloadFile = [
  validateFileParams,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }
    const file = matchedData(req);

    const fileToDownload = await prisma.file.findFirst({
      where: {
        id: file.id,
        userId: req.user.id,
      },
    });

    if (!fileToDownload) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "File not found" }],
      });
    }

    let filePath = path.join(process.cwd(), "public", fileToDownload.path);
    return res.download(filePath, fileToDownload.filename, (err) => {
      if (err) {
        console.error(err);
      }
    });
  },
];

export const deleteFile = [
  validateFileParams,
  sanitizeContextQuery,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const file = matchedData(req);

    const fileToDelete = await prisma.file.findFirst({
      where: {
        id: file.id,
        userId: req.user.id,
      },
    });

    if (!fileToDelete) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "File not found" }],
      });
    }

    const fileDeleted = await prisma.file.deleteMany({
      where: {
        id: fileToDelete.id,
        userId: req.user.id,
      },
    });

    // a little bit redundant
    if (fileDeleted.count === 0) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "File not found" }],
      });
    }

    try {
      let filePath = path.join(process.cwd(), "public", fileToDelete.path);
      await mod.unlink(filePath);
    } catch (err) {
      console.error(err);
    }

    if (file.context === "root") {
      return res.redirect("/dashboard");
    }

    return res.redirect(`/folders/${fileToDelete.folderId}`);
  },
];

export const getFileDetails = [
  validateFileParams,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const fileId = matchedData(req).id;

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId: req.user.id,
      },
    });

    if (!file) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "File not found" }],
      });
    }

    file.size = formatBytes(Number(file.size));
    file.uploadedAt = format(new Date(file.uploadedAt), "dd-MM-yyyy");

    return res.render("fileDetailsView", { file: file });
  },
];
