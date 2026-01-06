import { Request, Response } from "express";
import { SupportModel } from "../models/support.model.js";
import { emailService } from "../services/email.service.js";

export const submitSupportRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, type, message } = req.body;

    if (!name || !email || !type || !message) {
      res.status(400).json({
        success: false,
        message: "All fields are required"
      });
      return;
    }

    // 1. Save to Database
    const supportRequest = await SupportModel.create({
      name,
      email,
      type,
      message,
      status: "PENDING"
    });

    // 2. Send Emails in Parallel
    // We execute both email tasks concurrently to reduce API response time
    const [adminEmailResult] = await Promise.allSettled([
      emailService.sendSupportEmail({ name, email, type, message }),
      emailService.sendUserAutoReply({ name, email, type })
    ]);

    // 3. Update Email Sent Status in DB based on Admin Email success
    const isEmailSent = adminEmailResult.status === 'fulfilled' && adminEmailResult.value === true;

    if (isEmailSent) {
      supportRequest.isEmailSent = true;
      await supportRequest.save();
    }

    res.status(201).json({
      success: true,
      message: "Report submitted successfully. We will get back to you soon!",
      data: supportRequest
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit support request"
    });
  }
};
