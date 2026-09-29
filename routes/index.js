import { Router } from "express";

import homeRouter from "./homeRouter.js";
import authRouter from "./authRouter.js";
import dashboardRouter from "./dashboardRouter.js";
import foldersRouter from "./foldersRouter.js";

const indexRouter = Router();

indexRouter.use(homeRouter);
indexRouter.use(authRouter);
indexRouter.use(dashboardRouter);
indexRouter.use(foldersRouter);

export default indexRouter;
