import { validationResult, matchedData } from "express-validator";
import { validateShareToken } from "../middlewares/validator.js";
import { prisma } from "../lib/prisma.js";

export const getSharedFolderView = [
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
        folder: {
          include: {
            subfolders: true,
          },
          include: {
            files: true,
          },
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

    return res.render("sharedFolderView", { folder: shareLink.folder });
  },
];
