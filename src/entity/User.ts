import { PrimaryGeneratedColumn, Column, Entity, Generated } from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  userName?: string;

  @Column({ nullable: true })
  gstId?: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  role?: "companyAdmin" | "Auditor";

  @Column({ nullable: true })
  verfied: boolean;
}
