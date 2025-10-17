import express, { Router} from "express";
import { login, logout, register } from "../../controllers/user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const userRoutes: Router = express.Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.post("/logout", authMiddleware, logout);



export default userRoutes;
