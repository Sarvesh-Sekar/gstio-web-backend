import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "invoice" })
export class InvoiceDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoiceId: string;

  @Column()
  gstId: string;

  @Column()
  companyName: string;

  @Column()
  amount: number;

  @Column()
  gst: number;

  @Column()
  cgst: number;

  @Column()
  sgst: number;

  @Column()
  igst: number;

  @Column()
  status: string;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  date: Date;
}
