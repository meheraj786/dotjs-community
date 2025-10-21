import express, { Router, Request, Response } from "express";
import userRoutes from "./user.router";
import postRoutes from "./post.router";
import commentRoutes from "./comment.router";

const apiRoutes: Router = express.Router();

apiRoutes.use("/auth", userRoutes)
apiRoutes.use("/post", postRoutes)
apiRoutes.use("/comment", commentRoutes)



export default apiRoutes;
