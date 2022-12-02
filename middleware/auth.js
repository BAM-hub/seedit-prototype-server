const jwt = require("jsonwebtoken");
require("dotenv").config();

const refreshToken = (token) => {
  try {
    const { user } = jwt.decode(token, process.env.jwtSecret);
    if (!user) return res.status(401).json({ msg: "Token is not valid" });

    const payload = {
      user: {
        id: user,
      },
    };
    token = jwt.sign(payload, process.env.jwtSecret, {
      expiresIn: 360000,
    });
    return token;
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
};

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    console.log("No token, authorization denied");
    return res.status(401).json({ msg: "No token, authoraization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    req.token = token;
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log("Token is not valid");
    const newToken = refreshToken(token);
    req.user = user;
    req.token = newToken;
    next();
  }
};
