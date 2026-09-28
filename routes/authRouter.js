import { Router } from "express";

import {
  getRegisterForm,
  getLoginForm,
  createUser,
  login,
  logout,
} from "../controllers/authController.js";

const authRouter = Router();

authRouter.get("/register", getRegisterForm);
authRouter.get("/login", getLoginForm);

authRouter.post("/register", createUser);
authRouter.post("/login", login);

authRouter.get("/logout", logout);

export default authRouter;
