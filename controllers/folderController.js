import { validationResult, matchedData } from "express-validator";
import { isAuth, isAuthApi } from "../middlewares/auth.js";
import {
  validateFolderForm,
  validateFolderParams,
  validateParentFolderQuery,
  sanitizeContextQuery,
} from "../middlewares/validator.js";
import { prisma } from "../lib/prisma.js";

export const getFolderCreateForm = [
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
  validateFolderForm,
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

    return res.redirect(`/folders/${parentFolder.id}`);
  },
];

export const getFolderEditForm = [
  isAuth,
  validateFolderParams,
  sanitizeContextQuery,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const requestedFolder = matchedData(req);
    const folder = await prisma.folder.findFirst({
      where: {
        id: requestedFolder.id,
        userId: req.user.id,
      },
    });

    if (!folder) {
      return res
        .status(404)
        .render("errorView", { errors: [{ msg: "Folder not found" }] });
    }

    let action = `/folders/edit/${folder.id}?_method=PUT`;

    if (requestedFolder.context === "current") {
      action += "&context=current";
    }

    return res.render("folderForm", {
      folderName: folder.name,
      action: action,
      edit: true,
    });
  },
];

export const editFolder = [
  isAuth,
  validateFolderForm,
  validateFolderParams,
  sanitizeContextQuery,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (errors.array().findIndex((x) => x.location === "param") > 0) {
        return res.status(400).render("errorView", { errors: errors.array() });
      }

      return res.status(400).render("folderForm", {
        errors: errors.array(),
        folderName: req.body.name,
        action: `/folders/edit/${req.params.id}?_method=PUT`,
        edit: true,
      });
    }

    const requestedFolder = matchedData(req);
    const folder = await prisma.folder.findFirst({
      where: {
        id: requestedFolder.id,
        userId: req.user.id,
      },
    });

    if (!folder) {
      return res
        .status(404)
        .render("errorView", { errors: [{ msg: "Folder not found" }] });
    }

    const updatedFolder = await prisma.folder.update({
      where: {
        id: requestedFolder.id,
      },
      data: {
        name: requestedFolder.name,
      },
    });

    if (requestedFolder.context === "current") {
      return res.redirect(`/folders/${updatedFolder.id}`);
    }

    return res.redirect(`/folders/${updatedFolder.parentFolderId}`);
  },
];

export const getFolderView = [
  isAuth,
  validateFolderParams,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const requestedFolder = matchedData(req);
    const folder = await prisma.folder.findUnique({
      where: {
        id: requestedFolder.id,
        userId: req.user.id,
      },
      include: {
        subfolders: true,
        files: true,
      },
    });

    if (!folder) {
      return res
        .status(404)
        .render("errorView", { errors: [{ msg: "Folder not found" }] });
    }

    if (folder.parentFolderId === null) {
      return res.redirect("/dashboard");
    }

    const path =
      await prisma.$queryRaw`SELECT * FROM get_folder_path(${folder.id})`;
    path.pop();

    const fileFormErrors = req.flash("error");

    return res.render("folderView", {
      folder: folder,
      path: path.reverse(),
      errors: fileFormErrors,
    });
  },
];

export const deleteFolder = [
  isAuthApi,
  validateFolderParams,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Invalid folder ID" });
    }

    const folderId = matchedData(req).id;

    const folderToDelete = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: req.user.id,
      },
    });

    if (!folderToDelete) {
      return res.status(404).json({ msg: "Folder was not found" });
    }

    if (folderToDelete.parentFolderId === null) {
      return res
        .status(403)
        .json({ msg: "You are not allowed to perform this action" });
    }

    const folder = await prisma.folder.deleteMany({
      where: {
        id: folderId,
        userId: req.user.id,
      },
    });

    // a little bit redundant
    if (folder.count === 0) {
      return res.status(404).json({ msg: "Folder was not found" });
    }

    return res.json({
      msg: "Folder was deleted successfully",
      parentFolderId: folderToDelete.parentFolderId,
    });
  },
];
