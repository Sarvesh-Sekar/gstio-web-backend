import express, { Request, Response } from "express";
import { AppDataSource } from "./dataSource/dataSource";
import userRoutes from "./modules/users/user.routes";
import cors from "cors";
import productRoutes from "./modules/products/products.routes";

const app = express();

app.use(
  cors({
    origin: ["https://gstio-web.vercel.app/",'http://localhost:3000'], // your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials:true
  })
);
app.use(express.json());
app.use("/users", userRoutes);
app.use("/products", productRoutes);

AppDataSource.initialize().then(() => {
  console.log("Database connected");
});

app.listen(4000, () => {
  console.log("Example app listening on port 3000!");
});
