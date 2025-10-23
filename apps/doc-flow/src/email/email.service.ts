import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private async createTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    const smtpSecure = this.configService.get<boolean>('SMTP_SECURE', false);

    if (!smtpHost || !smtpUser || !smtpPassword) {
      this.logger.warn('Configurações SMTP não encontradas. Emails não serão enviados.');
      return;
    }

    if (smtpHost.includes('outlook.com') || smtpHost.includes('hotmail.com')) {
      this.logger.log('🔧 Detectado Outlook/Hotmail - aplicando configuração especial');
      this.transporter = await this.createHotmailTransporter(smtpUser, smtpPassword);
    } else {
      let transportConfig: any = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      };

      if (smtpHost.includes('gmail.com')) {
        transportConfig = {
          ...transportConfig,
          service: 'gmail',
          tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
          }
        };
      } else if (smtpHost.includes('yahoo.com')) {
        transportConfig = {
          ...transportConfig,
          service: 'yahoo',
          tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
          }
        };
      } else {
        transportConfig = {
          ...transportConfig,
          tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1',
            maxVersion: 'TLSv1.3',
            ciphers: 'ALL'
          },
          requireTLS: false,
          ignoreTLS: false
        };
      }

      this.transporter = nodemailer.createTransport(transportConfig);
    }
  }

  private async createHotmailTransporter(smtpUser: string, smtpPassword: string): Promise<nodemailer.Transporter> {
    const isAppPassword = smtpPassword.length >= 16 && smtpPassword.includes('-');

    const clientId = this.configService.get<string>('OUTLOOK_CLIENT_ID');
    const clientSecret = this.configService.get<string>('OUTLOOK_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('OUTLOOK_REFRESH_TOKEN');

    if (clientId && clientSecret && refreshToken) {
      try {
        const oauthTransporter = nodemailer.createTransport({
          service: 'hotmail',
          auth: {
            type: 'OAuth2',
            user: smtpUser,
            clientId: clientId,
            clientSecret: clientSecret,
            refreshToken: refreshToken,
          },
        });

        await oauthTransporter.verify();
        return oauthTransporter;
      } catch (error) {
        this.logger.warn(`❌ OAuth2 falhou: ${error.message}. Tentando App Password...`);
      }
    }

    try {
      const appPasswordTransporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3',
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
      });

      await appPasswordTransporter.verify();
      return appPasswordTransporter;
    } catch (error) {
      this.logger.warn(`❌ App Password falhou: ${error.message}`);
    }

    try {
      const serviceTransporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3',
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
      });

      await serviceTransporter.verify();
      this.logger.log('✅ Service hotmail funcionou!');
      return serviceTransporter;
    } catch (error) {
      this.logger.warn(`❌ Service hotmail falhou: ${error.message}`);
    }

    throw new Error('Não foi possível configurar Hotmail/Outlook. Gere uma App Password ou migre para Gmail.');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Transporter não configurado. Email não enviado.');
      return false;
    }

    try {
      const fromEmail = this.configService.get<string>('SMTP_FROM', this.configService.get<string>('SMTP_USER'));
      const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'Sistema HubCefet');

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado com sucesso para ${mailOptions.to}. MessageId: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar email: ${error.message}`, error.stack);
      return false;
    }
  }
} 
