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

  private getTemplate(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background: #1a1633; padding: 30px 20px; text-align: center; }
          .logo { font-size: 24px; font-weight: 800; color: #D65DF2; letter-spacing: -1px; text-decoration: none; }
          .content { padding: 40px 30px; }
          .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888; }
          h2 { color: #1a1633; margin-top: 0; }
          .label { font-weight: bold; color: #6C2BD9; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { margin-bottom: 20px; font-size: 16px; }
          .message-box { background: #f8f8f8; border-left: 4px solid #D65DF2; padding: 20px; border-radius: 4px; margin-top: 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #6C2BD9; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">SONIQ</span>
          </div>
          <div class="content">
            <h2 style="color: #6C2BD9;">${title}</h2>
            ${content}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} SONIQ. All rights reserved.<br>
            Automated Notification System
          </div>
        </div>
      </body>
      </html>
    `;
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
      const html = this.getTemplate(
        "New Support Request",
        `
        <p class="label">SUBMITTED BY</p>
        <div class="value">${data.name} (<a href="mailto:${data.email}" style="color: #6C2BD9;">${data.email}</a>)</div>
        
        <p class="label">ISSUE TYPE</p>
        <div class="value">${data.type}</div>
        
        <p class="label">MESSAGE</p>
        <div class="message-box">
          ${data.message.replace(/\n/g, "<br>")}
        </div>
        `
      );

      const info = await this.transporter.sendMail({
        from: `"SONIQ Support" <${process.env.SMTP_USER}>`,
        to: "chatterjeesoumyajeet@gmail.com",
        subject: `[SONIQ Support] New ${data.type} Reported by ${data.name}`,
        html,
        replyTo: data.email
      });

      logger.info(`Support email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Error sending support email: ${error}`);
      return false;
    }
  }

  async sendUserAutoReply(data: { name: string; email: string; type: string }) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn("SMTP credentials not provided. Auto-reply skipped.");
      return false;
    }

    try {
      const html = this.getTemplate(
        "We Received Your Request",
        `
        <p>Hi ${data.name},</p>
        <p>Thanks for reaching out to SONIQ Support. We have received your query regarding <strong>"${data.type}"</strong>.</p>
        <p>Our team is reviewing your request and will get back to you shortly if any further information is needed.</p>
        <p>In the meantime, feel free to explore more rooms or create your own vibe!</p>
        <div style="text-align: center;">
           <a href="https://soniq-lime.vercel.app" class="button">Back to SONIQ</a>
        </div>
        `
      );

      const info = await this.transporter.sendMail({
        from: `"SONIQ Support" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: `We received your request: ${data.type}`,
        html
      });

      logger.info(`Auto-reply sent to ${data.email}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Error sending auto-reply: ${error}`);
      return false;
    }
  }
}

export const emailService = new EmailService();
