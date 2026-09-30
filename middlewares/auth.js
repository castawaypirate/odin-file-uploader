export async function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect("/login");
  }
}

export async function isAuthApi(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).json({ msg: "Unauthorized" });
  }
}
