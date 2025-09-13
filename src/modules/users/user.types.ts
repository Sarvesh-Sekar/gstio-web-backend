export type typeUser = {
  email: string;
  password: string;
  userName?: string;
  gstId?: string;
  companyName?: string;
  role?: "companyAdmin" | "Auditor";
  verified?: boolean;
  userId?: string;
};
