const jwt = require("jsonwebtoken");
require("dotenv").config();

const refreshToken = (token) => {
  try {
    const {
      user: { id },
    } = jwt.decode(token, process.env.jwtSecret);
    if (!id) return res.status(401).json({ msg: "Token is not valid" });

    const payload = {
      user: {
        id,
      },
    };
    token = jwt.sign(payload, process.env.jwtSecret, {
      expiresIn: 360000,
    });
    return [token, id];
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
};

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  console.log("token: ", token);
  if (!token) {
    console.log("No token, authorization denied");
    return res.status(401).json({ msg: "No token, authoraization denied" });
  }
  try {
    jwt.verify(token, process.env.jwtSecret);
    const {
      user: { id },
    } = jwt.decode(token, process.env.jwtSecret);
    console.log("id: ", id);
    req.token = token;
    req.userId = id;
    next();
  } catch (err) {
    console.log("Token is not valid");
    const [newToken, id] = refreshToken(token);
    req.token = newToken;
    console.log("newToken: ", id);
    req.userId = id;
    next();
  }
};
