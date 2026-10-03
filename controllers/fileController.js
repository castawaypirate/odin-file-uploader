import { matchedData } from "express-validator";
import { prisma } from "../lib/prisma.js";
import { sanitizeContextQuery } from "../middlewares/validator.js";

export const uploadFile = [
  sanitizeContextQuery,
  async (req, res) => {
    if (!req.file) {
      req.flash("error", "Please select a file to upload");
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

export const deleteFile = [async (req, res) => {}];
