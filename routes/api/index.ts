import express, { Router, Request, Response } from "express";
import userRoutes from "./user.router";

const apiRoutes: Router = express.Router();

apiRoutes.use("/auth", userRoutes)



export default apiRoutes;
