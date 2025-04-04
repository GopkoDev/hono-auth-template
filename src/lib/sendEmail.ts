import nodemailer from 'nodemailer';
import { config } from '../../envconfig.js';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

interface MailOptions {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ email, subject, html }: MailOptions) => {
  const transportOptions: SMTPTransport.Options = {
    service: config.smtp.service,
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  const mailOptions = {
    from: config.smtp.from,
    to: email,
    subject,
    html,
  };

  const transporter = nodemailer.createTransport(transportOptions);

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('[NODEMAILER] Error sending email:', error);
  }
};
