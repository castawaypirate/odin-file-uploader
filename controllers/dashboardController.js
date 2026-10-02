import { isAuth } from "../middlewares/auth.js";
import { prisma } from "../lib/prisma.js";

export const getDashboardView = [
  isAuth,
  async (req, res) => {
    const rootFolder = await prisma.folder.findFirst({
      where: {
        name: "/",
        parentFolderId: null,
        userId: req.userId,
      },
      include: {
        files: true,
        subfolders: true,
      },
    });
    const errors = req.flash("error");
    return res.render("dashboardView", { root: rootFolder, errors: errors });
  },
];
