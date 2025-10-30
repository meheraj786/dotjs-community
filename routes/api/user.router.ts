import express, { Router } from "express";
import {
  followUser,
  getAllUser,
  getUser,
  login,
  logout,
  register,
  unfollowUser,
} from "../../controllers/user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const userRoutes: Router = express.Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.post("/logout", authMiddleware, logout);
userRoutes.get("/get-user", authMiddleware, getUser);
userRoutes.get("/get-users", getAllUser);
userRoutes.post("/:id/follow", authMiddleware, followUser);
userRoutes.post("/:id/unfollow", authMiddleware, unfollowUser);

export default userRoutes;
