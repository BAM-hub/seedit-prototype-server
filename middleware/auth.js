const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    console.log("No token, authorization denied");
    return res.status(401).json({ msg: "No token, authoraization denied" });
  }
  try {
    jwt.verify(token, process.env.jwtSecret);
    req.token = token;
    req.userId = jwt.decode(token, process.env.jwtSecret).user.id;
    next();
  } catch (err) {
    console.log("Token is not valid");
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
