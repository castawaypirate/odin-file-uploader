import { Router } from "express";

import homeRouter from "./homeRouter.js";
import authRouter from "./authRouter.js";
import dashboardRouter from "./dashboardRouter.js";
import foldersRouter from "./foldersRouter.js";
import fileRouter from "./filesRouter.js";

const indexRouter = Router();

indexRouter.use(homeRouter);
indexRouter.use(authRouter);
indexRouter.use(dashboardRouter);
indexRouter.use(foldersRouter);
indexRouter.use(fileRouter);

export default indexRouter;
