import { matchedData, validationResult } from "express-validator";
import { format } from "date-fns";
import path from "node:path";
import { Readable } from "node:stream";
import { prisma } from "../lib/prisma.js";
import { cloudinary } from "../config/cloudinary.js";
import { formatBytes } from "../lib/utils.js";
import {
  sanitizeContextQuery,
  validateFileParams,
  validateFilename,
} from "../middlewares/validator.js";

export const uploadFile = [
  sanitizeContextQuery,
  async (req, res) => {
    if (!req.file) {
      req.flash("error", "Please select a file to upload");
      if (req.query.context === "root") {
        return res.redirect("/dashboard");
      } else {
        return res.redirect(`/folders/${req.query.context}`);
      }
    }
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

    try {
      const fileBuffer = req.file.buffer;

      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        folder: process.env.CLOUDINARY_FOLDER,
      };

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER,
          },
          (error, result) => {
            if (error) {
              reject(error); // jumps to catch (err)
            } else {
              resolve(result); // hands 'result' back to 'uploadResult'
            }
          },
        );
        // pipe data inside the promise
        Readable.from(fileBuffer).pipe(stream);
      });

      await prisma.file.create({
        data: {
          filename: req.file.originalname,
          filetype: path
            .extname(req.file.originalname)
            .toLowerCase()
            .replace(".", ""),
          // path: req.file.path.replace("public", ""),
          publicId: uploadResult.public_id,
          secureUrl: uploadResult.secure_url,
          size: req.file.size,
          folderId: folder.id,
          userId: req.user.id,
        },
      });

      if (context === "root") {
        return res.redirect("/dashboard");
      }

      return res.redirect(`/folders/${folder.id}`);
    } catch (err) {
      console.error(err);

      return res.redirect(
        context === "root" ? "/dashboard" : `/folders/${folder.id}`,
      );
    }
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

    try {
      const fetchResponse = await fetch(fileToDownload.secureUrl);

      if (!fetchResponse.ok) {
        return res.status(502).render("errorView", {
          errors: [{ msg: "Failed to retrieve file from storage provider" }],
        });
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileToDownload.filename}"`,
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

export const updateFile = [
  validateFileParams,
  sanitizeContextQuery,
  validateFilename,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("errorView", { errors: errors.array() });
    }

    const file = matchedData(req);

    const fileToUpdate = await prisma.file.findFirst({
      where: {
        id: file.id,
        userId: req.user.id,
      },
    });

    if (!fileToUpdate) {
      return res.status(404).render("errorView", {
        errors: [{ msg: "File not found" }],
      });
    }

    await prisma.file.update({
      where: {
        id: fileToUpdate.id,
      },
      data: { filename: `${file.filename}.${fileToUpdate.filetype}` },
    });

    if (file.context === "root") {
      return res.redirect("/dashboard");
    }

    return res.redirect(`/folders/${fileToUpdate.folderId}`);
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

    try {
      const deleteResult = await new Promise((resolve, reject) => {
        const deleteFile = cloudinary.uploader.destroy(
          fileToDelete.publicId,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
      });

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

      if (file.context === "root") {
        return res.redirect("/dashboard");
      }

      return res.redirect(`/folders/${fileToDelete.folderId}`);
    } catch (err) {
      console.error(err);

      return res.redirect(
        file.context === "root"
          ? "/dashboard"
          : `/folders/${fileToDelete.folderId}`,
      );
    }
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
