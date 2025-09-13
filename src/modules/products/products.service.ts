import { Products } from "../../entity/Products";
import { AppDataSource } from "../../dataSource/dataSource";

export class ProductsService {
  constructor() {}

  getProducts = async (payload: any) => {
    try {
      const productRepo = AppDataSource.getRepository(Products);
      const [products, totalCount]: any = await productRepo
        .createQueryBuilder("products")
        .where("products.productName ILIKE :searchFor", {
          searchFor: `%${payload.searchFor}%`,
        })
        .andWhere("products.userId = :userId", {
          userId: payload.userId,
        })
        .skip(payload?.offset)
        .take(payload?.limit)
        .select([
          "products.productId",
          "products.productName",
          "products.userId",
        ])
        .getManyAndCount();

      return {
        products: products,
        totalCount: totalCount,
        itemsPerPage: payload.limit,
        currentPage: payload.offset + 1,
        totalPages: Math.ceil(totalCount / payload.limit),
      };

      // const searchCondtion =
      // {
      //   productName:payload?.searchFor,
      //   userId:payload?.userId
      // }

      // const {productName,...rest} = searchCondtion
      // const whereCondition = !payload?.searchFor?.length ? rest:searchCondtion
      // const [products,totalCount] = await productRepo.findAndCount({
      //   where: whereCondition,
      //   skip:payload.offset,
      //   take:payload.limit,
      //   select:["productId","productName","userId"],

      // })

      // return {
      //   products:products,
      //   totalCount:totalCount,
      //   itemsPerPage:payload.limit,
      //   currentPage:(payload.offset+1)/10,
      //   totalPages:Math.ceil(totalCount/payload.limit)

      // };
    } catch (err) {
      throw err;
    }
  };

  postProduct = async (data: any) => {
    try {
      const productRepo = AppDataSource.getRepository(Products);
      const product = new Products();
      product.userId = data.userId;
      product.productCode = data.productCode;
      product.productName = data.productName;
      product.pricePerUnit = data.pricePerUnit;
      product.cgst = data.cgst;
      product.sgst = data.sgst;
      product.igst = data.igst;
      product.productPrice = data.productPrice;
      const res = await productRepo.save(product);
      return res;
    } catch (err: any) {
      throw err;
    }
  };

  updateProduct = async (data: any) => {
    try {
      // if(!data.productId) return "Product Id is required";
      const productRepo = await AppDataSource.getRepository(Products);
      const product = await productRepo.findOneBy({
        productId: data.productId,
      });
      product.productCode = data.productCode || product.productCode;
      product.productName = data.productName || product.productName;
      product.pricePerUnit = data.pricePerUnit || product.pricePerUnit;
      product.cgst = data.cgst || product.cgst;
      product.sgst = data.sgst || product.sgst;
      product.igst = data.igst || product.igst;
      product.productPrice = data.productPrice || product.productPrice;
      const res = await productRepo.save(product);
      return res;
    } catch (err) {
      throw err;
    }
  };

  deleteProduct = async (data: any) => {
    try {
      const { userId, productId } = data;
      const productRepo = await AppDataSource.getRepository(Products);

      const products = await productRepo
        .createQueryBuilder()
        .delete()
        .from(Products)
        .where("userId = :userId", { userId: userId })
        .andWhere("productId = :productId", { productId: productId })
        .execute();

      return products;
    } catch (err) {
      throw err;
    }
  };

  getLastEntity = async (userId: string) => {
    try {
      const productRepo = AppDataSource.getRepository(Products);
      const res = await productRepo.find({
        where: { userId: userId },
        order: { productId: "DESC" },
        take: 1,
        select: 
        {
          productId:true,
          productCode:true
        },
      });

      return res;
    } catch (err) {
      throw err;
    }
  };
}
