const jwt = require("jsonwebtoken");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const findUserAndSignToken = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.jwtSecret, {
      expiresIn: 360000,
    });
    return token;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
};

module.exports = async function (req, res, next) {
  // Get token from the header
  const token = req.header("x-auth-token");
  //check if no token
  if (!token) {
    console.log("No token, authorization denied");
    return res.status(401).json({ msg: "No token, authoraization denied" });
  }
  // veryfy token
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    req.token = token;
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log("Token is not valid");
    const { user } = jwt.decode(token, process.env.jwtSecret);
    if (!user) return res.status(401).json({ msg: "Token is not valid" });
    const newToken = await findUserAndSignToken(user.id);
    req.user = user;
    req.token = newToken;
    next();
  }
};
