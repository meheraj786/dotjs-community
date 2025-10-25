import express, { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  checkIsLiked,
  createPost,
  getPost,
  getPosts,
  likePost,
  likesCount,
} from "../../controllers/post.controller";

const postRoutes: Router = express.Router();

postRoutes.post("/create", authMiddleware, createPost);
postRoutes.get("/posts", getPosts);
postRoutes.get("/post/:id", getPost);
postRoutes.post("/like/:id", authMiddleware, likePost);
postRoutes.get("/is-liked/:id", authMiddleware, checkIsLiked);
postRoutes.get("/likes-count/:id", likesCount);

export default postRoutes;
