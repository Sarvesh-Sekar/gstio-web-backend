import { PrimaryGeneratedColumn, Column, Entity, ManyToOne,AfterInsert } from "typeorm";
import {User} from "./User";
import {AppDataSource} from "../dataSource/dataSource";

@Entity({ name: "products" })
export class Products {
  @PrimaryGeneratedColumn("increment")
  productId: number;

  @Column({nullable:true})
  productCode: string;

  @Column()
  userId: string;

  @Column()
  productName: string;

  @Column()
  pricePerUnit: number;

  @Column()
  cgst: number;

  @Column()
  sgst: number;

  @Column()
  igst: number;

  @Column()
  productPrice: number;

  @ManyToOne(() => User, (user) => user.products)
  user: User;


}
