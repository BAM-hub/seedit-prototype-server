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

router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {},
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        createdAt: true,
        upVote: true,
        downVote: true,
        postActions: {
          select: {
            upVote: true,
            downVote: true,
          },
        },
        comment: {
          select: {
            id: true,
            text: true,
            upVote: true,
            downVote: true,
            CommentActions: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                id: true,
                profileUserName: true,
                profilePicThumbnail: true,
              },
            },
          },
        },
      },
    });
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

router.post("/", auth, async (req, res) => {
  const { userId, title, content, image } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    const post = await prisma.post.create({
      data: {
        author: {
          connect: {
            id: parseInt(userId),
          },
        },
        title,
        content,
        image,
        published: true,
      },
    });
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

router.delete("/:id", auth, accessControl, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
      },
    });
    if (!post) {
      return res.status(400).json({ msg: "Post not found" });
    }
    const deletedPost = await prisma.post.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json(deletedPost);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
