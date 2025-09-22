import { ProductsService } from "./products.service";
import { Request, Response } from "express";

export class ProductsController {
  constructor(private productsService: ProductsService) {}

  getProducts = async (req: Request, res: Response) => {
    try {
      const { userId, searchFor, pageNo, count,productId } = req.body;

      const fetchData = {
        userId: userId,
        searchFor: searchFor,
        productId: productId,
        offset: (pageNo - 1) * count,
        limit: count,
      };

      const response: any = await this.productsService.getProducts(fetchData);

      if (!response?.products?.length)
        return res.status(201).json({ message: "Product Not Found" });

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

      let productCode = "";
      let productData = {
        userId,
        productName,
        pricePerUnit,
        cgst,
        sgst,
        igst,
        productCode,
        productPrice,
      };



      const productExists: any = await this.productsService.getProducts({
        userId: userId,
        searchFor: productData?.productName,
        offset: 0,
        limit: 1,
      });

      if (
        productExists?.products[0]?.userId === productData.userId &&
        productExists?.products[0]?.productName === productData.productName
      )
        return res.status(400).json({ message: "Product Already Exists" });

      const lastProduct = await this.productsService.getLastEntity(
        productData?.userId
      );

      if (!lastProduct?.length)
        productData.productCode = "PR" + String(1).padStart(3, "0");
      else {
        productData.productCode =
          "PR" +
          String(Number(lastProduct[0]?.productCode.slice(3)) + 1).padStart(
            3,
            "0"
          );
      }

      const response = await this.productsService.postProduct(productData);

      const productResponse = await this.productsService.getProducts(
        response.productName
      );

      return res.status(200).json({ message: "Product Added Successfully" });
    } catch (err) {
      throw err;
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const response = await this.productsService.updateProduct(data);
      if (response === "Unauthorized")
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
        product: response,
      });
    } catch (err) {
      throw err;
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      const { userId, productId } = req.body;
      const deletePayload = {
        userId: userId,
        productId: productId,
      };
      const response = await this.productsService.deleteProduct(deletePayload);

      if (!response?.affected)
        return res
          .status(404)
          .json({ success: false, message: "Product Not Found" });

      return res
        .status(200)
        .json({ success: true, message: "Product Deleted Successfully" });
    } catch (err) {
      throw err;
    }
  };
}
