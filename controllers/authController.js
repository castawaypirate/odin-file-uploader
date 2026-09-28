import { validationResult, matchedData } from "express-validator";
import bcrypt from "bcryptjs";
import passport from "passport";

import { prisma } from "../lib/prisma.js";
import { validateRegister, validateLogin } from "../middlewares/validator.js";

export async function getRegisterForm(req, res) {
  return res.render("registerForm");
}

export async function getLoginForm(req, res) {
  return res.render("loginForm");
}

export const createUser = [
  validateRegister,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("registerForm", { errors: errors.array(), user: req.body });
    }

    const user = matchedData(req);
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        username: user.username,
        password: hashedPassword,
      },
    });

    req.login({ id: createdUser.id }, function (err) {
      if (!err) {
        return res.redirect("/dashboard");
      } else {
        throw new Error(err);
      }
    });
  },
];

export const login = [
  validateLogin,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("loginForm", { errors: errors.array(), user: req.body });
    }

    const user = matchedData(req);

    const existingUser = await prisma.user.findFirst({
      where: {
        username: user.username,
      },
    });

    if (!existingUser) {
      return res.status(400).render("loginForm", {
        errors: [{ msg: "Wrong username or password" }],
        user: req.body,
      });
    }

    req.login({ id: existingUser.id }, function (err) {
      if (!err) {
        return res.redirect("/dashboard");
      } else {
        throw new Error(err);
      }
    });
  },
];

export async function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    res.locals.currentUser = null;
    return res.redirect("/");
  });
}
