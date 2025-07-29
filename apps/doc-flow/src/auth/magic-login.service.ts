import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MagicLink } from './entities/magic-link.entity';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Role } from '../roles/entities/role.entity';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { Op } from 'sequelize';
import { generateMagicLoginEmailTemplate, MagicLoginEmailData } from './templates/magic-login-email.template';

@Injectable()
export class MagicLoginService {
  private readonly logger = new Logger(MagicLoginService.name);

  constructor(
    @InjectModel(MagicLink)
    private readonly magicLinkModel: typeof MagicLink,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async requestMagicLink(email: string): Promise<{ message: string }> {
    const user = await this.validateUserForMagicLogin(email);
    await this.cleanupExpiredTokens(user.id);
    
    const token = this.generateSecureToken();
    const expiresAt = this.calculateExpirationTime();
    
    await this.createMagicLinkRecord(user.id, token, expiresAt);
    await this.sendMagicLinkEmail(user, token);

    this.logger.log(`Magic link enviado para ${email}`);
    
    return {
      message: 'Link de acesso enviado para seu email. Verifique sua caixa de entrada.',
    };
  }

  async verifyMagicLink(token: string): Promise<User> {
    const magicLink = await this.findValidMagicLink(token);
    
    if (!magicLink) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    await this.markTokenAsUsed(magicLink);
    this.logger.log(`Magic link verificado com sucesso para usuário ${magicLink.user.email}`);
    
    return magicLink.user;
  }

  async cleanupAllExpiredTokens(): Promise<number> {
    const result = await this.magicLinkModel.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: new Date() } },
          { used: true },
        ],
      },
    });

    this.logger.log(`Limpeza automática: ${result} tokens expirados/usados removidos`);
    return result;
  }

  private async validateUserForMagicLogin(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email },
      include: [
        {
          model: Profile,
          attributes: ['id', 'name'],
          include: [
            {
              model: Role,
              attributes: ['id', 'name'],
              through: {
                attributes: []
              }
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado no sistema');
    }

    const profileName = user.profile?.name?.toLowerCase();
    if (profileName !== 'student' && profileName !== 'aluno') {
      throw new BadRequestException('Magic Login disponível apenas para estudantes');
    }

    return user;
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  private calculateExpirationTime(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    return expiresAt;
  }

  private async createMagicLinkRecord(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.magicLinkModel.create({
      user_id: userId,
      token,
      expires_at: expiresAt,
      used: false,
    });
  }

  private async findValidMagicLink(token: string): Promise<any> {
    return await this.magicLinkModel.findOne({
      where: {
        token,
        used: false,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
      include: [
        { 
          model: this.userModel, 
          as: 'user', 
          include: [
            {
              model: Profile,
              attributes: ['id', 'name'],
              include: [
                {
                  model: Role,
                  attributes: ['id', 'name'],
                  through: {
                    attributes: []
                  }
                },
              ],
            },
          ],
        }
      ],
    });
  }

  private async markTokenAsUsed(magicLink: any): Promise<void> {
    await magicLink.update({ used: true });
  }

  private buildMagicUrl(token: string): string {
    const frontendUrl = this.configService.get<string>('FRONT_REDIRECT_URL', 'http://localhost:5173');
    return `${frontendUrl}/auth/magic-login?token=${token}`;
  }

  private async sendMagicLinkEmail(user: User, token: string): Promise<void> {
    const magicUrl = this.buildMagicUrl(token);
    
    const emailData: MagicLoginEmailData = {
      userName: user.full_name,
      magicUrl,
    };

    const emailHtml = generateMagicLoginEmailTemplate(emailData);
    
    const success = await this.emailService.sendEmail({
      to: user.email,
      subject: '🔐 Seu Link de Acesso - DocFlow CEFET',
      html: emailHtml,
    });
    
    if (!success) {
      this.logger.error(`Falha ao enviar magic link para ${user.email}`);
      throw new BadRequestException('Erro ao enviar email. Tente novamente.');
    }
  }

  private async cleanupExpiredTokens(userId: string): Promise<void> {
    await this.magicLinkModel.destroy({
      where: {
        user_id: userId,
        [Op.or]: [
          { expires_at: { [Op.lt]: new Date() } },
          { used: true },
        ],
      },
    });
  }
} 
 