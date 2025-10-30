import express, { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  checkIsLiked,
  createPost,
  getPost,
  getPosts,
  getPostsByTag,
  getTrendingTopics,
  likePost,
  likesCount,
} from "../../controllers/post.controller";
import { upload } from "../../middleware/multer.middleware";

const postRoutes: Router = express.Router();

postRoutes.post("/create", authMiddleware, upload.single("image"), createPost);
postRoutes.get("/posts", getPosts);
postRoutes.get("/post/:id", getPost);
postRoutes.post("/like/:id", authMiddleware, likePost);
postRoutes.get("/is-liked/:id", authMiddleware, checkIsLiked);
postRoutes.get("/likes-count/:id", likesCount);
postRoutes.get("/trending-topics", getTrendingTopics);
postRoutes.get("/tag/:tag", getPostsByTag);

export default postRoutes;
