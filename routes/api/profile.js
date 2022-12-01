const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const auth = require("../../middleware/auth");
const fs = require("fs");
require("dotenv").config();

const prisma = new PrismaClient();
cloudinary.config({
  secure: true,
});

const memoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: memoryStorage });

const uploadImage = async (imagePath) => {
  return await cloudinary.uploader.upload(imagePath, {
    responsive_breakpoints: {
      create_derived: true,
      bytes_step: 20000,
      min_width: 150,
      max_width: 300,
    },
  });
};

router.post("/uploadImage", auth, upload.single("image"), async (req, res) => {
  const upload = await uploadImage(req.file.path);

  fs.unlink(req.file.path, (err) => {
    if (err) {
      return;
    }
  });

  return res.json({ upload });
});

router.post(
  "/CreateProfile",
  auth,
  [
    check("profileUserName", "user name is required").not().isEmpty(),
    check("userId", "user id is required").not().isEmpty(),
  ],
  async (req, res) => {
    const { userId, bio, profileUserName, address } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return res.status(400).json({ msg: "User not found" });
      }

      const {
        user: { id },
      } = jwt.decode(req.header("x-auth-token"), process.env.jwtSectret);

      if (id != userId) {
        return res.status(401).json({ msg: "User not authorized" });
      }

      const profile = await prisma.profile.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          bio,
          profileUserName,
          address,
        },
      });
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;