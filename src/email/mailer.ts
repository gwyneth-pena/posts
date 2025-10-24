import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export async function sendMail(to: string, resetLink: string) {
  const templatePath = path.join(
    process.cwd(),
    "src/templates",
    "reset-password.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");

  html = html.replace("{{RESET_LINK}}", resetLink);

  await transporter.sendMail({
    from: '"MyPosts" <no-reply@myposts.com>',
    to,
    subject: "Password Reset",
    html,
  });
}
