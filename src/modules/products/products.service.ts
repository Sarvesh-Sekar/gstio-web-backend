import { Products } from "../../entity/Products";
import { AppDataSource } from "../../dataSource/dataSource";

export class ProductsService {
  constructor() {}

  getProducts = async (searchFor: string) => {
    try {
      const productRepo = AppDataSource.getRepository(Products);
      const products = await productRepo
        .createQueryBuilder("products")
        .where("products.productName like :searchFor", {
          searchFor: searchFor,
        })
        .select(["products.productId", "products.productName","products.userId"])
        .getMany();

      return products;
    } catch (err) {
      throw err;
    }
  };

  postProduct = async (data: any) => {
    try {
      const productRepo = AppDataSource.getRepository(Products);
      const product = new Products();
      product.userId = data.userId;
      product.productName = data.productName;
      product.pricePerUnit = data.pricePerUnit;
      product.cgst = data.cgst;
      product.sgst = data.sgst;
      product.igst = data.igst;
      product.productPrice = data.productPrice;
      const res = await productRepo.save(product);
      return res;
    } catch (err: any) {
      return err;
    }
  };

  updateProduct = async(data:any)=>
  {
    try
    {
      // if(!data.productId) return "Product Id is required";
       const productRepo = await AppDataSource.getRepository(Products);
       const product = await productRepo.findOneBy({productId:data.productId});
       product.productCode = data.productCode || product.productCode;
       product.productName = data.productName || product.productName;
       product.pricePerUnit = data.pricePerUnit || product.pricePerUnit;
       product.cgst = data.cgst || product.cgst;
       product.sgst = data.sgst || product.sgst;
       product.igst = data.igst || product.igst;
       product.productPrice = data.productPrice || product.productPrice;
       const res = await productRepo.save(product);
       return res;
    }
    catch(err){} 
  }


  deleteProduct = async(data:any)=>
  {
      try
      {
        
        
        const {userId,productId} = data;
        const productRepo = await AppDataSource.getRepository(Products);
        
        const products = await productRepo
        .createQueryBuilder()
        .delete()
        .from(Products)
        .where("userId = :userId", {userId:userId})
        .andWhere("productId = :productId", {productId:productId})
        .execute();
        
       
        
      
        
        return products;
    
      
       
      }
      catch(err){}
  }
}
