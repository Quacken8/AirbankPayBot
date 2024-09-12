import { config } from "dotenv";
import nodemailer from "nodemailer";

export function sendEmail(text: string) {
  config();
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_FROM!,
      pass: process.env.EMAIL_PASSWORD!,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM!,
    to: process.env.EMAIL_FROM!,
    subject: "Nodeapp notification",
    text,
  };

  return new Promise((res, rej) =>
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        rej(error);
      } else {
        res(info);
      }
    })
  );
}
