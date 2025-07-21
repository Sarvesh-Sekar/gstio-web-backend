import express, { Request, Response } from "express";
import { AppDataSource } from "./dataSource/dataSource";
import userRoutes from "./modules/users/user.routes";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);

AppDataSource.initialize().then(() => {
  console.log("Database connected");
});

app.listen(4000, () => {
  console.log("Example app listening on port 3000!");
});
