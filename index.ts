import "dotenv/config";
import express, { Application } from "express";
import routers from "./routes/index.js";
import { dbConnect } from "./database/db.config.js";

const app: Application = express();
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await dbConnect();
    app.use(express.json());
    app.use(routers);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Something went wrong:", error);
  }
})();
