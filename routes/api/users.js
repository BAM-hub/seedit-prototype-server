const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const auth = require("../../middleware/auth");
const refresToken = require("../../middleware/refreshToken");
require("dotenv").config();

const prisma = new PrismaClient();

const nameExists = async (name) => {
  const user = await prisma.user.findUnique({
    where: {
      name: name,
    },
  });
  if (user) {
    return true;
  } else {
    return false;
  }
};

// @route   POST api/users
// @desc    Login User With JWT
// @access  Public
router.get("/", refresToken, (req, res) => {
  console.log(req.userId);
  return res.json({ token: req.token, userId: req.userId });
});

router.post(
  "/CreateUser",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be 6 or more charcters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      // see if the user exists
      const errors = await Promise.all([
        nameExists(name),
        await prisma.user.findUnique({
          where: {
            email,
          },
        }),
      ]);

      if (errors[0]) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User name already exists" }] });
      }
      if (errors[1]) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email already exists" }] });
      }
      // encrypt the password

      const salt = await bcrypt.genSalt(10);

      let hashPassword = await bcrypt.hash(password, salt);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashPassword,
        },
      });
      // return jwt

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.jwtSecret,
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

router.get("/GetUsers", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {},
      select: {
        email: true,
        name: true,
        createdAt: true,
        profile: {
          select: {
            profilePicThumbnail: true,
          },
        },
      },
    });
    return res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

router.get("/GetUser/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      select: {
        email: true,
        name: true,
        createdAt: true,
        profile: {
          select: {
            profilePicThumbnail: true,
          },
        },
      },
    });
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

router.delete("/DeleteUser/:id", auth, async (req, res) => {
  try {
    const {
      user: { id },
    } = jwt.decode(req.header("x-auth-token"), process.env.jwtSectret);

    if (id != req.params.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await prisma.user.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    return res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

router.post(
  "/Login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          password: true,
          profile: {
            select: {
              id: true,
              profilePicThumbnail: true,
              profilePic: true,
              bio: true,
              profileUserName: true,
              address: true,
            },
          },
        },
      });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(payload, process.env.jwtSecret, {
        expiresIn: 36000,
      });
      delete user.password;
      return res.json({
        token,
        user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
