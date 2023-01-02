const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const auth = require("../../middleware/auth");
const fs = require("fs");
const accessControl = require("../../middleware/accessControl");
require("dotenv").config();

const prisma = new PrismaClient();
cloudinary.config({
  secure: true,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

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

router.post(
  "/uploadProfileImage/:id",

  upload.single("image"),
  async (req, res) => {
    // console.log(req.body);
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ msg: "User not found" });
    console.log(req.userId, "uploadProfileImage");

    // if (req.userId !== id) {
    //   fs.unlink(req.file.path, (err) => {
    //     if (err) {
    //       console.log(err);
    //     }
    //   });
    //   return res.status(401).json({ msg: "Not authorized" });
    // }
    console.log(req.file);
    const upload = await uploadImage(req.file.path);
    const { responsive_breakpoints } = upload;
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log(err);
      }
    });
    const profile = await prisma.profile.update({
      where: {
        userId: id,
      },
      data: {
        profilePic: responsive_breakpoints[0].breakpoints[0].url,
        profilePicThumbnail: responsive_breakpoints[0].breakpoints[1].url,
      },
    });

    return res.json({ profile });
  }
);

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

router.put(
  "/UpdateProfile/:id",
  auth,
  accessControl,
  [check("profileUserName", "user name is required").not().isEmpty()],
  async (req, res) => {
    const { userId } = req;
    const { bio, profileUserName, address } = req.body;
    if (!validationResult(req).isEmpty()) {
      console.log(validationResult(req));
      return res.status(400).json({ msg: "Invalid data" });
    }
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return res.status(400).json({ msg: "User not found" });
      }

      const profile = await prisma.profile.update({
        where: {
          userId: userId,
        },
        data: {
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

router.get("/getProfile/:id", auth, async (req, res) => {
  console.log(req.userId, "getProfile");
  const id = parseInt(req.params.id);
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: id,
      },
    });
    if (!profile) {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
