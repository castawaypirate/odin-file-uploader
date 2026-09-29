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

export const validateFolder = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Folder name cannot be emtpy")
    .custom(async (value, { req }) => {
      let parentFolder;
      if (req.query.parentFolderId) {
        parentFolder = await prisma.folder.findUnique({
          where: {
            id: req.query.parentFolderId,
          },
          include: {
            subfolders: true,
          },
        });
      } else {
        parentFolder = await prisma.folder.findFirst({
          where: {
            name: "/",
            parentFolderId: null,
          },
          include: {
            subfolders: true,
          },
        });
      }
      if (parentFolder.subfolders.find((x) => x.name === value)) {
        throw new Error(
          "A folder with this name already exists in this location",
        );
      }
      req.resolvedParentFolder = parentFolder;
      return true;
    }),
];

export const validateFolderParams = [param("id").isUUID()];
