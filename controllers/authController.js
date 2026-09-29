import { validationResult, matchedData } from "express-validator";
import bcrypt from "bcryptjs";
import passport from "passport";

import { prisma } from "../lib/prisma.js";
import { validateRegister, validateLogin } from "../middlewares/validator.js";

export async function getRegisterForm(req, res) {
  return res.render("registerForm");
}

export async function getLoginForm(req, res) {
  return res.render("loginForm", {
    errors: req.flash("error"),
    username: req.flash("username")[0],
  });
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
      return res.status(400).render("loginForm", {
        errors: errors.array(),
        username: req.body.username,
      });
    }

    const handler = passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/login",
      failureFlash: true,
    });
    handler(req, res, next);
  },
];

export async function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    res.locals.currentUser = null;
    return res.redirect("/");
  });
}
