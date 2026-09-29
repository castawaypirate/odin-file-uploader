import { isAuth } from "../middlewares/auth.js";
import { prisma } from "../lib/prisma.js";

export const getDashboardView = [
  isAuth,
  async (req, res) => {
    const rootFolder = await prisma.folder.findFirst({
      where: {
        name: "/",
        parentFolderId: null,
      },
      include: {
        files: true,
        subfolders: true,
      },
    });
    console.log(rootFolder);
    return res.render("dashboardView", { root: rootFolder });
  },
];
