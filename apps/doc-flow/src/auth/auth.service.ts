import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { SignUpAuthDto } from './dto/singup-auth.dto';
import { MagicLoginService } from './magic-login.service';
import { MagicLoginRequestDto } from './dto/magic-login-request.dto';
import { MagicLoginVerifyDto } from './dto/magic-login-verify.dto';
import { ProfileService } from 'src/profile/profile.service';

const UNAUTHED_SIGNUP_PROFILE = 'student';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private magicLoginService: MagicLoginService,
    private profileService: ProfileService,
  ) {}

  private async authenticate(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const isPasswordMatching = await compare(password, user.password);
    if (!isPasswordMatching) {
      return null;
    }
    return user;
  }

  private async generateJwtPayloadAndGetAccessToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.full_name,
      profile: user.profile,
    };

    return await this.jwtService.signAsync(payload);
  }

  private async hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  async signIn(signInDto: SignInAuthDto): Promise<{ access_token: string }> {
    const authenticateUser = await this.authenticate(
      signInDto.email,
      signInDto.password,
    );
    if (!authenticateUser) {
      return null;
    }
    const accessToken =
      await this.generateJwtPayloadAndGetAccessToken(authenticateUser);
    return {
      access_token: accessToken,
    };
  }

  async signUp(signupDto: SignUpAuthDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(signupDto.email);

    const defaultProfile = await this.profileService.findByProfileName(
      UNAUTHED_SIGNUP_PROFILE,
    );

    if (!defaultProfile) {
      throw new Error('Default profile not found');
    }

    if (user) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.hashPassword(signupDto.password);
    const newUser = await this.usersService.create({
      email: signupDto.email,
      password: hashedPassword,
      enrollment: signupDto.enrollment,
      full_name: signupDto.fullName,
      profileId: defaultProfile?.id,
    });
    const accessToken = await this.generateJwtPayloadAndGetAccessToken(
      newUser.data.user,
    );
    return {
      access_token: accessToken,
    };
  }

  async requestMagicLogin(
    requestDto: MagicLoginRequestDto,
  ): Promise<{ message: string }> {
    return await this.magicLoginService.requestMagicLink(requestDto.email);
  }

  async verifyMagicLogin(
    verifyDto: MagicLoginVerifyDto,
  ): Promise<{ access_token: string }> {
    const user = await this.magicLoginService.verifyMagicLink(verifyDto.token);

    const accessToken = await this.generateJwtPayloadAndGetAccessToken(user);
    return {
      access_token: accessToken,
    };
  }
}
