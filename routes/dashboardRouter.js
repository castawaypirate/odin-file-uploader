import { Router } from "express";

import { getDashboardView } from "../controllers/dashboardController.js";

const dashboardRouter = Router();

dashboardRouter.get("/dashboard", getDashboardView);

export default dashboardRouter;
