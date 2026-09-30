import { validationResult, matchedData } from "express-validator";
import { isAuth, isAuthApi } from "../middlewares/auth.js";
import {
  validateCreateFolder,
  validateFolderParams,
  validateParentFolderQuery,
} from "../middlewares/validator.js";
import { prisma } from "../lib/prisma.js";

export const getFolderForm = [
  isAuth,
  validateParentFolderQuery,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const parentFolderId = matchedData(req).parentFolderId;

    if (parentFolderId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentFolderId,
          userId: req.userId,
        },
      });

      if (!parentFolder) {
        return res.status(404).render("errorView", {
          errors: [{ msg: "Parent folder not found" }],
        });
      }

      return res.render("folderForm", { parentFolderId: parentFolderId });
    }

    return res.render("folderForm");
  },
];

export const createFolder = [
  isAuth,
  validateCreateFolder,
  validateParentFolderQuery,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (errors.array().findIndex((x) => x.location === "query") > 0) {
        return res.status(400).render("errorView", { errors: errors.array() });
      }

      return res.status(400).render("folderForm", {
        errors: errors.array(),
        folderName: req.body.name,
      });
    }

    const folder = matchedData(req);

    let parentFolder;
    if (folder.parentFolderId) {
      parentFolder = await prisma.folder.findFirst({
        where: {
          id: folder.parentFolderId,
          userId: req.user.id,
        },
        include: {
          subfolders: true,
        },
      });
    } else {
      parentFolder = await prisma.folder.findFirst({
        where: {
          name: "/",
          parentFolderId: null,
          userId: req.user.id,
        },
        include: {
          subfolders: true,
        },
      });
    }

    if (!parentFolder) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "Parent folder not found" }],
      });
    }

    if (parentFolder.subfolders.find((x) => x.name === folder.name)) {
      return res.status(400).render("folderForm", {
        errors: [
          { msg: "A folder with this name already exists in this location" },
        ],
        folderName: folder.name,
        parentFolderId: folder.parentFolderId,
      });
    }

    const newFolder = await prisma.folder.create({
      data: {
        name: folder.name,
        parentFolder: {
          connect: {
            id: parentFolder.id,
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
      include: {
        subfolders: true,
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
