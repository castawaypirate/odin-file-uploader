import express from "express";
import session from "express-session";
import passport from "passport";
import { prisma } from "./lib/prisma.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import path from "path";
import { fileURLToPath } from "url";
import favicon from "serve-favicon";

import indexRouter from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;

// app.use(favicon(path.join(__dirname, "favicon.ico")));

const staticPath = path.join(__dirname, "public");
app.use(express.static(staticPath));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.set("trust proxy", 1);

app.use("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRouter);

app.use((req, res, next) => {
  res.status(err.statusCode || 500).send(err.message);
});

app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Running on Node version: ${process.version}`);
  console.log(`App listening at port: ${port}`);
});
