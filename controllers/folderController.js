import { validationResult, matchedData } from "express-validator";
import { isAuth, isAuthApi } from "../middlewares/auth.js";
import {
  validateFolderForm,
  validateFolderParams,
  validateParentFolderQuery,
  sanitizeContextQuery,
  validateShareExpiration,
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
          deletedAt: null,
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
      if (errors.array().findIndex((x) => x.location === "query") !== -1) {
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
          deletedAt: null,
        },
        include: {
          subfolders: { where: { deletedAt: null } },
        },
      });
    } else {
      parentFolder = await prisma.folder.findFirst({
        where: {
          name: "/",
          parentFolderId: null,
          userId: req.user.id,
          deletedAt: null,
        },
        include: {
          subfolders: { where: { deletedAt: null } },
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
        deletedAt: null,
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
      if (errors.array().findIndex((x) => x.location === "param") !== -1) {
        return res.status(400).render("errorView", { errors: errors.array() });
      }

      return res.status(400).render("folderForm", {
        errors: errors.array(),
        folderName: req.body.name,
        action: req.query.context
          ? `/folders/edit/${req.params.id}?_method=PUT&context=${req.query.context}`
          : `/folders/edit/${req.params.id}?_method=PUT`,
        edit: true,
      });
    }

    const requestedFolder = matchedData(req);

    const folder = await prisma.folder.findFirst({
      where: {
        id: requestedFolder.id,
        userId: req.user.id,
        deletedAt: null,
      },
    });

    if (!folder) {
      return res
        .status(404)
        .render("errorView", { errors: [{ msg: "Folder not found" }] });
    }

    let parentFolder;
    if (folder.parentFolderId) {
      parentFolder = await prisma.folder.findFirst({
        where: {
          id: folder.parentFolderId,
          userId: req.user.id,
          deletedAt: null,
        },
        include: {
          subfolders: { where: { deletedAt: null } },
        },
      });
    } else {
      parentFolder = await prisma.folder.findFirst({
        where: {
          name: "/",
          parentFolderId: null,
          userId: req.user.id,
          deletedAt: null,
        },
        include: {
          subfolders: { where: { deletedAt: null } },
        },
      });
    }

    if (!parentFolder) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "Parent folder not found" }],
      });
    }

    if (
      parentFolder.subfolders.find((x) => x.name === requestedFolder.name) &&
      requestedFolder.name !== folder.name
    ) {
      return res.status(400).render("folderForm", {
        errors: [
          { msg: "A folder with this name already exists in this location" },
        ],
        folderName: requestedFolder.name,
        action: req.query.context
          ? `/folders/edit/${folder.id}?_method=PUT&context=${requestedFolder.context}`
          : `/folders/edit/${folder.id}?_method=PUT`,
        edit: true,
      });
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
        deletedAt: null,
      },
      include: {
        subfolders: { where: { deletedAt: null } },
        files: { where: { deletedAt: null } },
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
        deletedAt: null,
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

    // previous implementation: hard delete
    // const folder = await prisma.folder.deleteMany({
    //   where: {
    //     id: folderId,
    //     userId: req.user.id,
    //   },
    // });

    try {
      await prisma.$transaction(async (tx) => {
        const folders =
          await tx.$queryRaw`SELECT * FROM get_folder_descendants(${folderToDelete.id})`;

        const folderIds = folders.map((x) => x.id);

        const softDeletedFolders = await tx.folder.updateMany({
          where: {
            id: {
              in: folderIds,
            },
            userId: req.user.id,
          },
          data: {
            deletedAt: new Date(),
          },
        });

        if (softDeletedFolders.count === 0) {
          throw new Error("FOLDER_NOT_FOUND");
        }

        await tx.file.updateMany({
          where: {
            folderId: {
              in: folderIds,
            },
            userId: req.user.id,
          },
          data: {
            deletedAt: new Date(),
          },
        });
      });

      return res.json({
        msg: "Folder was deleted successfully",
        parentFolderId: folderToDelete.parentFolderId,
      });
    } catch (err) {
      if (err.message === "FOLDER_NOT_FOUND") {
        return res.status(404).json({ msg: "Folder was not found" });
      }
      console.error(err);

      return res
        .status(500)
        .json({ msg: "An error occurred while deleting folder" });
    }
  },
];

export const getShareFolderLinks = [
  validateFolderParams,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const folderId = matchedData(req).id;

    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: req.userId,
        deletedAt: null,
      },
      include: {
        shareLinks: true,
      },
    });

    if (!folder) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "Folder not found" }],
      });
    }

    const url = req.protocol + "://" + req.get("host");

    return res.render("shareFolderLinks", { folder: folder, url: url });
  },
];

export const generateShareLink = [
  validateFolderParams,
  validateShareExpiration,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (errors.array().findIndex((x) => x.location === "params") !== -1) {
        return res.status(400).render("errorView", { errors: errors.array() });
      }

      return res.status(400).render("shareFolderLinks", {
        errors: errors.array(),
        folderId: req.params.id,
      });
    }

    const data = matchedData(req);

    const folder = await prisma.folder.findFirst({
      where: {
        id: data.id,
        userId: req.userId,
        deletedAt: null,
      },
    });

    if (!folder) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "Folder not found" }],
      });
    }

    const duration = data.expiration;

    let expiresAt = null;
    if (duration !== "never") {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(duration.slice(0, -1)));
    }

    const newShareLink = await prisma.shareLink.create({
      data: {
        expiresAt: expiresAt,
        folder: {
          connect: {
            id: folder.id,
          },
        },
      },
    });

    return res.redirect(`/folders/${folder.id}/share`);
  },
];
