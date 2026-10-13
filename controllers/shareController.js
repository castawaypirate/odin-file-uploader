import { validationResult, matchedData } from "express-validator";
import { format } from "date-fns";
import { Readable } from "node:stream";
import {
  validateFileParams,
  validateFolderParams,
  validateShareToken,
} from "../middlewares/validator.js";
import { prisma } from "../lib/prisma.js";
import { formatBytes } from "../lib/utils.js";

export const resolveShareLink = [
  validateShareToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const token = matchedData(req).token;

    const shareLink = await prisma.shareLink.findUnique({
      where: {
        token: token,
      },
      include: {
        folder: true,
      },
    });

    if (!shareLink) {
      return res.status(404).render("errorView", {
        errors: [
          { msg: "This share link is invalid, expired, or no longer exists" },
        ],
      });
    }

    const now = new Date();
    const expiresAt = new Date(shareLink.expiresAt);

    if (expiresAt && now > expiresAt) {
      return res.status(410).render("errorView", {
        errors: [{ msg: "This share link has expired" }],
      });
    }

    return res.redirect(`/share/${token}/folders/${shareLink.folder.id}`);
  },
];

export const getSharedFolderView = [
  validateShareToken,
  validateFolderParams,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const params = matchedData(req);

    const token = params.token;

    const shareLink = await prisma.shareLink.findUnique({
      where: {
        token: token,
        folder: {
          deletedAt: null,
        },
      },
    });

    if (!shareLink) {
      return res.status(404).render("errorView", {
        errors: [
          { msg: "This share link is invalid, expired, or no longer exists" },
        ],
      });
    }

    const now = new Date();
    const expiresAt = new Date(shareLink.expiresAt);

    if (expiresAt && now > expiresAt) {
      return res.status(410).render("errorView", {
        errors: [{ msg: "This share link has expired" }],
      });
    }

    const folders =
      await prisma.$queryRaw`SELECT * FROM get_folder_descendants(${shareLink.folderId})`;

    const folderIds = folders.map((x) => x.id);

    if (!folderIds.includes(params.id)) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "Folder not found" }],
      });
    }

    const path =
      await prisma.$queryRaw`SELECT * FROM get_folder_path(${params.id})`;

    const index = path.findIndex((x) => x.id === folderIds[0]);

    const sharedPath = path.slice(0, index + 1).reverse();

    const sharedFolder = await prisma.folder.findUnique({
      where: {
        id: params.id,
      },
      include: {
        subfolders: { where: { deletedAt: null } },
        files: { where: { deletedAt: null } },
      },
    });

    return res.render("sharedFolderView", {
      token: shareLink.token,
      folder: sharedFolder,
      path: sharedPath,
    });
  },
];

export const getSharedFileDetails = [
  validateShareToken,
  validateFileParams,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const params = matchedData(req);

    const token = params.token;

    const shareLink = await prisma.shareLink.findUnique({
      where: {
        token: token,
        folder: {
          deletedAt: null,
        },
      },
    });

    if (!shareLink) {
      return res.status(404).render("errorView", {
        errors: [
          { msg: "This share link is invalid, expired, or no longer exists" },
        ],
      });
    }

    const now = new Date();
    const expiresAt = new Date(shareLink.expiresAt);

    if (expiresAt && now > expiresAt) {
      return res.status(410).render("errorView", {
        errors: [{ msg: "This share link has expired" }],
      });
    }

    const folders =
      await prisma.$queryRaw`SELECT * FROM get_folder_descendants(${shareLink.folderId})`;

    const folderIds = folders.map((x) => x.id);

    const file = await prisma.file.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!folderIds.includes(file.folderId) || !file) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "File not found" }],
      });
    }

    file.size = formatBytes(Number(file.size));
    file.uploadedAt = format(new Date(file.uploadedAt), "dd-MM-yyyy");

    return res.render("sharedFileDetailsView", {
      token: params.token,
      folderId: file.folderId,
      file: file,
    });
  },
];

export const downloadSharedFile = [
  validateShareToken,
  validateFileParams,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }
    const params = matchedData(req);

    const token = params.token;

    const shareLink = await prisma.shareLink.findUnique({
      where: {
        token: token,
        folder: {
          deletedAt: null,
        },
      },
    });

    if (!shareLink) {
      return res.status(404).render("errorView", {
        errors: [
          { msg: "This share link is invalid, expired, or no longer exists" },
        ],
      });
    }

    const now = new Date();
    const expiresAt = new Date(shareLink.expiresAt);

    if (expiresAt && now > expiresAt) {
      return res.status(410).render("errorView", {
        errors: [{ msg: "This share link has expired" }],
      });
    }

    const folders =
      await prisma.$queryRaw`SELECT * FROM get_folder_descendants(${shareLink.folderId})`;

    const folderIds = folders.map((x) => x.id);

    const file = await prisma.file.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!folderIds.includes(file.folderId) || !file) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "File not found" }],
      });
    }

    try {
      const fetchResponse = await fetch(file.secureUrl);

      if (!fetchResponse.ok) {
        return res.status(502).render("errorView", {
          errors: [{ msg: "Failed to retrieve file from storage provider" }],
        });
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.filename}"`,
      );

      Readable.fromWeb(fetchResponse.body).pipe(res);
    } catch (err) {
      console.error(err);

      return res.status(502).render("errorView", {
        errors: [{ msg: "Failed to retrieve file from storage provider" }],
      });
    }
  },
];

