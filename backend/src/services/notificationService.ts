import nodemailer from 'nodemailer';
import axios from 'axios';
import { logger } from '../utils/logger';

export enum NotificationChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook'
}

export interface NotificationConfig {
  channel: NotificationChannel;
  enabled: boolean;
  
  // Email config
  emailTo?: string[];
  emailFrom?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  
  // Slack config
  slackWebhookUrl?: string;
  slackChannel?: string;
  
  // Generic webhook config
  webhookUrl?: string;
  webhookMethod?: 'POST' | 'PUT';
  webhookHeaders?: Record<string, string>;
}

export interface NotificationPayload {
  scheduleId: number;
  scheduleName: string;
  queryName: string;
  executionStatus: 'success' | 'failed';
  executionTime: number;
  rowsAffected?: number;
  errorMessage?: string;
  executedAt: Date;
  resultPreview?: any[];
}

export class NotificationService {
  /**
   * Send notification through configured channel
   */
  static async sendNotification(
    config: NotificationConfig,
    payload: NotificationPayload
  ): Promise<boolean> {
    if (!config.enabled) {
      logger.info('Notification disabled, skipping', { scheduleId: payload.scheduleId });
      return false;
    }

    try {
      switch (config.channel) {
        case NotificationChannel.EMAIL:
          return await this.sendEmail(config, payload);
        case NotificationChannel.SLACK:
          return await this.sendSlack(config, payload);
        case NotificationChannel.WEBHOOK:
          return await this.sendWebhook(config, payload);
        default:
          logger.warn('Unknown notification channel', { channel: config.channel });
          return false;
      }
    } catch (error: any) {
      logger.error('Notification failed', {
        channel: config.channel,
        scheduleId: payload.scheduleId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmail(
    config: NotificationConfig,
    payload: NotificationPayload
  ): Promise<boolean> {
    if (!config.emailTo || config.emailTo.length === 0) {
      throw new Error('Email recipients not configured');
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost || process.env.SMTP_HOST || 'localhost',
      port: config.smtpPort || parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: config.smtpUser ? {
        user: config.smtpUser,
        pass: config.smtpPassword || ''
      } : undefined
    });

    const subject = payload.executionStatus === 'success'
      ? `✓ Query Executed Successfully: ${payload.queryName}`
      : `✗ Query Execution Failed: ${payload.queryName}`;

    const htmlBody = this.buildEmailHtml(payload);

    await transporter.sendMail({
      from: config.emailFrom || process.env.EMAIL_FROM || 'noreply@sqlquery.local',
      to: config.emailTo.join(','),
      subject: subject,
      html: htmlBody
    });

    logger.info('Email notification sent', {
      scheduleId: payload.scheduleId,
      recipients: config.emailTo.length
    });

    return true;
  }

  /**
   * Send Slack notification
   */
  private static async sendSlack(
    config: NotificationConfig,
    payload: NotificationPayload
  ): Promise<boolean> {
    if (!config.slackWebhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const color = payload.executionStatus === 'success' ? '#36a64f' : '#ff0000';
    const icon = payload.executionStatus === 'success' ? ':white_check_mark:' : ':x:';

    const slackMessage = {
      channel: config.slackChannel,
      attachments: [
        {
          color: color,
          title: `${icon} ${payload.queryName}`,
          text: `Schedule: ${payload.scheduleName}`,
          fields: [
            {
              title: 'Status',
              value: payload.executionStatus.toUpperCase(),
              short: true
            },
            {
              title: 'Execution Time',
              value: `${payload.executionTime}ms`,
              short: true
            },
            {
              title: 'Rows Affected',
              value: payload.rowsAffected?.toString() || 'N/A',
              short: true
            },
            {
              title: 'Executed At',
              value: payload.executedAt.toISOString(),
              short: true
            }
          ],
          footer: 'SQL Query Dashboard',
          ts: Math.floor(payload.executedAt.getTime() / 1000)
        }
      ]
    };

    if (payload.errorMessage) {
      slackMessage.attachments[0].fields.push({
        title: 'Error',
        value: payload.errorMessage,
        short: false
      });
    }

    await axios.post(config.slackWebhookUrl, slackMessage);

    logger.info('Slack notification sent', { scheduleId: payload.scheduleId });

    return true;
  }

  /**
   * Send generic webhook notification
   */
  private static async sendWebhook(
    config: NotificationConfig,
    payload: NotificationPayload
  ): Promise<boolean> {
    if (!config.webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const method = config.webhookMethod || 'POST';
    const headers = {
      'Content-Type': 'application/json',
      ...config.webhookHeaders
    };

    const webhookPayload = {
      event: 'query_execution',
      status: payload.executionStatus,
      schedule: {
        id: payload.scheduleId,
        name: payload.scheduleName
      },
      query: {
        name: payload.queryName
      },
      execution: {
        status: payload.executionStatus,
        executionTime: payload.executionTime,
        rowsAffected: payload.rowsAffected,
        executedAt: payload.executedAt.toISOString(),
        errorMessage: payload.errorMessage
      },
      results: payload.resultPreview
    };

    await axios({
      method: method,
      url: config.webhookUrl,
      headers: headers,
      data: webhookPayload
    });

    logger.info('Webhook notification sent', { scheduleId: payload.scheduleId });

    return true;
  }

  /**
   * Build HTML email body
   */
  private static buildEmailHtml(payload: NotificationPayload): string {
    const statusColor = payload.executionStatus === 'success' ? '#4CAF50' : '#f44336';
    const statusIcon = payload.executionStatus === 'success' ? '✓' : '✗';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
          .field { margin-bottom: 15px; }
          .field-label { font-weight: bold; color: #555; }
          .field-value { color: #333; }
          .error { background-color: #ffebee; padding: 10px; border-left: 4px solid #f44336; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusIcon} Query Execution ${payload.executionStatus === 'success' ? 'Successful' : 'Failed'}</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">Schedule Name:</div>
              <div class="field-value">${payload.scheduleName}</div>
            </div>
            <div class="field">
              <div class="field-label">Query Name:</div>
              <div class="field-value">${payload.queryName}</div>
            </div>
            <div class="field">
              <div class="field-label">Status:</div>
              <div class="field-value">${payload.executionStatus.toUpperCase()}</div>
            </div>
            <div class="field">
              <div class="field-label">Execution Time:</div>
              <div class="field-value">${payload.executionTime}ms</div>
            </div>
            <div class="field">
              <div class="field-label">Rows Affected:</div>
              <div class="field-value">${payload.rowsAffected || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Executed At:</div>
              <div class="field-value">${payload.executedAt.toLocaleString()}</div>
            </div>
            ${payload.errorMessage ? `
              <div class="error">
                <div class="field-label">Error Message:</div>
                <div>${payload.errorMessage}</div>
              </div>
            ` : ''}
            ${payload.resultPreview && payload.resultPreview.length > 0 ? `
              <div class="field">
                <div class="field-label">Result Preview (first 5 rows):</div>
                <pre style="background: white; padding: 10px; border: 1px solid #ddd; overflow-x: auto;">${JSON.stringify(payload.resultPreview.slice(0, 5), null, 2)}</pre>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>SQL Query Management Dashboard</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
