import express, { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createPost,
  getPost,
  getPosts,
  likePost,
} from "../../controllers/post.controller";
import {
  deleteComment,
  getComment,
  likeComment,
  updateComment,
} from "../../controllers/comment.controller";

const commentRoutes: Router = express.Router();

commentRoutes.post("/create", authMiddleware, createPost);
commentRoutes.get("/comment/:id", getComment);
commentRoutes.patch("/update-comment/:id", updateComment);
commentRoutes.delete("/delete-comment/:id", deleteComment);
commentRoutes.post("/like/:id", authMiddleware, likeComment);
commentRoutes.get("/commentbypost/:id", authMiddleware, likeComment);

export default commentRoutes;
