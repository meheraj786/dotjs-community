import express, { Router} from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { createPost, getPost, getPosts, likePost } from "../../controllers/post.controller";

const postRoutes: Router = express.Router();

postRoutes.post("/create", authMiddleware, createPost);
postRoutes.get("/posts", getPosts);
postRoutes.get("/post/:id", getPost);
postRoutes.post("/like/:id", authMiddleware, likePost);



export default postRoutes;
