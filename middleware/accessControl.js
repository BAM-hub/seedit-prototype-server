const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  const authId = parseInt(req.header("x-auth-id"));

  console.log("token: ", token);
  if (!token) {
    return res.status(401).json({ msg: "User not authorized" });
  }

  try {
    const {
      user: { id },
    } = jwt.decode(token, process.env.jwtSecret);
    console.log({ id, authId });
    console.log(authId !== id);
    if (authId !== id)
      return res.status(401).json({ msg: "User not authorized" });
    req.token = token;
    req.userId = id;
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
};
