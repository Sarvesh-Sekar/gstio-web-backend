import express, { Request, Response } from "express";
import { AppDataSource } from "./dataSource/dataSource";
import userRoutes from "./modules/users/user.routes";

const app = express();

app.use(express.json());
app.use("/users", userRoutes);

AppDataSource.initialize().then(() => {
  console.log("Database connected");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
