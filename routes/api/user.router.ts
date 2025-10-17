import express, { Router} from "express";
import { followUser, login, logout, register, unfollowUser } from "../../controllers/user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const userRoutes: Router = express.Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.post("/logout", authMiddleware, logout);
userRoutes.post("/:id/follow", authMiddleware, followUser);
userRoutes.post("/:id/unfollow", authMiddleware, unfollowUser);



export default userRoutes;
