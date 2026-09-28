import { Router } from "express";

import homeRouter from "./homeRouter.js";
import authRouter from "./authRouter.js";
import dashboardRouter from "./dashboardRouter.js";

const indexRouter = Router();

indexRouter.use(homeRouter);
indexRouter.use(authRouter);
indexRouter.use(dashboardRouter);

export default indexRouter;
