import { ProductsController} from "./products.controller";
import { ProductsService } from "./products.service";

export const ProductsModule = {
    controller: new ProductsController(new ProductsService()),
};