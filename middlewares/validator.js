import { body, query, param } from "express-validator";
import { prisma } from "../lib/prisma.js";

export const validateRegister = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username cannot be empty")
    .custom(async (value) => {
      const existingUser = await prisma.user.findUnique({
        where: {
          username: value,
        },
      });
      if (existingUser) {
        throw new Error("A user already exists with this username");
      }
      return true;
    }),
  body("password").notEmpty().withMessage("Password cannot be empty"),
  body("confirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

export const validateLogin = [
  body("username").trim().notEmpty().withMessage("Username cannot be empty"),
  body("password").notEmpty().withMessage("Password cannot be empty"),
];

export const validateFolderForm = [
  body("name").trim().notEmpty().withMessage("Folder name cannot be emtpy"),
];

export const validateParentFolderQuery = [
  query("parentFolderId")
    .optional()
    .isUUID()
    .withMessage("Invalid parent folder ID"),
];

export const validateFolderParams = [
  param("id").isUUID().withMessage("Invalid folder ID"),
];
