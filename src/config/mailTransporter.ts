const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 567,
  secure: false,
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.MAIL_PASS,
  },
});


