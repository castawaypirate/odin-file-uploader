import { isAuth } from "../middlewares/auth.js";
import { prisma } from "../lib/prisma.js";

export const getDashboardView = [
  isAuth,
  async (req, res) => {
    const rootFolder = await prisma.folder.findFirst({
      where: {
        name: "/",
        parentFolderId: null,
        userId: req.user.id,
        deletedAt: null,
      },
      include: {
        files: { where: { deletedAt: null } },
        subfolders: { where: { deletedAt: null } },
      },
    });

    const errors = req.flash("error");
    return res.render("dashboardView", { root: rootFolder, errors: errors });
  },
];
