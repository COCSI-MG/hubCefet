import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { ClassCancellation } from '../classes/entities/class-cancellation.entity';
import { Op } from 'sequelize';

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

  constructor(private configService: ConfigService, @InjectModel(ClassCancellation) private classCancellationModel: typeof ClassCancellation) {
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

  async sendClassCancellationEmail(
    studentEmails: string[],
    className: string,
    subjectName: string,
    canceledDates: string[],
    reason: string,
    teacherName: string
  ): Promise<boolean> {
    const formattedDates = canceledDates.map(date => {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        if (date.includes('-')) {
          const [year, month, day] = date.split('-').map(Number);
          dateObj = new Date(year, month - 1, day);
        } else {
          dateObj = new Date(date);
        }
      } else {
        dateObj = new Date(date);
      }
      
      return dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Sao_Paulo'
      });
    }).join(', ');

    const subject = `Cancelamento de Aula - ${subjectName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .dates { background-color: #e3f2fd; padding: 10px; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚫 Cancelamento de Aula</h1>
          </div>
          <div class="content">
            <div class="alert">
              <strong>⚠️ Atenção:</strong> Uma aula foi cancelada pelo professor.
            </div>
            
            <h2>Detalhes do Cancelamento</h2>
            <p><strong>Disciplina:</strong> ${subjectName}</p>
            <p><strong>Aula:</strong> ${className}</p>
            <p><strong>Professor:</strong> ${teacherName}</p>
            
            <div class="dates">
              <strong>📅 Data(s) cancelada(s):</strong><br>
              ${formattedDates}
            </div>
            
            <h3>Motivo do Cancelamento</h3>
            <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #1976d2;">
              ${reason}
            </p>
            
            <p><strong>O que fazer agora?</strong></p>
            <ul>
              <li>Verifique se há reposição agendada</li>
              <li>Entre em contato com o professor se tiver dúvidas</li>
              <li>Acompanhe os avisos da disciplina</li>
            </ul>
          </div>
          <div class="footer">
            <p>Este é um email automático do Sistema HubCefet.<br>
            Por favor, não responda a este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
CANCELAMENTO DE AULA

Disciplina: ${subjectName}
Aula: ${className}
Professor: ${teacherName}

Data(s) cancelada(s): ${formattedDates}

Motivo: ${reason}

Este é um email automático do Sistema HubCefet.
    `;

    return this.sendEmail({
      to: studentEmails,
      subject,
      html,
      text
    });
  }

  async markCancellationsAsNotified(classId: number, canceledDates: string[]): Promise<void> {
    try {
      const dateObjects = canceledDates.map(dateStr => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      });

      await this.classCancellationModel.update(
        { studentsNotified: true },
        {
          where: {
            classId: classId,
            date: {
              [Op.in]: dateObjects
            }
          }
        }
      );

      this.logger.log(`Cancelamentos marcados como notificados para a aula ${classId}`);
    } catch (error) {
      this.logger.error(`Erro ao marcar cancelamentos como notificados: ${error.message}`, error.stack);
      throw error;
    }
  }
} 