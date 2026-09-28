import { isAuth } from "../middlewares/auth.js";

export const getDashboardView = [
  isAuth,
  async (req, res) => {
    return res.render("dashboardView");
  },
];
