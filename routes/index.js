import { Router } from "express";

import homeRouter from "./homeRouter.js";

const indexRouter = Router();

indexRouter.use(homeRouter);

export default indexRouter;
