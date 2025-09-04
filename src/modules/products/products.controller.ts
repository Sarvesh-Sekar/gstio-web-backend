import { ProductsService } from "./products.service";
import { Request, Response } from "express";

export class ProductsController {
  constructor(private productsService: ProductsService) {}

  getProducts = async (req: Request, res: Response) => {
    try {
      const { searchFor } = req.body;
      const response: any = await this.productsService.getProducts(searchFor);

      if (!response?.length)
        return res.status(404).json({ message: "Product Not Found" });

      return res.status(200).json(response);
    } catch (err) {
      throw err;
    }
  };

  postProduct = async (req: Request, res: Response) => {
    try {
      const {
        userId,
        productName,
        pricePerUnit,
        cgst,
        sgst,
        igst,
        productPrice,
      } = req.body;
      const productData = {
        userId,
        productName,
        pricePerUnit,
        cgst,
        sgst,
        igst,
        productPrice,
      };

      const productExists: any = await this.productsService.getProducts(
        productData.productName
      );

      if (productExists[0]?.userId === productData.userId)
        return res.status(400).json({ message: "Product Already Exists" });
      const response = await this.productsService.postProduct(productData);

      const productCode = {
        productId: response.productId,
        productCode: "PR" + String(response.productId).padStart(3, "0"),
      };

      await this.productsService.updateProduct(productCode);

      const productResponse = await this.productsService.getProducts(
        response.productName
      );

      return res.status(200).json(productResponse);
    } catch (err) {
      throw err;
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const response = await this.productsService.updateProduct(data);
      return res.status(200).json(response);
    } catch (err) {
      throw err;
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {

      const {userId,productId} = req.body;
      const deletePayload = 
      {
        userId:userId,
        productId:productId
      }
      const response = await this.productsService.deleteProduct(deletePayload);
      return res.status(200).json({message:"Product Deleted Successfully"});
    } catch (err) {
      throw err;
    }
  };
}
