import { ProductsModule } from "./products.module";
import { Router } from "express";
import {UserModule} from "../users/user.module";


const router = Router();

router.post("/getProducts", ProductsModule.controller.getProducts);
router.post("/postProduct", UserModule.middleware.verifyUser,ProductsModule.controller.postProduct);
router.post("/updateProduct", UserModule.middleware.verifyUser,ProductsModule.controller.updateProduct);
router.post("/deleteProduct", UserModule.middleware.verifyUser,ProductsModule.controller.deleteProduct);

export default router;