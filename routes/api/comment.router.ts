import express, { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  addComment,
  deleteComment,
  getComment,
  likeComment,
  updateComment,
} from "../../controllers/comment.controller";

const commentRoutes: Router = express.Router();

commentRoutes.get("/comment/:id", getComment);
commentRoutes.patch("/update-comment/:id", authMiddleware, updateComment);
commentRoutes.delete("/delete-comment/:id", authMiddleware, deleteComment);
commentRoutes.post("/like/:id", authMiddleware, likeComment);
commentRoutes.post("/commentbypost/:id", authMiddleware, addComment);

export default commentRoutes;
