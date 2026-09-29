import { validationResult, matchedData } from "express-validator";
import { isAuth } from "../middlewares/auth.js";
import {
  validateFolder,
  validateFolderParams,
} from "../middlewares/validator.js";
import { prisma } from "../lib/prisma.js";

export const getFolderForm = [
  isAuth,
  async (req, res) => {
    return res.render("folderForm");
  },
];

export const createFolder = [
  isAuth,
  validateFolder,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("folderForm", {
        errors: errors.array(),
        folderName: req.body.name,
      });
    }

    const folder = matchedData(req);

    const newFolder = await prisma.folder.create({
      data: {
        name: folder.name,
        parentFolder: {
          connect: {
            id: req.resolvedParentFolder.id,
          },
        },
        user: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.redirect(`/folders/${newFolder.id}`);
  },
];

export const getFolderView = [
  isAuth,
  validateFolderParams,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("folderView", { errors: errors.array() });
    }

    const requestedFolder = matchedData(req);
    const folder = await prisma.folder.findUnique({
      where: {
        id: requestedFolder.id,
      },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res
        .status(404)
        .render("folderView", { error: [{ msg: "Folder not found" }] });
    }
    return res.render("folderView", { folder: folder });
  },
];
