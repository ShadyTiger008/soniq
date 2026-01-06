import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

class EmailService {
  private transporter;

  constructor() {
    // For production, you should set these in .env
    // If not provided, it will fail to send but we'll log the error
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendSupportEmail(data: {
    name: string;
    email: string;
    type: string;
    message: string;
  }) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn("SMTP credentials not provided. Email notification skipped.");
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"SONIQ Support" <${process.env.SMTP_USER}>`,
        to: "chatterjeesoumyajeet@gmail.com",
        subject: `[SONIQ Support] New ${data.type} Reported by ${data.name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
            <h2 style="color: #1DB954;">New Support Request</h2>
            <p><strong>From:</strong> ${data.name} (${data.email})</p>
            <p><strong>Type:</strong> ${data.type}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
              ${data.message.replace(/\n/g, '<br>') || "No message provided."}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">This is an automated notification from the SONIQ Backend.</p>
          </div>
        `,
      });

      logger.info(`Support email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Error sending support email: ${error}`);
      return false;
    }
  }
}

export const emailService = new EmailService();
