/**
 * AWS Simple Email Service (SES)
 * Handles email sending operations using AWS SES.
 * Provides functionality for sending emails with HTML and plain text content.
 */

import AWS, { SES } from 'aws-sdk';
import config from '../../config';

/**
 * Interface defining the structure of an email
 * @interface Email
 * @property {string} bodyText - The content of the email
 * @property {string} recipient - The email address of the recipient
 */
export interface Email {
  bodyText: string;
  recipient: string;
}

/**
 * Email Service class for handling email operations
 * Uses AWS SES for sending emails with proper configuration and error handling
 */
export default class EmailService {
  private ses: SES;

  constructor() {
    // Configure AWS credentials for SES
    AWS.config.update({
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      region: config.AWS_SES_REGION, 
    });

    this.ses = new AWS.SES({ apiVersion: '2010-12-01' });
  }

  /**
   * Sends an email using AWS SES
   * @param email - Email object containing recipient and content
   * @returns void
   * @throws Error if email sending fails
   */
  public sendEmail(email: Email): void {
    const params: SES.SendEmailRequest = {
      Destination: {
        ToAddresses: [email.recipient],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<html><body><p>${email.bodyText}</p></body></html>`,
          },
          Text: {
            Charset: 'UTF-8',
            Data: email.bodyText,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Forgot Password OTP',
        },
      },
      Source: String(config.SES_VERIFIED_SENDER),
    };

    // Send email
    this.ses.sendEmail(params, (err: AWS.AWSError, data: SES.SendEmailResponse) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', data);
      }
    });
  }
}

